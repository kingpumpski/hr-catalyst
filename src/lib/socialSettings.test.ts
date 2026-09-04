import { describe, expect, it } from "vitest";
import { DEFAULT_SOCIAL_SETTINGS, normalizeSocialSettings } from "./socialSettings";

describe("normalizeSocialSettings", () => {
  it("preserves valid profile URLs and enabled state", () => {
    const result = normalizeSocialSettings([
      {
        ...DEFAULT_SOCIAL_SETTINGS[0],
        url: " https://example.com/profile ",
        enabled: true,
      },
    ]);

    expect(result[0].url).toBe("https://example.com/profile");
    expect(result[0].enabled).toBe(true);
  });

  it("rejects unsafe profile URLs and falls back to trusted defaults", () => {
    const result = normalizeSocialSettings([
      {
        ...DEFAULT_SOCIAL_SETTINGS[0],
        url: "javascript:alert(document.domain)",
        enabled: true,
      },
    ]);

    expect(result[0].url).toBe(DEFAULT_SOCIAL_SETTINGS[0].url);
    expect(result[0].enabled).toBe(true);
  });

  it("rejects malformed URLs and does not enable empty profiles", () => {
    const result = normalizeSocialSettings([
      {
        ...DEFAULT_SOCIAL_SETTINGS[0],
        url: "not a url",
        enabled: true,
      },
      {
        ...DEFAULT_SOCIAL_SETTINGS[2],
        url: "",
        enabled: true,
      },
    ]);

    expect(result[0].url).toBe(DEFAULT_SOCIAL_SETTINGS[0].url);
    expect(result[2].url).toBe("");
    expect(result[2].enabled).toBe(false);
  });

  it("returns safe defaults for malformed persisted data", () => {
    expect(normalizeSocialSettings(null)).toEqual(DEFAULT_SOCIAL_SETTINGS);
    expect(normalizeSocialSettings({ links: [] })).toEqual(DEFAULT_SOCIAL_SETTINGS);
  });
});
