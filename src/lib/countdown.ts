export type TimeLeft = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

export function getTimeLeft(target: string | null | undefined, now: number = Date.now()): TimeLeft {
  const empty: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };
  if (!target) return empty;
  const targetTime = new Date(target).getTime();
  if (Number.isNaN(targetTime)) return empty;
  const diff = targetTime - now;
  if (diff <= 0) return { ...empty, done: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
    done: false,
  };
}

export function isDateConfirmed(value: string | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}
