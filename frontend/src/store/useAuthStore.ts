import { create } from "zustand";
import type { UserPreview, AuthData } from "../types/models";

interface AuthState {
    token: string | null;
    user: UserPreview | null;
    setAuth: (auth: AuthData) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem("token"),
    user: null,
    setAuth: ({ token, user }) => {
        localStorage.setItem("token", token);
        set({ token, user });
    },
    clearAuth: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null });
    },
}));
