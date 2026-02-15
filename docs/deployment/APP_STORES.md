# App Store and Play Store Submission Guide

Complete guide for submitting Lomito to Apple App Store and Google Play Store.

---

## Pre-Submission Checklist

Before submitting to either store, ensure you have:

### Required Assets

- [ ] **App Icon:** 1024x1024px PNG (transparent background not allowed for iOS)
- [ ] **Splash Screen:** 1284x2778px (iOS) and 1080x1920px (Android)
- [ ] **Screenshots:**
  - **iOS:** 6.5" iPhone (1284x2778), 5.5" iPhone (1242x2208)
  - **Android:** Phone (1080x1920), Tablet (1600x2560)
  - Minimum 2, recommended 5-8 per device type
- [ ] **Feature Graphic (Android only):** 1024x500px
- [ ] **Promotional Images (optional):** Various sizes for store marketing

### Required Information

- [ ] **Privacy Policy URL:** https://lomito.org/privacy (must be live)
- [ ] **Support URL:** https://lomito.org/support (must be live)
- [ ] **Marketing URL:** https://lomito.org
- [ ] **Contact Email:** hello@lomito.org
- [ ] **Contact Phone:** (required for Play Store, optional for App Store)
- [ ] **Physical Address:** (required for Play Store)

### Store Listings

Pre-written listings are available in:

- `/Users/elninja/Code/lomito/docs/store/app-store-listing.md` — Apple App Store
- `/Users/elninja/Code/lomito/docs/store/play-store-listing.md` — Google Play Store

---

## Apple App Store

### 1. App Store Connect Setup

#### Create App Record

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill out:
   - **Platform:** iOS
   - **Name:** Lomito
   - **Primary Language:** Spanish (Mexico)
   - **Bundle ID:** `org.lomito.app`
   - **SKU:** `lomito-ios-v1` (unique identifier, not visible to users)
   - **User Access:** Full Access

#### App Information

1. **Category:**
   - Primary: **Lifestyle**
   - Secondary: **Social Networking**

2. **Age Rating:**
   - Click "Edit" next to Age Rating
   - Complete questionnaire:
     - **Unrestricted Web Access:** No
     - **Contests:** No
     - **Gambling:** No
     - **Made for Kids:** No
     - **Frequent/Intense Cartoon or Fantasy Violence:** No
     - **Infrequent/Mild Realistic Violence:** **Yes** (animal welfare content may include descriptions/photos of animal abuse or injury)
     - **Profanity or Crude Humor:** No
     - **Sexual Content or Nudity:** No
     - **Alcohol, Tobacco, or Drug Use:** No
     - **Horror/Fear Themes:** No
     - **Mature/Suggestive Themes:** **Infrequent/Mild** (animal abuse is a mature topic)
   - **Result:** 12+ rating

3. **Subtitle (30 chars max):**
   ```
   Animal Welfare Made Civic
   ```

### 2. Privacy Policy

#### Privacy Nutrition Labels

Apple requires detailed privacy labels. Configure in App Store Connect → App Privacy:

**Data Collected:**

1. **Contact Info:**
   - Name: **Linked to user**, used for **App Functionality** (required for reporting)
   - Email Address: **Linked to user**, used for **App Functionality** (account creation, notifications)
   - Phone Number: **Linked to user**, used for **App Functionality** (optional, for government contact)

2. **Location:**
   - Precise Location: **Linked to user**, used for **App Functionality** (case reporting, map display)

3. **User Content:**
   - Photos or Videos: **Linked to user**, used for **App Functionality** (case evidence)
   - Other User Content: **Linked to user**, used for **App Functionality** (case descriptions, comments)

4. **Identifiers:**
   - User ID: **Linked to user**, used for **App Functionality** (account management)
   - Device ID: **Not linked to user**, used for **Analytics** (PostHog)

**Data Not Collected:**

- Financial Info (donations handled by Mercado Pago/Stripe, not collected by app)
- Browsing History
- Search History
- Health & Fitness
- Sensitive Info (except location for case reporting)

**Third-Party Tracking:**

- **Do you or your third-party partners use data from this app for tracking purposes?** No

**Privacy Policy URL:**

```
https://lomito.org/privacy
```

### 3. Version Information

For each new version submission:

1. **Version Number:** 1.0.0 (use semantic versioning)
2. **Copyright:** © 2026 Lomito Foundation. All rights reserved.
3. **What's New in This Version:**

   ```
   Primer lanzamiento de Lomito en Tijuana.

   - Reporta casos de bienestar animal con fotos y ubicación
   - Mapa en tiempo real de casos en tu ciudad
   - Seguimiento transparente de cada reporte
   - Rendición de cuentas gubernamental automática
   - Panel de métricas de impacto comunitario

   First release of Lomito in Tijuana.

   - Report animal welfare cases with photos and location
   - Real-time map of cases in your city
   - Transparent tracking of every report
   - Automatic government accountability
   - Community impact metrics dashboard
   ```

### 4. Build Upload

Upload build via EAS:

```bash
cd /Users/elninja/Code/lomito/apps/mobile
eas submit --platform ios --profile production
```

Or manually:

1. Download IPA from EAS
2. Open Xcode → Window → Organizer
3. Click "Distribute App"
4. Select build → Upload to App Store Connect

**Wait for processing** (5-30 minutes). Once processed, the build appears in App Store Connect → TestFlight.

### 5. TestFlight Testing (Recommended)

Before submitting for App Review, test via TestFlight:

1. Go to TestFlight tab in App Store Connect
2. Wait for build to pass TestFlight review (1-24 hours)
3. Add internal testers (up to 100)
4. Once approved for TestFlight, invite external testers (optional)
5. Collect feedback, fix bugs, upload new build if needed

### 6. App Review Information

**Sign-in required?** Yes

**Demo Account Credentials:**

```
Username: <STORED IN 1PASSWORD — "Lomito App Review Demo">
Password: <STORED IN 1PASSWORD — "Lomito App Review Demo">
```

**Contact Information:**

- First Name: Lomito
- Last Name: Foundation
- Email: hello@lomito.org
- Phone: +52 664 XXX XXXX (TBD)

**Notes:**

```
Lomito is a civic platform for reporting animal welfare issues in Tijuana, Mexico.

To test the app:
1. Sign in with the demo account above
2. Browse the map to see existing cases
3. Tap "Report" to create a test case (photos and location required)
4. Subscribe to case updates to test notifications
5. View the transparency dashboard for city-wide metrics

Moderator/Government test accounts available upon request.

The app uses location services to:
- Show cases near the user's current location
- Auto-detect jurisdiction when submitting a report
- Display case markers on the map

Photos are used to provide visual evidence of animal welfare issues.

All case data is public, but reporter contact information is only visible to verified government and moderator accounts (for follow-up).

Thank you for reviewing Lomito. We're excited to launch in Tijuana and expand across Mexico.
```

### 7. Submit for Review

1. Select the build from TestFlight
2. Complete all required metadata fields
3. Click "Add for Review" → "Submit to App Review"
4. Wait for review (1-3 days for first submission, 24-48 hours for updates)

### 8. Common Rejection Reasons (and How to Avoid Them)

**Rejection: "App requires login to test"**

**Solution:** Always provide demo account credentials in App Review Information (see above).

---

**Rejection: "Privacy policy is not accessible"**

**Solution:** Ensure https://lomito.org/privacy is live and accessible (not behind a login or paywall).

---

**Rejection: "Location permission used without clear purpose"**

**Solution:** Update `NSLocationWhenInUseUsageDescription` in `app.json` to clearly explain why location is needed. Already configured:

```
Lomito needs your location to show animal welfare cases near you and to automatically detect your jurisdiction when submitting a report.
```

---

**Rejection: "App crashes on launch"**

**Solution:**

- Test on physical device before submitting (simulators can mask issues)
- Check Xcode crash logs
- Ensure all API keys and environment variables are set correctly in EAS secrets

---

**Rejection: "App contains references to unreleased software"**

**Solution:** Do not mention "beta" or "coming soon" features in screenshots or description. Only describe features that exist in the submitted build.

---

**Rejection: "In-app purchases required for essential features"**

**Solution:** Lomito does not have this issue (donations are optional). Ensure the donation flow clearly states it's optional.

---

### 9. Post-Approval

Once approved:

1. **Release manually** or **automatically** (configure in Version Release settings)
2. Monitor reviews in App Store Connect → Ratings and Reviews
3. Respond to user reviews (increases engagement)
4. Track analytics in App Store Connect → Analytics (downloads, sessions, crashes)

---

## Google Play Store

### 1. Play Console Setup

#### Create App

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill out:
   - **App name:** Lomito
   - **Default language:** Spanish (Latin America)
   - **App or game:** App
   - **Free or paid:** Free
   - **Developer Program Policies:** Accept terms
4. Click "Create app"

#### App Access

1. Go to App access (left sidebar)
2. **All functionality is available without restrictions:** No
3. **Provide instructions for accessing restricted features:**

   ```
   Lomito requires user account creation to submit reports and subscribe to case updates.

   Demo Account:
   Email: <STORED IN 1PASSWORD>
   Password: <STORED IN 1PASSWORD>

   To test:
   1. Sign in with demo account
   2. Browse map of animal welfare cases in Tijuana
   3. Create a test report (camera/location permissions required)
   4. Subscribe to case updates
   5. View transparency dashboard

   Moderator/Government test accounts available upon request.
   ```

### 2. Store Listing

Use content from `/Users/elninja/Code/lomito/docs/store/play-store-listing.md`.

#### App Details

1. **App name:** Lomito
2. **Short description (80 chars max):**

   ```
   Report and track animal welfare issues in your city
   ```

3. **Full description (4000 chars max):**
   - Copy from `play-store-listing.md` (English and Spanish sections)

#### Graphics

1. **App icon:** 512x512px PNG (already in `apps/mobile/assets/icon.png`)
2. **Feature graphic:** 1024x500px PNG (create this, showcase app UI with hero image)
3. **Screenshots:**
   - **Phone:** 1080x1920px, minimum 2, recommended 8
   - Show:
     - Map view with case markers
     - Case detail view
     - Report form
     - Transparency dashboard
     - Profile/settings screen
4. **Promotional video (optional):** YouTube URL

#### Categorization

1. **App category:** Social
2. **Tags (5 max):**
   - Social Impact
   - Community
   - Civic Engagement
   - Animal Welfare
   - Transparency

#### Contact Details

1. **Email:** hello@lomito.org
2. **Phone:** +52 664 XXX XXXX (required, TBD)
3. **Website:** https://lomito.org
4. **Physical Address:** (required, TBD)
   ```
   Lomito Foundation
   [Street Address]
   Tijuana, Baja California
   22000
   Mexico
   ```

### 3. Content Rating

Complete the content rating questionnaire:

1. **App category:** Social
2. **Does your app contain any violent content?** Yes
   - **Cartoon or fantasy violence:** No
   - **Realistic violence:** Yes (images/descriptions of animal abuse or injury)
   - **Frequent or intense violence:** No (infrequent and for civic reporting purposes)
3. **Does your app contain any sexual content?** No
4. **Does your app contain any profanity or crude humor?** No
5. **Does your app reference or use alcohol, tobacco, or drugs?** No
6. **Does your app simulate gambling?** No
7. **Can users communicate with each other in your app?** No (comments are moderated and not peer-to-peer)
8. **Does your app share user-provided personal information with third parties?** No
   - (Reporter PII is shared with verified government/moderator accounts for case follow-up, but this is disclosed in privacy policy)
9. **Does your app collect user location?** Yes
   - **Location used for app functionality:** Yes (case reporting, map display)

**Expected Rating:** Teen (similar to iOS 12+)

### 4. Data Safety

Google requires a Data Safety section (equivalent to iOS privacy labels).

**Data Collected:**

1. **Location:**
   - **Approximate location:** Yes
   - **Precise location:** Yes
   - **Is this data collected, shared, or both?** Collected
   - **Is this data processed ephemerally?** No
   - **Is collection of this data required or optional?** Required for case reporting, optional for map browsing
   - **Why is this user data collected?** App functionality (case location, jurisdiction detection)

2. **Personal info:**
   - **Name:** Collected, required for reporting, used for app functionality
   - **Email address:** Collected, required for account creation, used for app functionality
   - **Phone number:** Collected, optional, used for app functionality (government follow-up)

3. **Photos and videos:**
   - **Photos:** Collected, optional, used for app functionality (case evidence)
   - **Videos:** Collected, optional, used for app functionality (case evidence)

4. **App activity:**
   - **App interactions:** Collected, used for analytics (PostHog)

**Data Shared:**

- **Location:** Shared publicly (anonymized case locations on map)
- **Personal info:** Shared with verified government/moderator accounts only (for case follow-up)

**Security practices:**

- **Data is encrypted in transit:** Yes
- **Users can request data deletion:** Yes
- **Data is not sold to third parties:** Yes
- **Privacy policy:** https://lomito.org/privacy

### 5. App Content

1. **Target audience:**
   - **Age range:** 13+ (Teen)
   - **Does your app contain ads?** No
   - **Does your app have in-app purchases?** No (donations handled externally by Mercado Pago/Stripe)

2. **News app declaration:**
   - **Is this a news app?** No

3. **COVID-19 contact tracing and status apps:**
   - **Is this a COVID-19 contact tracing or status app?** No

4. **Data safety questionnaire:** Complete as described above

### 6. Build Upload

Upload AAB via EAS:

```bash
cd /Users/elninja/Code/lomito/apps/mobile
eas submit --platform android --profile production
```

Or manually:

1. Download AAB from EAS
2. Go to Play Console → Release → Production
3. Click "Create new release"
4. Upload AAB
5. Fill out release notes:

```
Primer lanzamiento de Lomito en Tijuana.

- Reporta casos de bienestar animal con fotos y ubicación
- Mapa en tiempo real de casos en tu ciudad
- Seguimiento transparente de cada reporte
- Rendición de cuentas gubernamental automática
- Panel de métricas de impacto comunitario

First release of Lomito in Tijuana.

- Report animal welfare cases with photos and location
- Real-time map of cases in your city
- Transparent tracking of every report
- Automatic government accountability
- Community impact metrics dashboard
```

### 7. Internal Testing (Recommended)

Before releasing to production, test via internal testing track:

1. Go to Release → Internal testing
2. Create new release → Upload AAB
3. Add testers (email addresses)
4. Share internal testing link
5. Collect feedback, fix bugs, upload new AAB if needed

### 8. Production Release

1. Go to Release → Production
2. Create new release → Upload AAB (or promote from internal/closed testing)
3. Review release:
   - **Countries:** Mexico (initially), expand later
   - **Rollout percentage:** Start with 10%, increase gradually
4. Click "Review release" → "Start rollout to Production"

### 9. Submit for Review

1. Click "Send for review"
2. Wait for review (1-3 days for first submission, 1-2 days for updates)

### 10. Common Rejection Reasons (and How to Avoid Them)

**Rejection: "App violates User Data policy"**

**Solution:**

- Ensure Data Safety section accurately describes all data collection
- Privacy policy must be accessible and clearly explain data usage
- Do not collect more data than necessary

---

**Rejection: "App crashes or has bugs"**

**Solution:**

- Test on multiple physical devices (different Android versions)
- Use Play Console → Pre-launch report to catch crashes before submission
- Fix all critical bugs before submitting

---

**Rejection: "Misleading app description"**

**Solution:**

- Screenshots and description must accurately represent app functionality
- Do not mention features that don't exist in the submitted build
- Do not use stock photos or generic images (use actual app screenshots)

---

**Rejection: "Permissions not justified"**

**Solution:**

- Ensure all declared permissions are used in the app
- Remove unused permissions from `app.json`
- Clearly explain why each permission is needed in the Data Safety section

---

**Rejection: "App requires phone number for sign-up"**

**Solution:** Lomito does not require phone (email only). If rejected for this, clarify that phone is optional.

---

### 11. Post-Approval

Once approved:

1. **Monitor reviews:** Play Console → User feedback → Reviews
2. **Respond to reviews:** Increases rating and user trust
3. **Track metrics:** Play Console → Statistics (installs, crashes, ANRs)
4. **Update regularly:** Fix bugs, add features, maintain active development

---

## Post-Submission Monitoring

### Review Response

Both stores allow you to respond to user reviews. Best practices:

- **Respond within 24-48 hours** (shows active support)
- **Thank users for positive reviews** (brief, genuine)
- **Address concerns in negative reviews** (offer to help, ask for details)
- **Do NOT argue with users** (professional tone always)

**Example responses:**

**Positive review:**

```
Gracias por tu apoyo. Juntos estamos haciendo de Tijuana un mejor lugar para todos los animales.
```

**Negative review (bug report):**

```
Lamentamos el inconveniente. Hemos identificado el problema y lo solucionaremos en la próxima actualización. Si necesitas ayuda, escríbenos a hello@lomito.org. ¡Gracias por reportar!
```

### Crash Monitoring

**iOS:**

- Xcode Organizer → Crashes
- App Store Connect → Analytics → Crashes

**Android:**

- Play Console → Quality → Crashes & ANRs

**Recommended:** Integrate Sentry or Bugsnag for real-time crash reporting.

### Update Cadence

**Recommended schedule:**

- **Patch releases (bug fixes):** Every 1-2 weeks as needed
- **Minor releases (new features):** Every 4-6 weeks
- **Major releases (major features/redesigns):** Every 3-6 months

**Use semantic versioning:**

- 1.0.0 → Initial release
- 1.0.1 → Bug fix
- 1.1.0 → New feature (backward compatible)
- 2.0.0 → Breaking change or major redesign

---

## Troubleshooting

### "App pending review for 7+ days"

**iOS:**

- Contact Apple via App Store Connect → Contact Us
- Escalate if urgent (emergency expedited review available in rare cases)

**Android:**

- Check Play Console for additional information requests
- Contact Google via Help → Contact Us

---

### "Build rejected but no reason given"

**iOS:**

- Check Resolution Center in App Store Connect
- Review Apple Developer Program License Agreement (you may have missed a required step)

**Android:**

- Check email associated with Play Console account
- Review Play Console → Policy status for details

---

### "Users report crashes but I can't reproduce"

**Solution:**

1. Check crash logs in App Store Connect / Play Console
2. Identify device/OS version causing crashes
3. Test on that specific configuration
4. Use remote debugging tools (Sentry, Firebase Crashlytics)

---

## Support

**Apple Developer Support:**

- https://developer.apple.com/support/

**Google Play Console Help:**

- https://support.google.com/googleplay/android-developer/

**Lomito-specific submission issues:**

- Contact development team
- File issue in project repository
