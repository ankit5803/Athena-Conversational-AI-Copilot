import DOMPurify from "dompurify";
import { marked } from "marked";

// Utility to join class names safely
export const cls = (
  ...classes: (string | undefined | false | null)[]
): string => classes.filter(Boolean).join(" ");

// Utility to get "time ago" text
export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const sec = Math.max(1, Math.floor((now.getTime() - d.getTime()) / 1000));

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const ranges: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2629800, "week"],
    [31557600, "month"],
  ];

  let unit: Intl.RelativeTimeFormatUnit = "year";
  let value = -Math.floor(sec / 31557600);

  for (const [limit, u] of ranges) {
    if (sec < limit) {
      unit = u;
      const div =
        unit === "second"
          ? 1
          : unit === "minute"
          ? 60
          : unit === "hour"
          ? 3600
          : unit === "day"
          ? 86400
          : unit === "week"
          ? 604800
          : 2629800;
      value = -Math.floor(sec / div);
      break;
    }
  }

  return rtf.format(value, unit);
}

// Utility to create unique IDs with a prefix
export const makeId = (prefix = ""): string =>
  `${prefix}${Math.random().toString(36).slice(2, 10)}`;

export async function formatMessageFromAI(content: string) {
  if (!content || typeof content !== "string") return "";

  // Configure markdown renderer
  marked.setOptions({
    breaks: true, // Handle \n as <br>
    gfm: true, // Enable GitHub Flavored Markdown
  });

  // Convert Markdown to HTML
  const rawHtml: string = await marked.parse(content);

  // Sanitize the HTML to prevent XSS
  const safeHtml: string = DOMPurify.sanitize(rawHtml);

  return safeHtml;
}
