/** @type {import('next').NextConfig} */
const nextConfig = {
  // The English site stays at the existing indexed root; /id/* is future
  // work once Indonesian copy actually exists (see docs/03-frontend.md §4
  // and CLAUDE.md — bilingual). Do not add an empty /id tree ahead of it.
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
