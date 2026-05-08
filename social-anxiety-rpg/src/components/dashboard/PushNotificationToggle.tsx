'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
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

export function PushNotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      // Check existing subscription
      navigator.serviceWorker.register('/sw.js').then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsSubscribed(subscription !== null);
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // Send to server
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
      alert('매일 연습 알림이 설정되었습니다! 🎉');
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('알림 설정에 실패했습니다. 브라우저 알림 권한을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
      <div>
        <h3 className="font-medium">매일 연습 알림</h3>
        <p className="text-sm text-muted-foreground">매일 잊지 않도록 알림을 보내드려요.</p>
      </div>
      {isSubscribed ? (
        <span className="text-sm font-medium text-primary">✅ 알림 켜짐</span>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={subscribeUser}
          disabled={isLoading}
        >
          {isLoading ? '설정 중...' : '알림 켜기'}
        </Button>
      )}
    </div>
  );
}
