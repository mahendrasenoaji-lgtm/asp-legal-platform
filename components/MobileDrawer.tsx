"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NAV } from "../lib/data";

// Ports the drawer behaviour from prototype/assets/app.js: focus capture on
// open, focus return on close, Escape to close, body scroll lock.
export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

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
      <div
        ref={drawerRef}
        className="drawer"
        id="drawer"
        data-open={open ? "true" : "false"}
        aria-hidden={!open}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="header__brand">ASP</span>
        </div>
        <ul className="drawer__list">
          {NAV.map(([label, href]) => (
            <li key={href}>
              <Link href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/contact" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </li>
        </ul>
        <div className="drawer__foot">
          <Link className="btn btn--gold" href="/consultation" onClick={() => setOpen(false)}>
            Discuss your matter
          </Link>
          <span className="lang">
            <a href="#" aria-current="true">
              English
            </a>{" "}
            / <a href="#">Bahasa Indonesia</a>
          </span>
        </div>
      </div>
    </>
  );
}
