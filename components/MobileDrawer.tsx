"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NAV, NAV_I18N_KEYS } from "../lib/constants";
import { useLang } from "./LanguageProvider";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

// Ports the drawer behaviour from prototype/assets/app.js: focus capture on
// open, focus return on close, Escape to close, body scroll lock.
export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const { t } = useLang();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement;
      const first = drawerRef.current?.querySelector<HTMLElement>("a, button");
      first?.focus();
    } else {
      lastFocus.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const trapIndex = open ? undefined : -1;

  return (
    <>
      <button
        ref={toggleRef}
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="drawer"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Close" : "Menu"}
      </button>
      {/* aria-hidden alone hides content from assistive tech but leaves its
          links/buttons in the tab order, so a keyboard user can still focus
          into an "invisible" closed drawer (confirmed by Lighthouse's
          aria-hidden-focus audit). The HTML `inert` attribute is the
          standard fix for exactly this, but React 18's server renderer
          silently drops it (verified: it's simply absent from the rendered
          HTML) — `inert` boolean-attribute support landed in React 19, not
          before. Falling back to explicit tabIndex={-1} on every
          interactive descendant below, which works on any React version. */}
      <div
        ref={drawerRef}
        className="drawer"
        id="drawer"
        data-open={open ? "true" : "false"}
        aria-hidden={!open}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="header__brand">
            <Image src="/images/logo-asp.png" alt="Arifudin Susanto Partnership" width={89} height={34} />
          </span>
        </div>
        <ul className="drawer__list">
          {NAV.map(([label, href]) => (
            <li key={href}>
              <Link href={href} tabIndex={trapIndex} onClick={() => setOpen(false)}>
                {t.nav[NAV_I18N_KEYS[href]] ?? label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/contact" tabIndex={trapIndex} onClick={() => setOpen(false)}>
              {t.nav.contact}
            </Link>
          </li>
        </ul>
        <div className="drawer__foot">
          <Link
            className="btn btn--gold"
            href="/consultation"
            tabIndex={trapIndex}
            onClick={() => setOpen(false)}
          >
            {t.nav.cta}
          </Link>
          <ThemeToggle tabIndex={trapIndex} />
          <LanguageToggle tabIndex={trapIndex} />
        </div>
      </div>
    </>
  );
}
