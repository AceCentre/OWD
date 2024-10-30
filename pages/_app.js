import "antd/dist/reset.css";
import "../styles/globals.css";
import "../styles/receiver.css";
import "../styles/sender.css";
import { useEffect } from "react";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/service-worker.js")
                .then((registration) => {
                    console.log("Service Worker registered with scope:", registration.scope);
                })
                .catch((error) => {
                    console.error("Service Worker registration failed:", error);
                });
        }
    }, []);

    return (
        <>
            <Head>
                <title>OWD - AAC Display App</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;