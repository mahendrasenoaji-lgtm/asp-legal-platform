/**
 * Static-copy dictionary for the EN/ID language toggle.
 *
 * Scope: chrome/prose copy only — nav labels, hero, section kickers/titles/
 * intros, CTA, footer, form labels, and the three small static-content
 * blocks (About "values" cards, Insights "workflow" cards) that don't come
 * from the database. Every string below is taken verbatim from the redesign
 * handoff's own `DICT.en`/`DICT.id` objects (the deliverable's copy, not
 * invented here — see PROGRESS.md for where the handoff bundle came from).
 *
 * Deliberately NOT here: lawyer names, practice names, award titles/orgs,
 * industries, the firm's address/phone/email. Those are real facts that
 * live in the database / data/*.json (already bilingual where it matters —
 * e.g. practices carry name_en/name_id) and must stay the single source of
 * truth rather than being duplicated into a second, driftable copy here.
 */

export type Lang = "en" | "id";

export const LANGS: Lang[] = ["en", "id"];

interface Dict {
  nav: {
    home: string; about: string; people: string; practices: string;
    insights: string; cases: string; recognition: string; careers: string;
    contact: string; cta: string;
  };
  themeToggle: { light: string; dark: string };
  hero: { kicker: string; title: string; sub: string; cta1: string; cta2: string };
  statsLabels: { founded: string; people: string; practiceAreas: string; recognitions: string };
  practices: { kicker: string; title: string; seeAll: string; intro: string };
  practiceGroupLabel: { flagship: string; dispute: string; corporate: string };
  about: { kicker: string; title: string; body1: string; body2: string; body3: string; more: string };
  cta: { title: string; sub: string; button: string };
  values: { kicker: string; title: string; items: { title: string; body: string }[] };
  sectors: { kicker: string; title: string; intro: string };
  people: {
    kicker: string; title: string; body: string; note: string;
    groupLabel: { partner: string; leader: string; associate: string };
  };
  insights: {
    kicker: string; title: string; note: string; intro: string;
    emptyTitle: string; emptyBody: string;
    workflow: { kicker: string; title: string; body: string }[];
  };
  cases: { kicker: string; title: string; intro: string; emptyTitle: string; emptyBody: string };
  recognition: { kicker: string; title: string; intro: string };
  careers: {
    kicker: string; title: string; intro: string;
    openTitle: string; openBody: string; internTitle: string; internBody: string; cta: string;
  };
  contact: {
    kicker: string; title: string; officeLabel: string; phoneLabel: string; emailLabel: string;
    formName: string; formEmail: string; formMessage: string; formSend: string;
  };
  footer: {
    /** e.g. "Arifudin Susanto Partnership. All rights reserved." — rendered as `© {year} ` + this. */
    rightsSuffix: string;
    links: string[];
    blurb: string; practicesLabel: string; allPractices: string; firmLabel: string; contactLabel: string;
  };
}

export const DICT: Record<Lang, Dict> = {
  en: {
    nav: {
      home: "Home", about: "About", people: "People", practices: "Practices",
      insights: "Insights", cases: "Cases", recognition: "Recognition",
      careers: "Careers", contact: "Contact", cta: "Discuss your matter",
    },
    themeToggle: { light: "Light", dark: "Dark" },
    hero: {
      kicker: "Jakarta · Est. 2017",
      title: "Arifudin Susanto Partnership",
      sub: "Advocates, receivers and administrators in bankruptcy. Jakarta, since 2017.",
      cta1: "Discuss your matter",
      cta2: "Our practices",
    },
    statsLabels: {
      founded: "Founded", people: "People", practiceAreas: "Practice areas",
      recognitions: "Recognitions, 2022–2026",
    },
    practices: {
      kicker: "Practices", title: "Twelve practices", seeAll: "All practices",
      intro: "Ten as published by the firm, with bankruptcy, PKPU and restructuring separated into distinct areas.",
    },
    practiceGroupLabel: {
      flagship: "Insolvency & restructuring", dispute: "Disputes", corporate: "Corporate & regulatory",
    },
    about: {
      kicker: "About the firm",
      title: "A practice organised around insolvency",
      body1: "Founded 3 May 2017 by Muhamad Arifudin and Herlin Susanto. Advocates, receivers and administrators in bankruptcy.",
      body2: "ASP handles commercial disputes with a primary concentration in bankruptcy, liquidation and PKPU. The firm’s lawyers act in three capacities that are usually split across different firms: as court-appointed receiver, as administrator, and as counsel to debtors or creditors.",
      body3: "Matters have involved individual debtors, national private companies, publicly listed companies and state-owned enterprises.",
      more: "More about the firm",
    },
    cta: {
      title: "Have a matter to discuss?",
      sub: "Reach the partnership directly — by phone, email or in person at our Jakarta office.",
      button: "Discuss your matter",
    },
    values: {
      kicker: "Vision & values", title: "Three commitments, stated plainly",
      items: [
        { title: "Visionary", body: "Anticipating how the legal landscape moves, so a strategy holds up beyond the current hearing." },
        { title: "Integrity", body: "Candid advice, transparent process, and the client’s interest ahead of the firm’s." },
        { title: "Professional", body: "Expert knowledge applied with precision, and communicated on time." },
      ],
    },
    sectors: {
      kicker: "Sectors", title: "Where the work has been",
      intro: "Sixteen sectors drawn from matters the firm has already described publicly.",
    },
    people: {
      kicker: "People", title: "23 professionals",
      body: "Names, honorifics and tiers are taken from the firm’s published team page.",
      note: "Photography and biographies are pending.",
      groupLabel: { partner: "Partners", leader: "Leadership", associate: "Associates" },
    },
    insights: {
      kicker: "ASP Insights", title: "Legal updates and case analysis",
      note: "Nine categories, an editorial workflow with legal review, and no published articles yet.",
      intro: "Nine categories, an editorial workflow with legal review, and no published articles yet.",
      emptyTitle: "Nothing published yet",
      emptyBody: "Real articles start here, each with a named author, a reviewer, and a publication date.",
      workflow: [
        { kicker: "Workflow", title: "Draft → legal review", body: "Written by a named lawyer, reviewed by a second before anything is scheduled." },
        { kicker: "Attribution", title: "Named authors only", body: "Every article carries an author who works at the firm. No house byline." },
        { kicker: "Dates", title: "Published and updated", body: "Both dates shown. Legal updates go stale, and hiding that helps nobody." },
      ],
    },
    cases: {
      kicker: "Case intelligence", title: "Selected matters on the public record",
      intro: "A filterable register of matters that are already public and cleared for publication by the firm.",
      emptyTitle: "Nothing published yet",
      emptyBody: "The register stays empty until the firm supplies matters that are on the public record and clears each one for publication.",
    },
    recognition: {
      kicker: "Recognition", title: "10 recognitions, 2022–2026",
      intro: "Each entry links to the awarding organisation’s published listing.",
    },
    careers: {
      kicker: "Careers", title: "Build your career with ASP",
      intro: "Insolvency practice rewards people who can hold a statutory deadline and a commercial negotiation in the same week.",
      openTitle: "Open positions",
      openBody: "No vacancies published. When roles open, each will get its own page with responsibilities, requirements and an application route.",
      internTitle: "Internship programme",
      internBody: "Programme description, eligibility and intake dates are not yet published.",
      cta: "Send your CV",
    },
    contact: {
      kicker: "Contact", title: "Visit or write to us",
      officeLabel: "Office", phoneLabel: "Phone", emailLabel: "Email",
      formName: "Name", formEmail: "Email", formMessage: "Your matter", formSend: "Send",
    },
    footer: {
      rightsSuffix: "Arifudin Susanto Partnership. All rights reserved.",
      links: ["Privacy policy", "Terms", "Legal disclaimer", "Cookie policy"],
      blurb: "Advocates, receivers and administrators in bankruptcy. Jakarta, since 2017.",
      practicesLabel: "Practices", allPractices: "All practices",
      firmLabel: "Firm", contactLabel: "Contact",
    },
  },
  id: {
    nav: {
      home: "Beranda", about: "Tentang", people: "Tim", practices: "Praktik",
      insights: "Wawasan", cases: "Perkara", recognition: "Penghargaan",
      careers: "Karier", contact: "Kontak", cta: "Diskusikan Perkara Anda",
    },
    themeToggle: { light: "Terang", dark: "Gelap" },
    hero: {
      kicker: "Jakarta · Berdiri 2017",
      title: "Arifudin Susanto Partnership",
      sub: "Advokat, kurator, dan pengurus kepailitan. Jakarta, sejak 2017.",
      cta1: "Diskusikan Perkara Anda",
      cta2: "Bidang Praktik Kami",
    },
    statsLabels: {
      founded: "Berdiri", people: "Orang", practiceAreas: "Bidang praktik",
      recognitions: "Penghargaan, 2022–2026",
    },
    practices: {
      kicker: "Praktik", title: "Dua belas bidang praktik", seeAll: "Semua bidang praktik",
      intro: "Sepuluh sebagaimana dipublikasikan firma, dengan kepailitan, PKPU, dan restrukturisasi dipisah menjadi bidang tersendiri.",
    },
    practiceGroupLabel: {
      flagship: "Kepailitan & restrukturisasi", dispute: "Sengketa", corporate: "Korporasi & regulasi",
    },
    about: {
      kicker: "Tentang Kami",
      title: "Praktik yang berpusat pada kepailitan",
      body1: "Berdiri 3 Mei 2017 oleh Muhamad Arifudin dan Herlin Susanto. Advokat, kurator, dan pengurus kepailitan.",
      body2: "ASP menangani sengketa komersial dengan konsentrasi utama pada kepailitan, likuidasi, dan PKPU. Para pengacara firma ini bertindak dalam tiga kapasitas yang biasanya terpisah di firma lain: sebagai kurator yang ditunjuk pengadilan, sebagai pengurus, dan sebagai kuasa hukum debitor atau kreditor.",
      body3: "Perkara yang ditangani melibatkan debitor perorangan, perusahaan swasta nasional, perusahaan terbuka, dan badan usaha milik negara.",
      more: "Selengkapnya tentang firma",
    },
    cta: {
      title: "Ada perkara yang perlu didiskusikan?",
      sub: "Hubungi kami langsung — melalui telepon, surel, atau kunjungan ke kantor kami di Jakarta.",
      button: "Diskusikan Perkara Anda",
    },
    values: {
      kicker: "Visi & Nilai", title: "Tiga komitmen, dinyatakan dengan jelas",
      items: [
        { title: "Visioner", body: "Mengantisipasi arah perkembangan hukum, agar strategi tetap relevan melampaui sidang yang sedang berjalan." },
        { title: "Integritas", body: "Nasihat yang jujur, proses yang transparan, dan kepentingan klien didahulukan di atas kepentingan firma." },
        { title: "Profesional", body: "Pengetahuan ahli yang diterapkan dengan presisi, dan disampaikan tepat waktu." },
      ],
    },
    sectors: {
      kicker: "Sektor", title: "Sektor yang pernah ditangani",
      intro: "Enam belas sektor yang diambil dari perkara yang telah dipublikasikan firma.",
    },
    people: {
      kicker: "Tim", title: "23 profesional",
      body: "Nama, gelar, dan jenjang diambil dari halaman tim resmi firma.",
      note: "Foto dan biodata masih dalam proses.",
      groupLabel: { partner: "Mitra", leader: "Pimpinan", associate: "Associate" },
    },
    insights: {
      kicker: "ASP Insights", title: "Pembaruan hukum dan analisis perkara",
      note: "Sembilan kategori, alur editorial dengan tinjauan hukum, dan belum ada artikel yang diterbitkan.",
      intro: "Sembilan kategori, alur editorial dengan tinjauan hukum, dan belum ada artikel yang diterbitkan.",
      emptyTitle: "Belum ada yang diterbitkan",
      emptyBody: "Artikel akan dimulai di sini, masing-masing dengan penulis bernama, peninjau, dan tanggal terbit.",
      workflow: [
        { kicker: "Alur kerja", title: "Draf → tinjauan hukum", body: "Ditulis oleh pengacara bernama, ditinjau oleh orang kedua sebelum dijadwalkan." },
        { kicker: "Atribusi", title: "Hanya penulis bernama", body: "Setiap artikel mencantumkan penulis yang bekerja di firma. Tanpa nama samaran." },
        { kicker: "Tanggal", title: "Terbit dan diperbarui", body: "Kedua tanggal ditampilkan. Pembaruan hukum bisa kedaluwarsa, dan menyembunyikannya tidak membantu siapa pun." },
      ],
    },
    cases: {
      kicker: "Data Perkara", title: "Perkara terpilih yang tercatat publik",
      intro: "Daftar perkara yang sudah bersifat publik dan disetujui firma untuk dipublikasikan.",
      emptyTitle: "Belum ada yang diterbitkan",
      emptyBody: "Daftar ini akan tetap kosong hingga firma memberikan perkara yang tercatat publik dan menyetujui masing-masing untuk dipublikasikan.",
    },
    recognition: {
      kicker: "Penghargaan", title: "10 penghargaan, 2022–2026",
      intro: "Setiap entri tertaut ke daftar resmi organisasi pemberi penghargaan.",
    },
    careers: {
      kicker: "Karier", title: "Bangun karier Anda bersama ASP",
      intro: "Praktik kepailitan menghargai orang yang mampu menjaga tenggat waktu berdasarkan undang-undang sekaligus negosiasi komersial dalam minggu yang sama.",
      openTitle: "Lowongan terbuka",
      openBody: "Belum ada lowongan yang dipublikasikan. Saat posisi dibuka, setiap posisi akan memiliki halaman tersendiri dengan tanggung jawab, persyaratan, dan cara melamar.",
      internTitle: "Program magang",
      internBody: "Deskripsi program, syarat, dan jadwal penerimaan belum dipublikasikan.",
      cta: "Kirim CV Anda",
    },
    contact: {
      kicker: "Kontak", title: "Kunjungi atau hubungi kami",
      officeLabel: "Kantor", phoneLabel: "Telepon", emailLabel: "Surel",
      formName: "Nama", formEmail: "Surel", formMessage: "Perkara Anda", formSend: "Kirim",
    },
    footer: {
      rightsSuffix: "Arifudin Susanto Partnership. Hak cipta dilindungi.",
      links: ["Kebijakan privasi", "Ketentuan", "Sangkalan hukum", "Kebijakan cookie"],
      blurb: "Advokat, kurator, dan pengurus kepailitan. Jakarta, sejak 2017.",
      practicesLabel: "Praktik", allPractices: "Semua bidang praktik",
      firmLabel: "Firma", contactLabel: "Kontak",
    },
  },
};

export const DEFAULT_LANG: Lang = "en";
export const LANG_STORAGE_KEY = "asp-lang";
