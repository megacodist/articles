"use client"; // Required for onClick events

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";
import ThemeSwitch from "./theme-switch";

import { SvgHomePage, SvgMegacodist, SvgLicense } from "@/components/svgs";


export default function Header() {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch (wait for component to mount on client)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same height to prevent layout shift.
    // The height is based on the default DaisyUI navbar height.
    return <header className="navbar h-16" />;
  }

  return (
    <header className={`navbar ${styles.header}`}>
      <div className={`navbar-start ${styles.headerGroup}`}>
        {/* The Home Page */}
        <div className="tooltip tooltip-bottom" data-tip="Home Page">
          <Link href="/" className="m3-icon-btn"
            aria-label="Go to the Home page">
            <SvgHomePage className={`${styles.headerIcon}`} />
          </Link>
        </div>

        {/* The Megacodist Logo */}
        <div className="tooltip tooltip-bottom" data-tip="About Megacodist">
          <Link href="/about" className="m3-icon-btn"
            aria-label="About Megacodist">
            <SvgMegacodist className={`${styles.headerIcon}`} />
          </Link>
        </div>
      </div>

      {/* Right Side Group */}
      <div className={`navbar-end ${styles.headerGroup}`}>
        <div className="tooltip tooltip-bottom" data-tip="License Page">
          <Link href="/license" className="m3-icon-btn"
            aria-label="Go to the License page">
            <SvgLicense className={`${styles.headerIcon}`} />
          </Link>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Light/dark theme">
          <ThemeSwitch iconClassName="m3-icon-m" />
        </div>
      </div>
    </header>
  );
}