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
import classNames from "classnames";

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
            if (e.metaKey && e.key === "k") {
                e.preventDefault();
                toggle();
            }

            if (e.key === "Escape") {
                e.preventDefault();
                close();
            }

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
            <button className={styles.closeButton} onClick={close}>
                <CloseIcon />
            </button>
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
            const offset = (() => {
                if (window.innerWidth > 600) {
                    return 70;
                } else {
                    return 160;
                }
            })();

            window.scrollTo({
                top: window.scrollY + top - offset,
            });
        }
    }

    function goNext() {
        if (currentIndex === null) {
            return;
        }
        if (currentIndex === foundItemSlugs.length - 1) {
            setCurrentIndex(0);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    }

    function goPrev() {
        if (currentIndex === null) {
            return;
        }
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

export function CloseIcon(props: { className?: string }) {
    return (
        <svg
            style={{ width: 12, height: 12, marginTop: 2 }}
            className={classNames(props.className)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
        >
            <title>Close</title>
            <path
                transform="translate(-4 -4)"
                fill="currentColor"
                d="M12,10.6293581 L5.49002397,4.11938207 C5.30046135,3.92981944 4.95620859,3.96673045 4.69799105,4.22494799 L4.22494799,4.69799105 C3.97708292,4.94585613 3.92537154,5.29601344 4.11938207,5.49002397 L10.6293581,12 L4.11938207,18.509976 C3.92981944,18.6995387 3.96673045,19.0437914 4.22494799,19.3020089 L4.69799105,19.775052 C4.94585613,20.0229171 5.29601344,20.0746285 5.49002397,19.8806179 L12,13.3706419 L18.509976,19.8806179 C18.6995387,20.0701806 19.0437914,20.0332695 19.3020089,19.775052 L19.775052,19.3020089 C20.0229171,19.0541439 20.0746285,18.7039866 19.8806179,18.509976 L13.3706419,12 L19.8806179,5.49002397 C20.0701806,5.30046135 20.0332695,4.95620859 19.775052,4.69799105 L19.3020089,4.22494799 C19.0541439,3.97708292 18.7039866,3.92537154 18.509976,4.11938207 L12,10.6293581 Z"
            />
        </svg>
    );
}
