# ASP LEGAL INTELLIGENCE PLATFORM
## PHASE 1 — INFORMATION ARCHITECTURE

**Klien:** Arifudin Susanto Partnership (ASP)
**Website lama:** https://asplawyer.co.id/
**Status dokumen:** Draft untuk review & sign-off sebelum Phase 2 (UI Design System)
**Tanggal audit:** 18 Agustus 2026

---

## 0. CATATAN INTEGRITAS DATA

Seluruh nama lawyer, penghargaan, alamat, angka, dan practice area dalam dokumen ini **diambil langsung dari website ASP yang sekarang live** (halaman `/`, `/about-us/`, `/our-people/`, `/solutions/`), bukan hasil karangan.

Hal-hal yang **tidak** saya isi karena tidak tersedia di sumber publik ditandai:

- 🔴 **BUTUH DATA ASP** — harus disuplai klien sebelum halaman dibangun
- 🟡 **PERLU KONFIRMASI** — ada di brief tapi bertentangan / tidak terverifikasi di situs lama
- ⚪ **DEMO DATA** — boleh diisi mock, wajib berlabel visual "DEMO DATA"

---

## 1. AUDIT WEBSITE LAMA

### 1.1 Profil teknis

| Item | Temuan |
|---|---|
| Platform | WordPress (tema Salient / Nectar) |
| Plugin terdeteksi | Slider Revolution 6.7.37, TranslatePress Multilingual |
| Struktur bahasa | EN di root (`/`), ID di prefix (`/id/`) |
| Media | `/wp-content/uploads/YYYY/MM/` — campuran `.jpg`, `.png`, `.webp`, banyak file `-scaled` (tidak dioptimasi) |
| Meta viewport | `maximum-scale=1, user-scalable=0` → **pelanggaran aksesibilitas WCAG 1.4.4**, wajib dihapus di build baru |
| Site icon | `cropped-ASP-Site-Icon-270x270.png` |

### 1.2 Struktur navigasi lama (7 item)

```
/                    Home
/about-us/           About Us  (+ anchor #achievements)
/our-people/         Our People
/solutions/          Practice Area   ← label menu ≠ slug URL
/news/               News
/careers/            Careers
/contact-us/         Contact Us
```

### 1.3 Masalah kritis yang ditemukan

| # | Masalah | Dampak | Prioritas |
|---|---|---|---|
| 1 | Blog masih berisi konten default WordPress: **"Hello world!"**, **"Be My Guest"**, **"Nulla Magna"** dengan teks Lorem Ipsum dan tanggal palsu (2014) | Kredibilitas hancur di halaman depan | P0 |
| 2 | Kategori berita: **Fashion**, **Music**, **Uncategorized** | Sinyal SEO salah total, tampak situs belum jadi | P0 |
| 3 | Tidak ada satu pun artikel legal asli | Nol topical authority | P0 |
| 4 | Tidak ada halaman detail per practice area — semua hanya daftar `<h6>` tanpa link | Kehilangan 10 halaman SEO bernilai tinggi | P0 |
| 5 | Tidak ada halaman profil individual lawyer | Tidak ada schema `Person`, tidak ada thought leadership | P0 |
| 6 | Achievements hanya berupa galeri gambar + bullet link keluar ke Hukumonline | Social proof terkuat ASP tidak ter-index sebagai konten sendiri | P1 |
| 7 | Slug `/solutions/` untuk menu berlabel "Practice Area" | Kebingungan IA + SEO mismatch | P1 |
| 8 | Footer "Quick Links" semua `href="#"` (mati) | Broken internal linking | P1 |
| 9 | Copyright footer "2025" (basi) | Detail kepercayaan | P2 |
| 10 | Tidak ada breadcrumb, tidak ada structured data, tidak ada halaman legal (Privacy/Disclaimer) | Wajib untuk firma hukum | P0 |

### 1.4 Aset yang LAYAK dimigrasi (real content)

**Profil firma**
- Didirikan **3 Mei 2017** oleh **Muhamad Arifudin** dan **Herlin Susanto**
- Positioning existing: *Advocates, Receivers, and Administrators in Bankruptcy*
- Fokus: Bankruptcy, Liquidation, PKPU, Debt Restructuring
- Core values: **VIP** — Visionary, Integrity, Professional

**Angka (dari situs lama)**
- 40 Fee Earners · 10 Area of Practices · 237 Satisfied Clients

> 🟡 **PERLU KONFIRMASI:** Halaman `/our-people/` hanya menampilkan **23 orang** (2 Partner + 5 Leader + 16 Associate), sedangkan klaim di homepage adalah **40 fee earners**. Dua angka ini harus direkonsiliasi sebelum launch — angka yang tidak bisa dibuktikan di halaman People adalah risiko kredibilitas. Opsi: (a) lengkapi 17 profil yang hilang, atau (b) turunkan klaim ke angka aktual.

**Practice areas aktual (10)**
1. Bankruptcy, Suspension of Debt Payment Obligations (PKPU) & Restructuring
2. Commercial Litigation
3. Civil Litigation
4. Criminal Litigation
5. Labor and Employment
6. Capital Markets
7. Competition & Antitrust
8. Arbitration
9. Islamic Law
10. Dispute Resolution

> 🟡 Brief meminta practice **"Corporate Legal Services / Corporate Matters"** dan memisahkan Bankruptcy / PKPU / Restructuring menjadi 3 halaman. Situs lama menggabungkan ketiganya jadi satu dan **tidak** punya practice Corporate. Rekomendasi saya di §3.3.

**Industri yang sudah tertulis (dipakai sebagai taxonomy `industries`)**
Manufacturing · Aviation · Shipping · Oil & Gas and Energy Exploration · Property & Real Estate · Tobacco · Plantation & Palm Oil Processing · Cooperatives & Microfinance · Umrah and Hajj Travel · Textiles & Garments · Investment Firms · Cellular Dealership · Warehousing · Traditional Herbal Medicine (Jamu) · SOE (BUMN) · Listed Companies (Tbk)

**People (23 orang terverifikasi)**

| Tier | Nama |
|---|---|
| Managing Partner | Muhamad Arifudin, S.H., M.H. |
| Founding Partner | Herlin Susanto, S.H., M.H. |
| Leader | Akhmad Fahmi Budiman, S.H., M.H. |
| Leader | Rakhmadani Hutama, S.H., M.H. |
| Leader | Muhammad Agung Laksana, S.H. |
| Leader | Adnan Dika Prawira Wardhana, S.H., M.H. |
| Leader | Indah Try Harsanti, S.H. |
| Associate | Muhammad Rizki Aditya, S.H. |
| Associate | Reza Rahmawati, S.H. |
| Associate | Christian Kharis Wicaksono, S.H., M.Kn. |
| Associate | Betti, S.H. |
| Associate | Dania Agustina, S.H. |
| Associate | Erwin Hardi Pramana, S.H. |
| Associate | Faras Salwaa Janvira, S.H. |
| Associate | Ratna Sumirat, S.H., M.H. |
| Associate | Arif Gunawan, S.H. |
| Associate | Nurhadi Islami, S.H. |
| Associate | Andy Arly Gustiawan, S.H. |
| Associate | Benedictus Aryo Bimo, S.H. |
| Associate | Eunike Putri Emmanuella, S.H. |
| Associate | Faza Shaqila, S.H. |
| Associate | Meisel Rusli Irawan, S.H. |
| Associate | Richard Goenawan, S.H., M.H. |

> 🟡 Brief memakai tier **"Counsel"**. Situs lama memakai tier **"Leaders"**. Saya rekomendasikan mengganti "Leaders" → **"Partners / Counsel / Senior Associate"** sesuai konvensi firma internasional, tapi ini keputusan ASP karena menyangkut jabatan riil. Sampai dikonfirmasi, IA memakai label netral **Leadership**.
>
> 🔴 **BUTUH DATA ASP:** hanya 2 dari 23 orang punya biografi. 21 profil lain butuh: bio, practice areas, pendidikan, admissions, bahasa, email, selected matters.

**Recognition (10 award terverifikasi, semua dari Hukumonline)**

| Tahun | Penghargaan |
|---|---|
| 2026 | Best Litigation Law Firm Brand Innovation of The Year |
| 2026 | 3rd Place — Top 10 Largest Litigation Practice Law Firm |
| 2026 | Elite One Practice Leader — Bankruptcy, Insolvency & Restructuring |
| 2026 | Elite One Practice Leader — Islamic Finance |
| 2026 | Top 100 Indonesian Law Firms |
| 2025 | Practice Leaders — Elite One in Labor & Employment |
| 2025 | Practice Leaders — Elite One in Arbitration, Litigation & Dispute Resolution |
| 2024 | Practice Leaders — Elite One in Bankruptcy, Insolvency and Restructuring |
| 2024 | 4th Place — Largest Litigation Practice Law Firm of The Year |
| 2022 | 3rd Place — Top 10 Largest Litigation Practice Law Firm |

Semua punya URL sumber Hukumonline → dipakai sebagai field `source_url` (E-E-A-T signal).

**Kontak**
ASP Building, Jl. Mampang Prapatan Raya No. 26, RT.2/RW.1, Duren Tiga, Pancoran, Jakarta Selatan 12760 · Tel (021) 38815231 · office@asplawyer.co.id

> 🔴 **BUTUH DATA ASP:** office hours, LinkedIn URL, koordinat Google Maps, PIC media relations.

### 1.5 Aset yang HARUS DIBUANG (jangan dimigrasi)

- Post: `Hello world!`, `Be My Guest`, `Nulla Magna`
- Kategori: `Fashion`, `Music`, `Uncategorized`
- Media placeholder: `banner_v2.webp` (dipakai sebagai thumbnail semua post dummy)
- Semua author default WordPress
- Slider Revolution assets

---

## 2. KEPUTUSAN ARSITEKTUR (untuk disetujui)

| # | Keputusan | Rekomendasi | Alasan |
|---|---|---|---|
| D-01 | Strategi bahasa | **EN tetap di root, ID di `/id/`** (bukan `/en/` + `/id/`) | Mempertahankan seluruh link equity URL EN yang sudah ter-index. `/en/*` disediakan sebagai 301 → root. `hreflang` x-default = EN. |
| D-02 | Slug practice | `/practices/` (bukan `/solutions/`) | Sesuai istilah industri hukum & search intent |
| D-03 | Slug editorial | `/insights/` dengan `/news/` di-301 | Brief meminta "ASP Insights"; `/news/` lama hanya berisi dummy sehingga tidak ada equity yang hilang |
| D-04 | Bankruptcy/PKPU/Restructuring | **Dipisah jadi 3 halaman practice + 1 hub page** | 3 search intent berbeda di Indonesia; hub page menjaga cerita "satu tim" |
| D-05 | Recognition | Halaman index + **detail page per award** | Mengubah gambar galeri jadi 10 halaman ter-index dengan schema `Award` |
| D-06 | Cases | Launch dengan **struktur + empty state**, bukan mock | Data perkara = risiko kerahasiaan. Mock hanya untuk staging, berlabel DEMO DATA, `noindex` |
| D-07 | Knowledge Center | **Fase 2 konten**, bukan blocker launch | Butuh 8 pillar + minimal 3 artikel/pillar; jangan launch dengan kerangka kosong |
| D-08 | AI Assistant | Hanya menyiapkan skema data & chunking di Phase 1–4. **Tidak ada UI chatbot di launch** | Sesuai instruksi brief §33 |

---

## 3. SITEMAP FINAL

### 3.1 Struktur URL (EN = root; ID = mirror di `/id/`)

```
/                                       Homepage
│
├── /about/                             About ASP (hub)
│   ├── /about/firm/                    The Firm
│   ├── /about/values/                  Vision & Values (VIP)
│   ├── /about/leadership/              Leadership
│   └── /about/timeline/                Milestones sejak 2017        🔴
│
├── /people/                            People (index + filter)
│   ├── /people/?tier=partners
│   ├── /people/?tier=counsel
│   ├── /people/?tier=associates
│   └── /people/{slug}/                 Profil individual (23 halaman)
│
├── /practices/                         Practices (index)
│   ├── /practices/bankruptcy/
│   ├── /practices/pkpu/
│   ├── /practices/debt-restructuring/
│   ├── /practices/commercial-litigation/
│   ├── /practices/civil-litigation/
│   ├── /practices/criminal-litigation/
│   ├── /practices/labor-employment/
│   ├── /practices/capital-markets/
│   ├── /practices/competition-antitrust/
│   ├── /practices/arbitration/
│   ├── /practices/islamic-law/
│   └── /practices/dispute-resolution/
│
├── /insights/                          ASP Insights (index + filter)
│   ├── /insights/category/{slug}/      9 kategori
│   ├── /insights/author/{slug}/        arsip per lawyer
│   └── /insights/{slug}/               artikel
│
├── /knowledge/                         Legal Knowledge Center (hub)
│   └── /knowledge/{topic}/             8 pillar
│       └── /knowledge/{topic}/{guide}/ guide
│
├── /cases/                             Case Intelligence (index + filter)
│   └── /cases/{slug}/                  detail matter
│
├── /recognition/                       Recognition (index)
│   └── /recognition/{slug}/            detail award (10 halaman)
│
├── /events/                            Events                        🔴
│   └── /events/{slug}/
│
├── /careers/                           Careers
│   ├── /careers/culture/
│   ├── /careers/development/
│   ├── /careers/internship/
│   └── /careers/openings/{slug}/                                     🔴
│
├── /contact/                           Contact
├── /consultation/                      Legal Intake (form utama)
├── /search/                            Global search
│
└── Legal & sistem
    ├── /privacy-policy/
    ├── /terms/
    ├── /legal-disclaimer/
    ├── /cookie-policy/
    ├── /sitemap.xml
    ├── /robots.txt
    └── /404, /500
```

### 3.2 SEO landing pages (Bahasa Indonesia, prioritas trafik)

Ditempatkan di namespace ID karena search intent-nya berbahasa Indonesia:

```
/id/kepailitan/
/id/pkpu/
/id/restrukturisasi-utang/
/id/litigasi-komersial/
/id/arbitrase/
/id/kurator-pengurus/
```

Setiap landing page = konten unik (bukan duplikat practice page), `canonical` ke diri sendiri, `hreflang` berpasangan dengan halaman practice EN yang setara.

### 3.3 Pemetaan practice lama → baru

| Practice lama (10) | Halaman baru | Catatan |
|---|---|---|
| Bankruptcy, PKPU & Restructuring | 3 halaman: `/bankruptcy/`, `/pkpu/`, `/debt-restructuring/` | D-04 |
| Commercial Litigation | `/commercial-litigation/` | 1:1 |
| Civil Litigation | `/civil-litigation/` | 1:1 |
| Criminal Litigation | `/criminal-litigation/` | 1:1 |
| Labor and Employment | `/labor-employment/` | 1:1 |
| Capital Markets | `/capital-markets/` | 1:1 |
| Competition & Antitrust | `/competition-antitrust/` | 1:1 |
| Arbitration | `/arbitration/` | 1:1 |
| Islamic Law | `/islamic-law/` | Award 2026 "Islamic Finance" → pertimbangkan sub-halaman |
| Dispute Resolution | `/dispute-resolution/` | 1:1 |
| — | Corporate Legal Services | 🟡 **Tidak ada di situs lama.** Hanya dibuat bila ASP mengonfirmasi kapabilitas & bisa menyuplai deskripsi + lawyer terkait. Tidak akan saya karang. |

**Total halaman practice: 12** (bukan 10) — atau 13 bila Corporate dikonfirmasi.

---

## 4. NAVIGASI

### 4.1 Header (desktop) — mega menu

```
[ASP logo]   About   People   Practices ▾   Insights ▾   Cases   Recognition   Careers      🔍   EN|ID   [Discuss Your Matter]
```

**Mega menu Practices** (3 kolom):
- Kolom 1 — *Flagship*: Bankruptcy · PKPU · Debt Restructuring
- Kolom 2 — *Disputes*: Commercial · Civil · Criminal Litigation · Arbitration · Dispute Resolution
- Kolom 3 — *Corporate & Regulatory*: Labor & Employment · Capital Markets · Competition & Antitrust · Islamic Law
- Panel kanan: 1 insight terbaru + CTA "View all practices"

**Mega menu Insights** (2 kolom): 9 kategori + 2 artikel featured

### 4.2 Header (mobile)

Logo · 🔍 · ☰ → full-screen drawer, accordion 1 level, CTA "Discuss Your Matter" sticky di bawah drawer, language switcher di paling bawah.

### 4.3 Utility & footer

- Sticky CTA bar muncul setelah scroll > 60% di halaman practice & article
- Footer 4 kolom: Firm · Practices (top 6) · Resources (Insights, Knowledge, Cases, Recognition, Events, Careers) · Contact (alamat + tel + email + LinkedIn)
- Footer bawah: Privacy · Terms · Legal Disclaimer · Cookie Policy · © tahun dinamis

### 4.4 Breadcrumb

Wajib di semua halaman kecuali homepage. Format: `Home / Practices / Bankruptcy` dengan schema `BreadcrumbList`.

---

## 5. CONTENT MODEL (entitas & relasi)

### 5.1 Collections

| Collection | Field inti | Jumlah saat launch |
|---|---|---|
| `lawyers` | slug, name, honorifics, tier, position, photo, bio_short, bio_full, practice_areas[], industries[], education[], admissions[], memberships[], languages[], email, linkedin, recognitions[], publications[], is_curator (bool) | 23 |
| `practice_areas` | slug, name_en, name_id, tier (flagship/dispute/corporate), summary, overview, capabilities[], process_steps[], faq[], lead_lawyers[], related_insights[], related_cases[], seo | 12 |
| `insights` | slug, title, excerpt, body, hero_image, category, tags[], authors[] (→ lawyers), reviewer, practice_areas[], published_at, updated_at, reading_time, status, is_legal_reviewed | 0 🔴 |
| `insight_categories` | slug, name, description | 9 |
| `cases` | slug, matter_title, case_type, court, year, industry, practice_areas[], role (curator/administrator/counsel-debtor/counsel-creditor), status, is_public, source_url, summary, team[] | 0 / DEMO |
| `awards` | slug, title, year, organization, category, source_url, image, description, related_lawyers[], related_practices[] | 10 ✅ |
| `industries` | slug, name | 16 ✅ |
| `events` | slug, title, type, date, venue, speakers[], registration_url | 0 🔴 |
| `jobs` | slug, title, tier, location, type, description, requirements[], is_open | 0 🔴 |
| `knowledge_topics` | slug, title, pillar_content, guides[], related_* | 8 (kerangka) |
| `leads` | name, company, position, email, phone, matter_type, role, urgency, description, file_ref, source_page, utm, status, assigned_to, created_at | runtime |
| `users` | email, role, mfa_enabled, last_login | runtime |
| `seo_metadata` | entity_type, entity_id, locale, title, description, og_image, canonical, noindex | derived |
| `audit_logs` | actor, action, entity, before, after, ip, ts | runtime |

### 5.2 Peta relasi

```
lawyer ──n:m── practice_area ──n:m── insight
  │                  │                  │
  │                  └──n:m── case ──n:m── industry
  │                                 │
  └──n:m── award                    └──n:m── lawyer
  │
  └──1:n── publication / speaking_engagement

knowledge_topic ──1:1── practice_area (opsional)
knowledge_topic ──1:n── guide ──n:m── insight
lead ──n:1── practice_area (via matter_type)
```

**Aturan integritas:**
- Setiap `practice_area` **wajib** punya ≥1 `lead_lawyer` → mencegah halaman "yatim"
- Setiap `insight` **wajib** punya `author` yang merupakan lawyer nyata → E-E-A-T + schema `Article.author`
- `case.is_public = false` → tidak pernah dirender ke frontend, apa pun kondisi filter
- `case` tanpa `source_url` atau tanpa persetujuan tertulis **tidak boleh** dipublikasikan

### 5.3 Taxonomy Insights (9 kategori)

Legal Update · Bankruptcy · PKPU · Restructuring · Litigation · Corporate · Arbitration · Employment · Case Analysis

Ini **menggantikan** Fashion / Music / Uncategorized.

---

## 6. PAGE TEMPLATE INVENTORY

| # | Template | Rute | Prioritas |
|---|---|---|---|
| T-01 | Homepage | `/` | P0 |
| T-02 | Practice index | `/practices/` | P0 |
| T-03 | Practice detail | `/practices/{slug}/` | P0 |
| T-04 | People index | `/people/` | P0 |
| T-05 | Lawyer profile | `/people/{slug}/` | P0 |
| T-06 | About | `/about/*` | P0 |
| T-07 | Insight index + filter | `/insights/` | P0 |
| T-08 | Article detail | `/insights/{slug}/` | P0 |
| T-09 | Recognition index | `/recognition/` | P0 |
| T-10 | Award detail | `/recognition/{slug}/` | P1 |
| T-11 | Contact | `/contact/` | P0 |
| T-12 | Legal intake | `/consultation/` | P0 |
| T-13 | Case index + filter | `/cases/` | P1 |
| T-14 | Case detail | `/cases/{slug}/` | P1 |
| T-15 | Knowledge hub / topic / guide | `/knowledge/*` | P1 |
| T-16 | Careers + job detail | `/careers/*` | P1 |
| T-17 | Events + detail | `/events/*` | P2 |
| T-18 | Search results | `/search/` | P1 |
| T-19 | Legal pages | `/privacy-policy/` dst. | P0 |
| T-20 | 404 / 500 / empty states | — | P0 |
| T-21 | SEO landing (ID) | `/id/kepailitan/` dst. | P1 |
| T-22 | Admin dashboard + CRUD | `/admin/*` | P1 |

**Total halaman publik saat launch (EN+ID):**
`(1 home + 4 about + 1 people index + 23 profil + 1 practice index + 12 practice + 1 recognition index + 10 award + 1 contact + 1 intake + 1 careers + 1 search + 4 legal) × 2 bahasa ≈ **122 halaman**` — belum termasuk insights, cases, knowledge, events.

---

## 7. 301 REDIRECT MAP

### 7.1 Redirect (301)

| URL lama | URL baru |
|---|---|
| `/about-us/` | `/about/firm/` |
| `/about-us/#achievements` | `/recognition/` |
| `/our-people/` | `/people/` |
| `/solutions/` | `/practices/` |
| `/news/` | `/insights/` |
| `/careers/` | `/careers/` (tetap) |
| `/contact-us/` | `/contact/` |
| `/id/about-us/` | `/id/tentang/profil/` |
| `/id/our-people/` | `/id/tim/` |
| `/id/solutions/` | `/id/layanan/` |
| `/id/news/` | `/id/wawasan/` |
| `/id/contact-us/` | `/id/kontak/` |
| `/en/*` | `/*` |
| `/wp-content/uploads/**` (aset yang dipertahankan) | `/media/**` |

### 7.2 Gone (410 — bukan 301)

Konten dummy tidak boleh diredirect massal ke homepage (dianggap soft-404 oleh Google):

```
/hello-world/
/be-my-guest/
/nulla-magna/
/category/fashion/
/category/music/
/category/uncategorized/
/?p=1
```

### 7.3 Block (robots + WAF)

`/wp-admin/*` · `/wp-login.php` · `/xmlrpc.php` · `/wp-json/*` · `/feed/*` · `/?s=`

> ⚠️ **Redirect map ini belum final.** Nav lama hanya mengungkap 7 halaman. Sebelum Phase 8 wajib dilakukan crawl penuh (Screaming Frog + export Google Search Console 16 bulan + `wp-sitemap.xml`) untuk menangkap URL yatim, attachment page, tag archive, dan paginasi. Estimasi tambahan: 100–400 URL, mayoritas attachment page media.

---

## 8. YANG DIBUTUHKAN DARI ASP SEBELUM PHASE 3

| # | Kebutuhan | Blocker untuk | Urgensi |
|---|---|---|---|
| 1 | Bio + data 21 lawyer (selain 2 partner) | T-05 (23 halaman) | 🔴 Tinggi |
| 2 | Rekonsiliasi angka 40 fee earners vs 23 profil | Homepage trust bar | 🔴 Tinggi |
| 3 | Deskripsi 12 practice area (300–600 kata/halaman) | T-03 | 🔴 Tinggi |
| 4 | Konfirmasi tier: "Leaders" vs "Counsel" | T-04, T-05 | 🔴 Tinggi |
| 5 | Konfirmasi ada/tidaknya practice Corporate | Sitemap | 🔴 Tinggi |
| 6 | Daftar perkara yang **disetujui** untuk dipublikasikan + bukti status publik | T-13, T-14 | 🟠 Sedang |
| 7 | 5–10 artikel legal asli (atau approval agar tim menulis draft) | T-07, T-08 | 🟠 Sedang |
| 8 | File asli sertifikat/plakat award resolusi tinggi | T-10 | 🟠 Sedang |
| 9 | Foto profesional: tim, kantor, arsitektur | Semua template | 🟠 Sedang |
| 10 | LinkedIn firma, jam operasional, koordinat maps | T-11 | 🟢 Rendah |
| 11 | Teks Privacy Policy, Disclaimer, Cookie Policy (review oleh ASP sendiri) | T-19 | 🟢 Rendah |
| 12 | Logo vektor (SVG) + brand guideline bila ada | Phase 2 | 🟢 Rendah |
| 13 | Akses Search Console & hosting/DNS lama | Phase 8 | 🟢 Rendah |

---

## 9. ACCEPTANCE CRITERIA — PHASE 1

Phase 1 dianggap selesai bila:

- [ ] Sitemap §3 disetujui ASP (khususnya D-04 dan pemisahan practice)
- [ ] 8 keputusan arsitektur (§2) di-sign-off
- [ ] Isu tier "Leaders/Counsel" diputuskan
- [ ] Isu angka 40 vs 23 diputuskan
- [ ] Practice Corporate: masuk atau tidak
- [ ] Content model §5 disetujui sebagai dasar skema CMS
- [ ] Redirect map §7 disetujui sebagai baseline (final setelah crawl penuh)
- [ ] Daftar kebutuhan data §8 diterima dan diberi PIC + deadline

**Deliverable Phase 1 yang dapat diuji:** dokumen ini + (opsional, atas permintaan) prototipe navigasi HTML clickable berisi seluruh 122 rute dengan judul halaman, breadcrumb, dan status konten per halaman — dapat ditelusuri sebelum satu baris UI dibuat.

---

## 10. PREVIEW PHASE 2

Setelah sign-off, Phase 2 — UI Design System akan menghasilkan:

1. Design token (warna `#111315` / `#16352B` / `#B89B5E` / `#F7F5EF`, spacing scale, radius, shadow, motion easing)
2. Type scale editorial (serif heading + sans body) dengan uji keterbacaan mobile
3. Grid & layout system (12 kolom, asymmetric editorial)
4. Kontras WCAG 2.2 AA terverifikasi untuk setiap pasangan warna — catatan awal: gold `#B89B5E` di atas ivory `#F7F5EF` **tidak lolos** untuk teks kecil, sehingga gold hanya boleh dipakai sebagai aksen/border, bukan body text
5. 15 komponen inti (§38 brief) dalam bentuk static states dulu, motion menyusul
6. Dark editorial vs light editorial: aturan pemakaian per section

---

*Dokumen ini tidak mengklaim sistem production-ready. Klaim tersebut hanya boleh dibuat setelah Phase 6 (Security) dan Phase 7 (QA) selesai.*
