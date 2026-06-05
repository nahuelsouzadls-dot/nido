// Web stub — push notifications no están disponibles en web.
// Metro resuelve notificaciones.native.ts en iOS/Android automáticamente.

export async function registrarPushToken(_perfilId: string) {}

export async function enviarNotificacionLocal(_titulo: string, _cuerpo: string) {}

export async function notificarCompanero(
  _hogarId: string,
  _miId: string,
  _titulo: string,
  _cuerpo: string,
) {}
