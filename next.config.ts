import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "export",
  trailingSlash: true, // emits out/journal/index.html instead of out/journal.html
};

export default nextConfig;
