export type ShareDocumentType = "cv" | "resume" | "letter";

export const normalizeShareDocumentType = (value?: string): ShareDocumentType => {
  const normalized = value?.toLowerCase();
  if (normalized === "resume") return "resume";
  if (normalized === "letter") return "letter";
  return "cv";
};

export const isShareRoute = (pathname: string) => pathname.startsWith("/share/");

export const getShareLink = (slug: string, documentType: ShareDocumentType) =>
  `/share/${documentType}/${slug}`;

export const getSharePageTitle = (documentType: ShareDocumentType) => {
  switch (documentType) {
    case "resume":
      return "Recruiter-ready resume";
    case "letter":
      return "Recruiter-ready cover letter";
    default:
      return "Recruiter-ready CV";
  }
};
