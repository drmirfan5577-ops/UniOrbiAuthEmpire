import { useState, useCallback } from "react";
import {
  getPasskeys, savePasskey, deletePasskey,
  getApps, saveApp, deleteApp,
  getCredentials, saveCredential, deleteCredential,
  getBackends, saveBackend, deleteBackend,
  getSyncLogs, addSyncLog,
  getAuthConfig, saveAuthConfig,
} from "@/lib/storage";
import type { Passkey, ConnectedApp, StoredCredential, BackendIntegration, AuthConfig, SyncLog } from "@/types";
import { generateId } from "@/lib/utils";

export function usePasskeys() {
  const [passkeys, setPasskeys] = useState<Passkey[]>(getPasskeys);

  const add = useCallback((data: Omit<Passkey, "id" | "createdAt" | "lastUsed">) => {
    const pk: Passkey = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };
    savePasskey(pk);
    setPasskeys(getPasskeys());
    return pk;
  }, []);

  const update = useCallback((passkey: Passkey) => {
    savePasskey(passkey);
    setPasskeys(getPasskeys());
  }, []);

  const remove = useCallback((id: string) => {
    deletePasskey(id);
    setPasskeys(getPasskeys());
  }, []);

  return { passkeys, add, update, remove };
}

export function useApps() {
  const [apps, setApps] = useState<ConnectedApp[]>(getApps);

  const add = useCallback((data: Omit<ConnectedApp, "id" | "addedAt" | "lastAccess">) => {
    const app: ConnectedApp = {
      ...data,
      id: generateId(),
      addedAt: new Date().toISOString(),
      lastAccess: new Date().toISOString(),
    };
    saveApp(app);
    setApps(getApps());
    return app;
  }, []);

  const update = useCallback((app: ConnectedApp) => {
    saveApp(app);
    setApps(getApps());
  }, []);

  const remove = useCallback((id: string) => {
    deleteApp(id);
    setApps(getApps());
  }, []);

  return { apps, add, update, remove };
}

export function useCredentials() {
  const [credentials, setCredentials] = useState<StoredCredential[]>(getCredentials);

  const add = useCallback((data: Omit<StoredCredential, "id" | "createdAt" | "updatedAt">) => {
    const cred: StoredCredential = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCredential(cred);
    setCredentials(getCredentials());
    return cred;
  }, []);

  const update = useCallback((cred: StoredCredential) => {
    saveCredential({ ...cred, updatedAt: new Date().toISOString() });
    setCredentials(getCredentials());
  }, []);

  const remove = useCallback((id: string) => {
    deleteCredential(id);
    setCredentials(getCredentials());
  }, []);

  return { credentials, add, update, remove };
}

export function useBackends() {
  const [backends, setBackends] = useState<BackendIntegration[]>(getBackends);

  const add = useCallback((data: Omit<BackendIntegration, "id">) => {
    const be: BackendIntegration = { ...data, id: generateId() };
    saveBackend(be);
    setBackends(getBackends());
    return be;
  }, []);

  const update = useCallback((be: BackendIntegration) => {
    saveBackend(be);
    setBackends(getBackends());
  }, []);

  const remove = useCallback((id: string) => {
    deleteBackend(id);
    setBackends(getBackends());
  }, []);

  return { backends, add, update, remove };
}

export function useSyncLogs() {
  const [logs, setLogs] = useState<SyncLog[]>(getSyncLogs);

  const add = useCallback((log: Omit<SyncLog, "id">) => {
    addSyncLog(log);
    setLogs(getSyncLogs());
  }, []);

  return { logs, add };
}

export function useAuthConfig() {
  const [config, setConfig] = useState<AuthConfig>(getAuthConfig);

  const update = useCallback((updates: Partial<AuthConfig>) => {
    const newConfig = { ...getAuthConfig(), ...updates };
    saveAuthConfig(newConfig);
    setConfig(newConfig);
  }, []);

  return { config, update };
}
