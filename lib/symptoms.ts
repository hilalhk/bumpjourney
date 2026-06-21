import { Ionicons } from '@expo/vector-icons';

export type Intensity = 'mild' | 'moderate' | 'severe';
export type SymptomData = Record<string, Intensity>;

export type Symptom = { id: string; label: string; icon: keyof typeof Ionicons.glyphMap };
// iconPath is the exact 24×24 stroke-icon path from the redesign comp.
export type Category = { title: string; iconPath: string; icon: keyof typeof Ionicons.glyphMap; symptoms: Symptom[] };

// The 4 quick-access symptoms (most commonly logged)
export const QUICK_IDS = ['nausea', 'fatigue', 'back_pain', 'cravings'];

export const CATEGORIES: Category[] = [
  {
    title: 'Digestive',
    iconPath: 'M6 2v7a3 3 0 0 0 6 0V2M9 2v20M18 2c-1.7 0-3 2-3 5s1.3 5 3 5M18 12v10',
    icon: 'restaurant-outline',
    symptoms: [
      { id: 'nausea', label: 'Nausea', icon: 'sad-outline' },
      { id: 'heartburn', label: 'Heartburn', icon: 'flame-outline' },
      { id: 'constipation', label: 'Constipation', icon: 'remove-circle-outline' },
      { id: 'bloating', label: 'Bloating', icon: 'ellipse-outline' },
      { id: 'cravings', label: 'Cravings', icon: 'fast-food-outline' },
      { id: 'aversion', label: 'Food aversion', icon: 'close-circle-outline' },
    ],
  },
  {
    title: 'Energy & sleep',
    iconPath: 'M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z',
    icon: 'battery-half-outline',
    symptoms: [
      { id: 'fatigue', label: 'Fatigue', icon: 'battery-dead-outline' },
      { id: 'insomnia', label: 'Insomnia', icon: 'moon-outline' },
      { id: 'restless', label: 'Restless', icon: 'bed-outline' },
    ],
  },
  {
    title: 'Aches & pains',
    iconPath: 'M12 2a7 7 0 0 0-4 12.7V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4.3A7 7 0 0 0 12 2z',
    icon: 'bandage-outline',
    symptoms: [
      { id: 'back_pain', label: 'Back pain', icon: 'body-outline' },
      { id: 'headache', label: 'Headache', icon: 'thunderstorm-outline' },
      { id: 'cramps', label: 'Cramps', icon: 'flash-outline' },
      { id: 'ligament', label: 'Ligament pain', icon: 'fitness-outline' },
      { id: 'pelvic', label: 'Pelvic pressure', icon: 'arrow-down-circle-outline' },
    ],
  },
  {
    title: 'Mood',
    iconPath: 'M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 5a5 5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9z',
    icon: 'heart-outline',
    symptoms: [
      { id: 'anxious', label: 'Anxious', icon: 'alert-circle-outline' },
      { id: 'emotional', label: 'Emotional', icon: 'water-outline' },
      { id: 'irritable', label: 'Irritable', icon: 'flame-outline' },
      { id: 'low', label: 'Low', icon: 'rainy-outline' },
      { id: 'happy', label: 'Happy', icon: 'happy-outline' },
    ],
  },
  {
    title: 'Body',
    iconPath: 'M12 2.5c-2.6 3.4-4.5 6-4.5 9a4.5 4.5 0 0 0 9 0c0-3-1.9-5.6-4.5-9z',
    icon: 'flower-outline',
    symptoms: [
      { id: 'swelling', label: 'Swelling', icon: 'water-outline' },
      { id: 'breast_tender', label: 'Breast tenderness', icon: 'flower-outline' },
      { id: 'skin', label: 'Skin changes', icon: 'sparkles-outline' },
      { id: 'dizziness', label: 'Dizziness', icon: 'sync-outline' },
      { id: 'urination', label: 'Frequent urination', icon: 'repeat-outline' },
      { id: 'breathless', label: 'Shortness of breath', icon: 'cloud-outline' },
    ],
  },
];

// Flat lookup: id → { label, icon, category }
export const SYMPTOM_LOOKUP: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {};
CATEGORIES.forEach((c) => c.symptoms.forEach((s) => { SYMPTOM_LOOKUP[s.id] = { label: s.label, icon: s.icon }; }));

export function quickSymptoms(): Symptom[] {
  return QUICK_IDS.map((id) => {
    const s = SYMPTOM_LOOKUP[id];
    return { id, label: s.label, icon: s.icon };
  });
}

export const INTENSITY_ORDER: Intensity[] = ['mild', 'moderate', 'severe'];