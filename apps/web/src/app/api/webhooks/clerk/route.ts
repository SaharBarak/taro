import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  // Handle the webhook event
  const eventType = evt.type;

  switch (eventType) {
    case 'user.created': {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses?.[0]?.email_address;

      console.log('User created:', { id, email, first_name, last_name });

      // TODO: Create user in Converge database
      // TODO: Create Qubik wallet for user
      // await converge.users.create({
      //   clerkId: id,
      //   email,
      //   firstName: first_name,
      //   lastName: last_name,
      // });

      break;
    }

    case 'user.updated': {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses?.[0]?.email_address;

      console.log('User updated:', { id, email, first_name, last_name });

      // TODO: Update user in Converge database
      break;
    }

    case 'user.deleted': {
      const { id } = evt.data;

      console.log('User deleted:', { id });

      // TODO: Handle user deletion (soft delete in Converge)
      break;
    }

    case 'session.created': {
      console.log('Session created:', evt.data);
      break;
    }

    default:
      console.log('Unhandled webhook event:', eventType);
  }

  return NextResponse.json({ received: true });
}
