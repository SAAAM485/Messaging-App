import styles from "./LoginPage.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    login,
    register,
    thirdPartyLoginOrCreate,
} from "../../services/userService";
import { useAuthStore } from "../../store/useAuthStore";

export default function LoginPage() {
    const [registering, setRegistering] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    // 初始化 Google 登入
    useEffect(() => {
        if (
            !window.google ||
            !window.google.accounts ||
            !window.google.accounts.id
        ) {
            console.error("Google Identity Services not loaded");
            return;
        }

        window.google.accounts.id.initialize({
            client_id:
                "781718890214-nf21cjvbqd1p8uj89e9u4ucnerduthki.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
        });
    }, []);

    const handleCredentialResponse = async (
        response: google.accounts.id.CredentialResponse
    ) => {
        try {
            const credential = response.credential;
            const res = await thirdPartyLoginOrCreate({ credential });
            if (res.success && res.data) {
                setAuth({
                    token: res.data.token,
                    user: res.data.user, // 假設後端回傳的資料包含 user
                });
                navigate("/profile");
            } else {
                alert("Login Failed: " + res.error?.message);
            }
        } catch (err) {
            console.error("Login Error", err);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { email, password, name } = form;
        if (!email || !password || (registering && !name)) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const res = registering
                ? await register({ email, password, name })
                : await login({ email, password });

            if (res.success && res.data) {
                setAuth({
                    token: res.data.token,
                    user: res.data.user, // 假設後端回傳的資料包含 user
                });
                navigate("/profile");
            } else {
                alert(res.error?.message || "Authentication failed.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        }
    };

    return (
        <div className={styles.loginPage}>
            <img src="/logo.png" alt="logo" />
            <h1>IASAM</h1>
            <p>
                {registering ? "Register an account" : "Login to your account"}
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInput}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInput}
                    placeholder="Password"
                    required
                />
                {registering && (
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInput}
                        placeholder="Name"
                        required
                    />
                )}
                <button type="submit">
                    {registering ? "Register" : "Login"}
                </button>
            </form>

            <button onClick={() => setRegistering(!registering)}>
                {registering
                    ? "Already have an account? Login"
                    : "Create new account"}
            </button>

            <div style={{ marginTop: "1rem" }}>
                <p>or continue with</p>
                <img
                    src="/google-icon.png"
                    alt="Google Sign-In"
                    onClick={() => window.google.accounts.id.prompt()}
                />
            </div>
        </div>
    );
}
