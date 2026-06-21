import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const QUEUE_KEY = 'health_sync_queue';

type QueueItem = {
  table: 'kick_sessions' | 'contraction_sessions';
  payload: Record<string, unknown>;
};

async function readQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeQueue(queue: QueueItem[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function saveSession(item: QueueItem) {
  const queue = await readQueue();
  queue.push(item);
  await writeQueue(queue);
  trySyncAll();
}

export async function trySyncAll(): Promise<number> {
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
}

export async function pendingCount(): Promise<number> {
  return (await readQueue()).length;
}