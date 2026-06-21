import { User } from '@supabase/supabase-js';

/** Full display name: the name given at sign-up, else the email local-part. */
export function fullName(user: User | null | undefined): string {
  const meta = (user?.user_metadata?.full_name ?? user?.user_metadata?.name) as string | undefined;
  if (meta && meta.trim()) return meta.trim();
  return user?.email ? user.email.split('@')[0] : '';
}

/** First name only — used in greetings and the avatar initial. */
export function firstName(user: User | null | undefined): string {
  return fullName(user).split(' ')[0];
}
