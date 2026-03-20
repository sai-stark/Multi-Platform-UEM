import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

interface BaseDialogContextValue {
  /** Child calls this to register its save handler */
  registerSave: (handler: () => void | Promise<void>) => void;
  /** Child calls this to update loading state shown on the footer Save button */
  setLoading: (loading: boolean) => void;
  /** Child calls this to disable the footer Save button */
  setSaveDisabled: (disabled: boolean) => void;
}

const BaseDialogContext = createContext<BaseDialogContextValue | null>(null);

/**
 * Hook for child policy components to register their save handler
 * and update loading / disabled state on the BaseDialog footer.
 */
export function useBaseDialogContext() {
  const ctx = useContext(BaseDialogContext);
  if (!ctx) {
    if (import.meta.env.DEV) {
      console.log('[BaseDialogContext] used outside provider — save bridge inactive');
    }
    // Return no-ops so components still work outside BaseDialog (e.g. standalone usage)
    return {
      registerSave: () => {},
      setLoading: () => {},
      setSaveDisabled: () => {},
    } satisfies BaseDialogContextValue;
  }
  return ctx;
}

interface BaseDialogProviderProps {
  children: ReactNode;
  onSaveRef: React.MutableRefObject<(() => void | Promise<void>) | null>;
  onLoadingChange: (loading: boolean) => void;
  onSaveDisabledChange: (disabled: boolean) => void;
}

export function BaseDialogProvider({
  children,
  onSaveRef,
  onLoadingChange,
  onSaveDisabledChange,
}: BaseDialogProviderProps) {
  const registerSave = useCallback(
    (handler: () => void | Promise<void>) => {
      onSaveRef.current = handler;
    },
    [onSaveRef],
  );

  const setLoading = useCallback(
    (loading: boolean) => {
      onLoadingChange(loading);
    },
    [onLoadingChange],
  );

  const setSaveDisabled = useCallback(
    (disabled: boolean) => {
      onSaveDisabledChange(disabled);
    },
    [onSaveDisabledChange],
  );

  const value: BaseDialogContextValue = { registerSave, setLoading, setSaveDisabled };

  return <BaseDialogContext.Provider value={value}>{children}</BaseDialogContext.Provider>;
}
