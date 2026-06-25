export type Milestone = { title: string; desc: string; icon: string };

const BY_TRIMESTER: Record<number, Milestone[]> = {
  1: [
    { title: 'First heartbeat', desc: 'Seeing the first tiny flicker on the ultrasound.', icon: 'heart-rate' },
    { title: 'Dating scan', desc: 'First ultrasound confirming your due date.', icon: 'search' },
    { title: 'Trimester end', desc: 'Miscarriage risk drops, and many feel ready to share the news.', icon: 'calendar-slash' },
  ],
  2: [
    { title: 'First kicks', desc: 'Feeling those first flutters of movement.', icon: 'pulse-outline' },
    { title: 'Anatomy scan', desc: 'A detailed check of baby’s development.', icon: 'search-outline' },
    { title: 'Finding out', desc: 'You can learn the sex, if you choose to.', icon: 'heart-outline' },
  ],
  3: [
    { title: 'Full term', desc: 'Reaching week 37 — baby could arrive any time.', icon: 'checkmark-circle-outline' },
    { title: 'Head down', desc: 'Baby settles into position for birth.', icon: 'arrow-down-outline' },
    { title: 'Hospital bag', desc: 'Packed and ready for the big day.', icon: 'bag-handle-outline' },
  ],
};

// An extra, multiples-specific milestone surfaced when carrying twins+.
const MULTIPLES_BY_TRIMESTER: Record<number, Milestone> = {
  1: { title: 'Confirming multiples', desc: 'An early scan checks how many babies and how they share a placenta.', icon: 'search' },
  2: { title: 'Growth scans', desc: 'More frequent scans track each baby’s growth.', icon: 'pulse-outline' },
  3: { title: 'Earlier arrival', desc: 'Multiples often come before 37 weeks — be ready ahead of time.', icon: 'checkmark-circle-outline' },
};

export function getMilestones(trimester: number, count = 1): Milestone[] {
  const base = BY_TRIMESTER[trimester] ?? BY_TRIMESTER[1];
  if (count > 1) {
    const extra = MULTIPLES_BY_TRIMESTER[trimester] ?? MULTIPLES_BY_TRIMESTER[1];
    return [extra, ...base];
  }
  return base;
}