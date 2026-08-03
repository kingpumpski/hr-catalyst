export type DocumentSettings = {
  showContactDetails: boolean;
  showLocation: boolean;
  showAvailability: boolean;
  showReferences: boolean;
  includeLinkedIn: boolean;
  includeWhatsApp: boolean;
  resumeMode: boolean;
};

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  showContactDetails: true,
  showLocation: true,
  showAvailability: true,
  showReferences: true,
  includeLinkedIn: true,
  includeWhatsApp: true,
  resumeMode: false,
};

export const parseStoredDocumentSettings = (
  storedValue: string | null,
): DocumentSettings => {
  if (!storedValue) {
    return DEFAULT_DOCUMENT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<DocumentSettings>;
    return normalizeDocumentSettings(parsed);
  } catch {
    return DEFAULT_DOCUMENT_SETTINGS;
  }
};

export const normalizeDocumentSettings = (
  value?: Partial<DocumentSettings>,
): DocumentSettings => ({
  ...DEFAULT_DOCUMENT_SETTINGS,
  ...value,
});

export const saveDocumentSettings = (settings: DocumentSettings) => {
  localStorage.setItem("hr-catalyst-document-settings", JSON.stringify(settings));
};

export const loadDocumentSettings = (): DocumentSettings => {
  if (typeof window === "undefined") {
    return DEFAULT_DOCUMENT_SETTINGS;
  }

  return parseStoredDocumentSettings(localStorage.getItem("hr-catalyst-document-settings"));
};
