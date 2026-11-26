import { GitHub } from "@/components/svgs/github";
import { Gmail } from "@/components/svgs/gmail";
import { Instagram } from "@/components/svgs/instagram";
import { LinkedIn } from "@/components/svgs/linkedin";
import type { ComponentType, SVGProps } from "react";

type ContactIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type ContactChannel = {
  id: string;
  label: string;
  icon: ContactIcon;
  value: string;
  // Channels without a URL hide the open button in the detail view.
  href?: string;
  copyText: string;
  description: string;
};

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: "email",
    label: "Email",
    icon: Gmail,
    value: "rizkyfauziilmi@gmail.com",
    href: "mailto:rizkyfauziilmi@gmail.com",
    copyText: "rizkyfauziilmi@gmail.com",
    description: "Best for collaboration, questions, and long-form messages.",
  },
  {
    id: "github",
    label: "GitHub",
    icon: GitHub,
    value: "github.com/rizkyfauziilmi",
    href: "https://github.com/rizkyfauziilmi",
    copyText: "https://github.com/rizkyfauziilmi",
    description: "Source code, experiments, and open-source work.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: LinkedIn,
    value: "linkedin.com/in/rizkyfauziilmi",
    href: "https://www.linkedin.com/in/rizkyfauziilmi/",
    copyText: "https://www.linkedin.com/in/rizkyfauziilmi/",
    description: "Professional experience and work history.",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    value: "instagram.com/rizkyfauziilmi",
    href: "https://www.instagram.com/rizkyfauziilmi",
    copyText: "https://www.instagram.com/rizkyfauziilmi",
    description: "Photos and day-to-day updates.",
  },
];
