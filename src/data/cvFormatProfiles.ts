export type CvMarket =
  | "ghana"
  | "us"
  | "canada"
  | "uk"
  | "australia"
  | "new-zealand"
  | "germany"
  | "france"
  | "europass"
  | "india"
  | "japan"
  | "singapore"
  | "global";

export type PhotoPolicy = "never" | "optional" | "common" | "required";
export type AtsLevel = "strict" | "standard" | "market";

export type CvFormatProfile = {
  market: CvMarket;
  label: string;
  documentLabel: "CV" | "Resume" | "Lebenslauf" | "Rirekisho";
  paperSize: "A4" | "Letter";
  photoPolicy: PhotoPolicy;
  defaultIncludePhoto: boolean;
  atsLevel: AtsLevel;
  dateStyle: "numeric" | "month-year";
  notes: string;
};

export const CV_FORMAT_PROFILES: Record<CvMarket, CvFormatProfile> = {
  ghana: { market: "ghana", label: "Ghana", documentLabel: "CV", paperSize: "A4", photoPolicy: "optional", defaultIncludePhoto: false, atsLevel: "standard", dateStyle: "month-year", notes: "ATS-first Ghana CV. Photo remains optional and off by default." },
  us: { market: "us", label: "United States", documentLabel: "Resume", paperSize: "Letter", photoPolicy: "never", defaultIncludePhoto: false, atsLevel: "strict", dateStyle: "month-year", notes: "ATS-first US resume. Do not include a photograph or unnecessary personal data." },
  canada: { market: "canada", label: "Canada", documentLabel: "Resume", paperSize: "Letter", photoPolicy: "never", defaultIncludePhoto: false, atsLevel: "strict", dateStyle: "month-year", notes: "ATS-first Canadian resume with professional, qualification-focused structure." },
  uk: { market: "uk", label: "United Kingdom", documentLabel: "CV", paperSize: "A4", photoPolicy: "never", defaultIncludePhoto: false, atsLevel: "strict", dateStyle: "month-year", notes: "Conventional UK CV. Avoid age, date of birth, marital status and photographs." },
  australia: { market: "australia", label: "Australia", documentLabel: "CV", paperSize: "A4", photoPolicy: "never", defaultIncludePhoto: false, atsLevel: "standard", dateStyle: "month-year", notes: "A4 professional CV with concise, achievement-focused sections." },
  "new-zealand": { market: "new-zealand", label: "New Zealand", documentLabel: "CV", paperSize: "A4", photoPolicy: "never", defaultIncludePhoto: false, atsLevel: "standard", dateStyle: "month-year", notes: "A4 professional CV; keep the profile focused on relevant skills and experience." },
  germany: { market: "germany", label: "Germany", documentLabel: "Lebenslauf", paperSize: "A4", photoPolicy: "common", defaultIncludePhoto: false, atsLevel: "market", dateStyle: "month-year", notes: "German-style CV profile. Professional photo is supported but not automatically inserted." },
  france: { market: "france", label: "France", documentLabel: "CV", paperSize: "A4", photoPolicy: "optional", defaultIncludePhoto: false, atsLevel: "market", dateStyle: "month-year", notes: "French-market CV profile with optional professional photograph." },
  europass: { market: "europass", label: "Europass / EU", documentLabel: "CV", paperSize: "A4", photoPolicy: "optional", defaultIncludePhoto: false, atsLevel: "standard", dateStyle: "month-year", notes: "European profile-first format. Photograph can be enabled when appropriate." },
  india: { market: "india", label: "India", documentLabel: "CV", paperSize: "A4", photoPolicy: "optional", defaultIncludePhoto: false, atsLevel: "standard", dateStyle: "month-year", notes: "India-market CV with optional photograph; keep ATS compatibility as the default." },
  japan: { market: "japan", label: "Japan", documentLabel: "Rirekisho", paperSize: "A4", photoPolicy: "required", defaultIncludePhoto: false, atsLevel: "market", dateStyle: "numeric", notes: "Japan supports a dedicated Rirekisho renderer in a later phase; this profile only establishes the market policy." },
  singapore: { market: "singapore", label: "Singapore", documentLabel: "CV", paperSize: "A4", photoPolicy: "optional", defaultIncludePhoto: false, atsLevel: "standard", dateStyle: "month-year", notes: "Singapore CV profile with optional recent photograph and keyword-focused summary." },
  global: { market: "global", label: "Global ATS", documentLabel: "CV", paperSize: "A4", photoPolicy: "never", defaultIncludePhoto: false, atsLevel: "strict", dateStyle: "month-year", notes: "Portable ATS-first format for international applications." },
};

export const DEFAULT_CV_MARKET: CvMarket = "ghana";

export const getCvFormatProfile = (market?: CvMarket): CvFormatProfile =>
  CV_FORMAT_PROFILES[market ?? DEFAULT_CV_MARKET] ?? CV_FORMAT_PROFILES[DEFAULT_CV_MARKET];
