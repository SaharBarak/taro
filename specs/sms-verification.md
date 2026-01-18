# SMS Phone Verification Specification

**Status:** COMPLETE (v85 backend, v96 mobile UI)
**Last Updated:** January 18, 2026 (v96)
**Provider:** Twilio

---

## Overview

Phone verification adds an additional layer of identity verification for Taruu users. Users can verify their phone number via SMS OTP (One-Time Password) to increase their identity score and prove they control a real phone number.

## Purpose

- **Sybil Resistance:** Harder to create multiple fake accounts
- **Account Recovery:** Secondary recovery method if needed
- **Israeli Number Validation:** Ensure users have Israeli phone numbers

## Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │────▶│   Backend   │────▶│   Twilio    │
│   Client    │     │   /api/     │     │   Verify    │
│             │◀────│   verify    │◀────│   Service   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Step 1: Request Verification

**User Action:** Enters phone number in settings

**Client Request:**
```
POST /api/user/phone/send-code
{
  "phone": "+972501234567"
}
```

**Backend Actions:**
1. Validate phone format (Israeli number: +972)
2. Check rate limit (max 3 requests per phone per hour)
3. Call Twilio Verify API to send SMS
4. Store pending verification in database

**Response (200):**
```json
{
  "success": true,
  "message": "קוד אימות נשלח",
  "expiresIn": 600
}
```

### Step 2: Verify Code

**User Action:** Enters 6-digit code received via SMS

**Client Request:**
```
POST /api/user/phone/verify
{
  "phone": "+972501234567",
  "code": "123456"
}
```

**Backend Actions:**
1. Call Twilio Verify Check API
2. If valid: Update user record with verified phone
3. Create phone verification record
4. (Optional) Add points to identity score if phone contributes

**Response (200):**
```json
{
  "success": true,
  "message": "מספר הטלפון אומת בהצלחה",
  "verified": true
}
```

## API Endpoints

### POST /api/user/phone/send-code

Send verification SMS to phone number.

**Request:**
```json
{
  "phone": "+972501234567"
}
```

**Validation:**
- Phone must be Israeli format: `+972[5X][0-9]{7}` (mobile) or `+972[2-9][0-9]{7}` (landline)
- User must be authenticated
- Rate limit: 3 attempts per phone per hour

**Response (200):**
```json
{
  "success": true,
  "message": "קוד אימות נשלח",
  "expiresIn": 600
}
```

**Errors:**
- `400 INVALID_PHONE` - Phone format invalid
- `400 NOT_ISRAELI_NUMBER` - Must be Israeli phone number
- `429 RATE_LIMITED` - Too many attempts
- `500 SMS_SEND_FAILED` - Twilio error

### POST /api/user/phone/verify

Verify the SMS code.

**Request:**
```json
{
  "phone": "+972501234567",
  "code": "123456"
}
```

**Validation:**
- Code must be 6 digits
- Phone must match pending verification
- Code must not be expired (10 minutes)

**Response (200):**
```json
{
  "success": true,
  "message": "מספר הטלפון אומת בהצלחה",
  "verified": true
}
```

**Errors:**
- `400 INVALID_CODE` - Code format invalid
- `400 CODE_EXPIRED` - Verification expired
- `400 WRONG_CODE` - Incorrect code
- `404 NO_PENDING_VERIFICATION` - No verification in progress

### GET /api/user/phone/status

Check phone verification status.

**Response (200):**
```json
{
  "verified": true,
  "phone": "+972501234567",
  "verifiedAt": "2025-01-18T12:00:00.000Z"
}
```

Or if not verified:
```json
{
  "verified": false,
  "phone": null,
  "verifiedAt": null
}
```

## Twilio Integration

### Service: Twilio Verify

Use Twilio Verify service (not raw SMS) for:
- Automatic code generation
- Rate limiting
- Delivery tracking
- Code validation

### API Calls

**Send Verification:**
```typescript
import twilio from 'twilio';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

await client.verify.v2
  .services(TWILIO_VERIFY_SERVICE_SID)
  .verifications.create({
    to: phone,
    channel: 'sms',
    locale: 'he'
  });
```

**Check Verification:**
```typescript
const verification = await client.verify.v2
  .services(TWILIO_VERIFY_SERVICE_SID)
  .verificationChecks.create({
    to: phone,
    code: code
  });

if (verification.status === 'approved') {
  // Verification successful
}
```

## Database Schema

### phone_verifications table
```sql
CREATE TABLE phone_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_phone_verifications_phone ON phone_verifications(phone);
CREATE INDEX idx_phone_verifications_user ON phone_verifications(user_id);
```

### users table update
```sql
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN phone_verified_at TIMESTAMPTZ;
```

## Environment Variables

```env
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Rate Limiting

| Action | Limit | Window |
|--------|-------|--------|
| Send code (per phone) | 3 | 1 hour |
| Send code (per user) | 5 | 1 day |
| Verify code (per phone) | 5 | 10 minutes |

## Security Considerations

1. **Phone Number Formatting:** Always normalize to E.164 format (+972...)
2. **Rate Limiting:** Prevent SMS bombing attacks
3. **Code Expiry:** 10 minute expiration
4. **Attempt Limits:** Lock after 5 failed attempts
5. **Phone Uniqueness:** One phone per account (optional: enforce globally)

## Error Messages (Hebrew)

| Code | Hebrew |
|------|--------|
| `INVALID_PHONE` | מספר טלפון לא תקין |
| `NOT_ISRAELI_NUMBER` | יש להזין מספר טלפון ישראלי |
| `RATE_LIMITED` | נסיונות רבים מדי, נסה שוב מאוחר יותר |
| `SMS_SEND_FAILED` | שליחת ההודעה נכשלה |
| `INVALID_CODE` | קוד לא תקין |
| `CODE_EXPIRED` | פג תוקף הקוד |
| `WRONG_CODE` | קוד שגוי |
| `NO_PENDING_VERIFICATION` | לא נמצא תהליך אימות פעיל |

## Implementation Files

| File | Purpose |
|------|---------|
| `apps/web/src/services/sms/twilio.ts` | Twilio service wrapper |
| `apps/web/src/app/api/user/phone/send-code/route.ts` | Send SMS endpoint |
| `apps/web/src/app/api/user/phone/verify/route.ts` | Verify code endpoint |
| `apps/web/src/app/api/user/phone/status/route.ts` | Check status endpoint |
| `packages/shared/src/types/phone.ts` | TypeScript types |
| `packages/shared/src/contracts/phone.ts` | Zod schemas |
| `packages/api-client/src/phone.ts` | API client methods |
| `supabase/migrations/xxx_phone_verifications.sql` | Database migration |

## Mobile UI

Location: `apps/mobile/app/settings/verification.tsx`

Replace "Coming Soon" with:
1. Phone number input (with Israeli flag/+972 prefix)
2. "Send Code" button
3. 6-digit code input
4. "Verify" button
5. Success/error states

---

*Last Updated: January 18, 2025*
