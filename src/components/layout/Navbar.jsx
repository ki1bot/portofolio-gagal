"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  {
    id: "home",
    label: "Home",
    href: "/",
  },
  {
    id: "about",
    label: "About",
    href: "/about",
  },
  {
    id: "projects",
    label: "Portofolio",
    href: "/projects",
  },
  {
    id: "contact",
    label: "Contact",
    href: "/contact",
  },
];

const pathToSection = {
  "/": "home",
  "/home": "home",
  "/about": "about",
  "/projects": "projects",
  "/contact": "contact",
};

const sectionToPath = {
  home: "/",
  about: "/about",
  projects: "/projects",
  contact: "/contact",
};

function getSectionFromPathname(pathname) {
  return pathToSection[pathname] || "home";
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [hoveredSection, setHoveredSection] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
    opacity: 0,
  });

  const desktopNavRef = useRef(null);
  const itemRefs = useRef({});
  const animationFrameRef = useRef(null);
  const manualScrollRef = useRef(false);
  const manualScrollTimeoutRef = useRef(null);
  const activeSectionRef = useRef("home");
  const hoveredSectionRef = useRef(null);

  const displayedSection = hoveredSection || activeSection;

  function updateBrowserPath(sectionId, mode = "replace") {
    if (typeof window === "undefined") return;

    const nextPath = sectionToPath[sectionId] || "/";

    if (window.location.pathname === nextPath) return;

    if (mode === "push") {
      window.history.pushState(null, "", nextPath);
      return;
    }

    window.history.replaceState(null, "", nextPath);
  }

  function updateIndicator(sectionId = activeSectionRef.current) {
    const navContainer = desktopNavRef.current;
    const activeElement = itemRefs.current[sectionId];

    if (!navContainer || !activeElement) return;

    const navRect = navContainer.getBoundingClientRect();
    const activeRect = activeElement.getBoundingClientRect();

    setIndicatorStyle({
      width: activeRect.width,
      left: activeRect.left - navRect.left,
      opacity: 1,
    });
  }

  function getCurrentSection() {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return "home";
    }

    const currentSection = navItems
      .map((item) => {
        const section = document.getElementById(item.id);

        if (!section) return null;

        const rect = section.getBoundingClientRect();

        return {
          id: item.id,
          distance: Math.abs(rect.top - 112),
          visible: rect.top <= window.innerHeight * 0.5 && rect.bottom >= 112,
        };
      })
      .filter(Boolean)
      .filter((section) => section.visible)
      .sort((a, b) => a.distance - b.distance)[0];

    return currentSection?.id || "home";
  }

  function detectActiveSection() {
    if (typeof window === "undefined") return;

    setIsScrolled(window.scrollY > 16);

    if (manualScrollRef.current) return;

    const currentSection = getCurrentSection();

    if (activeSectionRef.current === currentSection) return;

    activeSectionRef.current = currentSection;
    setActiveSection(currentSection);

    requestAnimationFrame(() => {
      updateBrowserPath(currentSection, "replace");

      if (!hoveredSectionRef.current) {
        updateIndicator(currentSection);
      }
    });
  }

  function scrollToSection(sectionId, behavior = "smooth") {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const section = document.getElementById(sectionId);

    if (!section) return;

    const navbarOffset = window.innerWidth < 768 ? 84 : 115;
    const rawPosition =
      section.getBoundingClientRect().top + window.scrollY - navbarOffset;
    const sectionPosition = sectionId === "home" ? 0 : Math.max(rawPosition, 0);

    window.scrollTo({
      top: sectionPosition,
      behavior,
    });
  }

  function handleDesktopMouseEnter(sectionId) {
    hoveredSectionRef.current = sectionId;
    setHoveredSection(sectionId);

    requestAnimationFrame(() => {
      updateIndicator(sectionId);
    });
  }

  function handleDesktopMouseLeave() {
    hoveredSectionRef.current = null;
    setHoveredSection(null);

    requestAnimationFrame(() => {
      updateIndicator(activeSectionRef.current);
    });
  }

  useEffect(() => {
    const initialFrame = requestAnimationFrame(() => {
      const sectionFromPath = getSectionFromPathname(window.location.pathname);

      activeSectionRef.current = sectionFromPath;
      setActiveSection(sectionFromPath);
      setIsScrolled(window.scrollY > 16);
      updateIndicator(sectionFromPath);

      if (sectionFromPath !== "home") {
        scrollToSection(sectionFromPath, "auto");
      }
    });

    function handlePopState() {
      requestAnimationFrame(() => {
        const nextSection = getSectionFromPathname(window.location.pathname);

        activeSectionRef.current = nextSection;
        setActiveSection(nextSection);
        updateIndicator(nextSection);
        scrollToSection(nextSection, "auto");
      });
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    activeSectionRef.current = activeSection;

    requestAnimationFrame(() => {
      updateIndicator(hoveredSectionRef.current || activeSection);
    });

    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }

      requestAnimationFrame(() => {
        updateIndicator(hoveredSectionRef.current || activeSectionRef.current);
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeSection]);

  useEffect(() => {
    function handleScroll() {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(detectActiveSection);
    }

    animationFrameRef.current = requestAnimationFrame(detectActiveSection);

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.body.style.overflow = isOpen ? "hidden" : "";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleNavClick(event, sectionId) {
    event.preventDefault();

    const section = document.getElementById(sectionId);

    if (!section) return;

    manualScrollRef.current = true;
    activeSectionRef.current = sectionId;
    hoveredSectionRef.current = null;

    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current);
    }

    setActiveSection(sectionId);
    setHoveredSection(null);
    setIsOpen(false);

    requestAnimationFrame(() => {
      updateIndicator(sectionId);
      updateBrowserPath(sectionId, "push");
    });

    scrollToSection(sectionId, "smooth");

    manualScrollTimeoutRef.current = setTimeout(() => {
      manualScrollRef.current = false;

      requestAnimationFrame(() => {
        detectActiveSection();
      });
    }, 950);
  }

  return (
    <header
      className={`fixed left-0 top-0 z-[90] w-full border-none transition-all duration-500 ease-out ${
        isScrolled || isOpen
          ? "bg-slate-950/80 shadow-2xl shadow-violet-950/10 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav
        className={`relative z-[110] mx-auto flex max-w-[1320px] items-center justify-between px-4 transition-all duration-500 ease-out sm:px-6 md:px-10 ${
          isScrolled || isOpen ? "py-3.5 md:py-5" : "py-5 md:py-8"
        }`}
      >
        <a
          href="/"
          onClick={(event) => handleNavClick(event, "home")}
          className="group relative inline-flex items-center overflow-hidden rounded-full px-3 py-1.5 text-2xl font-black tracking-wide text-violet-300 transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:drop-shadow-[0_0_14px_rgba(168,85,247,0.45)] sm:px-5 sm:py-2 sm:text-[1.7rem]"
        >
          <span className="absolute inset-0 rounded-full bg-white/[0.05] opacity-0 transition duration-300 group-hover:opacity-100" />
          <span className="relative z-10">Rifqi</span>
        </a>

        <div
          ref={desktopNavRef}
          onMouseLeave={handleDesktopMouseLeave}
          className="relative hidden items-center gap-8 rounded-full border border-white/10 bg-slate-950/30 px-7 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:flex"
        >
          <span
            className="pointer-events-none absolute bottom-3 h-[2px] rounded-full bg-gradient-to-r from-blue-300 via-violet-300 to-fuchsia-300 shadow-[0_0_18px_rgba(168,85,247,0.75)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: `${indicatorStyle.width}px`,
              left: `${indicatorStyle.left}px`,
              opacity: indicatorStyle.opacity,
            }}
          />

          <span
            className="pointer-events-none absolute bottom-2 h-4 rounded-full bg-violet-400/20 blur-lg transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: `${indicatorStyle.width}px`,
              left: `${indicatorStyle.left}px`,
              opacity: indicatorStyle.opacity ? 1 : 0,
            }}
          />

          {navItems.map((item) => {
            const isHighlighted = displayedSection === item.id;

            return (
              <a
                key={item.id}
                ref={(element) => {
                  itemRefs.current[item.id] = element;
                }}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.id)}
                onMouseEnter={() => handleDesktopMouseEnter(item.id)}
                className={`group relative z-10 px-0 py-1 text-sm font-bold transition-all duration-300 ${
                  isHighlighted
                    ? "text-violet-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                    : "text-blue-100/72 hover:text-violet-200"
                }`}
              >
                <span className="relative z-10">{item.label}</span>

                <span
                  className={`absolute -bottom-2 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-violet-300 transition-all duration-300 ${
                    isHighlighted ? "opacity-0" : "group-hover:w-full"
                  }`}
                />

                <span className="absolute inset-x-[-10px] inset-y-[-8px] -z-10 rounded-xl bg-violet-500/10 opacity-0 blur-md transition duration-300 group-hover:opacity-100" />
              </a>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="group relative inline-flex size-11 items-center justify-center overflow-hidden rounded-full text-white transition-all duration-300 hover:-translate-y-0.5 lg:hidden"
          aria-label="Toggle menu"
          aria-controls="mobile-navbar-menu"
          aria-expanded={isOpen}
        >
          <span
            className={`absolute inset-0 rounded-full border border-white/10 bg-white/[0.06] shadow-lg shadow-slate-950/20 transition-all duration-300 ${
              isOpen
                ? "scale-100 border-violet-300/20 bg-white/[0.08]"
                : "scale-95 group-hover:scale-100 group-hover:border-violet-300/20"
            }`}
          />

          <Menu
            className={`absolute size-6 transition-all duration-300 ease-out ${
              isOpen
                ? "rotate-90 scale-75 opacity-0"
                : "rotate-0 scale-100 opacity-100"
            }`}
          />

          <X
            className={`absolute size-6 transition-all duration-300 ease-out ${
              isOpen
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-75 opacity-0"
            }`}
          />
        </button>
      </nav>

      <div
        id="mobile-navbar-menu"
        className={`fixed left-0 right-0 top-0 z-[100] overflow-hidden bg-[#030013]/95 shadow-2xl shadow-slate-950/50 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_26%_42%,rgba(139,92,246,0.16),transparent_34%),radial-gradient(circle_at_78%_16%,rgba(59,130,246,0.08),transparent_30%)]" />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:54px_54px] opacity-55" />

        <div className="relative z-10 flex flex-col px-12 pb-12 pt-[104px] min-[390px]:px-14 sm:px-16 sm:pb-14 sm:pt-[112px]">
          <div className="flex flex-col items-start gap-9 min-[390px]:gap-10">
            {navItems.map((item, index) => {
              const isActive = activeSection === item.id;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.id)}
                  style={{
                    transitionDelay: isOpen ? `${120 + index * 55}ms` : "0ms",
                  }}
                  className={`relative text-lg font-extrabold tracking-tight transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] min-[390px]:text-xl ${
                    isActive
                      ? "text-violet-400 drop-shadow-[0_0_16px_rgba(139,92,246,0.42)]"
                      : "text-blue-100/82 hover:text-violet-200"
                  } ${
                    isOpen
                      ? "translate-y-0 opacity-100 blur-0"
                      : "-translate-y-7 opacity-0 blur-sm"
                  }`}
                >
                  <span>{item.label}</span>

                  <span
                    className={`absolute -bottom-2 left-0 h-[2px] rounded-full bg-violet-400 shadow-[0_0_14px_rgba(139,92,246,0.65)] transition-all duration-300 ${
                      isActive ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
