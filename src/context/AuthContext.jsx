import { createContext, useContext, useState, useEffect } from "react";

const ADMIN_USER = "admin";
const DEFAULT_PASSWORD = "adminKG";

const BARBER_STORAGE_KEY = "agendafy_barber_user";

function loadPassword() {
  try {
    return localStorage.getItem("adminPassword") || DEFAULT_PASSWORD;
  } catch {
    return DEFAULT_PASSWORD;
  }
}

function savePassword(pwd) {
  try {
    localStorage.setItem("adminPassword", pwd);
  } catch {}
}

function loadBarberUser() {
  try {
    const raw = localStorage.getItem(BARBER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveBarberUser(u) {
  try {
    if (u) {
      localStorage.setItem(BARBER_STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(BARBER_STORAGE_KEY);
    }
  } catch {}
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadBarberUser());

  useEffect(() => {
    saveBarberUser(user);
  }, [user]);

  function loginAdmin(username, password) {
    if (username === ADMIN_USER && password === loadPassword()) {
      setUser({ role: "admin" });
      return true;
    }
    return false;
  }

  function loginBarber(barbershopSlug, professionalName) {
    const name = professionalName || "";
    setUser({ role: "barber", barbershopSlug, professionalName: name });
    return true;
  }

  function logout() {
    setUser(null);
  }

  function updatePassword(current, newPass) {
    const stored = loadPassword();
    if (current !== stored) return false;
    savePassword(newPass);
    return true;
  }

  return (
    <AuthContext.Provider value={{ user, loginAdmin, loginBarber, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
