import { describe, expect, it } from "vitest";
import { CV_FORMAT_PROFILES, DEFAULT_CV_MARKET, getCvFormatProfile } from "./cvFormatProfiles";

describe("CV format profiles", () => {
  it("uses Ghana as the default application market", () => {
    expect(DEFAULT_CV_MARKET).toBe("ghana");
    expect(getCvFormatProfile().paperSize).toBe("A4");
    expect(getCvFormatProfile().defaultIncludePhoto).toBe(false);
  });

  it("keeps strict ATS markets photo-free", () => {
    for (const market of ["us", "canada", "uk"] as const) {
      const profile = CV_FORMAT_PROFILES[market];
      expect(profile.photoPolicy).toBe("never");
      expect(profile.defaultIncludePhoto).toBe(false);
      expect(profile.atsLevel).toBe("strict");
    }
  });

  it("supports market-specific paper and photo conventions", () => {
    expect(CV_FORMAT_PROFILES.us.paperSize).toBe("Letter");
    expect(CV_FORMAT_PROFILES.germany.photoPolicy).toBe("common");
    expect(CV_FORMAT_PROFILES.japan.documentLabel).toBe("Rirekisho");
    expect(CV_FORMAT_PROFILES.europass.photoPolicy).toBe("optional");
  });
});
