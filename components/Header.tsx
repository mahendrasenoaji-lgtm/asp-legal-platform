"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "../lib/constants";
import { MobileDrawer } from "./MobileDrawer";

export function Header() {
  const pathname = usePathname();
  return (
    <header className="header">
      <div className="wrap header__inner">
        <Link className="header__brand" href="/">
          ASP <small>Est. 2017</small>
        </Link>
        <nav className="nav" aria-label="Primary">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header__actions">
          <span className="lang">
            <a href="#" aria-current="true">
              EN
            </a>{" "}
            / <a href="#">ID</a>
          </span>
          <Link className="btn btn--gold" href="/consultation">
            Discuss your matter
          </Link>
          <MobileDrawer />
        </div>
      </div>
    </header>
  );
}
