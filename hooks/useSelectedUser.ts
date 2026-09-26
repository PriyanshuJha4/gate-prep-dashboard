"use client";

import { createUserRecord, deleteUserData, type UserProfile } from "@/lib/gateData";
import { syncUserProfiles, useLocalStorageValue } from "@/hooks/useLocalStorageValue";

const SELECTED_KEY = "gate-selected-user";

export function useSelectedUser() {
  const [users, persistUsers] = useLocalStorageValue<UserProfile[]>("gate-users", []);
  const [selectedId, setSelectedId] = useLocalStorageValue<string | null>(SELECTED_KEY, null);
  const selectedUser = users.find((entry) => entry.id === selectedId) ?? users[0] ?? null;

  const setUser = (userId: string) => {
    const nextUser = users.find((entry) => entry.id === userId) ?? null;
    setSelectedId(nextUser?.id ?? null);
  };

  const addUser = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const nextUser = createUserRecord(trimmed);
    const nextUsers = [...users, nextUser];
    persistUsers(nextUsers);
    void syncUserProfiles("POST", { users: [nextUser] });
    setSelectedId(nextUser.id);
    return nextUser;
  };

  const updateUser = (userId: string, updates: Partial<UserProfile>) => {
    const nextUsers = users.map((entry) => entry.id === userId ? { ...entry, ...updates } : entry);
    persistUsers(nextUsers);
    void syncUserProfiles("PATCH", { id: userId, updates });
  };

  const removeUser = (userId: string) => {
    const nextUsers = users.filter((entry) => entry.id !== userId);
    deleteUserData(userId);
    persistUsers(nextUsers);
    void syncUserProfiles("DELETE", undefined, `?id=${encodeURIComponent(userId)}`);
    if (selectedId === userId) {
      const fallback = nextUsers[0] ?? null;
      setSelectedId(fallback?.id ?? null);
    }
  };

  return { users, selectedUser, setUser, addUser, updateUser, removeUser };
}
