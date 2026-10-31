import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const auth = getAuth(app);
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          // Injection forcée du rôle Admin uniquement pour votre adresse e-mail officielle
          if (currentUser.email === "supportdiasporaloveconnect@gmail.com") {
            const adminUser = {
              ...currentUser,
              role: "admin",
              access_level: "admin",
              display_name: currentUser.displayName || "Admin"
            };
            setUser(adminUser);
            resolve(adminUser);
            return;
          }
          setUser(currentUser);
          resolve(currentUser);
        } else {
          setUser(null);
          resolve(null);
        }
        setLoading(false);
      });
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
