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
