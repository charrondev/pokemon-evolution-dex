/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import React, { useEffect, useState } from "react";
import { usePokemonModel } from "../models/PokemonModel";
import styles from "./DexHeader.module.scss";
import { LayoutContainer } from "./LayoutContainer";

export function DexHeader() {
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
        <header className={styles.header}>
            <LayoutContainer>
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
                </nav>
            </LayoutContainer>
        </header>
    );
}

function DexSearch() {
    const [isActive, setIsActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const model = usePokemonModel();

    useEffect(() => {
        function handler(e: KeyboardEvent) {
            if (e.ctrlKey && e.key === "k") {
                setSearchTerm("");
                if (isActive) {
                    setIsActive(true);
                } else {
                    setIsActive(false);
                }
            }
        }
    });

    const pokes = isActive && searchTerm ? model.search(searchTerm) : [];

    return (
        <div>
            <input
                type="text"
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                }}
                value={searchTerm}
            />
        </div>
    );
}
