const BORDER_PALETTE = [
  "border-rose-500",
  "border-purple-500",
  "border-sky-500",
  "border-emerald-500",
  "border-amber-500",
  "border-fuchsia-500",
  "border-teal-500",
  "border-orange-500",
];

const ICON_PALETTE = ["⚔️", "🏹", "🛡️", "✨", "🔮", "🗡️", "🪄", "🎲"];

function hash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function colorForName(name: string): string {
  return BORDER_PALETTE[hash(name) % BORDER_PALETTE.length];
}

export function iconForName(name: string): string {
  return ICON_PALETTE[hash(name) % ICON_PALETTE.length];
}
