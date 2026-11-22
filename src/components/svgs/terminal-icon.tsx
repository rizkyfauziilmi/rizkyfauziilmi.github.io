import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type TerminalIconProps = ComponentProps<"svg">;

export function TerminalIcon({ className, style, ...props }: TerminalIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 1024 1024"
      fill="#000000"
      className={cn("icon", className)}
      style={{
        verticalAlign: "middle",
        fill: "currentColor",
        overflow: "hidden",
        ...style,
      }}
      {...props}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M48 128m64 0l800 0q64 0 64 64l0 640q0 64-64 64l-800 0q-64 0-64-64l0-640q0-64 64-64Z"
          fill="#17243B"
        ></path>
        <path
          d="M112 128h800q64 0 64 64v96H48V192q0-64 64-64z"
          fill="#2563EB"
        ></path>
        <path
          d="M204 472q-16-16 0-34t36 0l128 104q20 18 0 36l-128 104q-20 18-36 0t0-34l106-88z"
          fill="#4ADE80"
        ></path>
        <path
          d="M448 640m32 0l160 0q32 0 32 32l0 0q0 32-32 32l-160 0q-32 0-32-32l0 0q0-32 32-32Z"
          fill="#FBBF24"
        ></path>
      </g>
    </svg>
  );
}

export default TerminalIcon;
