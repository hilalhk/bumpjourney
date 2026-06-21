const PROMPTS: Record<number, string[]> = {
  4:  ['How did you find out you were pregnant?', 'What was your first reaction?'],
  5:  ['Who have you told so far?', 'What are you feeling most right now?'],
  6:  ['What are your hopes for this pregnancy?', 'Any cravings or aversions yet?'],
  7:  ['How are you feeling physically this week?', 'What are you most looking forward to?'],
  8:  ['Write a note to your baby.', 'What has surprised you most so far?'],
  9:  ['How are your energy levels?', 'What is on your mind today?'],
  10: ['What is your favorite moment of the week?', 'Any worries you want to set down here?'],
  11: ['How are you preparing for the months ahead?', 'What made you smile this week?'],
  12: ['How was your first scan?', 'What does this milestone feel like?'],
  13: ['Welcome to the second trimester — how do you feel?', 'What are you grateful for?'],
  14: ['What are you enjoying most right now?', 'Any new symptoms this week?'],
  15: ['What would you tell your pre-pregnancy self?', 'How is your bump changing?'],
  16: ['Have you felt any movement yet?', 'What is your mood like this week?'],
  17: ['What are you daydreaming about?', 'How are you taking care of yourself?'],
  18: ['What does your baby feel like when they move?', 'Any names on your mind?'],
  19: ['What has been the best part of this week?', 'How are you feeling about the birth?'],
  20: ['Halfway there — reflect on the journey so far.', 'How did the anatomy scan go?'],
  21: ['What is your favorite way to connect with baby?', 'What are you most proud of?'],
  22: ['How is your body feeling these days?', 'What are you looking forward to buying?'],
  23: ['What does a good day look like right now?', 'Any advice you have received that stuck?'],
  24: ['What are your hopes for the third trimester?', 'How are you sleeping?'],
  25: ['What song or sound does baby respond to?', 'What is on your preparation list?'],
  26: ['How are you feeling as things get real?', 'Write a wish for your baby.'],
  27: ['Last week of the second trimester — reflect.', 'What are you nervous about?'],
  28: ['Welcome to the third trimester — how do you feel?', 'What does your routine look like now?'],
  29: ['How are you preparing your space for baby?', 'What are you most excited about?'],
  30: ['What has this pregnancy taught you?', 'How are you resting these days?'],
  31: ['What are your thoughts on the birth plan?', 'What makes you feel calm right now?'],
  32: ['What are you grateful for this week?', 'How is your bump feeling?'],
  33: ['What do you want to remember about now?', 'Who has supported you most?'],
  34: ['How are you feeling about meeting your baby?', 'What is left on your to-do list?'],
  35: ['What are your hopes for the delivery day?', 'How are you feeling physically?'],
  36: ['Is your hospital bag ready? How do you feel?', 'Write a note to baby before they arrive.'],
  37: ['Baby could come any time now — how do you feel?', 'What are you most looking forward to?'],
  38: ['How are you spending these final days?', 'What are you feeling in this moment?'],
  39: ['Any signs things are starting?', 'What do you want to tell your baby?'],
  40: ['You made it to your due date — reflect.', 'What is your final wish before baby arrives?'],
};

export function getPrompts(week: number): string[] {
  const clamped = Math.min(40, Math.max(4, week));
  return PROMPTS[clamped] ?? ['How are you feeling today?', 'Write a note to your baby.'];
}

export const MOODS = [
  'Joyful', 'Grateful', 'Excited', 'Calm', 'Hopeful',
  'Tired', 'Anxious', 'Emotional', 'Overwhelmed', 'Uncomfortable',
];