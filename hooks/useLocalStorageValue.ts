"use client";

import { useEffect, useSyncExternalStore } from "react";
import { USER_DATA_UPDATED_EVENT } from "@/lib/gateData";
import { supabase } from "@/lib/supabase";

const listeners = new Set<() => void>();
let revision = 0;
let isListening = false;
let pendingUserSync: Promise<void> = Promise.resolve();
let realtimeChannel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
const hydrationRequests = new Map<string, Promise<void>>();
const lastHydrationAt = new Map<string, number>();
const localVersions = new Map<string, number>();
const DATABASE_POLL_MS = 5000;

export type DatabaseSyncStatus = "checking" | "syncing" | "synced" | "local" | "offline";

const DATABASE_SYNC_STATUS_EVENT = "gate-database-sync-status";
const SUPABASE_REMOTE_UPDATE_EVENT = "gate-supabase-remote-update";
let databaseSyncStatus: DatabaseSyncStatus = "checking";

function updateDatabaseSyncStatus(status: DatabaseSyncStatus) {
  if (databaseSyncStatus === status) return;
  databaseSyncStatus = status;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(DATABASE_SYNC_STATUS_EVENT));
}

function subscribeSyncStatus(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handleOffline = () => updateDatabaseSyncStatus("offline");
  const handleOnline = () => updateDatabaseSyncStatus("checking");
  window.addEventListener(DATABASE_SYNC_STATUS_EVENT, onStoreChange);
  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", handleOnline);
  return () => {
    window.removeEventListener(DATABASE_SYNC_STATUS_EVENT, onStoreChange);
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("online", handleOnline);
  };
}

export function useDatabaseSyncStatus() {
  return useSyncExternalStore(subscribeSyncStatus, () => databaseSyncStatus, () => "checking");
}

const handleStoreChange = () => {
  revision += 1;
  listeners.forEach((listener) => listener());
};

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  listeners.add(onStoreChange);
  if (!isListening) {
    window.addEventListener(USER_DATA_UPDATED_EVENT, handleStoreChange);
    window.addEventListener("storage", handleStoreChange);
    isListening = true;
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && isListening) {
      window.removeEventListener(USER_DATA_UPDATED_EVENT, handleStoreChange);
      window.removeEventListener("storage", handleStoreChange);
      isListening = false;
    }
  };
}

function readSnapshot(key: string | null) {
  if (!key || typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function applyRemoteSnapshot(key: string, value: unknown) {
  const serialized = JSON.stringify(value);
  if (readSnapshot(key) === serialized) return;
  window.localStorage.setItem(key, serialized);
  window.dispatchEvent(new CustomEvent(USER_DATA_UPDATED_EVENT));
}

async function fetchDatabase(input: RequestInfo | URL, init?: RequestInit) {
  if (!supabase) {
    updateDatabaseSyncStatus("local");
    return null;
  }
  if (!navigator.onLine) {
    updateDatabaseSyncStatus("offline");
    return null;
  }
  updateDatabaseSyncStatus("syncing");
  try {
    const { data, error } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (error || !accessToken) {
      updateDatabaseSyncStatus("local");
      return null;
    }
    startRealtimeSubscriptions();
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    const response = await fetch(input, { ...init, headers });
    updateDatabaseSyncStatus(response.ok ? "synced" : "local");
    return response;
  } catch {
    updateDatabaseSyncStatus("offline");
    return null;
  }
}

function startRealtimeSubscriptions() {
  if (!supabase || realtimeChannel) return;
  let channel = supabase.channel("gate-dashboard-realtime");
  for (const table of ["users", "chapter_progress", "weekly_log", "mock_logs", "error_logs", "resources", "milestone_progress"]) {
    channel = channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
      window.dispatchEvent(new Event(SUPABASE_REMOTE_UPDATE_EVENT));
      window.dispatchEvent(new CustomEvent(USER_DATA_UPDATED_EVENT));
    });
  }
  realtimeChannel = channel.subscribe((status) => {
    if (status === "SUBSCRIBED") updateDatabaseSyncStatus("synced");
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") updateDatabaseSyncStatus("local");
  });
}

function getUserIdForKey(key: string) {
  const prefixes = ["gate-profile-", "gate-weekly-", "gate-milestones-", "gate-resources-", "gate-mocks-", "gate-errors-"];
  const prefix = prefixes.find((candidate) => key.startsWith(candidate));
  if (prefix) return key.slice(prefix.length);
  const progressMatch = key.match(/^gate-(.+)-progress$/);
  return progressMatch?.[1] ?? null;
}

export function syncUserProfiles(method: "POST" | "PATCH" | "DELETE", body?: unknown, query = "") {
  pendingUserSync = fetchDatabase(`/api/users${query}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }).then(() => undefined);
  return pendingUserSync;
}

function persistToDatabase(key: string, value: unknown) {
  if (key === "gate-users") return;

  const userId = getUserIdForKey(key);
  if (!userId) return;

  void pendingUserSync.then(() => fetchDatabase("/api/user-data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, key, value }),
  }));
}

function hydrateFromDatabase(key: string, force = false) {
  if (typeof window === "undefined") return Promise.resolve();
  const existingRequest = hydrationRequests.get(key);
  if (existingRequest) return existingRequest;
  const now = Date.now();
  if (!force && now - (lastHydrationAt.get(key) ?? 0) < DATABASE_POLL_MS) return Promise.resolve();
  lastHydrationAt.set(key, now);
  const localVersionAtStart = localVersions.get(key) ?? 0;

  const request = hydrateDatabaseSnapshot(key, localVersionAtStart);
  hydrationRequests.set(key, request);
  void request.finally(() => hydrationRequests.delete(key));
  return request;
}

async function hydrateDatabaseSnapshot(key: string, localVersionAtStart: number) {
  if (key === "gate-users") {
    const response = await fetchDatabase("/api/users", { cache: "no-store" });
    if (!response?.ok || (localVersions.get(key) ?? 0) !== localVersionAtStart) return;
    const serverUsers = await response.json() as unknown[];
    const localValue = readSnapshot(key);
    const localUsers = localValue ? JSON.parse(localValue) as unknown[] : [];
    if (serverUsers.length === 0 && localUsers.length > 0) {
      void syncUserProfiles("POST", { users: localUsers });
      return;
    }
    applyRemoteSnapshot(key, serverUsers);
    return;
  }

  const userId = getUserIdForKey(key);
  if (!userId) return;

  const params = new URLSearchParams({ userId, key });
  const response = await fetchDatabase(`/api/user-data?${params}`, { cache: "no-store" });
  if (!response?.ok || (localVersions.get(key) ?? 0) !== localVersionAtStart) return;
  const result = await response.json() as { value: unknown | null };
  if (result.value === null) {
    const localValue = readSnapshot(key);
    if (localValue) persistToDatabase(key, JSON.parse(localValue) as unknown);
    return;
  }
  applyRemoteSnapshot(key, result.value);
}

export function useLocalStorageValue<T>(key: string | null, fallback: T) {
  const snapshot = useSyncExternalStore(subscribe, () => `${revision}\n${readSnapshot(key)}`, () => "0\n");
  useEffect(() => {
    if (!key) return;
    const refresh = () => {
      if (document.visibilityState === "visible") void hydrateFromDatabase(key);
    };
    void hydrateFromDatabase(key, true);
    const intervalId = window.setInterval(refresh, DATABASE_POLL_MS);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    const handleRemoteUpdate = () => void hydrateFromDatabase(key, true);
    window.addEventListener(SUPABASE_REMOTE_UPDATE_EVENT, handleRemoteUpdate);
    const authSubscription = supabase?.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") void hydrateFromDatabase(key, true);
      if (event === "SIGNED_OUT") updateDatabaseSyncStatus("local");
    }).data.subscription;
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener(SUPABASE_REMOTE_UPDATE_EVENT, handleRemoteUpdate);
      authSubscription?.unsubscribe();
    };
  }, [key]);

  const serializedValue = snapshot.slice(snapshot.indexOf("\n") + 1);
  let value = fallback;

  if (serializedValue) {
    try {
      value = JSON.parse(serializedValue) as T;
    } catch {
      if (typeof fallback === "string") value = serializedValue as T;
    }
  }

  const save = (nextValue: T) => {
    if (!key || typeof window === "undefined") return;
    try {
      localVersions.set(key, (localVersions.get(key) ?? 0) + 1);
      window.localStorage.setItem(key, JSON.stringify(nextValue));
      window.dispatchEvent(new CustomEvent(USER_DATA_UPDATED_EVENT));
      persistToDatabase(key, nextValue);
    } catch {
      return;
    }
  };

  return [value, save] as const;
}