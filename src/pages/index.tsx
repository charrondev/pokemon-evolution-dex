/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import Head from "next/head";
import { DexHeader } from "../components/DexHeader";
import { EvolutionDex } from "../components/EvolutionDex";
import { LayoutContainer } from "../components/LayoutContainer";
import { usePokemonModel } from "../models/PokemonModel";
import styles from "./index.module.scss";

const desription =
    "The Evolution Dex is an alternate method of organizing a living dex of pokemon that keeps evolution lines together, regardless of the generation they were introduced.";

export default function Home() {
    const model = usePokemonModel();
    const regions = model.getRegionNames();

    return (
        <div className={styles.container}>
            <Head>
                <title>Pokemon Evolution Dex</title>
                <meta name="description" content={desription} />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <LayoutContainer>
                    <h1 className={styles.title}>Evolution Dex</h1>
                    <div className={styles.textContent}>
                        <div>
                            <h2>What is the Evolution Dex?</h2>
                            <p>{desription}</p>
                            <p>
                                By keeping pokemon of the same evolution line
                                together, it can be easier to find pokemon in
                                your PC or Pokémon Home.
                            </p>
                        </div>
                        <div>
                            <h2>What is this site for?</h2>
                            <p>
                                This site lays out pokemon by original region
                                and evolution line with visual guides for
                                organizing in Pokémon Home or in game. Pokemon
                                are grouped in order by "Box" and have a both
                                their National Dex ID and a "Region ID"
                                displayed. Region IDs are a numerical order
                                based on evolution line and may change in the
                                future as new forms and evolutions are
                                introduced.
                            </p>
                        </div>
                    </div>
                </LayoutContainer>
                <DexHeader />
                {regions.map((region, i) => {
                    return (
                        <EvolutionDex
                            regionName={region}
                            key={region}
                            gradient={i}
                        />
                    );
                })}
            </main>

            <footer className={styles.footer}>
                <a
                    href="https://charron.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{" "}
                    <img
                        src="/charrondev.svg"
                        alt="Vercel Logo"
                        className={styles.logo}
                    />
                </a>
            </footer>
        </div>
    );
}
