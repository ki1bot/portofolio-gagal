import { useEffect, useState } from "react";
import "./app/globals.css";

import { getPortfolioData } from "@/lib/portfolio-api";
import { assetUrl } from "@/lib/supabase-storage";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { AnimatedBackground } from "@/components/animations/AnimatedBackground";
import { BackToTop } from "@/components/animations/BackToTop";
import { LoadingScreen } from "@/components/animations/LoadingScreen";
import { ReloadToHome } from "@/components/animations/ReloadToHome";

import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { PortfolioShowcaseSection } from "@/components/sections/PortfolioShowcaseSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";

const initialPortfolioData = {
  projects: [],
  certificates: [],
  comments: [],
};

function toCssUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return `url("${path}")`;
  return `url("/${path.replace(/^\/+/, "")}")`;
}

export default function App() {
  const [portfolioData, setPortfolioData] = useState(initialPortfolioData);

  useEffect(() => {
    document.documentElement.lang = "id";
    document.documentElement.dataset.scrollBehavior = "smooth";
    document.documentElement.classList.add("portfolio-is-loading");

    document.body.className = "antialiased";
    document.body.style.setProperty(
      "--portfolio-gradient-blue-image",
      toCssUrl(assetUrl("assets/gradient-blue.jpg")),
    );

    document.title = "Rifqi | Software Engineer";

    const description =
      "Website portofolio pribadi yang menampilkan project, sertifikat, dan kontak.";

    let descriptionMeta = document.querySelector('meta[name="description"]');

    if (!descriptionMeta) {
      descriptionMeta = document.createElement("meta");
      descriptionMeta.setAttribute("name", "description");
      document.head.appendChild(descriptionMeta);
    }

    descriptionMeta.setAttribute("content", description);

    let themeMeta = document.querySelector('meta[name="theme-color"]');

    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeMeta);
    }

    themeMeta.setAttribute("content", "#020617");

    const faviconHref = assetUrl("assets/logoKibot.png");

    if (faviconHref) {
      let favicon = document.querySelector('link[rel="icon"]');

      if (!favicon) {
        favicon = document.createElement("link");
        favicon.setAttribute("rel", "icon");
        document.head.appendChild(favicon);
      }

      favicon.setAttribute("href", `/${faviconHref.replace(/^\/+/, "")}`);
      favicon.setAttribute("type", "image/png");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getPortfolioData()
      .then((data) => {
        if (!isMounted) return;

        setPortfolioData({
          projects: Array.isArray(data?.projects) ? data.projects : [],
          certificates: Array.isArray(data?.certificates)
            ? data.certificates
            : [],
          comments: Array.isArray(data?.comments) ? data.comments : [],
        });
      })
      .catch((error) => {
        console.error("Gagal memuat data portfolio:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <ReloadToHome />
      <LoadingScreen />

      <main className="min-h-screen bg-transparent">
        <AnimatedBackground />
        <BackToTop />
        <Navbar />
        <HeroSection />
        <ExperienceSection />
        <AboutSection
          projects={portfolioData.projects}
          certificates={portfolioData.certificates}
        />
        <PortfolioShowcaseSection
          projects={portfolioData.projects}
          certificates={portfolioData.certificates}
        />
        <ContactSection comments={portfolioData.comments} />
        <Footer />
      </main>
    </>
  );
}
