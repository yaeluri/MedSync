/** Build up-to-two-letter uppercase initials from a full name. */
export const initialsFromName = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s.charAt(0).toUpperCase())
    .join('');

/** Convert an ISO/date string into a yyyy-mm-dd value for date inputs. */
export const toDateInput = (value?: string | null): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

/** Human-readable date of birth, or an em dash when unavailable. */
export const formatDob = (value?: string | null): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};
