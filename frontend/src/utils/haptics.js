// #10 Haptic feedback utility
// Wraps @capacitor/haptics with graceful fallback for web
let Haptics = null;
let hapticsReady = false;

try {
  import('@capacitor/haptics').then(mod => {
    Haptics = mod.Haptics;
    hapticsReady = true;
  }).catch(() => {});
} catch {}

export const hapticImpact = async (style = 'Medium') => {
  if (!hapticsReady || !Haptics) return;
  try {
    await Haptics.impact({ style });
  } catch {}
};

export const hapticNotification = async (type = 'Success') => {
  if (!hapticsReady || !Haptics) return;
  try {
    await Haptics.notification({ type });
  } catch {}
};
