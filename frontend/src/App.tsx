import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginPage/LoginPage";
import ProfilePage from "./pages/profilePage/ProfilePage";
import ChatPage from "./pages/chatPage/ChatPage";
import MainLayout from "./components/layout/MainLayout";
import { useAuthStore } from "./store/useAuthStore";

function ProtectedRoute({ children }: { children: React.JSX.Element }) {
    const { user } = useAuthStore();

    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 公開路由 */}
                <Route path="/login" element={<LoginPage />} />

                {/* 受保護路由 */}
                <Route element={<MainLayout />}>
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile/:userId"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chat/:conversationId"
                        element={
                            <ProtectedRoute>
                                <ChatPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* 未匹配到就導到首頁（或 404） */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
