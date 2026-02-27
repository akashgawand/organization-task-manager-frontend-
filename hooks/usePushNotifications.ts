"use client";

import { useEffect, useState } from "react";
import { getDeviceToken, messaging } from "@/lib/firebase";
import { onMessage } from "firebase/messaging";
import { userService } from "@/app/services/userServices";

export function usePushNotifications(userId?: string | null) {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client and if user makes sense
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Attempt registration entirely automatically if permission already granted
    // Or, allow the UI to invoke requestPermission manually
    if (userId && permission === "granted" && !token) {
      registerPushToken();
    }
  }, [userId, permission, token]);

  const requestPermission = async () => {
    try {
      if (!("Notification" in window)) return;
      
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm === "granted") {
        await registerPushToken();
      } else {
        console.warn("User denied push notifications");
      }
    } catch (error) {
      console.error("Failed to request push permission", error);
    }
  };

  const registerPushToken = async () => {
    try {
      const fcmToken = await getDeviceToken();
      if (fcmToken) {
        setToken(fcmToken);
        // Sync token to our backend API
        await userService.saveFcmToken(fcmToken);
        console.log("FCM Token successfully synced");
      }
    } catch (e) {
      console.error("Could not generate FCM Token", e);
    }
  };

  useEffect(() => {
    // Listen to foreground messages
    const listen = async () => {
      const msg = await messaging();
      if (msg) {
        onMessage(msg, (payload: any) => {
          console.log("Message received in foreground: ", payload);
          
          if (typeof window !== "undefined" && 'Notification' in window && Notification.permission === 'granted') {
             const notificationTitle = payload.notification?.title || "New Notification";
             const notificationOptions: NotificationOptions = {
                 body: payload.notification?.body,
                 icon: payload.notification?.icon || '/favicon.ico',
                 badge: '/favicon.ico',
                 data: payload.data,
                 requireInteraction: true,
                 silent: false,
                 dir: 'auto'
             };
             
             try {
                // Native Desktop Chrome Notification
                const n = new Notification(notificationTitle, notificationOptions);
                n.onclick = (e) => {
                   e.preventDefault();
                   if (payload.data?.url) {
                       window.open(payload.data.url, '_blank');
                   }
                   n.close();
                };
             } catch (e) {
                // Fallback for Android Chrome where new Notification() may throw
                console.warn("Failed native Notification(), falling back to ServiceWorker", e);
                navigator.serviceWorker.ready.then((registration) => {
                   registration.showNotification(notificationTitle, notificationOptions);
                });
             }
          }
        });
      }
    };
    if (permission === 'granted') {
        listen();
    }
  }, [permission]);

  return { permission, token, requestPermission };
}
