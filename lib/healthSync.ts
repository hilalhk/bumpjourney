import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const QUEUE_KEY = 'health_sync_queue';

type QueueItem = {
  table: 'kick_sessions' | 'contraction_sessions';
  payload: Record<string, unknown>;
};

/**
 * Every queue mutation is a read-modify-write with awaits in the middle, so two
 * running concurrently corrupt each other:
 *
 *  - two `trySyncAll` runs (one fired by `saveSession`, one by the Health tab on
 *    focus) read the same queue and insert every item twice — a duplicate
 *    kick_sessions row, which then doubles "kicks logged today";
 *  - a `saveSession` landing mid-sync is discarded when the sync writes back the
 *    `remaining` list it computed from the older snapshot — the session is lost
 *    with no error.
 *
 * Serializing on one chain makes each mutation observe the previous one's write.
 * Each link is short (AsyncStorage plus a few inserts), so nothing queues deeply.
 */
let chain: Promise<unknown> = Promise.resolve();

function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  // Swallow rejections on the chain itself, or one failure wedges every later link.
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // A corrupt payload would otherwise throw on every call and wedge the queue.
    return [];
  }
}

async function writeQueue(queue: QueueItem[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function saveSession(item: QueueItem) {
  await serialize(async () => {
    const queue = await readQueue();
    queue.push(item);
    await writeQueue(queue);
  });
  // Best-effort flush — the item is already durable in the queue either way.
  trySyncAll().catch(() => {});
}

export function trySyncAll(): Promise<number> {
  return serialize(async () => {
    const queue = await readQueue();
    if (queue.length === 0) return 0;

    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    if (!user) return queue.length;

    const remaining: QueueItem[] = [];
    for (const item of queue) {
      const { error } = await supabase
        .from(item.table)
        .insert({ ...item.payload, user_id: user.id });
      if (error) remaining.push(item);
    }
    await writeQueue(remaining);
    return remaining.length;
  });
}

export function pendingCount(): Promise<number> {
  return serialize(async () => (await readQueue()).length);
}
