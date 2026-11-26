import { format, parseISO } from "date-fns";

export const CV = {
  pdfUrl: "/cv.pdf",
  filename: "rizky-fauzi-ilmi-cv.pdf",
  updatedAt: "2026-11-26",
};

export function formatCvUpdatedAt(iso: string) {
  return format(parseISO(iso), "d MMM yyyy");
}
