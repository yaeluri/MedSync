import React from 'react';
import type { RegisterFormState } from '../hooks/useRegisterForm';
import { FormFields } from './FormFields';
import { PERSONAL_FIELDS } from '../config/personalFields';

interface IPersonalStepProps {
  form: RegisterFormState;
  isTherapist: boolean;
}

export const PersonalStep: React.FC<IPersonalStepProps> = ({ form, isTherapist }) => (
  <FormFields fields={PERSONAL_FIELDS} form={form} isTherapist={isTherapist} />
);

export default PersonalStep;
