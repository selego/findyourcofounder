import "./globals.css";
import { Poppins } from "next/font/google";
import { getServerSession } from "next-auth/next";
import Script from "next/script"
import { Toaster } from "react-hot-toast";

import { TopBar } from "./components/top-bar";
import { Footer } from "./components/footer";

import Provider from "./auth-provider";
import { authOptions } from "./api/auth/[...nextauth]/route";

const poppins = Poppins({
  subsets: ["latin"],
  variable: '--font-poppins',
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  preload: false,
});

export const metadata = {
  title: "findyourcofounder",
  description: "You are looking for a Co-Founder, register now and find your Co-Founder.",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={poppins.className}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KR6T4LVH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-KR6T4LVH');`,
          }}
        />
        <Script
          id="gtm-hotjar"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:3792495,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
          }}
        />
        <Provider session={session}>
          <TopBar />
          <Toaster />
          {children}
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
