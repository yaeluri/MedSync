import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveSession } from '../../../api/auth';
import { homeForRole } from '../../../components/RequireRole/RequireRole';

export function useLoginForm(role?: string) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('נדרשים אימייל וסיסמה');
      return;
    }
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (role === 'therapist' && result.role !== 'doctor') {
        setError('אין לך הרשאות מטפל');
        return;
      }
      if (role === 'patient' && result.role !== 'patient') {
        setError('אין לך הרשאות מטופל');
        return;
      }
      saveSession(result);
      navigate(homeForRole(result.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'התחברות נכשלה');
    } finally {
      setSubmitting(false);
    }
  };

  return { email, setEmail, password, setPassword, submitting, error, handleSubmit };
}
