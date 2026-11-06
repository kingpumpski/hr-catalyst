import { describe, expect, it } from "vitest";
import { formatRefereesForDocument } from "@/lib/refereeDocument";
import type { Referee } from "@/lib/refereeVault";

const referee: Referee = {
  id: "ref-1",
  name: "Jordan Example",
  role: "Finance Manager",
  organization: "Example Ltd",
  relationship: "Former supervisor",
  email: "jordan@example.com",
  phone: "+233 20 000 0000",
  notes: "Do not call before 10am",
};

describe("private referee document inclusion", () => {
  it("includes only selected contact fields and never includes private notes", () => {
    const text = formatRefereesForDocument([referee]);
    expect(text).toContain("Jordan Example");
    expect(text).toContain("jordan@example.com");
    expect(text).not.toContain(referee.relationship);
    expect(text).not.toContain(referee.notes);
  });

  it("omits empty contact entries", () => {
    expect(formatRefereesForDocument([{ ...referee, name: "", role: "", organization: "", email: "", phone: "" }])).toBe("");
  });
});
