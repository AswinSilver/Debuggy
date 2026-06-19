import React from "react";
import { Menu, Download, FileDown, LogIn, LogOut, User } from "lucide-react";
import { download } from "../lib/utils";

export default function Header({ title, onMenuOpen, analysis, code, language, user, onSignUp, onLogin, onLogout }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#060608]/80 px-4 py-3.5 backdrop-blur-xl sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">

        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuOpen}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black leading-none text-white sm:text-2xl">{title}</h1>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">

          {/* Export buttons (only when analysis exists) */}
          {analysis && (
            <>
              <button
                className="btn-ghost text-xs"
                onClick={() =>
                  download("codexa-report.json", JSON.stringify(analysis, null, 2), "application/json")
                }
              >
                <Download size={14} />
                Export Report
              </button>
              {(analysis.fixed_code || analysis.secure_code || analysis.refactored_code) && (
                <button
                  className="btn-ghost text-xs"
                  onClick={() =>
                    download(
                      `fixed-code.${language?.toLowerCase() ?? "txt"}`,
                      analysis.fixed_code || analysis.secure_code || analysis.refactored_code
                    )
                  }
                >
                  <FileDown size={14} />
                  Export Fixed Code
                </button>
              )}
            </>
          )}

          {/* Auth area */}
          {user ? (
            /* Logged-in: avatar chip + logout */
            <div className="header-user-chip">
              <div className="header-user-avatar">
                {user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="header-user-name">{user.name}</span>
              <button
                onClick={onLogout}
                className="header-logout-btn"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            /* Logged-out: Sign In + Sign Up buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={onLogin}
                className="header-signin-btn"
              >
                <LogIn size={14} />
                Sign In
              </button>
              <button
                onClick={onSignUp}
                className="header-signup-btn"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
