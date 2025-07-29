import { useEffect, useRef, useState } from "react";
import styles from "./SearchBar.module.css";
import { useDebounce } from "../../../store/useDebounce";
import { getUserByName } from "../../../services/userService";
import type { UserPreview } from "../../../types/models";
import { Link } from "react-router-dom";
import { getImageSrc } from "../../../utils/imageUtils";

const SearchBar = () => {
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState<UserPreview[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const debouncedKeyword = useDebounce(keyword, 300);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!debouncedKeyword) {
            setResults([]);
            return;
        }

        setLoading(true);
        getUserByName(debouncedKeyword)
            .then((res) => {
                if (res.success && res.data) {
                    setResults(res.data);
                }
            })
            .catch((err) => console.error("Search failed", err))
            .finally(() => setLoading(false));
    }, [debouncedKeyword]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setIsFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.searchBar} ref={searchRef}>
            <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="Search Users..."
                className={styles.input}
            />

            {isFocused && (
                <div className={styles.dropdown}>
                    {loading && (
                        <div className={styles.loading}>Searching...</div>
                    )}
                    {!loading && debouncedKeyword && results.length === 0 && (
                        <div className={styles.noResult}>No Users Found...</div>
                    )}
                    <ul className={styles.resultList}>
                        {results.map((user) => (
                            <li key={user.id} className={styles.resultItem}>
                                <Link
                                    to={`/profile/${user.id}`}
                                    className={styles.resultLink}
                                    onClick={() => setIsFocused(false)}
                                >
                                    <img
                                        src={getImageSrc(user.image)}
                                        alt={user.name}
                                        className={styles.avatar}
                                    />
                                    <span>{user.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
