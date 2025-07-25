import { useAuthStore } from "./useAuthStore";

export function useRequireUser() {
    const { user } = useAuthStore();
    if (!user) {
        throw new Error(
            "User not found. useRequireUser must be called after login."
        );
    }
    return user;
}
