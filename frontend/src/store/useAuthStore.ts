import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPreview, AuthData } from "../types/models";

interface AuthState {
    token: string | null;
    user: UserPreview | null;
    setAuth: (auth: AuthData) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setAuth: ({ token, user }) => {
                set({ token, user: { ...user, id: user.id } });
            },
            clearAuth: () => {
                set({ token: null, user: null });
            },
        }),
        {
            name: "auth-storage", // localStorage key
        }
    )
);
