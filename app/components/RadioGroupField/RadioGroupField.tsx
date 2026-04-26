import { ChangeEvent } from 'react';
import styles from './RadioGroupField.module.scss';

type RadioOption = {
  label: string;
  value: string;
};

type RadioGroupFieldProps = {
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  options: readonly RadioOption[];
};

const RadioGroupField = ({
  name,
  value,
  onChange,
  options
}: RadioGroupFieldProps) => {
  return (
    <div className={styles.radioGroup}>
      {options.map((option) => (
        <label key={option.value} className={styles.radioLabel}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

export default RadioGroupField;
