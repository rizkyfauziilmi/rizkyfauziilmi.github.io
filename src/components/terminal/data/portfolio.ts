export const PORTFOLIO = {
  version: "1.1.0",
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
  availableCommands: ["projects", "contact"],
};

export function buildAboutOutput() {
  return [
    ...PORTFOLIO.bio,
    "",
    `Get to know me better with this available commands: [${PORTFOLIO.availableCommands.join(", ")}]`,
  ].join("\n");
}
