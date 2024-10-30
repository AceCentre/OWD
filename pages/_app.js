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

        // Request notification permission if not already granted or denied
        if (typeof Notification !== "undefined" && Notification.permission === "default") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    console.log("Notifications enabled.");
                } else {
                    console.log("Notifications disabled.");
                }
            }).catch((error) => {
                console.error("Notification permission request failed:", error);
            });
        } else {
            console.warn("Notifications API not supported on this browser.");
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