// Generated from data/redirects.csv by config/gen-redirects.py — do not hand-edit.

const redirects = [
  {
    "source": "/about-us",
    "destination": "/about/firm/",
    "permanent": true
  },
  {
    "source": "/our-people",
    "destination": "/people/",
    "permanent": true
  },
  {
    "source": "/solutions",
    "destination": "/practices/",
    "permanent": true
  },
  {
    "source": "/news",
    "destination": "/insights/",
    "permanent": true
  },
  {
    "source": "/contact-us",
    "destination": "/contact/",
    "permanent": true
  },
  {
    "source": "/id/about-us",
    "destination": "/id/tentang/profil/",
    "permanent": true
  },
  {
    "source": "/id/our-people",
    "destination": "/id/tim/",
    "permanent": true
  },
  {
    "source": "/id/solutions",
    "destination": "/id/layanan/",
    "permanent": true
  },
  {
    "source": "/id/news",
    "destination": "/id/wawasan/",
    "permanent": true
  },
  {
    "source": "/id/contact-us",
    "destination": "/id/kontak/",
    "permanent": true
  },
  {
    "source": "/id/careers",
    "destination": "/careers/",
    "permanent": true
  },
  {
    "source": "/en/*",
    "destination": "/*",
    "permanent": true
  }
];

const gone = [
  "/hello-world/",
  "/be-my-guest/",
  "/nulla-magna/",
  "/category/fashion/",
  "/category/music/",
  "/category/uncategorized/",
  "/author/asplawyer/",
  "/id/hello-world/",
  "/id/be-my-guest/",
  "/id/nulla-magna/",
  "/id/category/fashion/",
  "/id/category/music/",
  "/id/category/uncategorized/",
  "/id/author/asplawyer/"
];

const blocked = [
  "/wp-admin/*",
  "/wp-login.php",
  "/xmlrpc.php",
  "/wp-json/*"
];

module.exports = { redirects, gone, blocked };
