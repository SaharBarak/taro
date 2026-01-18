# External Links Configuration

**Last Updated:** January 18, 2025

This file contains placeholder values for external URLs that need to be updated before production deployment.

---

## App Store Links

These URLs are used for QR codes on the download page and deep links.

```yaml
# Apple App Store
IOS_APP_STORE_URL: "https://apps.apple.com/il/app/taruu/id__________"

# Google Play Store
ANDROID_PLAY_STORE_URL: "https://play.google.com/store/apps/details?id=il.co.taruu.app"
```

## Google Search Console

Used for SEO verification in the web app layout.

```yaml
# Google Search Console verification code
# Get this from: https://search.google.com/search-console
GOOGLE_SITE_VERIFICATION: "__________"
```

## WhatsApp Community

Used for Schema.org structured data and support links.

```yaml
# WhatsApp group/community link
WHATSAPP_GROUP_URL: "https://chat.whatsapp.com/__________"

# WhatsApp support number (with country code, no +)
WHATSAPP_SUPPORT_NUMBER: "972501234567"
```

## Social Media

```yaml
# Facebook page
FACEBOOK_PAGE_URL: "https://facebook.com/taruu.israel"

# Instagram profile
INSTAGRAM_PROFILE_URL: "https://instagram.com/taruu.israel"

# Twitter/X profile
TWITTER_PROFILE_URL: "https://twitter.com/taruu_israel"

# LinkedIn company page
LINKEDIN_PAGE_URL: "https://linkedin.com/company/taruu-israel"
```

## Support & Legal

```yaml
# Support email
SUPPORT_EMAIL: "support@taruu.co.il"

# Privacy policy URL
PRIVACY_POLICY_URL: "https://taruu.co.il/privacy"

# Terms of service URL
TERMS_OF_SERVICE_URL: "https://taruu.co.il/terms"
```

## Analytics & Tracking

```yaml
# Google Analytics 4 Measurement ID
GA4_MEASUREMENT_ID: "G-__________"

# Facebook Pixel ID
FACEBOOK_PIXEL_ID: "__________"

# Hotjar Site ID
HOTJAR_SITE_ID: "__________"
```

---

## How to Update

1. Replace the placeholder values (`__________`) with actual values
2. Update the corresponding code references:
   - QR codes: `apps/web/src/app/[locale]/download/`
   - Google verification: `apps/web/src/app/[locale]/layout.tsx:121`
   - WhatsApp link: `apps/web/src/app/[locale]/layout.tsx:150`
3. Commit the changes

## Environment Variables

Some of these values should also be added to `.env.example`:

```env
# Analytics
NEXT_PUBLIC_GA4_ID=G-__________
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=__________

# App Links
NEXT_PUBLIC_IOS_APP_STORE_URL=https://apps.apple.com/...
NEXT_PUBLIC_ANDROID_PLAY_STORE_URL=https://play.google.com/...
```

---

*This file is a configuration reference. Update values as they become available.*
