import { useEffect, useState } from 'react';
import { loadSession } from '../api/auth';
import { getCaregiver } from '../api/caregivers';

export interface CurrentDoctor {
  fullName: string;
  specialization: string;
  initials: string;
}

const DEFAULT: CurrentDoctor = {
  fullName: 'Doctor',
  specialization: 'General Practice',
  initials: 'DR',
};

function computeInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s.charAt(0).toUpperCase())
      .join('') || 'DR'
  );
}

export function useCurrentDoctor(): CurrentDoctor {
  const session = loadSession();
  const [doctor, setDoctor] = useState<CurrentDoctor>(() => {
    if (!session) return DEFAULT;
    return {
      fullName: session.fullName || DEFAULT.fullName,
      specialization: DEFAULT.specialization,
      initials: computeInitials(session.fullName || ''),
    };
  });

  useEffect(() => {
    if (!session?.caregiverId) return;
    let active = true;
    getCaregiver(session.caregiverId)
      .then(c => {
        if (!active) return;
        setDoctor({
          fullName: c.user?.fullName || session.fullName || DEFAULT.fullName,
          specialization: c.specialization || DEFAULT.specialization,
          initials: computeInitials(c.user?.fullName || session.fullName || ''),
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [session?.caregiverId, session?.fullName]);

  return doctor;
}
