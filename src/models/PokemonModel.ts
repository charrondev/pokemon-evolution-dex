/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import { useDebugValue, useMemo } from "react";
import familyData from "../scrape/data/families.json";
import pokemonData from "../scrape/data/pokemon.json";

export interface IDexFamily {
    color: string;
    familyName: string;
    regionName: string;
    bulbapediaUrls: string[];
}

export interface IDexMon {
    bulbapediaUrl: string;
    name: string;
    nationalID: number;
    regionName: string;
    familyName: string;
    color: string;
    imageUrl: string;
}

export interface IDexMonExtended extends IDexMon {
    familyID: string;
    slug: string;
}

export class PokemonModel {
    private familiesByName: Map<string, IDexFamily> = new Map();
    private pokemonByRegion: Map<string, IDexMon[]> = new Map();
    private regions: Set<string> = new Set();
    private allPokemon: IDexMonExtended[];

    public constructor() {
        // Index the families.
        familyData.forEach((family) => {
            const { familyName, regionName } = family;
            this.familiesByName.set(familyName, family);
        });

        pokemonData.forEach((pokemon) => {
            const { regionName } = pokemon;
            this.regions.add(regionName);
            if (!this.pokemonByRegion.has(regionName)) {
                this.pokemonByRegion.set(regionName, []);
            }
            this.pokemonByRegion.get(regionName).push(pokemon);
        });

        this.allPokemon = this.applyFamilyIDs(pokemonData);
    }

    public getRegionNames(): string[] {
        return Array.from(this.regions);
    }

    public getPokemonInRegion(regionName: string): IDexMonExtended[] {
        return this.applyFamilyIDs(this.pokemonByRegion.get(regionName));
    }

    public search(keyword: string): string[] {
        return this.allPokemon
            .filter((poke) => {
                return poke.name.toLowerCase().includes(keyword.toLowerCase());
            })
            .map((poke) => {
                return poke.slug;
            });
    }

    private applyFamilyIDs(dexMon: IDexMon[]): IDexMonExtended[] {
        return dexMon.map((mon, i) => {
            const { regionName, imageUrl, name } = mon;
            const regionLetter = regionName.charAt(0).toUpperCase();
            const finalImageUrl = imageUrl.startsWith("//")
                ? `https:${imageUrl}`
                : imageUrl;
            const numberString = `${i + 1}`.padStart(3, "0");
            return {
                ...mon,
                slug: name.toLowerCase().replace(/\s/g, "-"),
                imageUrl: finalImageUrl,
                familyID: `${regionLetter} ${numberString}`,
            };
        });
    }
}

let instance = new PokemonModel();

export function usePokemonModel(): PokemonModel {
    return instance;
}

export function usePokemonInRegion(regionName: string) {
    const model = usePokemonModel();
    const pokemon = useMemo(() => {
        return model.getPokemonInRegion(regionName);
    }, [regionName]);
    useDebugValue({
        regionName,
        pokemon,
    });
    return pokemon;
}
