import React from "react";

// Component for handling recurring transaction options within a form
export default function RecurringFields({
  isRecurring,
  setIsRecurring,
  recurringInterval,
  setRecurringInterval,
  endDate,
  setEndDate,
  inputStyle,
}) {
  return (
    <>
      {/* Checkbox to toggle whether the transaction is recurring */}
      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
        />
        Recurring Transaction
      </label>

      {/* Only show repeat and end date fields if recurring is enabled */}
      {isRecurring && (
        <>
          {/* Dropdown to select the recurring interval (e.g. weekly, monthly) */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "4px" }}>Repeats Every</label>
            <select
              value={recurringInterval}
              onChange={(e) => setRecurringInterval(e.target.value)}
              style={inputStyle}
            >
              <option value="daily">Day</option>
              <option value="weekly">Week</option>
              <option value="monthly">Month</option>
              <option value="yearly">Year</option>
            </select>
          </div>

          {/* Date picker to specify when the recurrence should end */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "4px" }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        </>
      )}
    </>
  );
}
