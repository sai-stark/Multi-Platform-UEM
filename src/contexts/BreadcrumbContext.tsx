import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface BreadcrumbContextType {
  entityName: string | null;
  setEntityName: (name: string | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  entityName: null,
  setEntityName: () => {},
});

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [entityName, setEntityNameState] = useState<string | null>(null);
  const location = useLocation();

  // Reset entity name on route change
  useEffect(() => {
    setEntityNameState(null);
  }, [location.pathname]);

  const setEntityName = useCallback((name: string | null) => {
    setEntityNameState(name);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ entityName, setEntityName }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  return useContext(BreadcrumbContext);
}
