import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registrarPushToken(perfilId: string) {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Nido',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId =
    (Constants.easConfig?.projectId as string | undefined) ??
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined);

  if (!projectId || projectId === 'TU_PROJECT_ID_AQUI') return;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  await supabase.from('perfiles').update({ push_token: token }).eq('id', perfilId);

  return token;
}

export async function enviarNotificacionLocal(titulo: string, cuerpo: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: cuerpo },
    trigger: { seconds: 1, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
  });
}

export async function notificarCompanero(
  hogarId: string,
  miId: string,
  titulo: string,
  cuerpo: string,
) {
  await supabase.functions.invoke('send-push', {
    body: { hogar_id: hogarId, exclude_id: miId, titulo, cuerpo },
  });
}
