import { describe, expect, it } from "vitest";

import { profile } from "@/data/profile";
import { getEmailHref, getLinkedInHref, getPhoneHref, getWhatsAppHref } from "@/lib/contactLinks";

describe("contact link contracts", () => {
  it("builds email links from the canonical profile address", () => {
    expect(getEmailHref()).toBe(`mailto:${profile.email}`);
    expect(getEmailHref("Meeting request")).toBe(
      `mailto:${profile.email}?subject=Meeting%20request`,
    );
  });

  it("normalizes phone display values into tel links", () => {
    expect(getPhoneHref(profile.phone)).toBe("tel:+233542069136");
    expect(getPhoneHref("+233 208 791 163")).toBe("tel:+233208791163");
  });

  it("uses canonical professional profile destinations", () => {
    expect(getWhatsAppHref()).toBe(profile.whatsapp);
    expect(getLinkedInHref()).toBe("https://www.linkedin.com/in/kingsleynorku");
  });
});
