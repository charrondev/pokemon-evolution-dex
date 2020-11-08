import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
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
    </>;
}

export default MyApp;
