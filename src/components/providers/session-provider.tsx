'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createSupabaseClientComponentClient } from '@/lib/supabase/client';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

// Definiamo il tipo per il nostro context
type SessionContextType = {
  session: Session | null;
  supabase: SupabaseClient;
};

// Creiamo il Context con un valore di default
const SessionContext = createContext<SessionContextType | null>(null);

// Creiamo il Provider
export default function SessionProvider({ children, serverSession }: { children: React.ReactNode, serverSession: Session | null }) {
  const [supabase] = useState(() => createSupabaseClientComponentClient());
  const [session, setSession] = useState(serverSession);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if(session?.access_token !== serverSession?.access_token){
        setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, serverSession, session]);

  return (
    <SessionContext.Provider value={{ session, supabase }}>
      {children}
    </SessionContext.Provider>
  );
}

// Creiamo l'hook personalizzato per un facile accesso
export const useSession = () => {
  const context = useContext(SessionContext);
  if(!context){
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 