import React from "react";

export default function ResultCard({ title, badge, icon: Icon, action, children }) {
  return (
    <article className="glass-panel animate-rise p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-debug-red" size={22} />}
          <h3 className="text-xl font-black">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="rounded-full border border-debug-red/30 bg-debug-red/10 px-3 py-1 text-xs font-bold text-red-200">
              {badge}
            </span>
          )}
          {action}
        </div>
      </div>
      {children}
    </article>
  );
}
