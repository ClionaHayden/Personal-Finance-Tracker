// components/ExportMenu.jsx

import React from "react";
// Import export utility functions for different file formats
import { exportCSV, exportExcel, exportPDF } from "../utils/exportUtils";
// Import styling for the export buttons and container
import { exportButtonStyle, exportContainerStyle } from "../utils/styles";

// Component that renders export buttons for CSV, Excel, and PDF formats
export default function ExportMenu({ transactions, displayCurrency, exchangeRates }) {
  return (
    <div style={exportContainerStyle}>
      {/* Button to export transactions as CSV */}
      <button
        style={exportButtonStyle}
        onClick={() => exportCSV(transactions, displayCurrency, exchangeRates)}
      >
        Export CSV
      </button>

      {/* Button to export transactions as Excel */}
      <button
        style={exportButtonStyle}
        onClick={() => exportExcel(transactions, displayCurrency, exchangeRates)}
      >
        Export Excel
      </button>

      {/* Button to export transactions as PDF */}
      <button
        style={exportButtonStyle}
        onClick={() => exportPDF(transactions, displayCurrency, exchangeRates)}
      >
        Export PDF
      </button>
    </div>
  );
}
