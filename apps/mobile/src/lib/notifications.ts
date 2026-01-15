/**
 * Push Notification Library
 *
 * Handles push notification registration, permissions, and event listeners.
 * Uses Expo's push notification service for iOS and Android.
 */

import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { tokenStorage } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sync.co.il';

// Configure notification handler - determines how notifications are displayed
// when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications
 * 1. Creates Android notification channel if needed
 * 2. Checks device is physical (not simulator)
 * 3. Requests permission if not granted
 * 4. Gets Expo push token
 * 5. Sends token to backend
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  // Android requires notification channel to be created
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('verification', {
      name: 'אימות מיקום',
      description: 'הודעות על צ׳ק-אין לאימות תושבות',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
      sound: 'default',
    });

    // Also create a default channel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'הודעות כלליות',
      description: 'הודעות כלליות מהאפליקציה',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  // Must be a physical device for push notifications
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return undefined;
  }

  // Check current permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return undefined;
  }

  // Get Expo push token
  try {
    // Get project ID from EAS config
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.error('EAS project ID not found. Update app.json extra.eas.projectId');
      return undefined;
    }

    const pushTokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = pushTokenResponse.data;

    // Send token to backend
    await sendTokenToServer(token);

    return token;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return undefined;
  }
}

/**
 * Send push token to the backend server
 */
async function sendTokenToServer(token: string): Promise<void> {
  try {
    const sessionToken = await tokenStorage.getSessionToken();
    if (!sessionToken) {
      console.warn('No session token, cannot register push token');
      return;
    }

    const response = await fetch(`${API_URL}/api/user/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        token,
        deviceType: Platform.OS as 'ios' | 'android',
        deviceName: Device.deviceName || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to register push token:', error);
    }
  } catch (error) {
    console.error('Error sending push token to server:', error);
  }
}

/**
 * Unregister push token from server (e.g., on logout)
 */
export async function unregisterPushToken(): Promise<void> {
  try {
    const sessionToken = await tokenStorage.getSessionToken();
    if (!sessionToken) return;

    // Get current token
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) return;

    const pushTokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = pushTokenResponse.data;

    await fetch(`${API_URL}/api/user/push-token?token=${encodeURIComponent(token)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
  } catch (error) {
    console.error('Error unregistering push token:', error);
  }
}

/**
 * Check if push notifications are enabled
 */
export async function arePushNotificationsEnabled(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Request push notification permissions
 * Returns true if permissions were granted
 */
export async function requestPushPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Get the current notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// ============================================================================
// React Hooks
// ============================================================================

/**
 * Hook to handle notification events
 * Call this in your root layout to handle incoming notifications
 */
export function useNotificationListeners(options?: {
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void;
}) {
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Listener for when notification is received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        options?.onNotificationReceived?.(notification);
      }
    );

    // Listener for when user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        options?.onNotificationResponse?.(response);
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [options?.onNotificationReceived, options?.onNotificationResponse]);
}

/**
 * Hook to get and manage push notification state
 */
export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = React.useState<string | undefined>();
  const [isEnabled, setIsEnabled] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Check initial status
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    const enabled = await arePushNotificationsEnabled();
    setIsEnabled(enabled);
    setIsLoading(false);
  }, []);

  const register = useCallback(async () => {
    setIsLoading(true);
    const token = await registerForPushNotificationsAsync();
    setExpoPushToken(token);
    setIsEnabled(!!token);
    setIsLoading(false);
    return token;
  }, []);

  const unregister = useCallback(async () => {
    await unregisterPushToken();
    setExpoPushToken(undefined);
    setIsEnabled(false);
  }, []);

  return {
    expoPushToken,
    isEnabled,
    isLoading,
    register,
    unregister,
    refresh: checkStatus,
  };
}

// Need to import React for the useState hook
import React from 'react';

/**
 * Get notification data from a notification response
 * Use this to navigate to the appropriate screen
 */
export function getNotificationData(
  response: Notifications.NotificationResponse
): {
  type?: string;
  screen?: string;
  data?: Record<string, unknown>;
} {
  const notification = response.notification;
  const data = notification.request.content.data as Record<string, unknown> | undefined;

  return {
    type: data?.type as string | undefined,
    screen: data?.screen as string | undefined,
    data,
  };
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: trigger || null, // null = immediate delivery
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get count of unread notifications (badge count)
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge count
 */
export async function clearBadgeCount(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
