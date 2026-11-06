import type { Referee } from "@/lib/refereeVault";

/** Format only the explicitly selected referees; private notes are never exported. */
export const formatRefereesForDocument = (referees: Referee[]): string =>
  referees.map((referee) => [
    referee.name.trim(),
    [referee.role.trim(), referee.organization.trim()].filter(Boolean).join(" — "),
    referee.email.trim(),
    referee.phone.trim(),
  ].filter(Boolean).join("\n")).filter(Boolean).join("\n\n");
