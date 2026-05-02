'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from './components/Header/Header';
import FormField from './components/FormField/FormField';
import RadioGroupField from './components/RadioGroupField/RadioGroupField';
import SelectField from './components/SelectField/SelectField';
import StatusMessage from './components/StatusMessage/StatusMessage';
import SubmitButton from './components/SubmitButton/SubmitButton';
import TextInput from './components/TextInput/TextInput';
import styles from './page.module.scss';
import { handleExcel } from './utils/xl';
import type { YesNo } from './utils/entries';

const grainOptions = [
  'Gahu Pith',
  'Gahu Dalan',
  'Jwari Pith',
  'Jwari Dalan',
  'Bajari Pith',
  'Bajari Dalan'
] as const;

const grainTypePrices: Record<(typeof grainOptions)[number], number> = {
  'Gahu Pith': 65,
  'Gahu Dalan': 8,
  'Jwari Pith': 80,
  'Jwari Dalan': 8,
  'Bajari Pith': 80,
  'Bajari Dalan': 8
};

const receivedByOptions = [
  'Girani Counter',
  'Omkar S',
  'Omkar S Baba',
  'Prafull',
  'Omkar P'
] as const;

const yesNoOptions = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' }
] as const;

type YesNoValue = YesNo | '';

type FormData = {
  date: string;
  customerName: string;
  grainType: string;
  weight: string;
  receivedPayment: YesNoValue;
  receivedBy: string;
  payment: string;
  depositedOnGirani: YesNoValue;
};

const initialFormData: FormData = {
  date: '',
  customerName: '',
  grainType: '',
  weight: '',
  receivedPayment: '',
  receivedBy: '',
  payment: '',
  depositedOnGirani: ''
};

const customerNamePattern = /^[A-Za-z\s]+$/;
const decimalPattern = /^\d*\.?\d*$/;
const formatAmount = (value: number) => Number(value.toFixed(2)).toString();

export default function Home() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    if (name === 'receivedPayment') {
      setFormData((current) => ({
        ...current,
        receivedPayment: value as YesNoValue,
        receivedBy: value === 'Yes' ? current.receivedBy : ''
      }));
      return;
    }

    if (name === 'customerName') {
      if (value === '' || customerNamePattern.test(value)) {
        setFormData((current) => ({ ...current, [name]: value }));
      }
      return;
    }

    if (name === 'weight' || name === 'payment') {
      if (value === '' || decimalPattern.test(value)) {
        setFormData((current) => ({ ...current, [name]: value }));
      }
      return;
    }

    if (name === 'receivedBy') {
      setFormData((current) => ({
        ...current,
        receivedBy: value,
        depositedOnGirani: value === 'Girani Counter' ? 'Yes' : current.depositedOnGirani
      }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  useEffect(() => {
    if (!formData.grainType || !formData.weight) {
      setFormData((current) => ({
        ...current,
        payment: ''
      }));
      return;
    }

    const grainPrice = grainTypePrices[formData.grainType as keyof typeof grainTypePrices];
    const weightValue = Number(formData.weight);

    if (!grainPrice || Number.isNaN(weightValue)) {
      setFormData((current) => ({
        ...current,
        payment: ''
      }));
      return;
    }

    const calculatedPayment = formatAmount(grainPrice * weightValue);

    setFormData((current) =>
      current.payment === calculatedPayment
        ? current
        : {
            ...current,
            payment: calculatedPayment
          }
    );
  }, [formData.grainType, formData.weight]);

  const trimmedCustomerName = formData.customerName.trim();
  const isCustomerNameValid =
    trimmedCustomerName.length > 0 && customerNamePattern.test(trimmedCustomerName);
  const isFormValid =
    Boolean(formData.date) &&
    isCustomerNameValid &&
    Boolean(formData.grainType) &&
    Boolean(formData.weight) &&
    Boolean(formData.receivedPayment) &&
    Boolean(formData.payment) &&
    Boolean(formData.depositedOnGirani) &&
    (formData.receivedPayment !== 'Yes' || Boolean(formData.receivedBy));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.date) {
      setErrorMessage('Please select a date.');
      return;
    }

    if (!trimmedCustomerName || !customerNamePattern.test(trimmedCustomerName)) {
      setErrorMessage('Customer Name should contain letters and spaces only.');
      return;
    }

    if (!formData.grainType) {
      setErrorMessage('Please select a grain type.');
      return;
    }

    if (!formData.weight) {
      setErrorMessage('Please enter the weight.');
      return;
    }

    if (!formData.receivedPayment) {
      setErrorMessage('Please select whether payment was received.');
      return;
    }

    if (formData.receivedPayment === 'Yes' && !formData.receivedBy) {
      setErrorMessage('Please select who received it.');
      return;
    }

    if (!formData.payment) {
      setErrorMessage('Please enter the payment amount.');
      return;
    }

    if (!formData.depositedOnGirani) {
      setErrorMessage('Please select whether the payment was deposited in Girani.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await handleExcel({
        date: formData.date,
        customerName: trimmedCustomerName,
        grainType: formData.grainType,
        weight: Number(formData.weight),
        receivedPayment: formData.receivedPayment,
        receivedBy: formData.receivedBy,
        payment: Number(formData.payment),
        depositedOnGirani: formData.depositedOnGirani
      });

      setSuccessMessage(result.message);
      setFormData(initialFormData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save the entry.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBar}>
          <div>
            <Header />
            <p className={styles.subtitle}>Customer grain entry form</p>
          </div>
          <Link className={styles.linkButton} href="/entries">
            View Entries
          </Link>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <FormField label="Date">
            <TextInput
              type="date"
              name="date"
              value={formData.date}
              onChange={handleTextChange}
              required
            />
          </FormField>

          <FormField label="Customer Name">
            <TextInput
              name="customerName"
              value={formData.customerName}
              onChange={handleTextChange}
              placeholder="Enter customer name"
              required
            />
          </FormField>

          <FormField label="Grain Type">
            <SelectField
              name="grainType"
              value={formData.grainType}
              onChange={handleTextChange}
              options={grainOptions}
              placeholder="Select grain type"
              required
            />
          </FormField>

          <FormField label="Weight">
            <TextInput
              inputMode="decimal"
              name="weight"
              value={formData.weight}
              onChange={handleTextChange}
              placeholder="Enter weight"
              required
            />
          </FormField>

          <FormField label="Received Payment">
            <RadioGroupField
              name="receivedPayment"
              value={formData.receivedPayment}
              onChange={handleTextChange}
              options={yesNoOptions}
            />
          </FormField>

          {formData.receivedPayment === 'Yes' ? (
            <FormField label="Received By">
              <SelectField
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleTextChange}
                options={receivedByOptions}
                placeholder="Select receiver"
                required
              />
            </FormField>
          ) : null}

          <FormField label="Payment (Rs)">
            <TextInput
              inputMode="decimal"
              name="payment"
              value={formData.payment}
              onChange={handleTextChange}
              placeholder="Enter payment amount"
              required
            />
          </FormField>

          <FormField label="Deposited In Girani">
            <RadioGroupField
              name="depositedOnGirani"
              value={formData.depositedOnGirani}
              onChange={handleTextChange}
              options={yesNoOptions}
            />
          </FormField>

          <StatusMessage type="error" message={errorMessage} />
          <StatusMessage type="success" message={successMessage} />

          <SubmitButton
            isSubmitting={isSubmitting}
            disabled={!isFormValid}
            label="Save Entry"
            submittingLabel="Saving..."
          />
        </form>
      </div>
    </main>
  );
}
