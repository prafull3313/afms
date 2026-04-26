import { ChangeEvent } from 'react';
import styles from './SelectField.module.scss';

type SelectFieldProps = {
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
  placeholder: string;
  required?: boolean;
};

const SelectField = ({
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false
}: SelectFieldProps) => {
  return (
    <select
      className={styles.select}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default SelectField;
