const ZONE = "Asia/Kolkata";

export function istDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function startOfTodayIso() {
  return new Date(`${istDateString()}T00:00:00+05:30`).toISOString();
}

export function startOfWeekIso() {
  const today = istDateString();
  const midnight = new Date(`${today}T00:00:00+05:30`);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    weekday: "short",
  }).format(new Date());
  const offset: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  return new Date(midnight.getTime() - (offset[weekday] ?? 0) * 86_400_000).toISOString();
}

export function startOfMonthIso() {
  const [year, month] = istDateString().split("-");
  return new Date(`${year}-${month}-01T00:00:00+05:30`).toISOString();
}

export function dayRangeIso(day: string) {
  const start = new Date(`${day}T00:00:00+05:30`);
  return {
    start: start.toISOString(),
    end: new Date(start.getTime() + 86_400_000).toISOString(),
  };
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function greetingWord() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: ZONE,
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function greeting(name: string) {
  return `${greetingWord()}, ${name}`;
}
