import { ChangeEvent, MouseEvent } from 'react';
import styles from './TextInput.module.scss';

type TextInputProps = {
  type?: 'text' | 'date';
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'email' | 'search' | 'tel' | 'url';
};

const TextInput = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  inputMode
}: TextInputProps) => {
  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (type !== 'date') {
      return;
    }

    const input = event.currentTarget as HTMLInputElement & {
      showPicker?: () => void;
    };

    input.showPicker?.();
  };

  return (
    <input
      className={styles.input}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      inputMode={inputMode}
      onClick={handleClick}
    />
  );
};

export default TextInput;
