'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import FormField from '../components/FormField/FormField';
import Header from '../components/Header/Header';
import SelectField from '../components/SelectField/SelectField';
import StatusMessage from '../components/StatusMessage/StatusMessage';
import SubmitButton from '../components/SubmitButton/SubmitButton';
import TextInput from '../components/TextInput/TextInput';
import {
  expensePaidByOptions,
  getExpenseMonthOptions,
  getExpensesWithSheets,
  saveExpense,
  type ExpensePaidBy,
  type ExpenseWithSheet
} from '../utils/expenses';
import { downloadExpensesWorkbook } from './exportExpenses';
import styles from './page.module.scss';

type ExpenseFormData = {
  paidBy: ExpensePaidBy | '';
  amount: string;
  details: string;
  date: string;
};

const initialFormData: ExpenseFormData = {
  paidBy: '',
  amount: '',
  details: '',
  date: ''
};

const decimalPattern = /^\d*\.?\d*$/;

const formatDate = (value: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB').format(date);
};

export default function ExpensesPage() {
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData);
  const [expenses, setExpenses] = useState<ExpenseWithSheet[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const monthOptions = useMemo(
    () => ['All Months', ...getExpenseMonthOptions(expenses)],
    [expenses]
  );

  const filteredExpenses = useMemo(
    () =>
      selectedMonth === 'All Months'
        ? expenses
        : expenses.filter((expense) => expense.sheetName === selectedMonth),
    [expenses, selectedMonth]
  );

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  );

  const isFormValid =
    Boolean(formData.paidBy) &&
    Boolean(formData.amount) &&
    Number(formData.amount) > 0 &&
    Boolean(formData.details.trim()) &&
    Boolean(formData.date);

  const loadExpenses = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const loadedExpenses = await getExpensesWithSheets();
      setExpenses(loadedExpenses);
      setSelectedMonth('All Months');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load expenses.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadExpenses();
  }, []);

  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    if (name === 'amount') {
      if (value === '' || decimalPattern.test(value)) {
        setFormData((current) => ({ ...current, [name]: value }));
      }
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.paidBy) {
      setErrorMessage('Please select who paid the expense.');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setErrorMessage('Please enter a valid expense amount.');
      return;
    }

    if (!formData.details.trim()) {
      setErrorMessage('Please enter expense details.');
      return;
    }

    if (!formData.date) {
      setErrorMessage('Please select an expense date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await saveExpense({
        paidBy: formData.paidBy,
        amount: Number(formData.amount),
        details: formData.details.trim(),
        date: formData.date
      });

      setSuccessMessage(result.message);
      setFormData(initialFormData);
      await loadExpenses();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save the expense.'
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
            <p className={styles.subtitle}>Expense Management</p>
          </div>
          <div className={styles.navLinks}>
            <Link className={styles.linkButton} href="/">
              New Entry
            </Link>
            <Link className={styles.linkButton} href="/entries">
              View Entries
            </Link>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <FormField label="Expense Paid By">
            <SelectField
              name="paidBy"
              value={formData.paidBy}
              onChange={handleTextChange}
              options={expensePaidByOptions}
              placeholder="Select paid by"
              required
            />
          </FormField>

          <FormField label="Expense Amount">
            <TextInput
              inputMode="decimal"
              name="amount"
              value={formData.amount}
              onChange={handleTextChange}
              placeholder="Enter expense amount"
              required
            />
          </FormField>

          <FormField label="Expense Details">
            <TextInput
              name="details"
              value={formData.details}
              onChange={handleTextChange}
              placeholder="Enter expense details"
              required
            />
          </FormField>

          <FormField label="Expense Date">
            <TextInput
              type="date"
              name="date"
              value={formData.date}
              onChange={handleTextChange}
              required
            />
          </FormField>

          <StatusMessage type="error" message={errorMessage} />
          <StatusMessage type="success" message={successMessage} />

          <SubmitButton
            isSubmitting={isSubmitting}
            disabled={!isFormValid}
            label="Save Expense"
            submittingLabel="Saving..."
          />
        </form>

        <section className={styles.recordsSection}>
          <div className={styles.recordsHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Expense Records</h2>
              <p className={styles.countText}>{filteredExpenses.length} expenses shown</p>
            </div>
            {expenses.length > 0 ? (
              <div className={styles.filterControls}>
                <label className={styles.filterLabel}>
                  <span>View Month</span>
                  <select
                    className={styles.filterSelect}
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                  >
                    {monthOptions.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className={styles.exportButton}
                  type="button"
                  onClick={() => downloadExpensesWorkbook(filteredExpenses)}
                  disabled={filteredExpenses.length === 0}
                >
                  Download Excel
                </button>
              </div>
            ) : null}
          </div>

          {isLoading ? <p className={styles.info}>Loading expenses...</p> : null}

          {!isLoading && !errorMessage && expenses.length === 0 ? (
            <p className={styles.info}>No expenses found yet.</p>
          ) : null}

          {!isLoading && !errorMessage && expenses.length > 0 && filteredExpenses.length === 0 ? (
            <p className={styles.info}>No expenses found for the selected month.</p>
          ) : null}

          {!isLoading && !errorMessage && filteredExpenses.length > 0 ? (
            <>
              <div className={styles.totalBlock}>
                <span>Total Expense:</span>
                <strong>Rs {totalAmount}</strong>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Expense Date</th>
                      <th>Expense Paid By</th>
                      <th>Expense Amount</th>
                      <th>Expense Details</th>
                      <th>Sheet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{formatDate(expense.date)}</td>
                        <td>{expense.paidBy}</td>
                        <td>{expense.amount}</td>
                        <td>{expense.details}</td>
                        <td>{expense.sheetName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
