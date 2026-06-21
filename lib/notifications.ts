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

export async function ensurePermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const { status: asked } = await Notifications.requestPermissionsAsync();
  if (asked !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('appointments', {
      name: 'Appointment reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  return true;
}

export async function scheduleApptReminder(
  title: string,
  apptAt: Date,
  hoursBefore = 24
): Promise<string | null> {
  const fireAt = new Date(apptAt.getTime() - hoursBefore * 60 * 60 * 1000);
  if (fireAt <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Upcoming appointment',
      body: `${title} is tomorrow at ${apptAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
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
  const granted = await ensurePermission();
  if (!granted) return [];

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medications', {
      name: 'Medication reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

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