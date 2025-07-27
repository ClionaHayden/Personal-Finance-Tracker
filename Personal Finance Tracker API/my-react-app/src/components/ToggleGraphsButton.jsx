import React, { useState } from "react";
import SpendingByCategoryChart from "./SpendingByCategoryChart";
import MonthlySpendChart from "./MonthlySpendChart";
import {
  toggleButtonStyle,
  graphsContainerStyle,
  spendingChartWrapperStyle,
  monthlyChartWrapperStyle,
} from "../utils/styles";

// Component that toggles visibility of spending graphs (category & monthly)
export default function ToggleGraphsButton({ categories, transactions }) {
  const [showGraphs, setShowGraphs] = useState(false); // Track visibility of graphs

  // Change button background on hover
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = "#2980b9";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#3498db";
  };

  return (
    <>
      {/* Toggle button to show/hide graphs */}
      <button
        onClick={() => setShowGraphs((prev) => !prev)}
        style={toggleButtonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showGraphs ? "Hide Graphs" : "Show Graphs"}
      </button>

      {/* Conditionally render both charts when toggle is active */}
      {showGraphs && (
        <div style={graphsContainerStyle}>
          <div style={spendingChartWrapperStyle}>
            <SpendingByCategoryChart
              categories={categories}
              transactions={transactions}
            />
          </div>
          <div style={monthlyChartWrapperStyle}>
            <MonthlySpendChart
              categories={categories}
              transactions={transactions}
            />
          </div>
        </div>
      )}
    </>
  );
}
