import type { CvMarket } from "@/data/cvFormatProfiles";
import { DEFAULT_CV_MARKET } from "@/data/cvFormatProfiles";

export type DocumentSettings = {
  showContactDetails: boolean;
  showLocation: boolean;
  showAvailability: boolean;
  showReferences: boolean;
  includeLinkedIn: boolean;
  includeWhatsApp: boolean;
  resumeMode: boolean;
  targetMarket: CvMarket;
  includePhoto: boolean;
  photoUrl: string;
};

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  showContactDetails: true,
  showLocation: true,
  showAvailability: true,
  showReferences: true,
  includeLinkedIn: true,
  includeWhatsApp: true,
  resumeMode: false,
  targetMarket: DEFAULT_CV_MARKET,
  includePhoto: false,
  photoUrl: "",
};

export const parseStoredDocumentSettings = (
  storedValue: string | null,
): DocumentSettings => {
  if (!storedValue) return DEFAULT_DOCUMENT_SETTINGS;

  try {
    const parsed = JSON.parse(storedValue) as Partial<DocumentSettings>;
    return normalizeDocumentSettings(parsed);
  } catch {
    return DEFAULT_DOCUMENT_SETTINGS;
  }
};

export const normalizeDocumentSettings = (
  value?: Partial<DocumentSettings>,
): DocumentSettings => {
  const next = { ...DEFAULT_DOCUMENT_SETTINGS, ...value };
  return {
    ...next,
    targetMarket: next.targetMarket ?? DEFAULT_CV_MARKET,
    includePhoto: Boolean(next.includePhoto),
    photoUrl: typeof next.photoUrl === "string" ? next.photoUrl.trim() : "",
  };
};

export const saveDocumentSettings = (settings: DocumentSettings) => {
  localStorage.setItem("hr-catalyst-document-settings", JSON.stringify(settings));
};

export const loadDocumentSettings = (): DocumentSettings => {
  if (typeof window === "undefined") return DEFAULT_DOCUMENT_SETTINGS;
  return parseStoredDocumentSettings(localStorage.getItem("hr-catalyst-document-settings"));
};
