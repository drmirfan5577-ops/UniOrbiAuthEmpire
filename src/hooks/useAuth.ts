import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/types";
import {
  getUser,
  saveUser,
  isLoggedIn,
  setLoggedIn,
  isSetupComplete,
  markSetupComplete,
} from "@/lib/storage";
import { generateId } from "@/lib/utils";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loggedIn, setLoggedInState] = useState(isLoggedIn());
  const [setupDone, setSetupDone] = useState(isSetupComplete());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getUser();
    setUser(stored);
    setLoggedInState(isLoggedIn());
    setSetupDone(isSetupComplete());
    setLoading(false);
  }, []);

  const login = useCallback((credentials?: Partial<UserProfile>) => {
    let u = getUser();
    if (!u) {
      u = {
        id: generateId(),
        displayName: credentials?.displayName || "Auth Empire User",
        email: credentials?.email || "user@authempire.com",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        syncEnabled: false,
        theme: "dark",
        ...credentials,
      };
      saveUser(u);
    } else {
      u = { ...u, lastLogin: new Date().toISOString(), ...credentials };
      saveUser(u);
    }
    setUser(u);
    setLoggedIn(true);
    setLoggedInState(true);
  }, []);

  const logout = useCallback(() => {
    setLoggedIn(false);
    setLoggedInState(false);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    const u = getUser();
    if (!u) return;
    const updated = { ...u, ...updates };
    saveUser(updated);
    setUser(updated);
  }, []);

  const completeSetup = useCallback(() => {
    markSetupComplete();
    setSetupDone(true);
  }, []);

  return { user, loggedIn, setupDone, loading, login, logout, updateUser, completeSetup };
}
