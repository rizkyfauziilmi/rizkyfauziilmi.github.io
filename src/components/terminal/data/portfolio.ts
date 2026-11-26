export const PORTFOLIO = {
  avatarUrl: "/profile.png",
  name: "Rizky Fauzi Ilmi",
  role: "Web Developer",
  bio: [
    "I'm Rizky Fauzi Ilmi, a web developer building modern",
    "interfaces with React, Next.js, TypeScript, and Tailwind CSS.",
    "",
    "I use Git and work closely with teams to ship applications",
    "that are fast, maintainable, and built to scale.",
  ],
};

export function buildAboutOutput(suggestions: readonly string[]) {
  return [
    ...PORTFOLIO.bio,
    "",
    `Get to know me better with these commands: [${suggestions.join(", ")}]`,
  ].join("\n");
}
