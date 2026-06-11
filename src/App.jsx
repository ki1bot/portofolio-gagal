import "./index.css";

import { LoadingScreen } from "/components/animations/LoadingScreen.jsx";
import { ReloadToHome } from "/components/animations/ReloadToHome.jsx";
import { assetUrl } from "/lib/supabase-storage.js";

export const metadata = {
  title: "Rifqi | Software Engineer",
  description:
    "Website portofolio pribadi yang menampilkan project, sertifikat, dan kontak.",
  icons: {
    icon: [
      {
        url: assetUrl("assets/logoKibot.png"),
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: assetUrl("assets/logoKibot.png"),
        type: "image/png",
      },
    ],
    apple: [
      {
        url: assetUrl("assets/logoKibot.png"),
        type: "image/png",
      },
    ],
  },
};

export const viewport = {
  themeColor: "#020617",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className="portfolio-is-loading"
    >
      <body
        style={{
          "--portfolio-gradient-blue-image": `url("/${assetUrl(
            "assets/gradient-blue.jpg",
          )}")`,
        }}
      >
        <ReloadToHome />
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
