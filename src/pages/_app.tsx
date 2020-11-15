/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import "../styles/globals.css";
import Head from "next/head";
import { AppProps } from "next/app";
import React from "react";
import { ClientUserContext } from "../models/ClientUserModel";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ClientUserContext>
            <Component {...pageProps} />
            <Head>
                <script
                    async
                    defer
                    data-domain="evolution-dex.charron.dev"
                    src="https://stats.charron.dev/js/plausible.js"
                ></script>
            </Head>
        </ClientUserContext>
    );
}

export default MyApp;
