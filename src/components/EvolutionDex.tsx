/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import Image from "next/image";
import React, { useMemo } from "react";
import { IDexMonExtended, usePokemonInRegion } from "../models/PokemonModel";
import styles from "./EvolutionDex.module.scss";
import { LayoutContainer } from "./LayoutContainer";

interface IProps {
    regionName: string;
    gradient: number;
}

export function EvolutionDex(props: IProps) {
    const { regionName, gradient } = props;
    const mons = usePokemonInRegion(regionName);
    const grouped = breakIntoGroups(mons, 30);
    return (
        <>
            <div
                id={regionName.toLowerCase()}
                className={styles.wrapper + " " + styles[`gradient${gradient}`]}
            >
                <LayoutContainer>
                    <h2 className={styles.wrapperTitle}>
                        {regionName}-based Pokemon
                    </h2>
                </LayoutContainer>
                {grouped.map((group, i) => {
                    return <BoxGrid key={i} pokemon={group} />;
                })}
            </div>
        </>
    );
}

function BoxGrid(props: { pokemon: IDexMonExtended[] }) {
    const { pokemon } = props;
    const boxID = useBoxID();
    return (
        <LayoutContainer>
            <h3 className={styles.gridHeading}>{`Box ${boxID + 1}`}</h3>
            <div className={styles.grid}>
                {pokemon.map((mon) => {
                    return <PokemonItem {...mon} key={mon.familyID} />;
                })}
            </div>
        </LayoutContainer>
    );
}

function PokemonItem(props: IDexMonExtended) {
    return (
        <div className={styles.pokemon}>
            <h3 className={styles.pokemonTitle}>
                <a href={props.bulbapediaUrl}>{props.name}</a>
                <span className={styles.familyID}>{props.familyID}</span>
            </h3>
            <div className={styles.pokemonImageRow}>
                <Image
                    className={styles.pokemonImage}
                    src={props.imageUrl}
                    width={80}
                    height={80}
                    alt={props.name}
                />
                <span className={styles.nationalID}>#{props.nationalID}</span>
            </div>
        </div>
    );
}

function breakIntoGroups<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];

    let i = 1;
    let currentGroup: T[] = [];
    for (const item of items) {
        if (i > size) {
            result.push(currentGroup);
            i = 1;
            currentGroup = [];
        }

        currentGroup.push(item);
        i++;
    }

    if (currentGroup.length > 0) {
        result.push(currentGroup);
    }
    return result;
}

let i = 0;

function useBoxID() {
    return useMemo(() => {
        return i++;
    }, []);
}
