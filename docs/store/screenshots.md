# App Store & Play Store Screenshots

## iOS Requirements

### iPhone Screenshots (All Required)

**6.7" Display (iPhone 15 Pro Max, 14 Pro Max)**
- Resolution: 1290 × 2796 pixels
- Orientation: Portrait
- Required: Yes

**6.5" Display (iPhone 14 Plus, 13 Pro Max, 12 Pro Max, 11 Pro Max, 11, XS Max, XR)**
- Resolution: 1284 × 2778 pixels
- Orientation: Portrait
- Required: Yes

**5.5" Display (iPhone 8 Plus, 7 Plus, 6s Plus)**
- Resolution: 1242 × 2208 pixels
- Orientation: Portrait
- Required: Yes

### iPad Screenshots (Recommended)

**iPad Pro (6th Gen) 12.9"**
- Resolution: 2048 × 2732 pixels
- Orientation: Portrait
- Required: No (but strongly recommended since app supports tablet)

**iPad Pro (6th Gen) 11"**
- Resolution: 1668 × 2388 pixels
- Orientation: Portrait
- Required: No

---

## Android Requirements

### Phone Screenshots (Required)

**Minimum:**
- Resolution: 1080 × 1920 pixels (min)
- Aspect Ratio: 16:9
- Format: PNG or JPEG
- Max file size: 8MB per screenshot
- Quantity: 2-8 screenshots

**Recommended:**
- Resolution: 1080 × 1920 pixels or higher
- Use actual device screenshots from Pixel, Samsung Galaxy S series

### Tablet Screenshots (Recommended)

**7" Tablet**
- Resolution: 1200 × 1920 pixels (min)
- Required: No (but recommended)

**10" Tablet**
- Resolution: 1600 × 2560 pixels (min)
- Required: No (but recommended)

---

## Recommended Screenshot Sequence

### 1. Map View (Hero Screenshot)
**Purpose:** Show the core value proposition immediately

**Content:**
- Full-screen map with multiple case pins visible
- Active filter showing categories (stray, injured, abuse, lost/found)
- Location marker centered on Tijuana
- Bottom sheet showing quick case preview
- Status bar showing time, battery, signal

**Text Overlay (optional):**
- "See Animal Welfare Cases Near You"
- "Ver Casos de Bienestar Animal Cerca de Ti"

---

### 2. Report Flow — Photo Capture
**Purpose:** Demonstrate ease of reporting

**Content:**
- Camera viewfinder with animal in frame (use stock photo or illustration)
- Bottom UI showing "Take Photo" button
- Top UI showing "Cancel" and flash toggle
- Clean, intuitive interface

**Text Overlay (optional):**
- "Report Issues in Under 60 Seconds"
- "Reporta Problemas en Menos de 60 Segundos"

---

### 3. Report Flow — Location & Details
**Purpose:** Show jurisdiction auto-detection and form simplicity

**Content:**
- Map with dropped pin showing precise location
- Form fields: category dropdown, urgency selector, description textarea
- Auto-detected jurisdiction badge: "Tijuana, Baja California"
- Photo thumbnail preview
- "Submit Report" button

**Text Overlay (optional):**
- "Automatic Jurisdiction Detection"
- "Detección Automática de Jurisdicción"

---

### 4. Case Detail View
**Purpose:** Show tracking and transparency

**Content:**
- Case header with photo carousel
- Case metadata: status badge, category, urgency, date
- Description text
- Timeline showing status changes and government responses
- "Subscribe to Updates" button
- Map preview showing case location

**Text Overlay (optional):**
- "Track Every Case to Resolution"
- "Seguimiento de Cada Caso Hasta su Resolución"

---

### 5. Transparency Dashboard
**Purpose:** Demonstrate government accountability

**Content:**
- City-wide metrics cards:
  - Total Cases Reported
  - Average Resolution Time
  - Cases by Category (bar chart)
  - Government Response Rate
- Date range selector
- Municipality filter dropdown

**Text Overlay (optional):**
- "Hold Government Accountable"
- "Responsabiliza al Gobierno"

---

### 6. Government Portal (Optional — for Play Store only)
**Purpose:** Show the platform serves both citizens and officials

**Content:**
- Government dashboard showing assigned cases
- Filter by status (pending, in_progress, escalated)
- Case list with priority indicators
- "Respond to Case" action button

**Text Overlay (optional):**
- "Built for Citizens and Officials"
- "Construido para Ciudadanos y Funcionarios"

---

## Design Guidelines

### Framing
- Use actual device frames (iPhone 15 Pro, Pixel 8) for maximum realism
- Avoid outdated device frames (iPhone X, Pixel 3)

### Annotations
- Use text overlays sparingly (only for hero screenshot if needed)
- Keep text large (minimum 36pt), high contrast (white on dark gradient)
- Avoid covering important UI elements

### Consistency
- All screenshots should use the same device frame
- Use consistent theme (light mode or dark mode, not mixed)
- Ensure design tokens are correctly applied (colors, spacing, typography)

### Localization
- Create separate screenshot sets for English and Spanish listings
- Change in-app UI language via i18n, not text overlays

### Content
- Use realistic but anonymized data (no real PII)
- Show active, in-progress cases (not all resolved)
- Vary urgency levels (low, medium, high, critical)
- Vary animal types (dog, cat, wildlife, livestock)

---

## Production Checklist

- [ ] Take screenshots on actual devices or high-fidelity simulators
- [ ] Verify all design tokens are correctly applied (no placeholder colors)
- [ ] Ensure all text is in the correct language (Spanish for es-MX listing)
- [ ] Remove any "Lorem ipsum" or placeholder content
- [ ] Verify status bar shows realistic time and battery (not 9:41 AM every time)
- [ ] Check for typos in UI text
- [ ] Export at exact required resolutions (no upscaling/downscaling)
- [ ] Compress images to reduce file size (use ImageOptim or TinyPNG)
- [ ] Verify file sizes are under limits (8MB for Play Store)
- [ ] Generate separate sets for App Store (iOS) and Play Store (Android)
- [ ] Test screenshots on both light and dark backgrounds in store preview

---

## File Naming Convention

```
ios_6.7_01_map_view_en.png
ios_6.7_01_map_view_es.png
ios_6.7_02_report_photo_en.png
ios_6.7_02_report_photo_es.png
...
android_phone_01_map_view_en.png
android_phone_01_map_view_es.png
...
```

---

## Tools

**Screenshot Capture:**
- iOS: Xcode Simulator (Device > Screenshot)
- Android: Android Studio Emulator (Camera icon in toolbar)
- Web: Browser DevTools (toggle device toolbar, take screenshot)

**Device Framing:**
- [Facebook Design Device Frames](https://facebook.design/devices)
- [Screely](https://screely.com/) (browser-based, free)
- [Figma Frame Mockup Plugin](https://www.figma.com/community/plugin/819419075034034322/Frame-Mockup)

**Image Optimization:**
- [ImageOptim](https://imageoptim.com/mac) (macOS)
- [TinyPNG](https://tinypng.com/) (web-based)
- [Squoosh](https://squoosh.app/) (web-based, advanced controls)

---

## Notes

- Actual screenshots should be taken **after final UI polish** in Phase 6
- This document serves as a specification; screenshots are TBD
- Coordinate with design team for text overlay design (if used)
- Test screenshots in App Store Connect preview before submission
- Both stores allow uploading screenshots in multiple languages
