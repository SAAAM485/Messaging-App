import { useAuthStore } from "./useAuthStore";

export const logout = (navigate: (path: string) => void) => {
    useAuthStore.getState().clearAuth();

    if (window.google?.accounts?.id) {
        window.google.accounts.id.revoke(localStorage.getItem('authToken'), (done) => {
            console.log('Google token revoked:', done);
            localStorage.removeItem('authToken'); // 確保本地儲存的 token 也被移除
            navigate("/login");
        });
    } else {
        localStorage.removeItem('authToken');
        navigate("/login");
    }
};
