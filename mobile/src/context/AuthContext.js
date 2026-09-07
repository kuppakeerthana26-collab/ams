import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setApiBaseUrl } from "../services/api.js";
import { loadSession, saveSession, clearSession, loadServerUrl, saveServerUrl } from "../services/session.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [serverUrl, setServerUrlState] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on startup
  useEffect(() => {
    const init = async () => {
      try {
        const storedUrl = await loadServerUrl();
        if (storedUrl) {
          setServerUrlState(storedUrl);
          setApiBaseUrl(storedUrl);
        }

        const session = await loadSession();
        if (session && session.token) {
          setToken(session.token);
          setUser(session.user);

          // Verify token validity in background
          api.me(session.token)
            .then((res) => {
              if (res && res.user) {
                setUser(res.user);
                saveSession({ token: session.token, user: res.user });
              }
            })
            .catch(() => {
              // Token expired or invalid
              clearSession();
              setToken(null);
              setUser(null);
            });
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      if (response && response.token) {
        setToken(response.token);
        setUser(response.user);
        await saveSession({ token: response.token, user: response.user });
        return { success: true, user: response.user };
      }
      throw new Error(response.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await clearSession();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateServerUrl = useCallback(async (newUrl) => {
    const saved = await saveServerUrl(newUrl);
    setServerUrlState(saved);
    setApiBaseUrl(saved);
    return saved;
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.me(token);
      if (res && res.user) {
        setUser(res.user);
        await saveSession({ token, user: res.user });
      }
    } catch (err) {
      console.warn("Failed to refresh user:", err);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        serverUrl,
        isLoading,
        isAuthenticated: Boolean(token && user),
        role: user?.role || "teacher",
        login,
        logout,
        updateServerUrl,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
