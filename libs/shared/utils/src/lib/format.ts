const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCop(value: number | null | undefined): string {
  return copFormatter.format(Number(value ?? 0));
}

export function formatCompactCop(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}k`;
  }
  return `$${amount}`;
}

export function formatDistance(km: number | null | undefined): string {
  if (km == null || Number.isNaN(km)) {
    return '';
  }
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function initials(name: string | null | undefined): string {
  return (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
