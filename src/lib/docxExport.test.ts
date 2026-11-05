import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cvCatalog } from "@/data/cvCatalog";
import { createOriginalCvContent } from "@/data/cvDocumentContent";

const docxMock = vi.hoisted(() => ({ documentOptions: null as unknown }));

vi.mock("docx", () => ({
  AlignmentType: { CENTER: "center", LEFT: "left" },
  BorderStyle: { SINGLE: "single" },
  Document: class {
    constructor(options: unknown) {
      docxMock.documentOptions = options;
    }
  },
  HeadingLevel: { HEADING_1: "heading-1", HEADING_2: "heading-2" },
  LevelFormat: { BULLET: "bullet" },
  Packer: { toBlob: vi.fn(async () => new Blob(["generated document"])) },
  Paragraph: class {
    constructor(public options: unknown) {}
  },
  TextRun: class {
    constructor(public value: unknown) {}
  },
}));

describe("CV Word export", () => {
  const anchor = {
    href: "",
    download: "",
    click: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(() => {
    docxMock.documentOptions = null;
    vi.stubGlobal("document", {
      createElement: vi.fn(() => anchor),
      body: { appendChild: vi.fn() },
    });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:cv-export");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("builds and downloads Word output from the edited CV content", async () => {
    const version = cvCatalog[0];
    const content = createOriginalCvContent(version);
    content.name = "Updated Name";
    content.summary = "User-entered summary";
    content.companies[0].roles[0].period = "January 2025 - Present";
    content.companies[0].roles[0].location = "Remote";
    content.coreSkills = ["User-entered skill"];
    content.highlights = ["User-entered achievement"];

    const { downloadCvDocx } = await import("@/lib/docxExport");
    await downloadCvDocx(version, "cv", content);

    const generatedDocument = JSON.stringify(docxMock.documentOptions);
    for (const editedValue of [
      "Updated Name",
      "User-entered summary",
      "January 2025 - Present",
      "Remote",
      "User-entered skill",
      "User-entered achievement",
    ]) {
      expect(generatedDocument).toContain(editedValue);
    }
    expect(anchor.download).toBe("Updated_Name_CV.docx");
    expect(anchor.click).toHaveBeenCalledOnce();
  });
});
