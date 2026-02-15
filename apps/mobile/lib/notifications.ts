import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification handler for foreground display
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Push notifications are not supported on web without VAPID configuration
    if (Platform.OS === 'web') {
      return null;
    }

    // Request permissions first
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn('Push notification permissions not granted');
      return null;
    }

    // Get Expo push token
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenData.data;

    // Save token to user profile
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Type assertion needed until database is fully set up
      const { error } = await supabase
        .from('profiles')
        .update({ push_token: token } as never)
        .eq('id', user.id);

      if (error) {
        console.error('Failed to save push token:', error);
        return null;
      }
    }

    // Android-specific channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#13ECC8',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

export async function getExpoPushToken(): Promise<string | null> {
  try {
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenData.data;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }
}
