// Custom event system for cross-component communication

// Event types
export const EVENTS = {
  BALANCE_REFRESH: 'dreamdeck:balance-refresh',
  GENERATION_COMPLETE: 'dreamdeck:generation-complete',
} as const;

// Trigger balance refresh
export function triggerBalanceRefresh() {
  window.dispatchEvent(new CustomEvent(EVENTS.BALANCE_REFRESH));
}

// Trigger generation complete
export function triggerGenerationComplete(data?: { count: number; seed?: number }) {
  window.dispatchEvent(new CustomEvent(EVENTS.GENERATION_COMPLETE, { detail: data }));
}

// Hook to listen to balance refresh
export function useBalanceRefreshListener(callback: () => void) {
  if (typeof window !== 'undefined') {
    window.addEventListener(EVENTS.BALANCE_REFRESH, callback);
    return () => window.removeEventListener(EVENTS.BALANCE_REFRESH, callback);
  }
  return () => {};
}
