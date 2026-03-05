import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface BreadcrumbContextType {
  entityName: string | null;
  setEntityName: (name: string | null) => void;
  entityIcon: React.ElementType | null;
  setEntityIcon: (icon: React.ElementType | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  entityName: null,
  setEntityName: () => {},
  entityIcon: null,
  setEntityIcon: () => {},
});

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [entityName, setEntityNameState] = useState<string | null>(null);
  const [entityIcon, setEntityIconState] = useState<React.ElementType | null>(null);
  const location = useLocation();

  // Reset entity name and icon on route change
  useEffect(() => {
    setEntityNameState(null);
    setEntityIconState(null);
  }, [location.pathname]);

  const setEntityName = useCallback((name: string | null) => {
    setEntityNameState(name);
  }, []);

  const setEntityIcon = useCallback((icon: React.ElementType | null) => {
    setEntityIconState(icon);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ entityName, setEntityName, entityIcon, setEntityIcon }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  return useContext(BreadcrumbContext);
}
