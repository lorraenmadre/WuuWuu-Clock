export type PanchangClassification = 'green' | 'red' | 'gray';

export interface PanchangDefinition {
  canonicalName: string;
  classification: PanchangClassification;
  aliases: string[];
  description?: string;
}

/**
 * Deterministic Panchang Classification Registry.
 *
 * CRITICAL ARCHITECTURAL RULE:
 * Gemini only extracts names and timestamps from raw Panchang text.
 * All green/red/gray classifications are strictly and deterministically
 * resolved through this TypeScript registry to guarantee consistency
 * and eliminate LLM non-determinism.
 */
export const PANCHANG_REGISTRY: PanchangDefinition[] = [
  // Auspicious (Green)
  {
    canonicalName: 'Brahma Muhurta',
    classification: 'green',
    aliases: [
      'brahma muhurta',
      'brahma muhurtham',
      'brahmamuhurtha',
      'brahma',
      'brahma muhurat',
      'brahmamuhurta',
    ],
    description: 'Supreme auspicious dawn window for meditation, study, and mental clarity.',
  },
  {
    canonicalName: 'Amrita Gadiyas',
    classification: 'green',
    aliases: [
      'amrita gadiyas',
      'amrit gadiyas',
      'amrita kala',
      'amrit kaal',
      'amrit kalam',
      'amrita muhurta',
      'amrit',
      'amrita',
      'amrit ghati',
    ],
    description: 'Nectar window for vital, life-affirming beginnings and important activities.',
  },
  {
    canonicalName: 'Abhijit Muhurta',
    classification: 'green',
    aliases: [
      'abhijit muhurta',
      'abhijit muhurtham',
      'abhijit',
      'abhijith',
      'abhijeet muhurat',
      'abhijeet',
      'abhijit muhurtam',
    ],
    description: 'Midday victory window capable of neutralizing negative astrological influences.',
  },
  {
    canonicalName: 'Shuba Muhurtham',
    classification: 'green',
    aliases: [
      'shuba muhurtham',
      'shubh muhurat',
      'shubh muhurtham',
      'shubha muhurta',
      'vijaya muhurta',
      'godhuli muhurta',
      'ravi yoga',
      'sarvartha siddhi yoga',
      'amrit siddhi yoga',
      'shubh',
      'shubha',
    ],
    description: 'Auspicious muhurta for initiating beneficial undertakings.',
  },

  // Inauspicious (Red)
  {
    canonicalName: 'Rahu Kala',
    classification: 'red',
    aliases: [
      'rahu kala',
      'rahu kalam',
      'rahu kaal',
      'rahukala',
      'rahukaal',
      'rahu',
      'rahukalam',
    ],
    description: 'Inauspicious window governed by Rahu; avoid launches, travel, and irreversible commitments.',
  },
  {
    canonicalName: 'Yamaganda',
    classification: 'red',
    aliases: [
      'yamaganda',
      'yamagandam',
      'yamagand',
      'yamakandam',
      'yama kalam',
      'yama kaal',
      'yamaganda kalam',
    ],
    description: 'Inauspicious window governed by Ketu/Yama; avoid signing contracts and departures.',
  },
  {
    canonicalName: 'Gulika Kala',
    classification: 'red',
    aliases: [
      'gulika kala',
      'gulika kalam',
      'gulika kaal',
      'gulika',
      'gulikai',
      'kuligai',
      'gulikakaal',
      'gulika muhurta',
    ],
    description: 'Saturnian slow window; avoid quick wins or initial celebrations.',
  },
  {
    canonicalName: 'Dur Muhurtam',
    classification: 'red',
    aliases: [
      'dur muhurtam',
      'dur muhurtham',
      'durmuhurtham',
      'durmuhurta',
      'dur muhurat',
      'durmuhurat',
    ],
    description: 'Inauspicious astrological muhurta; postpone critical initiatives.',
  },
  {
    canonicalName: 'Varjyam',
    classification: 'red',
    aliases: ['varjyam', 'varjya', 'varjam', 'visha varjyam'],
    description: 'Detrimental or toxic period within a nakshatra; avoid new ventures.',
  },
  {
    canonicalName: 'Bhadra',
    classification: 'red',
    aliases: ['bhadra', 'vishti karana', 'vishti', 'bhadra kaal'],
    description: 'Harsh astrological influence; avoid constructive ceremonies.',
  },
];

/**
 * Deterministically classifies a Panchang period name into 'green', 'red', or 'gray'.
 * Guarantees that rule evaluation is strictly code-driven.
 */
export function classifyPanchangPeriod(
  periodName: string,
  fallback: PanchangClassification = 'gray'
): PanchangClassification {
  if (!periodName) return fallback;
  const norm = periodName
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Direct registry canonical match
  for (const entry of PANCHANG_REGISTRY) {
    if (norm === entry.canonicalName.toLowerCase()) {
      return entry.classification;
    }
  }

  // 2. Alias matching
  for (const entry of PANCHANG_REGISTRY) {
    for (const alias of entry.aliases) {
      if (norm === alias || norm.includes(alias) || alias.includes(norm)) {
        return entry.classification;
      }
    }
  }

  // 3. Fallback keyword matching
  if (
    norm.includes('rahu') ||
    norm.includes('yama') ||
    norm.includes('guli') ||
    norm.includes('varj') ||
    norm.includes('dur') ||
    norm.includes('bhadra')
  ) {
    return 'red';
  }

  if (
    norm.includes('brahma') ||
    norm.includes('amrit') ||
    norm.includes('abhij') ||
    norm.includes('shubh') ||
    norm.includes('vijaya')
  ) {
    return 'green';
  }

  return fallback;
}

/**
 * Normalizes period name to canonical title if recognized in registry.
 */
export function getCanonicalPanchangName(periodName: string): string {
  if (!periodName) return 'Custom Period';
  const norm = periodName
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const entry of PANCHANG_REGISTRY) {
    if (norm === entry.canonicalName.toLowerCase()) return entry.canonicalName;
    for (const alias of entry.aliases) {
      if (norm === alias || norm.includes(alias) || alias.includes(norm)) {
        return entry.canonicalName;
      }
    }
  }

  return periodName.trim();
}
