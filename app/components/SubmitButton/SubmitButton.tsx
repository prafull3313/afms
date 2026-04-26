import styles from './SubmitButton.module.scss';

type SubmitButtonProps = {
  isSubmitting: boolean;
  disabled?: boolean;
  label: string;
  submittingLabel: string;
};

const SubmitButton = ({
  isSubmitting,
  disabled = false,
  label,
  submittingLabel
}: SubmitButtonProps) => {
  return (
    <button
      className={styles.submitButton}
      type="submit"
      disabled={isSubmitting || disabled}
    >
      {isSubmitting ? submittingLabel : label}
    </button>
  );
};

export default SubmitButton;
