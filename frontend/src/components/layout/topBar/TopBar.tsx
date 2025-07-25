import SearchBar from "../../sideBarFeatures/searchBar/SearchBar";
import styles from "./TopBar.module.css";

const TopBar = () => {
    return (
        <header className={styles.topBar}>
            <SearchBar />
        </header>
    );
};

export default TopBar;
