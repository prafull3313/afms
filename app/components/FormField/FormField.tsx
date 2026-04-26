import { ReactNode } from 'react';
import styles from './FormField.module.scss';

type FormFieldProps = {
  label: string;
  children: ReactNode;
};

const FormField = ({ label, children }: FormFieldProps) => {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
    </label>
  );
};

export default FormField;
