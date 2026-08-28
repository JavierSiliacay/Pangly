import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let currentNotificationId: string | null = null;
let hasPermission = false;

/**
 * Request permission for notifications.
 * Should be called right before starting the download.
 */
export async function requestNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('download_progress', {
      name: 'Download Progress',
      importance: Notifications.AndroidImportance.LOW,
      sound: null,
    });

    await Notifications.setNotificationChannelAsync('pangly_alerts', {
      name: 'Pangly Alerts & Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'notification_sound.wav',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    hasPermission = finalStatus === 'granted';
  } else {
    // iOS doesn't strictly need persistent background download notifications,
    // but if we were to support it, we'd request here.
    hasPermission = false; 
  }
}

/**
 * Show or update a background download progress notification.
 */
export async function showDownloadNotification(
  step: number,
  downloadedMbText: string,
  etaLabel: string
) {
  if (!hasPermission) return;

  try {
    const content: Notifications.NotificationContentInput = {
      title: 'Pangly AI Setup',
      body: `Downloading Step ${step} of 2 \u00B7 ${downloadedMbText}\n${etaLabel}`,
      data: { isDownloadProgress: true },
      autoDismiss: false,
      sticky: true,
      sound: false,
    };

    let trigger: Notifications.NotificationTriggerInput = null;
    if (Platform.OS === 'android') {
      trigger = {
        channelId: 'download_progress',
      };
    }

    if (currentNotificationId) {
      // On Android, sending a notification with the same identifier updates the existing one
      await Notifications.scheduleNotificationAsync({
        identifier: currentNotificationId,
        content,
        trigger, // immediate with channel
      });
    } else {
      currentNotificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger,
      });
    }
  } catch (error) {
    console.error('Failed to show download notification', error);
  }
}

/**
 * Cancel the download notification when finished, cancelled, or failed.
 */
export async function cancelDownloadNotification() {
  if (currentNotificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(currentNotificationId);
    } catch (e) {
      console.warn('Failed to cancel download notification', e);
    }
    currentNotificationId = null;
  }
}
