// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html>
            <Head>
                <link rel="icon" type="image/png" sizes="32x32" href="/AppImages/ios/32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/AppImages/ios/16.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#000000" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="true"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&family=Oswald:wght@200..700&family=Permanent+Marker&display=swap"
                    rel="stylesheet"
                />
                <link rel="apple-touch-icon" sizes="180x180" href="/AppImages/ios/180.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/AppImages/ios/152.png" />
                <link rel="apple-touch-icon" sizes="120x120" href="/AppImages/ios/120.png" />
                <link rel="apple-touch-icon" sizes="76x76" href="/AppImages/ios/76.png" />
                <link rel="apple-touch-icon" href="/AppImages/ios/192.png" />

                <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/AppImages/ios/180.png" />
                <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/AppImages/ios/152.png" />
                <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/AppImages/ios/120.png" />
                <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/AppImages/ios/76.png" />
                <link rel="apple-touch-icon-precomposed" href="/AppImages/ios/192.png" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
