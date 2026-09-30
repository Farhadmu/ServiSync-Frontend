/**
 * Export data records to CSV file download in the browser
 */
export function exportToCsv<T extends Record<string, any>>(filename: string, rows: T[]): void {
  if (!rows || !rows.length) return;

  const separator = ",";
  const keys = Object.keys(rows[0]);

  const csvContent =
    keys.map((k) => `"${k}"`).join(separator) +
    "\n" +
    rows
      .map((row) =>
        keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? "" : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : typeof cell === "object" ? JSON.stringify(cell) : String(cell);
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator)
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename.replace(/\.csv$/, "")}_${Date.now()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers browser print dialog for current view
 */
export function triggerPrint(): void {
  if (typeof window !== "undefined") {
    window.print();
  }
}
