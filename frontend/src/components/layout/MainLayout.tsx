import { Outlet } from "react-router-dom";
import LeftBar from "./leftBar/LeftBar";
import TopBar from "./topBar/TopBar";
import RightBar from "./rightBar/RightBar";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
    return (
        <div className={styles.mainLayout}>
            <LeftBar />
            <div className={styles.center}>
                <TopBar />
                <main className={styles.outlet}>
                    <Outlet /> {/* 這裡會顯示 ChatPage 或 ProfilePage */}
                </main>
            </div>
            <RightBar />
        </div>
    );
};

export default MainLayout;