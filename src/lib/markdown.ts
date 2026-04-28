/**
 * Tiny safe Markdown → HTML for blog posts and market reports.
 *
 * Escapes input first, then applies a small subset:
 *   ## H2, ### H3, #### H4
 *   **bold**, *italic*, `code`, [text](url) — http(s)/mailto only
 *   bullet lists (- ...), blank-line paragraphs
 *
 * Returns a string suitable for `dangerouslySetInnerHTML`.
 */

const SAFE_URL = /^(https?:|mailto:)/i;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(s: string): string {
  // Inline code first so its contents aren't re-touched.
  s = s.replace(/`([^`]+)`/g, (_, code: string) =>
    `<code class="px-1 py-0.5 rounded bg-secondary text-brass-400 text-[0.9em]">${code}</code>`,
  );
  // Bold (greedy) before italic so ** doesn't get eaten as two *
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  // Links — only http(s) / mailto are allowed
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text: string, href: string) => {
    if (!SAFE_URL.test(href)) return text;
    return `<a class="text-brass-400 hover:underline" href="${href}" target="_blank" rel="noreferrer">${text}</a>`;
  });
  return s;
}

export function mdToHtml(md: string | null | undefined): string {
  if (!md) return "";
  const escaped = escapeHtml(md);
  const lines = escaped.split(/\r?\n/);
  const out: string[] = [];
  let para: string[] = [];
  let listOpen = false;

  function flushPara() {
    if (para.length) {
      out.push(`<p class="my-3 leading-relaxed">${inline(para.join(" "))}</p>`);
      para = [];
    }
  }
  function flushList() {
    if (listOpen) {
      out.push(`</ul>`);
      listOpen = false;
    }
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }

    let m;
    if ((m = line.match(/^####\s+(.*)$/))) {
      flushPara(); flushList();
      out.push(`<h4 class="font-display text-lg mt-6 mb-2">${inline(m[1])}</h4>`);
      continue;
    }
    if ((m = line.match(/^###\s+(.*)$/))) {
      flushPara(); flushList();
      out.push(`<h3 class="font-display text-xl mt-6 mb-2">${inline(m[1])}</h3>`);
      continue;
    }
    if ((m = line.match(/^##\s+(.*)$/))) {
      flushPara(); flushList();
      out.push(`<h2 class="font-display text-2xl mt-8 mb-3">${inline(m[1])}</h2>`);
      continue;
    }
    if ((m = line.match(/^#\s+(.*)$/))) {
      flushPara(); flushList();
      out.push(`<h1 class="font-display text-3xl mt-8 mb-3">${inline(m[1])}</h1>`);
      continue;
    }
    if ((m = line.match(/^[-*]\s+(.*)$/))) {
      flushPara();
      if (!listOpen) { out.push(`<ul class="list-disc pl-6 my-3 space-y-1">`); listOpen = true; }
      out.push(`<li>${inline(m[1])}</li>`);
      continue;
    }
    para.push(line);
  }
  flushPara();
  flushList();

  return out.join("\n");
}
