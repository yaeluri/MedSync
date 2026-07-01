export const genderLabel = (gender?: string): string => {
  if (gender === 'Male') return 'זכר';
  if (gender === 'Female') return 'נקבה';
  return gender ?? '';
};
