import { NextRequest, NextResponse } from 'next/server';
import {
  greenInvoiceService,
  type PaymentWebhookEvent,
} from '@/services/payments/greenInvoice';
import { qubikService } from '@/services/qubik';
import { convergeService } from '@/services/converge';
import { emailService } from '@/services/email';

/**
 * POST /api/payments/webhook
 * Handle Green Invoice payment webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-green-invoice-signature') || '';

    // Verify webhook signature
    if (!greenInvoiceService.verifyWebhookSignature(payload, signature)) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the webhook event
    const rawPayload = JSON.parse(payload);
    const event: PaymentWebhookEvent = greenInvoiceService.parseWebhookEvent(rawPayload);

    // Handle the event
    switch (event.type) {
      case 'payment.succeeded': {
        const { paymentId, amount, metadata } = event;
        const userId = metadata.userId;
        const type = metadata.type as 'vote_participation' | 'vote_creation';
        const tokensToMint = parseInt(String(metadata.tokensToMint) || '0', 10);
        const voteId = metadata.voteId;

        if (userId) {
          // Get user profile - try by ID first, then by Google ID
          let user = await convergeService.getUser(userId);
          if (!user) {
            user = await convergeService.getUserByGoogleId(userId);
          }

          if (!user) {
            console.error('User not found for payment:', userId);
            break;
          }

          // Mint SYNC tokens (1 ILS = 1 SYNC token)
          if (tokensToMint > 0) {
            try {
              await qubikService.mintTokens({
                walletAddress: user.qubikWalletAddress,
                amount: tokensToMint,
                reason: type,
              });

              // Update user token balance
              await convergeService.updateUser(user.id, {
                syncTokenBalance: (user.syncTokenBalance || 0) + tokensToMint,
              });

              console.log(
                `Minted ${tokensToMint} SYNC tokens for user ${user.id}`
              );
            } catch (mintError) {
              console.error('Error minting tokens:', mintError);
              // Don't fail the webhook - tokens can be minted manually later
            }
          }

          // Send receipt email
          try {
            // Get receipt URL from payment status
            const paymentStatus = await greenInvoiceService.getPaymentStatus(paymentId);

            await emailService.sendPaymentReceiptEmail({
              to: user.email,
              firstName: user.firstName || user.name?.split(' ')[0] || 'משתמש',
              amount,
              type,
              receiptUrl: paymentStatus.receiptUrl || '',
              tokensEarned: tokensToMint,
            });
          } catch (emailError) {
            console.error('Error sending receipt email:', emailError);
            // Don't fail the webhook
          }

          // If this is a vote participation payment, record the participation
          if (type === 'vote_participation' && voteId) {
            try {
              // Record the vote participation
              await convergeService.recordVoteParticipation({
                voteId,
                oderId: user.id,
                paymentId,
                amount,
                tokensMinted: tokensToMint,
              });
              console.log(
                `Vote participation payment confirmed for vote ${voteId}`
              );
            } catch (participationError) {
              console.error('Error recording vote participation:', participationError);
            }
          }

          // If this is a vote creation payment, the vote can now be activated
          if (type === 'vote_creation') {
            console.log(
              `Vote creation payment confirmed for user ${user.id}`
            );
          }
        }
        break;
      }

      case 'payment.failed': {
        console.error('Payment failed:', event.paymentId);
        // Could notify user, clean up pending records, etc.
        break;
      }

      case 'refund.created': {
        console.log('Refund processed:', event.paymentId);
        // Could deduct tokens, update records, etc.
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
