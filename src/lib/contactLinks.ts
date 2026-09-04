import { profile } from "@/data/profile";

export const getEmailHref = (subject?: string) => {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${profile.email}${query}`;
};

export const getPhoneHref = (phone: string) => {
  const normalized = phone.replace(/[^+\d]/g, "");
  return `tel:${normalized}`;
};

export const getWhatsAppHref = () => profile.whatsapp;
export const getLinkedInHref = () => profile.linkedin.replace(/^http:/, "https:");
