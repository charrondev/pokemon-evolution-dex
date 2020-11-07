/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import fs from "fs-extra";
import path from "path";
import { on } from "process";
import { IDexMon } from "../models/PokemonModel";

const SCRAPE_ROOT = path.resolve(__dirname);
const FAMILY_DATA_PATH = path.resolve(SCRAPE_ROOT, "./data/families.json");
const MON_DATA_PATH = path.resolve(SCRAPE_ROOT, "./data/pokemon.json");

if (!fs.existsSync(MON_DATA_PATH)) {
    console.error("Could not locate " + MON_DATA_PATH);
    process.exit(1);
}

const json = fs.readFileSync(MON_DATA_PATH, "utf-8");
const data: IDexMon[] = JSON.parse(json);

const result: IDexMon[] = [];

data.forEach((mon) => {
    if (isExluded(mon)) {
        return;
    }

    result.push(transformName(mon));
});

fs.writeFileSync(MON_DATA_PATH, JSON.stringify(result, null, 4));

function isExluded(mon: IDexMon) {
    const EXCLUSIONS = [
        "Darmanitan (Zen Mode)",
        "Darmanitan (Galarian Zen Mode)",
        "White Kyurem",
        "Black Kyurem",
        "Xerneas (Neutral Mode)",
        "Hoopa Confined",
        "Dusk Mane Necrozma",
        "Dawn Wings Necrozma",
        "Ultra Necrozma",
        "Original Color Magearna",
        "Eiscue (Noice Face)",
        "Female Indeedee",
        "Morpeko (Hangry Mode)",
        "Zacian (Crowned Sword)",
        "Zamazenta (Crowned Shield)",
        "Eternamax Eternatus",
        "Urshifu (Rapid Strike Style)",
        "Dada Zarude",
        "Ice Rider Calyrex",
        "Shadow Rider Calyrex",
    ];
    return EXCLUSIONS.includes(mon.name);
}

function transformName(mon: IDexMon): IDexMon {
    switch (mon.name) {
        case "Darmanitan (Standard Mode)":
            mon.name = "Darmanitan";
            break;
        case "Darmanitan (Galarian Standard Mode)":
            mon.name = "Galarian Darmanitan";
            break;
        case "Deerling (Spring Form)":
            mon.name = "Deerling";
            break;
        case "Sawsbuck (Spring Form)":
            mon.name = "Sawsbuck";
            break;
        case "Tornadus (Incarnate Forme)":
            mon.name = "Tornadus";
            break;
        case "Thundurus (Incarnate Forme)":
            mon.name = "Thundurus";
            break;
        case "Landorus (Incarnate Forme)":
            mon.name = "Landorus";
            break;
        case "Meloetta (Aria Forme)":
            mon.name = "Meloetta";
            break;
        case "Xerneas (Active Mode)":
            mon.name = "Xerneas";
            break;
        case "Zygarde (50% Forme)":
            mon.name = "Zygarde";
            break;
        case "Hoopa Unbound":
            mon.name = "Hoopa";
            break;
        case "Lycanroc (Midday Form)":
            mon.name = "Lycanroc";
            break;
        case "Wishiwashi (Solo Form)":
            mon.name = "Wishiwashi";
            break;
        case "Minior (Meteor Form)":
            mon.name = "Minior";
            break;
        case "Mimikyu (Disguised Form)":
            mon.name = "Mimikyu";
            break;
        case "Eiscue (Ice Face)":
            mon.name = "Eiscue";
            break;
        case "Morpeko (Full Belly Mode)":
            mon.name = "Morpeko";
            break;
        case "Zacian (Hero of Many Battles)":
            mon.name = "Zacian";
            break;
        case "Zamazenta (Hero of Many Battles)":
            mon.name = "Zamazenta";
            break;
        case "Urshifu (Single Strike Style)":
            mon.name = "Urshifu";
    }

    return mon;
}
