import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Android silently drops notifications posted to a channel that does not exist.
 * Channels must therefore be ensured on every launch, not only on the run where
 * the user first granted permission — previously the 'appointments' channel was
 * created inside the just-granted branch, so every later appointment reminder
 * targeted a missing channel. `setNotificationChannelAsync` is idempotent.
 */
async function ensureAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('appointments', {
    name: 'Appointment reminders',
    importance: Notifications.AndroidImportance.HIGH,
  });
  await Notifications.setNotificationChannelAsync('medications', {
    name: 'Medication reminders',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function ensurePermission(): Promise<boolean> {
  await ensureAndroidChannels();
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const { status: asked } = await Notifications.requestPermissionsAsync();
  return asked === 'granted';
}

export async function scheduleApptReminder(
  title: string,
  apptAt: Date,
  hoursBefore = 24
): Promise<string | null> {
  const fireAt = new Date(apptAt.getTime() - hoursBefore * 60 * 60 * 1000);
  if (fireAt <= new Date()) return null;

  // "tomorrow" is only true for the default 24h lead time; derive it so a
  // different `hoursBefore` cannot produce a wrong reminder body.
  const sameDay = fireAt.toDateString() === apptAt.toDateString();
  const when = sameDay ? 'today' : hoursBefore <= 48 ? 'tomorrow' : `on ${apptAt.toLocaleDateString()}`;
  const at = apptAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Upcoming appointment',
      body: `${title} is ${when} at ${at}.`,
      ...(Platform.OS === 'android' ? { channelId: 'appointments' } : {}),
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
  return id;
}

export async function cancelReminder(notifyId: string | null) {
  if (!notifyId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notifyId);
  } catch {
    // already fired or removed — nothing to do
  }
}

// ---- Medication reminders (daily repeating, one per time) ----

export async function scheduleMedReminders(
  medName: string,
  times: string[] // e.g. ['08:00', '20:00']
): Promise<string[]> {
  // ensurePermission() also ensures the Android channels exist.
  const granted = await ensurePermission();
  if (!granted) return [];

  const ids: string[] = [];
  for (const t of times) {
    const [hour, minute] = t.split(':').map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) continue;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medication reminder',
        body: `Time to take your ${medName}.`,
        ...(Platform.OS === 'android' ? { channelId: 'medications' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    ids.push(id);
  }
  return ids;
}

export async function cancelMedReminders(notifyIds: string[] | null) {
  if (!notifyIds || notifyIds.length === 0) return;
  for (const id of notifyIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // already fired or removed — nothing to do
    }
  }
}