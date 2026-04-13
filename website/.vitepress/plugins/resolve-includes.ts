import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/**
 * Resolves <!--@include: ./file.md[#region]--> directives ourselves (before
 * VitePress's built-in include plugin runs) so we can rewrite links in the
 * included content using the *source file's* location as context. Fixes two
 * classes of broken link:
 *
 *   1. Anchor links in the root README (e.g. `[Benchmarks](#benchmarks)`).
 *      Root README is sliced into separate guide pages, so those anchors
 *      need to point to `/guide/<anchor>`. Rewritten when a matching
 *      `guide/<anchor>.md` exists.
 *
 *   2. Path links (relative paths to repo files/dirs). They resolve correctly
 *      on GitHub but not on the site. Rewritten to a site URL if one exists,
 *      else to a GitHub `blob/main/…` or `tree/main/…` URL as a fallback.
 *
 * All mappings are filesystem-driven — add or rename a guide page and the
 * rewrite follows automatically. No hard-coded link tables.
 */

const GITHUB_REPO = "https://github.com/hpx7/delta-pack";
const GITHUB_BRANCH = "main";

export interface ResolveIncludesOptions {
  /** Website root — used to check for site pages (`guide/<name>.md`, etc.). */
  websiteRoot: string;
  /** Repo root — used to compute repo-relative paths for link rewriting. */
  repoRoot: string;
}

export function resolveIncludes(opts: ResolveIncludesOptions): Plugin {
  return {
    name: "delta-pack:resolve-includes",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith(".md")) return null;
      const filePath = id.split("?")[0];
      const out = expandIncludes(code, filePath, opts);
      return out === code ? null : { code: out, map: null };
    },
  };
}

// ----- @include expansion ---------------------------------------------------

// Matches VitePress's include syntax: <!--@include: ./path.md[{start,end}][#region]-->
const INCLUDE_RE =
  /<!--\s*@include:\s*([^\s#{]+)(?:\{(\d*),(\d*)\})?(?:#([^\s]+?))?\s*-->/g;

function expandIncludes(
  content: string,
  sourcePath: string,
  opts: ResolveIncludesOptions,
): string {
  const sourceDir = path.dirname(sourcePath);
  return content.replace(
    INCLUDE_RE,
    (raw, includePath: string, lineStart: string, lineEnd: string, region?: string) => {
      const absIncludePath = path.resolve(sourceDir, includePath);
      let included: string;
      try {
        included = fs.readFileSync(absIncludePath, "utf8");
      } catch {
        return raw; // leave unresolved; downstream will flag it
      }
      if (region) included = extractRegion(included, region);
      else if (lineStart || lineEnd) included = extractLineRange(included, lineStart, lineEnd);
      // Rewrite links using the included file's path as context, then recurse
      // in case the included content has its own @include directives.
      const rewritten = rewriteLinks(included, absIncludePath, opts);
      return expandIncludes(rewritten, absIncludePath, opts);
    },
  );
}

function extractRegion(content: string, region: string): string {
  const esc = region.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = new RegExp(`<!--\\s*#region\\s+${esc}\\s*-->`);
  const end = new RegExp(`<!--\\s*#endregion\\s+${esc}\\s*-->`);
  const startMatch = start.exec(content);
  if (!startMatch) return content;
  const after = content.slice(startMatch.index + startMatch[0].length);
  const endMatch = end.exec(after);
  return endMatch ? after.slice(0, endMatch.index) : after;
}

function extractLineRange(content: string, startStr: string, endStr: string): string {
  const lines = content.split("\n");
  const start = startStr ? Math.max(1, parseInt(startStr, 10)) : 1;
  const end = endStr ? Math.min(lines.length, parseInt(endStr, 10)) : lines.length;
  return lines.slice(start - 1, end).join("\n");
}

// ----- Link rewriting -------------------------------------------------------

// Matches markdown links. Deliberately simple: hrefs with whitespace or a
// literal `)` are rare enough to skip.
const LINK_RE = /(\[[^\]]*\])\(([^)\s]+)\)/g;

function rewriteLinks(
  content: string,
  sourcePath: string,
  opts: ResolveIncludesOptions,
): string {
  return content.replace(LINK_RE, (raw, label: string, href: string) => {
    const rewritten = rewriteHref(href, sourcePath, opts);
    return rewritten === href ? raw : `${label}(${rewritten})`;
  });
}

function rewriteHref(
  href: string,
  sourcePath: string,
  opts: ResolveIncludesOptions,
): string {
  // Absolute URL / protocol-relative / site-absolute — pass through.
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return href;
  if (href.startsWith("/")) return href;

  const [pathPart, hash] = splitHash(href);

  // Pure anchor (e.g. `#benchmarks`) — target is the source file itself.
  if (pathPart === "") {
    return resolveSameFileAnchor(hash, sourcePath, opts);
  }

  // Resolve path relative to source file's directory, then to repo root.
  const absTarget = path.resolve(path.dirname(sourcePath), pathPart);
  const repoRel = path.relative(opts.repoRoot, absTarget);
  // Escapes the repo — leave alone.
  if (repoRel.startsWith("..")) return href;

  // Prefer a site page if one exists.
  const siteUrl = siteUrlFor(repoRel, hash, opts);
  if (siteUrl) return siteUrl;

  // Fallback: GitHub URL.
  return githubUrlFor(repoRel, absTarget, hash, pathPart);
}

function splitHash(href: string): [string, string] {
  const idx = href.indexOf("#");
  return idx === -1 ? [href, ""] : [href.slice(0, idx), href.slice(idx + 1)];
}

/**
 * Anchor in the same file. Only the root README has been sliced across
 * multiple pages; its anchors may now map to separate guide pages. Other
 * included files are rendered as a single page, so same-file anchors work
 * natively and are left alone.
 */
function resolveSameFileAnchor(
  anchor: string,
  sourcePath: string,
  opts: ResolveIncludesOptions,
): string {
  const repoRelSource = path.relative(opts.repoRoot, sourcePath);
  if (repoRelSource !== "README.md") return `#${anchor}`;
  return rootReadmeAnchorTarget(anchor, opts);
}

/**
 * Root README anchors. If `website/guide/<anchor>.md` exists (a guide page
 * sliced from the same section), rewrite there; otherwise leave the anchor
 * in place — deeper headings (e.g. `#code-generation-recommended`) still
 * resolve in-page on whichever guide page includes the enclosing region.
 */
function rootReadmeAnchorTarget(anchor: string, opts: ResolveIncludesOptions): string {
  if (!anchor) return "/guide/overview";
  const guidePage = path.join(opts.websiteRoot, "guide", `${anchor}.md`);
  if (fs.existsSync(guidePage)) return `/guide/${anchor}`;
  return `#${anchor}`;
}

/**
 * Map a repo-relative path to a site URL if one exists. Returns null if
 * there's no site equivalent (caller falls back to GitHub).
 *
 * Patterns handled (all filesystem-driven):
 *   README.md              → /guide/overview (with anchor-aware slicing)
 *   <section>/README.md    → /guide/<section>   if guide/<section>.md exists
 *                          → /<section>         if website/<section>.md exists
 *   <section>/             → same as <section>/README.md (GitHub renders the
 *                            README when you navigate to a repo directory)
 */
function siteUrlFor(
  repoRel: string,
  hash: string,
  opts: ResolveIncludesOptions,
): string | null {
  const normalized = repoRel.replace(/\/$/, "");

  if (normalized === "README.md") {
    return rootReadmeAnchorTarget(hash, opts);
  }

  // <section>/README.md — explicit README file.
  const readmeMatch = /^([^/]+)\/README\.md$/.exec(normalized);
  if (readmeMatch) {
    return sectionSiteUrl(readmeMatch[1], hash, opts);
  }

  // Bare <section> directory (no nested path).
  if (!normalized.includes("/")) {
    return sectionSiteUrl(normalized, hash, opts);
  }

  return null;
}

function sectionSiteUrl(
  section: string,
  hash: string,
  opts: ResolveIncludesOptions,
): string | null {
  const frag = hash ? `#${hash}` : "";
  if (fs.existsSync(path.join(opts.websiteRoot, "guide", `${section}.md`))) {
    return `/guide/${section}${frag}`;
  }
  if (fs.existsSync(path.join(opts.websiteRoot, `${section}.md`))) {
    return `/${section}${frag}`;
  }
  return null;
}

function githubUrlFor(
  repoRel: string,
  absTarget: string,
  hash: string,
  originalPath: string,
): string {
  const isDir = safeIsDirectory(absTarget) || originalPath.endsWith("/");
  const kind = isDir ? "tree" : "blob";
  const trimmed = repoRel.replace(/\/$/, "");
  const url = `${GITHUB_REPO}/${kind}/${GITHUB_BRANCH}/${trimmed}`;
  return hash ? `${url}#${hash}` : url;
}

function safeIsDirectory(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}
