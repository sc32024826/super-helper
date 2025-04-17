import { ref } from "vue";

// 节流
export const useThrottle = (fn: Function, delay: number) => {
  const canRun = ref(true);
  return (...args: any[]) => {
    if (!canRun.value) return;
    canRun.value = false;
    setTimeout(() => {
      fn(...args);
      canRun.value = true;
    }, delay);
  };
};
