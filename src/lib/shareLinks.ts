export type ShareDocumentType = "cv" | "resume" | "letter";

export interface ShareRouteMatch {
  documentType: ShareDocumentType;
  slug: string;
}

export const isShareDocumentType = (value?: string): value is ShareDocumentType => {
  const normalized = value?.toLowerCase();
  return normalized === "cv" || normalized === "resume" || normalized === "letter";
};

export const normalizeShareDocumentType = (value?: string): ShareDocumentType => {
  const normalized = value?.toLowerCase();
  if (normalized === "resume") return "resume";
  if (normalized === "letter") return "letter";
  return "cv";
};

export const isShareRoute = (pathname: string) => pathname.startsWith("/share/");

export const parseShareRoute = (pathname: string): ShareRouteMatch | undefined => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 3 || segments[0].toLowerCase() !== "share") return undefined;

  const documentType = segments[1].toLowerCase();
  const slug = segments[2];

  if (!isShareDocumentType(documentType) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
    return undefined;
  }

  return { documentType, slug };
};

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
