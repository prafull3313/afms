import styles from './StatusMessage.module.scss';

type StatusMessageProps = {
  type: 'error' | 'success';
  message: string;
};

const StatusMessage = ({ type, message }: StatusMessageProps) => {
  if (!message) {
    return null;
  }

  return <p className={styles[type]}>{message}</p>;
};

export default StatusMessage;
