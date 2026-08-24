"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, NAV_I18N_KEYS } from "../lib/constants";
import { useLang } from "./LanguageProvider";
import { LanguageToggle } from "./LanguageToggle";
import { MobileDrawer } from "./MobileDrawer";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const { t } = useLang();
  return (
    <header className="header">
      <div className="wrap header__inner">
        <Link className="header__brand" href="/">
          <Image src="/images/logo-asp.png" alt="Arifudin Susanto Partnership" width={89} height={34} />
          <small>Est. 2017</small>
        </Link>
        <nav className="nav" aria-label="Primary">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
              {t.nav[NAV_I18N_KEYS[href]] ?? label}
            </Link>
          ))}
        </nav>
        <div className="header__actions">
          <ThemeToggle />
          <LanguageToggle />
          <Link className="btn btn--gold" href="/consultation">
            {t.nav.cta}
          </Link>
          <MobileDrawer />
        </div>
      </div>
    </header>
  );
}
