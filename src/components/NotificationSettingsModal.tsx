import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestNotificationPermission, canSendNotifications } from '@/lib/notifications';
import Modal from './ModalWrapper';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({ isOpen, onClose }: Props) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [wateringReminder, setWateringReminder] = useState(true);
  const [weatherAlert, setWeatherAlert] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPermission(Notification.permission);
      const saved = localStorage.getItem('chorokbyeol-notification-settings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          setPushEnabled(settings.pushEnabled ?? true);
          setWateringReminder(settings.wateringReminder ?? true);
          setWeatherAlert(settings.weatherAlert ?? true);
          setQuietHoursStart(settings.quietHoursStart ?? '22:00');
          setQuietHoursEnd(settings.quietHoursEnd ?? '07:00');
        } catch {
          // ignore
        }
      }
    }
  }, [isOpen]);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const settings = {
      pushEnabled,
      wateringReminder,
      weatherAlert,
      quietHoursStart,
      quietHoursEnd,
    };
    
    localStorage.setItem('chorokbyeol-notification-settings', JSON.stringify(settings));
    
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const quietHoursDisplay = `${quietHoursStart} ~ ${quietHoursEnd}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">🔔 알림 설정</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            ✕
          </button>
        </div>

        <AnimatePresence mode="wait">
          {permission !== 'granted' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="text-sm font-medium text-foreground">알림 권한이 필요해요</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    식물 물주기 알림을 받으려면 알림 권한을 허용해주세요.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRequestPermission}
                    className="mt-3 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium"
                  >
                    알림 권한 허용
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {permission === 'granted' && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl glass-light">
                <div>
                  <p className="text-sm font-medium text-foreground">푸시 알림</p>
                  <p className="text-xs text-muted-foreground">모든 알림 받기</p>
                </div>
                <button
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    pushEnabled ? 'bg-lime' : 'bg-muted'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-md"
                    animate={{ x: pushEnabled ? 26 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl glass-light">
                <div>
                  <p className="text-sm font-medium text-foreground">💧 물주기 알림</p>
                  <p className="text-xs text-muted-foreground">식물별 물주기 시간 알림</p>
                </div>
                <button
                  onClick={() => setWateringReminder(!wateringReminder)}
                  disabled={!pushEnabled}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    wateringReminder && pushEnabled ? 'bg-lime' : 'bg-muted'
                  } disabled:opacity-50`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-md"
                    animate={{ x: wateringReminder && pushEnabled ? 26 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl glass-light">
                <div>
                  <p className="text-sm font-medium text-foreground">🌤 날씨 알림</p>
                  <p className="text-xs text-muted-foreground">폭우, 폭염 등 날씨 경고</p>
                </div>
                <button
                  onClick={() => setWeatherAlert(!weatherAlert)}
                  disabled={!pushEnabled}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    weatherAlert && pushEnabled ? 'bg-lime' : 'bg-muted'
                  } disabled:opacity-50`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-md"
                    animate={{ x: weatherAlert && pushEnabled ? 26 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="p-3 rounded-xl glass-light">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">🌙 방해 금지 시간</p>
                    <p className="text-xs text-muted-foreground">알림을 받지 않을 시간</p>
                  </div>
                  <span className="text-sm text-lime font-medium">{quietHoursDisplay}</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground">시작</label>
                    <input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground">종료</label>
                    <input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-lime text-lime-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? '저장 중...' : '설정 저장'}
            </motion.button>
          </>
        )}

        {permission === 'denied' && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">
              알림 권한이 차단되어 있습니다. 브라우저 설정에서 권한을 허용해주세요.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}