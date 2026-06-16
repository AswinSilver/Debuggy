import React from "react";
import { cx, severityClass } from "../lib/utils";

export default function SeverityBadge({ value }) {
  if (!value) return null;
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
        severityClass(value)
      )}
    >
      {value}
    </span>
  );
}
