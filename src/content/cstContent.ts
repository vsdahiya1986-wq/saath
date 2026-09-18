import type { IconName } from '@/components/ui/Icon';

export interface HomeObject {
  id: string;
  icon: IconName;
  label: string;
  category: CategoryId;
}

export type CategoryId = 'kitchen' | 'getting_ready' | 'around_house';

export const CATEGORIES: Record<CategoryId, { label: string; icon: IconName; color: string }> = {
  kitchen: { label: 'Kitchen', icon: 'kettle', color: '#b45309' },
  getting_ready: { label: 'Getting ready', icon: 'mirror', color: '#6d28d9' },
  around_house: { label: 'Around the house', icon: 'home', color: '#0369a1' },
};

/** Fix pack A1: shown names go through `t()`; `label` is the English fallback. */
export const itemKey = (id: string) => `item.${id}`;
export const bucketKey = (id: CategoryId) => `opt.bucket.${id}`;
export const togetherKey = (theme: string, part: 'theme' | 'q' | 'follow') => `together.${theme.toLowerCase().replace(/\s+/g, '_')}.${part}`;

/** Everyday North-East Indian household objects (original line art, no photographs). */
export const HOME_OBJECTS: HomeObject[] = [
  { id: 'reg_tumbler', icon: 'tumbler', label: 'Steel tumbler', category: 'kitchen' },
  { id: 'reg_kettle', icon: 'kettle', label: 'Tea kettle', category: 'kitchen' },
  { id: 'reg_thali', icon: 'thali', label: 'Thali plate', category: 'kitchen' },
  { id: 'reg_ghoti', icon: 'ghoti', label: 'Water pot', category: 'kitchen' },
  { id: 'reg_comb', icon: 'comb', label: 'Comb', category: 'getting_ready' },
  { id: 'reg_mirror', icon: 'mirror', label: 'Hand mirror', category: 'getting_ready' },
  { id: 'reg_slipper', icon: 'slipper', label: 'Slippers', category: 'getting_ready' },
  { id: 'reg_jhola', icon: 'jhola', label: 'Cloth bag', category: 'getting_ready' },
  { id: 'reg_umbrella', icon: 'umbrella', label: 'Japi hat', category: 'getting_ready' },
  { id: 'reg_broom', icon: 'broom', label: 'Broom', category: 'around_house' },
  { id: 'reg_torch', icon: 'torch', label: 'Torch', category: 'around_house' },
  { id: 'reg_keylock', icon: 'keylock', label: 'Lock and key', category: 'around_house' },
  { id: 'reg_lamp', icon: 'lamp', label: 'Diya lamp', category: 'around_house' },
  { id: 'reg_stool', icon: 'stool', label: 'Mora stool', category: 'around_house' },
  { id: 'reg_pankha', icon: 'pankha', label: 'Hand fan', category: 'around_house' },
  { id: 'reg_basket', icon: 'basket', label: 'Bamboo basket', category: 'around_house' },
  { id: 'reg_dhekia', icon: 'fern', label: 'Dhekia greens', category: 'kitchen' },
  { id: 'reg_claypot', icon: 'claypot', label: 'Earthen water pot', category: 'kitchen' },
  { id: 'reg_areca', icon: 'areca', label: 'Areca nut plate', category: 'kitchen' },
  { id: 'reg_ricepot', icon: 'ricepot', label: 'Rice pot', category: 'kitchen' },
  { id: 'reg_gamosa', icon: 'gamosa', label: 'Gamosa', category: 'getting_ready' },
  { id: 'reg_xorai', icon: 'xorai', label: 'Brass offering tray', category: 'around_house' },
  { id: 'reg_net', icon: 'net', label: 'Fishing net', category: 'around_house' },
  { id: 'reg_loom', icon: 'loom', label: 'Weaving loom', category: 'around_house' },
];

/**
 * CST reminiscence prompts: opinions and stories, never right/wrong facts.
 * Used by Together Moment when the family has not yet recorded a moment.
 */
export const REMINISCENCE_PROMPTS: { theme: string; icon: IconName; question: string; followUp: string }[] = [
  { theme: 'Childhood', icon: 'home', question: 'Tell me about the house you grew up in.', followUp: 'Who lived there with you?' },
  { theme: 'Food', icon: 'thali', question: 'What was your favourite food as a child?', followUp: 'Who used to cook it for you?' },
  { theme: 'Festivals', icon: 'lamp', question: 'How did your family celebrate Bihu or a festival you love?', followUp: 'What did you wear on that day?' },
  { theme: 'Music', icon: 'music', question: 'Which song do you remember singing when you were young?', followUp: 'Can you hum a little of it?' },
  { theme: 'Work', icon: 'basket', question: 'What work did you enjoy doing with your hands?', followUp: 'Who taught you how to do it?' },
  { theme: 'Places', icon: 'umbrella', question: 'Where is a place that made you feel happy?', followUp: 'What could you see and hear there?' },
  { theme: 'Tea time', icon: 'kettle', question: 'How do you like your tea?', followUp: 'Who do you enjoy having tea with?' },
  { theme: 'Friends', icon: 'people', question: 'Tell me about a good friend from your younger days.', followUp: 'What did you do together?' },
];

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
