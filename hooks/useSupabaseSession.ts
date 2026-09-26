"use client";

import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type SessionSnapshot = { session: Session | null; loading: boolean };

const listeners = new Set<() => void>();
const SERVER_SNAPSHOT: SessionSnapshot = { session: null, loading: true };
let snapshot: SessionSnapshot = SERVER_SNAPSHOT;
let initialized = false;

function publish(nextSnapshot: SessionSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

function initializeSessionStore() {
  if (initialized) return;
  initialized = true;
  if (!supabase) {
    publish({ session: null, loading: false });
    return;
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    publish({ session, loading: false });
  });
  void supabase.auth.getSession().then(({ data, error }) => {
    publish({ session: error ? null : data.session, loading: false });
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  initializeSessionStore();
  return () => listeners.delete(listener);
}

function getServerSnapshot(): SessionSnapshot {
  return SERVER_SNAPSHOT;
}

export function useSupabaseSession() {
  return useSyncExternalStore(subscribe, () => snapshot, getServerSnapshot);
}