import React, { useState } from "react";
import { convertCurrency } from "../utils/currencyUtils";
import {
  tableStyle,
  thTdStyle,
  transactionTableHeaderStyle,
  buttonStyle,
  rowStyle,
  capitalizeText,
  paginationContainerStyle,
  paginationButtonStyle,
} from "../utils/styles";

const ITEMS_PER_PAGE = 10; // Number of transactions shown per page

export default function TransactionTable({
  transactions,     // Array of transaction objects to display
  onEdit,           // Callback to edit a transaction
  onDelete,         // Callback to delete a transaction
  displayCurrency,  // Currency code to display amounts in
  exchangeRates,    // Exchange rates object for currency conversion
}) {
  const [currentPage, setCurrentPage] = useState(1); // Current page of pagination

  // Show a message if no transactions to display
  if (transactions.length === 0) return <p>No transactions found.</p>;

  // Calculate the total number of pages needed
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);

  // Function to convert amounts from EUR to displayCurrency using exchange rates
  const convert = (amountEUR) => {
    if (!exchangeRates || !displayCurrency) return amountEUR; // fallback: no conversion
    return convertCurrency(amountEUR, "EUR", displayCurrency, exchangeRates);
  };

  // Determine the slice of transactions to show on current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Handler to navigate to a different page (with bounds checking)
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <table style={tableStyle}>
        <thead>
          <tr style={transactionTableHeaderStyle}>
            <th style={thTdStyle}>Date</th>
            <th style={thTdStyle}>Description</th>
            <th style={thTdStyle}>Amount ({displayCurrency})</th>
            <th style={thTdStyle}>Type</th>
            <th style={thTdStyle}>Category</th>
            <th style={thTdStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Render each transaction row for current page */}
          {currentTransactions.map((tx) => (
            <tr key={tx.id} style={rowStyle}>
              <td style={thTdStyle}>{new Date(tx.date).toLocaleDateString()}</td>
              <td style={thTdStyle}>{tx.description}</td>
              <td style={thTdStyle}>
                {convert(tx.amount).toFixed(2)} {displayCurrency}
              </td>
              <td style={{ ...thTdStyle, ...capitalizeText }}>{tx.type}</td>
              <td style={thTdStyle}>{tx.category?.name || "—"}</td>
              <td style={thTdStyle}>
                {/* Edit button triggers onEdit callback with this transaction */}
                <button
                  onClick={() => onEdit(tx)}
                  style={{ ...buttonStyle, backgroundColor: "#4caf50", color: "#fff" }}
                >
                  Edit
                </button>

                {/* Delete button triggers onDelete callback with transaction id */}
                <button
                  onClick={() => onDelete(tx.id)}
                  style={{ ...buttonStyle, backgroundColor: "#f44336", color: "#fff" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div style={paginationContainerStyle}>
        {/* Previous page button */}
        <button
          style={paginationButtonStyle}
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {/* Page number buttons */}
        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              style={{
                ...paginationButtonStyle,
                fontWeight: currentPage === pageNum ? "bold" : "normal",
                textDecoration: currentPage === pageNum ? "underline" : "none",
              }}
              onClick={() => goToPage(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next page button */}
        <button
          style={paginationButtonStyle}
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </>
  );
}
