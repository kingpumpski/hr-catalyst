export type SocialLink = {
  label: string;
  handle?: string;
  url: string;
};

/**
 * Public profile configuration.
 * Replace the placeholder URLs as accounts are confirmed. Empty URLs are
 * intentionally ignored by the social-links UI.
 */
export const socialLinks: SocialLink[] = [
  { label: "LinkedIn", handle: "@kingsleynorku", url: "https://www.linkedin.com/in/kingsleynorku" },
  { label: "GitHub", handle: "@kingpumpski", url: "" },
  { label: "X", handle: "@yourhandle", url: "" },
  { label: "Facebook", handle: "@yourhandle", url: "" },
  { label: "Instagram", handle: "@yourhandle", url: "" },
  { label: "YouTube", handle: "@yourchannel", url: "" },
];

export type PresentationTheme = "executive" | "professional";

export const presentationThemes: Array<{
  id: PresentationTheme;
  name: string;
  description: string;
}> = [
  {
    id: "executive",
    name: "Executive",
    description: "Clean recruiter-first presentation with restrained motion and strong hierarchy.",
  },
  {
    id: "professional",
    name: "Professional Network",
    description: "A LinkedIn-inspired professional profile experience with denser profile sections and interactive cards.",
  },
];
