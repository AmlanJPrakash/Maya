export const hapticFeedback = (pattern: number | number[] = 10) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(pattern);
  }
};

export const haptics = {
  light: () => hapticFeedback(10),
  medium: () => hapticFeedback(20),
  success: () => hapticFeedback([10, 30, 10]),
  error: () => hapticFeedback([50, 50, 50]),
};
