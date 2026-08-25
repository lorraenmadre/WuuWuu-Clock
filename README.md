# WuuWuu Clock

A deterministic cosmic timing clock combining traditional Vedic Panchang intervals with intuitive traffic-signal illumination, an analog watch dial overlay with celestial vector glyphs, and natural atmospheric sky elements.

---

## 1. Product Purpose

WuuWuu Clock translates complex astrological ephemeris intervals (Panchang) and solar transitions into an immediate, actionable glanceable interface. Rather than requiring users to decipher tables of auspicious and inauspicious windows, WuuWuu Clock continuously computes a deterministic 24-hour schedule and renders the exact current state as one of four universal colors:

- **Green (🟢)**: Auspicious / Flow state — Ideal for launching, high-leverage decisions, creative focus, and vital beginnings.
- **Red (🔴)**: Inauspicious / Protected focus — Avoid travel departures, new commitments, contract signings, or outward pushes.
- **Yellow (🟡)**: Transition / Sacred Window / Overlap — Golden hours at dawn/dusk and intervals where multiple timing conditions coincide.
- **Gray (⚪)**: Neutral / Rest & Sleep — Unscheduled periods and automatic/manual sleep overrides.

---

## 2. Architecture & Data Flow

```
[Raw Panchang Text / User Input]
               │
               ▼
[Gemini AI Parser (Server: /api/gemini/parse-timing)]
(Extracts entity names, sunrise/sunset, & raw timestamps ONLY — no color assignment)
               │
               ▼
[Deterministic Panchang Registry (TypeScript: src/engine/panchangRegistry.ts)]
(Canonical period name resolution & deterministic classification: green/red)
               │
               ▼
[Deterministic Timing Engine (src/engine/timingEngine.ts)]
(Applies 6-level priority hierarchy & generates continuous 24h timeline segments)
               │
               ▼
[UI Layer: Home / 24h Timeline / Dial Watch Preview / Debug Suite]
```

### Core Architecture Principles:
- **Zero Hallucination in Color Decisions**: Gemini extracts textual entities and timestamps from unstructured input, but never decides whether a period is green or red. All classifications are deterministically mapped via the TypeScript `PANCHANG_REGISTRY`.
- **Pure Functional Core**: Timeline generation (`generateDailyTimeline`) is deterministic, side-effect free, and operates on a 1440-minute daily coordinate space.
- **Live Device Time by Default**: The application defaults to real-time device clock synchronization. Time simulation activates only when deliberately manipulated via the interactive scrubber in the Debug view.

---

## 3. Timing Hierarchy & Overlap Rules

The timing engine evaluates daily time slices through a strict 6-tier precedence hierarchy:

```
Priority 1: Sleep / Rest Override      -> GRAY   (Active manual sleep or user profile schedule)
Priority 2: Golden Hour Window         -> YELLOW (Dawn: sunrise to sunrise+60m; Dusk: sunset-60m to sunset)
Priority 3: Multi-condition Overlap    -> YELLOW (Two or more green/red conditions active simultaneously)
Priority 4: Single Inauspicious Period -> RED    (Rahu Kala, Yamaganda, Gulika, etc.)
Priority 5: Single Auspicious Period   -> GREEN  (Brahma Muhurta, Amrita Gadiyas, Abhijit Muhurta, etc.)
Priority 6: Neutral Baseline           -> GRAY   (Standard unclassified daytime/nighttime)
```

### Overlap Evaluation:
- **Red + Green Overlap** (e.g., Abhijit Muhurta + Yamaganda): The overlapping slice resolves to **Yellow**; outside the overlap, the respective periods revert to Green and Red.
- **Green + Green Overlap**: Resolves to **Yellow** during concurrent windows.
- **Red + Red Overlap**: Resolves to **Yellow** during concurrent windows.
- **Golden Hour Overlap**: Dawn or Dusk golden hour strictly overrides underlying single green or red periods into **Yellow**.
- **Sleep Schedule Overrides**: When a sleep schedule is enabled (including schedules crossing midnight, e.g., 23:00 to 06:30), any underlying auspicious or inauspicious period evaluates to **Gray**.

---

## 4. The Four Colors

| Color | Hex Code | Meaning | Astrological & Solar Trigger |
| :--- | :--- | :--- | :--- |
| **Green** | `#22C55E` | Go / Auspicious | Single auspicious Panchang period (Brahma Muhurta, Amrita Gadiyas, Abhijit Muhurta) |
| **Red** | `#EF4444` | Stop / Inauspicious | Single inauspicious Panchang period (Rahu Kala, Yamaganda, Gulika Kala) |
| **Yellow** | `#FBBF24` | Transition / Overlap | Dawn/Dusk golden hours, or overlap of multiple astrological conditions |
| **Gray** | `#94A3B8` | Neutral / Rest | Neutral time outside active periods, or active sleep schedule window |

---

## 5. Data-Provider Abstraction

The system cleanly isolates external data extraction from timing computation:

1. **`DayData` Interface (`src/types.ts`)**:
   - `date`: Target date string (`YYYY-MM-DD`).
   - `sunData`: Sunrise and Sunset timestamps and minute offsets.
   - `periods`: Normalized array of `TimingPeriod` objects.
   - `astrologyContext`: Moon Nakshatra, Moon House, and zodiac positions.

2. **Deterministic Registry (`src/engine/panchangRegistry.ts`)**:
   - Maintains canonical entries for known Vedic periods with alias matching.
   - Functions: `classifyPanchangPeriod(name)` and `getCanonicalPanchangName(name)`.

3. **Gemini Extraction Service (`/api/gemini/parse-timing`)**:
   - Secure server-side endpoint converting pasted ephemeris text into structured JSON.
   - Exclusively handles schema extraction without asserting traffic light rules.

---

## 6. August 24 Benchmark Fixture

The canonical benchmark schedule is defined for **Miami, Florida on August 24, 2026** (Sunrise `06:57`, Sunset `19:48`):

| # | Time Window | Minutes | Expected Color | Primary Reason |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `12:00 AM – 05:28 AM` | `0 – 328` | **GRAY** | Neutral Night |
| **2** | `05:28 AM – 06:12 AM` | `328 – 372` | **GREEN** | Brahma Muhurta |
| **3** | `06:12 AM – 06:20 AM` | `372 – 380` | **GRAY** | Neutral Transition |
| **4** | `06:20 AM – 06:57 AM` | `380 – 417` | **GREEN** | Amrita Gadiyas (Pre-Sunrise) |
| **5** | `06:57 AM – 07:57 AM` | `417 – 477` | **YELLOW** | Dawn Golden Hour (Sunrise + 60m) |
| **6** | `07:57 AM – 08:06 AM` | `477 – 486` | **GREEN** | Amrita Gadiyas (Post-Golden Hour) |
| **7** | `08:06 AM – 08:33 AM` | `486 – 513` | **GRAY** | Neutral Transition |
| **8** | `08:33 AM – 10:09 AM` | `513 – 609` | **RED** | Rahu Kala |
| **9** | `10:09 AM – 11:46 AM` | `609 – 706` | **GRAY** | Neutral Midday |
| **10** | `11:46 AM – 12:56 PM` | `706 – 776` | **RED** | Yamaganda |
| **11** | `12:56 PM – 01:22 PM` | `776 – 802` | **YELLOW** | Overlap: Abhijit Muhurta + Yamaganda |
| **12** | `01:22 PM – 01:48 PM` | `802 – 828` | **GREEN** | Clear Abhijit Muhurta |
| **13** | `01:48 PM – 02:58 PM` | `828 – 898` | **GRAY** | Neutral Afternoon |
| **14** | `02:58 PM – 04:34 PM` | `898 – 994` | **RED** | Gulika Kala |
| **15** | `04:34 PM – 06:48 PM` | `994 – 1128` | **GRAY** | Neutral Pre-Dusk |
| **16** | `06:48 PM – 07:48 PM` | `1128 – 1188` | **YELLOW** | Dusk Golden Hour (Sunset − 60m) |
| **17** | `07:48 PM – 12:00 AM` | `1188 – 1440` | **GRAY** | Neutral Evening |

---

## 7. Development Setup & Testing

### Running the App
```bash
# Start development server
npm run dev
```

### Running the Automated Unit Test Suite
```bash
# Run Vitest test suite
npm test
```

### Building for Production
```bash
# Type check and build production bundle
npm run build
```
