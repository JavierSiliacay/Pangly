// src/services/reminderNotificationService.ts
// Handles scheduling local reminder notifications with Pangly's signature sound.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Schedule a local notification for a reminder with Pangly custom chime sound.
 */
export async function scheduleReminderNotification(params: {
  id: string;
  title: string;
  dueDate: string;      // YYYY-MM-DD
  dueTime?: string;     // HH:mm
}): Promise<string | null> {
  try {
    const { id, title, dueDate, dueTime = '09:00' } = params;
    
    // Parse target date & time
    const [year, month, day] = dueDate.split('-').map(Number);
    const [hours, minutes] = dueTime.split(':').map(Number);
    
    const triggerDate = new Date(year, month - 1, day, hours, minutes, 0);

    // If date is in the past, do not schedule
    if (triggerDate.getTime() <= Date.now()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: `pangly-rem-${id}`,
      content: {
        title: 'Pangly Reminder',
        body: title,
        sound: 'notification_sound.wav',
        data: { reminderId: id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'pangly_alerts',
      },
    });

    return notificationId;
  } catch (error) {
    console.warn('[reminderNotificationService] Scheduling error:', error);
    return null;
  }
}

/**
 * Cancel a scheduled reminder notification.
 */
export async function cancelReminderNotification(reminderId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`pangly-rem-${reminderId}`);
  } catch (error) {
    // Non-fatal
  }
}
