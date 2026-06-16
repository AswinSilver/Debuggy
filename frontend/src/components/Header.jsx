import React from "react";
import { Menu, Download, FileDown } from "lucide-react";
import { downloadFile } from "../utils/helpers";

export default function Header({
  title,
  onMenuOpen,
  analysis,
  code,
  language = "JavaScript",
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-debug-black/75 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg border border-white/10 p-2 lg:hidden"
            onClick={onMenuOpen}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-debug-red">
              Developer dashboard
            </p>
            <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis && (
            <button
              className="button-secondary"
              onClick={() =>
                downloadFile(
                  "debuggy-analysis-report.json",
                  JSON.stringify(analysis, null, 2),
                  "application/json"
                )
              }
            >
              <Download size={16} /> Download Analysis Report
            </button>
          )}
          {code && (
            <button
              className="button-secondary"
              onClick={() =>
                downloadFile(
                  `debuggy-fixed-code.${language
                    .toLowerCase()
                    .replace("#", "sharp")}.txt`,
                  (analysis && (analysis.fixed_code || analysis.secure_code)) || code
                )
              }
            >
              <FileDown size={16} /> Export Fixed Code
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
