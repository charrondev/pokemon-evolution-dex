/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import got from "got";
import { JSDOM } from "jsdom";
import { terminal } from "terminal-kit";
import fs from "fs-extra";
import path from "path";
import { IDexFamily, IDexMon } from "../models/PokemonModel";

const BASE_PATH = "https://bulbapedia.bulbagarden.net";
const FAMILY_URL = `${BASE_PATH}/wiki/List_of_Pok%C3%A9mon_by_evolution_family`;
const SCRAPE_ROOT = path.resolve(__dirname);
const FAMILY_DATA_PATH = path.resolve(SCRAPE_ROOT, "./data/families.json");
const MON_DATA_PATH = path.resolve(SCRAPE_ROOT, "./data/pokemon.json");

async function run() {
    terminal.clear();
    terminal.bold.underline("Scraping Pokedex Information\n\n");
    const cache = getCache();
    terminal.white(`Found ${cache.size} cache entries.\n`);

    // Write families
    const families = await scrapeIndex();
    terminal.white("Found ").bold.green(families.length).white(" Families\n");
    terminal.white("Writing family data to ").green(FAMILY_DATA_PATH + "\n");
    const familyJson = JSON.stringify(families, null, 4);
    fs.writeFileSync(FAMILY_DATA_PATH, familyJson);

    // Write pokemon.
    const mons = await scrapeFamilies(families, 10000);
    terminal
        .white(`Writing ${mons.length} pokemon to `)
        .green(MON_DATA_PATH + "\n");
    const monJson = JSON.stringify(mons, null, 4);
    fs.writeFileSync(MON_DATA_PATH, monJson);
}

// Utilities
async function scrapeFamilies(
    families: IDexFamily[],
    limit: number = 5
): Promise<IDexMon[]> {
    const mons: IDexMon[] = [];

    heading("\nScraping Pokedex Families\n");

    let i = 0;
    for (const family of families) {
        i++;
        if (i > limit) {
            break;
        }

        if (i % 5 === 0) {
            flushCache();
        }
        terminal.yellow.bold(family.familyName + "\n");
        const monsInFamily = await scrapeFamily(family);

        for (const mon of monsInFamily) {
            mons.push(mon);
        }
        terminal.white("\n");
    }

    return mons;
}

async function scrapeFamily(family: IDexFamily): Promise<IDexMon[]> {
    const mons: IDexMon[] = [];

    for (const url of family.bulbapediaUrls) {
        const [dom, wasCached] = await scrapeDom(url);
        const numberElements = dom.querySelectorAll(
            `[title="List of Pokémon by National Pokédex number"]`
        );
        const numberElement: Element = numberElements[1] ?? numberElements[0];
        if (!numberElement) {
            console.log("Couldn't find dex number for url " + url);
        }
        const nationalID = Number.parseInt(
            normalizeName(numberElement.textContent).replace("#", "")
        );
        const sidePanel = numberElement.closest("table");
        const images = Array.from(sidePanel.querySelectorAll(".image img"));

        const baseName = normalizeName(
            sidePanel.querySelector("big big b").textContent ?? ""
        );

        for (const image of images) {
            let name = normalizeName(image.getAttribute("alt"));
            if (shouldIgnoreMon(name)) {
                continue;
            }

            if (!name.includes(baseName)) {
                name = `${baseName} (${name})`;
            }

            const imageUrl = image.getAttribute("src");

            terminal.styleReset(`#${nationalID} - `).bold.green(name + " ");
            if (wasCached) {
                terminal.styleReset().green("(cached)\n");
            } else {
                terminal.styleReset().white("(remote)\n");
            }

            mons.push({
                bulbapediaUrl: url,
                name,
                nationalID,
                familyName: family.familyName,
                color: family.color,
                imageUrl,
                regionName: family.regionName,
            });
        }
    }

    return mons;
}

const COlOR_REGEX = /background:(?<color>#......);/;
async function scrapeIndex(): Promise<IDexFamily[]> {
    heading("Loading Family Indexes");
    const [dom, wasCached] = await scrapeDom(FAMILY_URL);
    if (wasCached) {
        terminal.green("Loading index from cache\n");
    } else {
        terminal.white("Fetched index from remote server\n");
    }

    const families: IDexFamily[] = [];
    const tables = Array.from(dom.querySelectorAll("h3 ~ table"));
    for (const table of tables) {
        const regionName = normalizeName(
            table.previousElementSibling.textContent
        )
            .replace("-based evolution families", "")
            .replace(" evolution families", "");

        let currentFamilyName = "";
        let currentColor = "";
        const existingLinks: Set<string> = new Set();
        for (const tableRow of Array.from(table.querySelectorAll("tr"))) {
            const tableHead = tableRow.querySelector("th");
            if (tableHead) {
                currentFamilyName = normalizeName(tableHead.textContent);
                const style = tableHead.getAttribute("style") ?? "";
                const color = COlOR_REGEX.exec(style)?.groups?.["color"];
                if (!color) {
                    // Not actually a pokemon.
                    continue;
                }
                if (color) {
                    currentColor = color;
                }
            } else {
                const links = Array.from(tableRow.querySelectorAll("td a"));

                const pokemonUrls: string[] = [];
                for (const link of links) {
                    if (!link.querySelector("span")) {
                        // This is decorative. Either an image or levelup.
                        continue;
                    }

                    const rawUrl = link.getAttribute("href");
                    if (!rawUrl) {
                        continue;
                    }

                    if (!rawUrl.includes("(Pok%C3%A9mon)")) {
                        continue;
                    }

                    if (existingLinks.has(rawUrl)) {
                        continue;
                    } else {
                        existingLinks.add(rawUrl);
                    }
                    pokemonUrls.push(BASE_PATH + rawUrl);
                }

                if (pokemonUrls.length === 0) {
                    continue;
                }

                let uniqueUrls = Array.from(new Set(pokemonUrls));
                families.push({
                    regionName,
                    color: currentColor,
                    familyName: currentFamilyName,
                    bulbapediaUrls: uniqueUrls,
                });
            }
        }
    }
    // dom.

    return families;
}

function rgbToHex(rgb: string) {
    if (rgb.startsWith("#")) {
        return rgb;
    }

    if (!rgb) {
        return "";
    }

    try {
        return (
            "#" +
            rgb
                .match(/\d+/g)
                .map(function (x) {
                    x = parseInt(x).toString(16);
                    return x.length == 1 ? "0" + x : x;
                })
                .join("")
        );
    } catch (e) {
        terminal.red.error("Failed to convert rgb to hex: " + rgb + "\n");
        return "";
    }
}

const IGNORE_WORDS = [
    "mega ",
    " y",
    " x",
    "gigantamax",
    "spiky-eared",
    "cosplay",
    "in a cap",
    "partner ",
    "Size)",
    "(Event)",
    "Sunny Form",
    "Rainy Form",
    "Snowy Form",
    "Cramorant (Gulping Form)",
    "Cramorant (Gorging Form)",
    "Aegislash (Blade Forme*)",
    "Deoxys (Attack Forme)",
    "Deoxys (Defense Forme)",
    "Deoxys (Speed Forme)",
    "Deoxys (Speed Forme)",
    "Cherrim (Sunshine Form)",
    "Shaymin (Sky Forme)",
    "Flower)",
    "Deerling (Summer Form)",
    "Deerling (Autumn Form)",
    "Deerling (Winter Form)",
    "Sawsbuck (Summer Form)",
    "Sawsbuck (Autumn Form)",
    "Sawsbuck (Winter Form)",
    " Drive ",
    "Basculin (Blue-Striped Form)",
    "Giratina (Origin Forme)",
    "(Therian Forme)",
    "Resolute Form)",
    "Meloetta (Pirouette Forme)",
    "Zygarde (10% Forme)",
    "Zygarde (Complete Forme)",
    "Lycanroc (Midnight Form)",
    "Lycanroc (Dusk Form)",
    "Wishiwashi (School Form)",
    "Minior (Core)",
    "Mimikyu (Busted Form)",
];

function normalizeName(name: string): string {
    return name
        .trim()
        .normalize()
        .replace(/\u00A0/g, " "); // Replace non-breaking spaces.
}

function shouldIgnoreMon(name: string): boolean {
    const normalized = name.toLowerCase();
    for (const ignoreWord of IGNORE_WORDS) {
        if (
            normalized.includes(ignoreWord.toLowerCase()) ||
            normalized === ignoreWord.toLowerCase()
        ) {
            return true;
        }
    }

    return false;
}

async function scrapeDom(
    url: string
): Promise<[dom: DocumentFragment, wasCache: boolean]> {
    const cache = getCache();
    let html: string = "";
    let cached = false;
    if (cache.has(url)) {
        html = cache.get(url);
        cached = true;
    } else {
        const response = await got(url);
        cache.set(url, response.body);
        html = response.body;
    }

    return [JSDOM.fragment(html), cached];
}

const CACHE_PATH = SCRAPE_ROOT + "/cache/html-cache.json";
let cache: Map<any, any> | null = null;

function getCache() {
    if (cache === null) {
        if (fs.existsSync(CACHE_PATH)) {
            const loaded = fs.readFileSync(CACHE_PATH, { encoding: "utf8" });
            cache = new Map(JSON.parse(loaded));
        } else {
            cache = new Map();
        }
    }

    return cache;
}

function flushCache() {
    const cache = getCache();
    let serialized = JSON.stringify(Array.from(cache.entries()));
    fs.writeFileSync(CACHE_PATH, serialized);
}

function exitHandler() {
    flushCache();

    process.exit();
}

//do something when app is closing
process.on("exit", exitHandler);

run().catch((e) => {
    console.error(e);
    process.exit(1);
});

function heading(text: string, color: "white" | "yellow" = "white") {
    terminal.bold[color].underline(`\n${text}\n`);
    terminal.styleReset();
}
