/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import React, { useEffect, useRef, useState } from "react";
import { usePokemonModel } from "../models/PokemonModel";
import styles from "./DexHeader.module.scss";
import { DexSearch } from "./DexSearch";
import { LayoutContainer } from "./LayoutContainer";
import classnames from "classnames";
import classNames from "classnames";

export function DexHeader() {
    const [isSearchOpen, setSearchOpen] = useState(false);
    const model = usePokemonModel();
    const regions = model.getRegionNames();
    const [currentHash, setCurrentHash] = useState(
        process.browser ? window.location.hash : ""
    );
    useEffect(() => {
        setCurrentHash(window.location.hash);
        function handler() {
            setCurrentHash(window.location.hash);
        }
        window.addEventListener("hashchange", handler);
        return () => {
            window.removeEventListener("hashchange", handler);
        };
    });

    return (
        <header
            className={classNames(
                styles.header,
                isSearchOpen && styles.headerFixedBottom
            )}
        >
            <LayoutContainer>
                {!isSearchOpen && (
                    <nav className={styles.links}>
                        <a href={"#"} className={styles.link}>
                            Evolution Dex
                        </a>
                        {regions.map((region) => {
                            const id = `#${region.toLowerCase()}`;
                            return (
                                <a
                                    key={id}
                                    className={
                                        styles.link +
                                        " " +
                                        (currentHash === id ? "isActive" : "")
                                    }
                                    href={id}
                                >
                                    {region}
                                </a>
                            );
                        })}
                        <span className={styles.spacer}></span>
                        <button
                            className={classNames(
                                styles.link,
                                styles.searchButton
                            )}
                            onClick={() => {
                                setSearchOpen(true);
                            }}
                        >
                            <SearchIcon className={styles.searchIcon} />
                        </button>
                    </nav>
                )}
                <DexSearch setIsOpen={setSearchOpen} isOpen={isSearchOpen} />
            </LayoutContainer>
        </header>
    );
}

export function SearchIcon(props: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 13.312 13.311"
            className={props.className}
        >
            <title>Search</title>
            <path
                d="M5.193,1.143A4.059,4.059,0,1,0,9.267,5.2,4.059,4.059,0,0,0,5.193,1.143h0M13.043,13.08a1.019,1.019,0,0,1-1.349-.054L8.125,9.456A5.182,5.182,0,1,1,9.477,8.113l3.559,3.559a1.033,1.033,0,0,1,0,1.409Z"
                transform="translate(-0.031 0.01)"
                fill="currentColor"
            />
        </svg>
    );
}
