export type PollShape = { status: "OPEN" | "CLOSED"; multiple: boolean; optionIds: string[] };

export function resolvePollSelection(poll: PollShape, existing: string[], chosen: string[]): string[] | { error: string } {
  if (poll.status !== "OPEN") return { error: "This poll is closed." };
  const valid = new Set(poll.optionIds);
  if (!chosen.every((id) => valid.has(id))) return { error: "Invalid option selected." };
  if (!chosen.length) return { error: "Choose at least one option." };
  if (!poll.multiple && chosen.length > 1) return { error: "Please choose one option." };
  if (poll.multiple) return Array.from(new Set([...existing.filter((id) => valid.has(id)), ...chosen]));
  return [chosen[0]!];
}

export function toggleVote(myVotes: string[], id: string): string[] {
  return myVotes.includes(id) ? myVotes.filter((v) => v !== id) : [...myVotes, id];
}

export function awardWinner(nominees: { id: string; votes: number }[]): string | null {
  if (!nominees.length) return null;
  const sorted = [...nominees].sort((a, b) => b.votes - a.votes);
  if (sorted.length > 1 && sorted[0]!.votes === sorted[1]!.votes) return null;
  return sorted[0]!.id;
}
