export function formatTimestamp(input: string | number | Date) {
  const d = new Date(input);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
