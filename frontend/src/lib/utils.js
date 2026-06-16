export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function severityClass(sev) {
  switch (sev?.toLowerCase()) {
    case "critical": return "severity-critical";
    case "high":     return "severity-high";
    case "medium":   return "severity-medium";
    case "low":      return "severity-low";
    default:         return "severity-info";
  }
}

export function download(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text ?? ""); return true; }
  catch { return false; }
}
