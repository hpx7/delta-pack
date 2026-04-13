import { defineConfig } from "vitepress";
import { fileURLToPath, URL } from "node:url";
import { resolveIncludes } from "./plugins/resolve-includes";

// .vitepress/config.ts → website/ → repo root
const websiteRoot = fileURLToPath(new URL("../", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

export default defineConfig({
  title: "Delta-Pack",
  description:
    "Ultra-compact binary serialization with delta compression for real-time state synchronization. TypeScript, C#, Rust.",
  // Deployed at https://hpx7.github.io/delta-pack/ — project site, not user root.
  base: "/delta-pack/",
  cleanUrls: true,
  lastUpdated: true,
  // `/typescript/`, `/csharp/`, `/rust/` are the API-reference subpaths deployed
  // independently via TypeDoc/DocFX/rustdoc — VitePress can't verify them.
  ignoreDeadLinks: [/^\/(typescript|csharp|rust)(\/|$)/],
  // Some included READMEs use rustdoc-style code fences like ```rust,ignore.
  // Rewrite them to plain `rust` so Shiki highlights them instead of falling back to txt.
  markdown: {
    config: (md) => {
      const originalFence = md.renderer.rules.fence!;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info.startsWith("rust,")) token.info = "rust";
        return originalFence(tokens, idx, options, env, self);
      };
    },
  },
  vite: {
    server: {
      fs: {
        allow: [".."],
      },
    },
    plugins: [resolveIncludes({ websiteRoot, repoRoot })],
  },
  // Important: API reference subpaths (/typescript/, /csharp/, /rust/) are deployed
  // independently by their own workflows (TypeDoc, DocFX, rustdoc) and must not
  // collide with any VitePress-generated routes. Keep all site pages under other paths.
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/overview" },
      {
        text: "Languages",
        items: [
          { text: "TypeScript", link: "/guide/typescript" },
          { text: "C#", link: "/guide/csharp" },
          { text: "Rust", link: "/guide/rust" },
        ],
      },
      { text: "CLI", link: "/cli" },
      {
        text: "API Reference",
        items: [
          { text: "TypeScript", link: "/typescript/", target: "_self" },
          { text: "C#", link: "/csharp/", target: "_self" },
          { text: "Rust", link: "/rust/", target: "_self" },
        ],
      },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Overview", link: "/guide/overview" },
          { text: "Benchmarks", link: "/guide/benchmarks" },
          { text: "Data Types", link: "/guide/data-types" },
          { text: "API", link: "/guide/api" },
          { text: "Usage", link: "/guide/usage" },
        ],
      },
      {
        text: "Languages",
        items: [
          { text: "TypeScript", link: "/guide/typescript" },
          {
            text: "TypeScript API Reference",
            link: "/typescript/",
            target: "_self",
          },
          { text: "C#", link: "/guide/csharp" },
          {
            text: "C# API Reference",
            link: "/csharp/",
            target: "_self",
          },
          { text: "Rust", link: "/guide/rust" },
          {
            text: "Rust API Reference",
            link: "/rust/",
            target: "_self",
          },
        ],
      },
      {
        text: "Tools",
        items: [{ text: "CLI", link: "/cli" }],
      },
    ],
    search: {
      provider: "local",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/hpx7/delta-pack" }],
    editLink: {
      pattern: "https://github.com/hpx7/delta-pack/edit/main/website/:path",
    },
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © hpx7",
    },
  },
});
