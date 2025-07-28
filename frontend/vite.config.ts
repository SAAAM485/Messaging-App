import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        headers: {
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
    },
});
console.log("Vite config loaded!");
