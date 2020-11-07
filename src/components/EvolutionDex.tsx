/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import classNames from "classnames";
import Image from "next/image";
import React, { useMemo } from "react";
import {
    IDexMonExtended,
    usePokemonInRegion,
    usePokemonModel,
} from "../models/PokemonModel";
import { useSearchContext } from "./DexSearch";
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
    const region = mons[0].regionName;
    return (
        <>
            <div
                id={regionName.toLowerCase()}
                className={styles.wrapper + " " + styles[`gradient${gradient}`]}
            >
                <LayoutContainer>
                    <h2 className={styles.wrapperTitle}>
                        {regionName.trim()} Pokemon
                    </h2>
                </LayoutContainer>
                {grouped.map((group, i) => {
                    return <BoxGrid key={i} pokemon={group} region={region} />;
                })}
                <EmptyBox region={region} />
            </div>
        </>
    );
}

function EmptyBox(props: { region: string }) {
    const emptyArray = Array.from(new Array(30));
    const model = usePokemonModel();
    const regionKey = model.getRegionKey(props.region);
    return (
        <LayoutContainer>
            <h3 className={classNames(styles.gridHeading)}>
                {`${regionKey}-Extras`}
                <p>
                    This is an empty box. It's recommended to use one to make
                    adjusting things easier in case new forms are added.
                </p>
            </h3>
            <div className={styles.grid}>
                {emptyArray.map((_, i) => {
                    return (
                        <div key={i} className={styles.pokemon}>
                            Placeholder
                        </div>
                    );
                })}
            </div>
        </LayoutContainer>
    );
}

function BoxGrid(props: { pokemon: IDexMonExtended[]; region: string }) {
    const { pokemon, region } = props;
    const boxID = useBoxID(region);
    const model = usePokemonModel();
    const regionKey = model.getRegionKey(region);
    const boxStart = 30 * (boxID - 1) + 1;
    const boxEnd = boxStart + 30;

    return (
        <LayoutContainer>
            <h3
                className={classNames(
                    styles.gridHeading,
                    styles.gridHeadingSticky
                )}
            >{`${regionKey} ${boxStart
                .toString()
                .padStart(3, "0")}-${boxEnd.toString().padStart(3, "0")}`}</h3>
            <div className={styles.grid}>
                {pokemon.map((mon, i) => {
                    return (
                        <React.Fragment key={mon.familyID}>
                            <PokemonItem {...mon} />
                            {i % 6 === 5 && (
                                <div className={styles.rowSeparator}>
                                    <label>
                                        Row {Math.round((i + 1) / 6) + 1}
                                    </label>
                                    <hr />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </LayoutContainer>
    );
}

function PokemonItem(props: IDexMonExtended) {
    const { searchTerm } = useSearchContext();
    const isSearched =
        searchTerm &&
        props.name.toLowerCase().includes(searchTerm.toLowerCase());
    return (
        <div
            className={styles.pokemon + " " + (isSearched ? "isActive" : "")}
            id={props.slug}
        >
            <h3 className={styles.pokemonTitle}>
                <span href={props.bulbapediaUrl}>{props.name}</span>
            </h3>
            <div className={styles.pokemonImageRow}>
                <Image
                    className={styles.pokemonImage}
                    src={props.imageUrl}
                    width={65}
                    height={65}
                    alt={props.name}
                />
                <div className={styles.pokemonIDs}>
                    <span className={styles.familyID}>{props.familyID}</span>
                    <span className={styles.nationalID}>
                        #{props.nationalID}
                    </span>
                </div>
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

const boxes: Record<string, number> = {};

function useBoxID(region: string) {
    return useMemo(() => {
        if (!boxes[region]) {
            boxes[region] = 1;
        }

        return boxes[region]++;
    }, [region]);
}
