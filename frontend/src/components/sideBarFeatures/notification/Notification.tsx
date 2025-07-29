import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./Notification.module.css";
import type { Friend } from "../../../types/models";
import { getAllReceivedRequests } from "../../../services/friendService";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../store/logout";
import { FaSignOutAlt } from "react-icons/fa"; // 導入登出圖示
import { getImageSrc } from "../../../utils/imageUtils";

const Notification = () => {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<Friend[]>([]);
    const [open, setOpen] = useState(false);
    const currentUser = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const fetchRequests = () => {
        setLoading(true);
        getAllReceivedRequests()
            .then((response) => {
                if (response.success && response.data) {
                    setRequests(response.data);
                } else {
                    console.error(response.error?.message);
                }
            })
            .catch((error) => {
                console.error("Error fetching friend requests:", error);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
        }
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false); // ✅ 僅當點擊在 ref 以外才關掉
            }
        };
        document.addEventListener("click", handleClickOutside); // ✅ 使用 click
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        const newOpen = !open;
        setOpen(newOpen);
        if (!open && !document.hidden) {
            fetchRequests();
        }
    };

    if (!currentUser) return null;

    return (
        <div className={styles.notificationWrapper} ref={wrapperRef}>
            <div className={styles.logoBar}>
                <div className={styles.leftContainer}>
                    <Link to="/profile" className={styles.logoLink}>
                        <img src="/logo.png" alt="logo" />
                        <h1>IASAM</h1>
                    </Link>
                    <div
                        className={styles.badgeWrapper}
                        onClick={toggleDropdown}
                    >
                        {requests.length > 0 && (
                            <span className={styles.badge}>
                                {requests.length}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => logout(navigate)}
                    className={styles.logoutButton}
                >
                    {" "}
                    {/* 添加 className */}
                    <FaSignOutAlt className={styles.logoutIcon} />{" "}
                    {/* 使用登出圖示 */}
                </button>
            </div>

            {open && (
                <div className={styles.dropdown}>
                    <h4>Friend Requests</h4>
                    {loading ? (
                        <p>Loading...</p>
                    ) : requests.length === 0 ? (
                        <p>No Friend Requests...</p>
                    ) : (
                        <ul>
                            {requests.map((req) => {
                                const otherUser =
                                    req.userId !== currentUser.id
                                        ? req.user
                                        : req.friendId !== currentUser.id
                                        ? req.friend
                                        : null;

                                if (!otherUser) return null;

                                return (
                                    <li key={req.id}>
                                        <Link
                                            to={`/profile/${otherUser.id}`}
                                            className={styles.link}
                                            onClick={() =>
                                                console.log("clicked")
                                            }
                                        >
                                            <img
                                                src={
                                                    getImageSrc(otherUser.image) ||
                                                    "/logo.png"
                                                }
                                                alt={
                                                    otherUser.name || "Unknown"
                                                }
                                                className={styles.avatar}
                                            />
                                            <span>
                                                {otherUser.name ?? "Unknown"}{" "}
                                                sent you a friend request
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notification;
