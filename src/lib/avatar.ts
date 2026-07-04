export function avatarHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function avatarGradient(name: string): string {
  const h = avatarHue(name);
  const h2 = (h + 42) % 360;
  return `linear-gradient(135deg, hsl(${h} 68% 48%) 0%, hsl(${h2} 58% 36%) 100%)`;
}

export function displayInitial(name: string | null | undefined, username?: string | null): string {
  const source = name ?? username ?? "?";
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source[0]?.toUpperCase() ?? "?";
}
