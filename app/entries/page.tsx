'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header/Header';
import { downloadEntriesWorkbook } from './exportEntries';
import styles from './page.module.scss';
import { getEntriesWithSheets, getMonthOptions, type EntryWithSheet } from '../utils/entries';

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

export default function EntriesPage() {
  const [entries, setEntries] = useState<EntryWithSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All Months');

  const monthOptions = useMemo(
    () => ['All Months', ...getMonthOptions(entries)],
    [entries]
  );

  const filteredEntries = useMemo(
    () =>
      selectedMonth === 'All Months'
        ? entries
        : entries.filter((entry) => entry.sheetName === selectedMonth),
    [entries, selectedMonth]
  );

  const totalPayment = useMemo(
    () => filteredEntries.reduce((sum, entry) => sum + entry.payment, 0),
    [filteredEntries]
  );

  const totalResults = useMemo(() => {
    const results = {
      totalPayment: 0,
      gahuPith: 0,
      gahuDalan: 0,
      jwariPith: 0,
      jwariDalan: 0,
      bajariPith: 0,
      bajariDalan: 0,
      totalWeight: 0
    };

    filteredEntries.forEach((entry) => {
      results.totalPayment += entry.payment;
      results.totalWeight += entry.weight;

      const grainType = entry.grainType?.toLowerCase() || '';
      const weight = entry.weight || 0;

      if (grainType.includes('gahu') && grainType.includes('pith')) {
        results.gahuPith += weight;
      } else if (grainType.includes('gahu') && grainType.includes('dalan')) {
        results.gahuDalan += weight;
      } else if (grainType.includes('jwari') && grainType.includes('pith')) {
        results.jwariPith += weight;
      } else if (grainType.includes('jwari') && grainType.includes('dalan')) {
        results.jwariDalan += weight;
      } else if (grainType.includes('bajari') && grainType.includes('pith')) {
        results.bajariPith += weight;
      } else if (grainType.includes('bajari') && grainType.includes('dalan')) {
        results.bajariDalan += weight;
      }
    });

    return results;
  }, [filteredEntries]);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const loadedEntries = await getEntriesWithSheets();
        setEntries(loadedEntries);
        setSelectedMonth('All Months');
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load entries.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadEntries();
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBar}>
          <div>
            <Header />
            <p className={styles.subtitle}>All customer grain entries</p>
          </div>
          <Link className={styles.linkButton} href="/">
            New Entry
          </Link>
        </div>

        {isLoading ? <p className={styles.info}>Loading entries...</p> : null}
        {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

        {!isLoading && !errorMessage && entries.length > 0 ? (
          <div className={styles.filterBar}>
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
                onClick={() => downloadEntriesWorkbook(filteredEntries)}
              >
                Download Excel
              </button>
            </div>
            <div className={styles.summaryBlock}>
              <p className={styles.countText}>{filteredEntries.length} entries shown</p>
            </div>
          </div>
        ) : null}

        {!isLoading && !errorMessage && entries.length === 0 ? (
          <p className={styles.info}>No entries found yet.</p>
        ) : null}

        {!isLoading && !errorMessage && entries.length > 0 && filteredEntries.length === 0 ? (
          <p className={styles.info}>No entries found for the selected month.</p>
        ) : null}

        <div className={styles.resultsBlock}>
          <h3 className={styles.resultsTitle}>Total Results</h3>
          <div className={styles.resultsGrid}>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Payment:</span>
              <span className={styles.resultValue}>Rs {totalResults.totalPayment}</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Gahu Pith:</span>
              <span className={styles.resultValue}>{totalResults.gahuPith} KGs</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Gahu Dalan:</span>
              <span className={styles.resultValue}>{totalResults.gahuDalan} KGs</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Jwari Pith:</span>
              <span className={styles.resultValue}>{totalResults.jwariPith} KGs</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Jwari Dalan:</span>
              <span className={styles.resultValue}>{totalResults.jwariDalan} KGs</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Bajari Pith:</span>
              <span className={styles.resultValue}>{totalResults.bajariPith} KGs</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Bajari Dalan:</span>
              <span className={styles.resultValue}>{totalResults.bajariDalan} KGs</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Weight:</span>
              <span className={styles.resultValue}>{totalResults.totalWeight} KGs</span>
            </div>
          </div>
        </div>

        {!isLoading && !errorMessage && filteredEntries.length > 0 ? (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Grain Type</th>
                    <th>Weight</th>
                    <th>Received Payment</th>
                    <th>Received By</th>
                    <th>Payment</th>
                    <th>Deposited In Girani</th>
                    <th>Sheet</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.date)}</td>
                      <td>{entry.customerName || '-'}</td>
                      <td>{entry.grainType || '-'}</td>
                      <td>{entry.weight}</td>
                      <td>{entry.receivedPayment || '-'}</td>
                      <td>{entry.receivedBy || '-'}</td>
                      <td>{entry.payment}</td>
                      <td>{entry.depositedOnGirani || '-'}</td>
                      <td>{entry.sheetName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}