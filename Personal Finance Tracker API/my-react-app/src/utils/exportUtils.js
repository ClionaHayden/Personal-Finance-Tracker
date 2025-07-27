import { unparse } from "papaparse";  // For CSV generation
import * as XLSX from "xlsx";          // For Excel file generation
import { saveAs } from "file-saver";  // To trigger file download
import jsPDF from "jspdf";            // For PDF generation
import autoTable from "jspdf-autotable"; // To create tables in PDFs

/**
 * Convert an amount from one currency to another using provided exchange rates.
 *
 * @param {number} amount - The amount to convert.
 * @param {string} fromCurrency - Original currency code (e.g., "EUR").
 * @param {string} toCurrency - Target currency code (e.g., "USD").
 * @param {object} exchangeRates - Exchange rates object with currency codes as keys.
 * @returns {number} - Converted amount.
 */
function convertCurrency(amount, fromCurrency, toCurrency, exchangeRates) {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) return amount;

  const rateFrom = exchangeRates[fromCurrency];
  const rateTo = exchangeRates[toCurrency];

  // Warn and return original amount if any rate is missing
  if (!rateFrom) {
    console.warn(`No exchange rate for ${fromCurrency}. Returning original amount.`);
    return amount;
  }
  if (!rateTo) {
    console.warn(`No exchange rate for ${toCurrency}. Returning original amount.`);
    return amount;
  }

  // Convert amount to base currency (EUR), then to target currency
  const amountInEUR = amount / rateFrom;
  const converted = amountInEUR * rateTo;

  return converted;
}

/**
 * Format transactions for export by converting amounts and preparing fields.
 *
 * @param {Array} transactions - Array of transaction objects.
 * @param {string} displayCurrency - The currency to display amounts in.
 * @param {object} exchangeRates - The exchange rates for conversion.
 * @returns {Array} - Array of formatted transaction objects.
 */
function formatTransactions(transactions, displayCurrency, exchangeRates) {
  return transactions.map(tx => {
    const fromCurrency = tx.currency || "EUR";  // Default currency is EUR if missing
    console.log(`Converting from ${fromCurrency} to ${displayCurrency}, amount: ${tx.amount}`);

    // Convert amount to display currency
    const convertedAmount = convertCurrency(tx.amount, fromCurrency, displayCurrency, exchangeRates);

    // Return formatted transaction with fixed 2 decimals for amount
    return {
      Date: new Date(tx.date).toLocaleDateString(),
      Description: tx.description,
      Amount: convertedAmount.toFixed(2),
      Currency: displayCurrency,
      Type: tx.type,
      Category: tx.category?.name || "—",
    };
  });
}

/**
 * Export transactions as CSV file.
 *
 * @param {Array} transactions - Transaction data.
 * @param {string} displayCurrency - Currency for amount display.
 * @param {object} exchangeRates - Exchange rates for currency conversion.
 */
export function exportCSV(transactions, displayCurrency, exchangeRates) {
  const data = formatTransactions(transactions, displayCurrency, exchangeRates);

  // Convert JSON to CSV string
  const csv = unparse(data);

  // Create a Blob from CSV string
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  // Trigger file download with appropriate filename
  saveAs(blob, `transactions-${displayCurrency}.csv`);
}

/**
 * Export transactions as Excel (.xlsx) file.
 *
 * @param {Array} transactions - Transaction data.
 * @param {string} displayCurrency - Currency for amount display.
 * @param {object} exchangeRates - Exchange rates for currency conversion.
 */
export function exportExcel(transactions, displayCurrency, exchangeRates) {
  const data = formatTransactions(transactions, displayCurrency, exchangeRates);

  // Convert JSON data to Excel worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create new workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

  // Generate Excel file buffer in array format
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // Create Blob with correct MIME type for Excel files
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  // Trigger file download
  saveAs(blob, `transactions-${displayCurrency}.xlsx`);
}

/**
 * Export transactions as PDF file with a table.
 *
 * @param {Array} transactions - Transaction data.
 * @param {string} displayCurrency - Currency for amount display.
 * @param {object} exchangeRates - Exchange rates for currency conversion.
 */
export function exportPDF(transactions, displayCurrency, exchangeRates) {
  const data = formatTransactions(transactions, displayCurrency, exchangeRates);

  // Initialize jsPDF document
  const doc = new jsPDF();

  console.log('Exchange rates:', exchangeRates);
  console.log('Display currency:', displayCurrency);

  // Prepare table body as array of arrays for autoTable
  const tableData = data.map(tx => [
    tx.Date,
    tx.Description,
    tx.Amount,
    tx.Currency,
    tx.Type,
    tx.Category,
  ]);

  // Generate table in PDF
  autoTable(doc, {
    head: [["Date", "Description", "Amount", "Currency", "Type", "Category"]],
    body: tableData,
  });

  // Save PDF file with filename reflecting display currency
  doc.save(`transactions-${displayCurrency}.pdf`);
}
