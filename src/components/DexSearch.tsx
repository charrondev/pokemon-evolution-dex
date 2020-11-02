/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { usePokemonModel } from "../models/PokemonModel";
import styles from "./DexSearch.module.scss";
import { debounce } from "lodash-es";
import { useLastValue } from "../utils/hookUtils";
import { match } from "assert";

interface IProps {
    setIsOpen(isOpen: boolean): void;
    isOpen: boolean;
}

export function DexSearch(props: IProps) {
    const { isOpen, setIsOpen } = props;
    const [searchTerm, setSearchTerm] = useState("");
    const {
        setSearchTerm: setExternalSearchTerm,
        matchCount,
        goNext,
        goPrev,
        currentMatchIndex,
    } = useSearchContext();
    const ref = useRef<HTMLInputElement>(null);
    const lastOpen = useLastValue(isOpen);
    useEffect(() => {
        if (isOpen && !lastOpen) {
            ref.current?.focus();
        }
    }, [isOpen, lastOpen]);

    function updateSearchTerm(term: string) {
        setSearchTerm(term);
        setExternalSearchTerm(term);
    }

    function open() {
        updateSearchTerm("");
        setIsOpen(true);
    }

    function close() {
        updateSearchTerm("");
        setIsOpen(false);
    }

    function toggle() {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }

    useEffect(() => {
        function handler(e: KeyboardEvent) {
            console.log(e.key);
            if (e.metaKey && e.key === "k") {
                e.preventDefault();
                toggle();
            }

            if (e.key === "Escape") {
                e.preventDefault();
                close();
            }

            console.log(e.metaKey, e.key);
            if (matchCount > 1 && e.metaKey) {
                e.preventDefault();
                if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                    goNext();
                } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    goPrev();
                }
            }
        }

        window.addEventListener("keydown", handler);
        return () => {
            window.removeEventListener("keydown", handler);
        };
    }, [matchCount, goNext, goPrev]);

    if (!isOpen) {
        return <></>;
    }

    return (
        <div className={styles.searchContainer}>
            <input
                ref={ref}
                className={styles.searchInput}
                placeholder="Search Pokemon"
                type="text"
                onChange={(e) => {
                    updateSearchTerm(e.target.value);
                }}
                value={searchTerm}
            />

            <span className={styles.counts}>{`Match ${
                currentMatchIndex !== null ? currentMatchIndex + 1 : 0
            } of ${matchCount}`}</span>
            <div className={styles.buttons}>
                <button className={styles.button} onClick={goPrev}>
                    Prev
                </button>
                <button className={styles.button} onClick={goPrev}>
                    Next
                </button>
            </div>
        </div>
    );
}

const context = React.createContext<{
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    matchCount: number;
    currentMatchIndex: number | null;
    goNext(): void;
    goPrev(): void;
}>({
    searchTerm: "",
    setSearchTerm: () => {},
    matchCount: 0,
    currentMatchIndex: null,
    goNext: () => {},
    goPrev: () => {},
});

export function SearchContext(props: { children: React.ReactNode }) {
    const { children } = props;
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [foundItemSlugs, setFoundItemSlugs] = useState<string[]>([]);
    const debounceSetSearchTerm = useCallback(debounce(setSearchTerm, 150), []);
    const animationFramed = useCallback((term: string) => {
        requestAnimationFrame(() => {
            debounceSetSearchTerm(term);
        });
    }, []);
    const model = usePokemonModel();

    function scrollToSlug(slug: string) {
        const firstItemElement = document.querySelector(`[id="${slug}"`);
        if (firstItemElement) {
            const rect = firstItemElement.getBoundingClientRect();
            const { top } = rect;
            window.scrollTo({
                top: window.scrollY + top - 70,
            });
        }
    }

    function goNext() {
        if (currentIndex === foundItemSlugs.length - 1) {
            setCurrentIndex(0);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    }

    function goPrev() {
        if (currentIndex === foundItemSlugs.length - 1) {
            setCurrentIndex(0);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    }

    useEffect(() => {
        if (currentIndex === null) {
            return;
        }

        const slug = foundItemSlugs[currentIndex];
        if (slug) {
            scrollToSlug(slug);
        }
    }, [currentIndex, foundItemSlugs]);

    useEffect(() => {
        if (!searchTerm && searchTerm.length < 3) {
            setFoundItemSlugs([]);
            setCurrentIndex(null);
            return;
        }
        const itemSlugs = model.search(searchTerm);
        setFoundItemSlugs(itemSlugs);
        setCurrentIndex(0);
        const firstItem = itemSlugs[0] ?? null;
        if (!firstItem) {
            return;
        }
        scrollToSlug(firstItem);
    }, [searchTerm, model]);

    return (
        <context.Provider
            value={{
                searchTerm,
                setSearchTerm: animationFramed,
                currentMatchIndex: currentIndex,
                matchCount: foundItemSlugs.length,
                goNext,
                goPrev,
            }}
        >
            {children}
        </context.Provider>
    );
}

export function useSearchContext() {
    return useContext(context);
}
