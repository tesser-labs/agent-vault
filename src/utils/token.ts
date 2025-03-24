export function getTokenValidityInDays(expiration: Date) {
  const now = new Date();
  const diffTime = Math.abs(expiration.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getTokenStatus(expiration: Date) {
  const days = getTokenValidityInDays(expiration);
  if (days < 15) return "expiring";
  if (days < 0) return "expired";
  return "valid";
}

export function getTokenExpirationLabel(expiration: Date) {
  return expiration.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
