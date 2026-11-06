import type { Referee } from "@/lib/refereeVault";

export const formatRefereesForDocument = (referees: Referee[]) =>
  referees.map((referee) =>
    [referee.name, referee.role, referee.organization, referee.email, referee.phone]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" | "),
  ).filter(Boolean).join("; ");
