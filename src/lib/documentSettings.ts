import { CV_FORMAT_PROFILES, type CvMarket, DEFAULT_CV_MARKET } from "@/data/cvFormatProfiles";

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

const isSafePhotoUrl = (value: string) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
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
  const targetMarket = Object.prototype.hasOwnProperty.call(CV_FORMAT_PROFILES, next.targetMarket)
    ? next.targetMarket
    : DEFAULT_CV_MARKET;
  const photoUrl = typeof next.photoUrl === "string" && isSafePhotoUrl(next.photoUrl.trim())
    ? next.photoUrl.trim()
    : "";

  return {
    ...next,
    targetMarket,
    includePhoto: Boolean(next.includePhoto) && Boolean(photoUrl),
    photoUrl,
  };
};

export const saveDocumentSettings = (settings: DocumentSettings) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("hr-catalyst-document-settings", JSON.stringify(normalizeDocumentSettings(settings)));
  } catch {
    // The selected settings remain active for the current session if storage is unavailable.
  }
};

export const loadDocumentSettings = (): DocumentSettings => {
  if (typeof window === "undefined") return DEFAULT_DOCUMENT_SETTINGS;
  try {
    return parseStoredDocumentSettings(localStorage.getItem("hr-catalyst-document-settings"));
  } catch {
    return DEFAULT_DOCUMENT_SETTINGS;
  }
};
