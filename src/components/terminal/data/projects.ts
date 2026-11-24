import portfolioScreenshot from "@/assets/screenshot.png";

export type Project = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  year: number;
  image: string;
  url?: string;
};

export const PROJECTS: Project[] = [
  {
    id: "portfolio-terminal",
    title: "Portfolio Terminal",
    description:
      "An interactive, terminal-style portfolio where the whole site behaves " +
      "like a shell: commands render text or React components, themes switch " +
      "at runtime, projects opens a keyboard-driven project browser, " +
      "neofetch/fastfetch prints system info, and reboot/shutdown simulate a " +
      "machine lifecycle. Also includes command history, per-command help, " +
      "hidden easter eggs, and CI-driven GitHub Pages deployment.",
    tech: [
      "React 19",
      "TypeScript",
      "Vite 8",
      "Tailwind CSS 4",
      "shadcn/Base UI",
      "Vitest",
    ],
    year: 2026,
    image: portfolioScreenshot,
    url: "https://github.com/rizkyfauziilmi/rizkyfauziilmi.github.io",
  },
  {
    id: "gambling-blocker",
    title: "Gambling Blocker",
    description:
      "A real-time gambling-site blocker combining a WXT browser extension " +
      "with a FastAPI backend. It classifies URLs with a fused model: TF-IDF " +
      "+ Keras on cleaned URLs, plus an MLP on 69 screenshot features (patch, " +
      "Sobel edge, color variance, colorfulness, brightness) captured by " +
      "Playwright, combined at alpha=0.5 with a 0.48 threshold. Includes " +
      "blacklist/whitelist, Redis cache and rate limiting, MinIO screenshots, " +
      "false-positive reports, and an accountability partner guarded by " +
      "PBKDF2 password, heartbeats, tamper alerts, and email notifications. A " +
      "shadcn dashboard manages reports, lists, cache, settings, and logs.",
    tech: [
      "Python 3.13",
      "FastAPI",
      "TensorFlow",
      "Redis",
      "MinIO",
      "Playwright",
      "WXT + React 19",
    ],
    year: 2026,
    image:
      "https://github.com/rizkyfauziilmi/gambling-blocker/raw/master/docs/screenshot.png",
    url: "https://github.com/rizkyfauziilmi/gambling-blocker",
  },
  {
    id: "simba",
    title: "SIMBA",
    description:
      "A web-based management information system with role-specific " +
      "dashboards for admin, teacher, and student. Admin handles account " +
      "management, finance, and master data; teachers manage teaching " +
      "schedules and their classes; students view schedules and class " +
      "history. Shared pages cover guides, settings, and profiles. " +
      "Authentication uses Better Auth; data flows through tRPC with " +
      "Prisma/PostgreSQL, and the app is containerized with Docker and " +
      "deployed behind Nginx.",
    tech: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "tRPC",
      "Better Auth",
      "Docker",
    ],
    year: 2025,
    image:
      "https://github.com/rizkyfauziilmi/simba/raw/main/docs/screenshot-1.png",
    url: "https://github.com/rizkyfauziilmi/simba",
  },
  {
    id: "quran-api",
    title: "Quran API",
    description:
      "A read-only REST API for Quranic data modeled as Juz -> Surah -> Ayah " +
      "-> Translation. It exposes paginated listings and detail endpoints " +
      "plus filtering by Meccan/Medinan classification, juz, and translation " +
      "language, along with ayah search and random-ayah endpoints. Every " +
      "response uses a consistent status/message/data envelope, and the " +
      "project includes Prisma migrations, a CLI seeder, Jest tests, and " +
      "Docker Compose.",
    tech: ["NestJS", "TypeScript", "Prisma", "PostgreSQL", "Docker"],
    year: 2025,
    image: "https://opengraph.githubassets.com/1/rizkyfauziilmi/quran-api",
    url: "https://github.com/rizkyfauziilmi/quran-api",
  },
  {
    id: "project-simulasi-gerak",
    title: "Simulasi Gerak Jatuh Bebas",
    description:
      "An interactive HTML5 Canvas simulation of free-fall motion. Users can " +
      "pick gravity presets for planets (Bumi through Matahari) or set custom " +
      "gravity, size, and color, then watch position and velocity update live " +
      "using Y(t) = Y₀ - ½gt² + V₀t and Vy(t) = -gt. It also shows estimated " +
      "fall time, unit toggles, auto-reset, light/dark theme, an annotated " +
      "flowchart of the render loop, GitHub stats, and a downloadable paper.",
    tech: ["JavaScript", "HTML5 Canvas", "CSS", "GitHub API"],
    year: 2023,
    image:
      "https://raw.githubusercontent.com/rizkyfauziilmi/project-simulasi-gerak/master/public/Screenshot%20from%202023-05-21%2017-46-16.png",
    url: "https://github.com/rizkyfauziilmi/project-simulasi-gerak",
  },
  {
    id: "anywall",
    title: "AnyWall",
    description:
      "A cross-platform Tauri desktop app for searching and applying " +
      "wallpapers without login. The React/shadcn client provides wallpaper " +
      "management, previews, and a light/dark toggle, while a Node/Express + " +
      "Cheerio server scrapes wallpaper sources. Desktop integration covers " +
      "Windows and Linux (GNOME, Cinnamon, KDE), with macOS still in progress. " +
      "The README explicitly limits it to educational use.",
    tech: [
      "Tauri",
      "React",
      "Tailwind CSS",
      "shadcn/ui",
      "Node.js",
      "Express",
      "Cheerio",
    ],
    year: 2023,
    image:
      "https://raw.githubusercontent.com/rizkyfauziilmi/anywall/main/dark-home.png",
    url: "https://github.com/rizkyfauziilmi/anywall",
  },
];
