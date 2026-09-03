import { socialLinks, type SocialLink } from "@/data/siteConfig";

const STORAGE_KEY = "hr-catalyst-social-links";

export type ConfiguredSocialLink = SocialLink & { enabled: boolean };

export const DEFAULT_SOCIAL_SETTINGS: ConfiguredSocialLink[] = socialLinks.map((link) => ({ ...link, enabled: Boolean(link.url.trim()) }));

const isSafeSocialUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const normalizeUrl = (value: string, fallback: string) => {
  const trimmed = value.trim();
  return trimmed && isSafeSocialUrl(trimmed) ? trimmed : fallback;
};

export const normalizeSocialSettings = (value: unknown): ConfiguredSocialLink[] => {
  if (!Array.isArray(value)) return DEFAULT_SOCIAL_SETTINGS;
  const byLabel = new Map(DEFAULT_SOCIAL_SETTINGS.map((link) => [link.label, link]));
  return DEFAULT_SOCIAL_SETTINGS.map((fallback) => {
    const stored = value.find((item) => item && typeof item === "object" && "label" in item && item.label === fallback.label) as Partial<ConfiguredSocialLink> | undefined;
    const url = normalizeUrl(typeof stored?.url === "string" ? stored.url : "", fallback.url);
    const handle = typeof stored?.handle === "string" ? stored.handle.trim() : fallback.handle;
    return { ...fallback, ...stored, label: byLabel.get(fallback.label)?.label ?? fallback.label, url, handle, enabled: typeof stored?.enabled === "boolean" && Boolean(url) ? stored.enabled : Boolean(url) };
  });
};

export const loadSocialSettings = (): ConfiguredSocialLink[] => {
  if (typeof window === "undefined") return DEFAULT_SOCIAL_SETTINGS;
  try {
    return normalizeSocialSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"));
  } catch {
    return DEFAULT_SOCIAL_SETTINGS;
  }
};

export const saveSocialSettings = (links: ConfiguredSocialLink[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
};
