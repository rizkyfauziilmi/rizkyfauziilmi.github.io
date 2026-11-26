import { GitHub } from "@/components/svgs/github";
import { Gmail } from "@/components/svgs/gmail";
import { Instagram } from "@/components/svgs/instagram";
import { LinkedIn } from "@/components/svgs/linkedin";
import { describe, expect, it } from "vitest";

import { CONTACT_CHANNELS } from "./contact";

describe("CONTACT_CHANNELS", () => {
  it("uses the local SVG icons in the expected order", () => {
    expect(CONTACT_CHANNELS.map((channel) => channel.id)).toEqual([
      "email",
      "github",
      "linkedin",
      "instagram",
    ]);
    expect(CONTACT_CHANNELS.map((channel) => channel.icon)).toEqual([
      Gmail,
      GitHub,
      LinkedIn,
      Instagram,
    ]);
  });

  it("links every channel to its real profile", () => {
    expect(CONTACT_CHANNELS.map((channel) => channel.href)).toEqual([
      "mailto:rizkyfauziilmi@gmail.com",
      "https://github.com/rizkyfauziilmi",
      "https://www.linkedin.com/in/rizkyfauziilmi/",
      "https://www.instagram.com/rizkyfauziilmi",
    ]);
    expect(CONTACT_CHANNELS.map((channel) => channel.copyText)).toEqual([
      "rizkyfauziilmi@gmail.com",
      "https://github.com/rizkyfauziilmi",
      "https://www.linkedin.com/in/rizkyfauziilmi/",
      "https://www.instagram.com/rizkyfauziilmi",
    ]);
  });
});
