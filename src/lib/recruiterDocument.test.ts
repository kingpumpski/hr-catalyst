import { describe, expect, it } from "vitest";

import { cvCatalog } from "@/data/cvCatalog";
import { profile } from "@/data/profile";
import {
  getRecruiterDocumentFilename,
  getRecruiterDocumentTitle,
  getRecruiterSafeSummary,
} from "@/lib/recruiterDocument";

describe("recruiter document export boundary", () => {
  it("uses generic recruiter-facing document titles", () => {
    expect(getRecruiterDocumentTitle("cv")).toBe("Kingsley Junior Norku - CV");
    expect(getRecruiterDocumentTitle("resume")).toBe("Kingsley Junior Norku - Resume");
    expect(getRecruiterDocumentTitle("cv", "Edited Name")).toBe("Edited Name - CV");
  });

  it("uses a safe name-based recruiter filename without exposing the target role", () => {
    expect(getRecruiterDocumentFilename("Éva O'Neil / Norku", "cv")).toBe("Eva_O_Neil_Norku_CV");
    expect(getRecruiterDocumentFilename("Edited Name", "resume")).toBe("Edited_Name_Resume");
    expect(getRecruiterDocumentFilename("!!!", "cv")).toBe("Professional_CV");
  });

  it("removes internal target titles from every catalogue summary", () => {
    for (const version of cvCatalog) {
      const summary = getRecruiterSafeSummary(version).toLowerCase();
      expect(summary).not.toContain(version.title.toLowerCase());
      for (const targetRole of version.targetRoles.split(" • ")) {
        expect(summary).not.toContain(targetRole.toLowerCase());
      }
    }
  });

  it("never uses the application-track title as the exported document identity", () => {
    for (const version of cvCatalog) {
      expect(getRecruiterDocumentTitle("cv").toLowerCase()).not.toContain(version.title.toLowerCase());
      expect(getRecruiterDocumentTitle("resume").toLowerCase()).not.toContain(version.title.toLowerCase());
    }
  });

  it("keeps language proficiency standardized for ATS output", () => {
    expect(profile.languages).toEqual([
      { name: "English", proficiency: "Fluent" },
      { name: "Fante", proficiency: "Conversational" },
      { name: "Twi", proficiency: "Conversational" },
    ]);
    expect(profile.languages.every(({ proficiency }) => ["Fluent", "Conversational"].includes(proficiency))).toBe(true);
  });
});
