import React from "react";
import { classNames } from "../utils/helpers";

export default function Severity({ value }) {
  const tone =
    value === "Critical"
      ? "bg-red-600 text-white"
      : value === "High"
      ? "bg-debug-red text-white"
      : value === "Medium"
      ? "bg-yellow-500 text-black"
      : "bg-zinc-700 text-zinc-100";

  return (
    <span className={classNames("rounded-full px-2.5 py-1 text-xs font-black", tone)}>
      {value}
    </span>
  );
}
