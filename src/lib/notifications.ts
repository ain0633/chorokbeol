const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const swUrl = `${window.location.origin}/sw.js`;
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
      });
      
      console.log('Service Worker 등록 성공:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker 등록 실패:', error);
      return null;
    }
  }
  console.log('Service Worker를 지원하지 않는 브라우저입니다.');
  return null;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('이 브라우저는 알림을 지원하지 않습니다.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    
    console.log('푸시 알림 구독 성공:', subscription);
    return subscription;
  } catch (error) {
    console.error('푸시 알림 구독 실패:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function sendLocalNotification(
  title: string,
  options: NotificationOptions
): Promise<void> {
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.log('알림 권한이 없습니다.');
    return;
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    });
  } else {
    new Notification(title, {
      icon: '/icon-192.png',
      ...options,
    });
  }
}

export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
}

export function canSendNotifications(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}