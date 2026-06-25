// Supportive, stage-aware tips shown on Home when the user is carrying
// multiples. General guidance only (the app's disclaimers apply) — everything
// points back to the user's care provider, and nothing here is medical advice.

const TIPS: Record<number, string[]> = {
  1: [
    'Carrying more than one baby often means stronger early symptoms — extra nausea and tiredness are common as your hormone levels run higher.',
    "You'll usually have an early ultrasound to confirm how many babies and whether they share a placenta. It's important information for your care team.",
    'Multiples raise your need for folate and iron. Ask your provider about the right prenatal vitamins for a multiple pregnancy.',
    'Try not to compare your bump to single-baby timelines — with multiples, things tend to move a little faster.',
  ],
  2: [
    "Your bump may measure ahead of your dates with multiples — that's expected, not a worry.",
    "You'll likely have more frequent scans so your team can track each baby's growth.",
    'Movement can start a little earlier with multiples — and you may feel kicks from more than one direction!',
    "Weight-gain targets are higher when you're carrying multiples. Your provider can give you a goal that's right for you.",
  ],
  3: [
    "Multiples often arrive early — many twins are born before 37 weeks, so it's worth packing your hospital bag sooner.",
    'Report any swelling, bad headaches, or regular tightening to your provider — pre-eclampsia and early labor are more common with multiples.',
    'Your team will talk through the safest birth plan for your babies, including their positions and whether a C-section is advised.',
    'Rest and put your feet up when you can — carrying multiples is more tiring, and it helps with swelling.',
  ],
};

/** A stage-appropriate tip for a multiple pregnancy, rotating gently by week. */
export function getMultiplesTip(week: number): string {
  const trimester = week <= 13 ? 1 : week <= 27 ? 2 : 3;
  const tips = TIPS[trimester];
  return tips[Math.max(0, week) % tips.length];
}
