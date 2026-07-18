/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

interface SyncContextType {
  isSynced: boolean;
}

const SyncContext = createContext<SyncContextType>({ isSynced: false });

export function useSyncEngine() {
  return useContext(SyncContext);
}

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSynced = useRealtimeSync();

  if (!isSynced) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="text-slate-400 text-sm font-medium">Syncing database...</p>
        </div>
      </div>
    );
  }

  return (
    <SyncContext.Provider value={{ isSynced }}>
      {children}
    </SyncContext.Provider>
  );
};
