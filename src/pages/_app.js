import "../styles/globals.css";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Component {...pageProps} />
            <Head>
                <script
                    async
                    defer
                    data-domain="evolution-dex.charron.dev"
                    src="https://stats.charron.dev/js/plausible.js"
                ></script>
            </Head>
        </>
    );
}

export default MyApp;
