import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ExportButtonsProps<T extends Record<string, unknown>> = {
  fileName: string;
  rows: T[];
  columns: Array<{ key: keyof T; label: string }>;
};

function escapeCsv(value: unknown): string {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

export default function ExportButtons<T extends Record<string, unknown>>({ fileName, rows, columns }: ExportButtonsProps<T>) {
  function onExportCsv() {
    const header = columns.map((column) => escapeCsv(column.label)).join(",");
    const body = rows
      .map((row) => columns.map((column) => escapeCsv(row[column.key])).join(","))
      .join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function onExportPdf() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [columns.map((column) => column.label)],
      body: rows.map((row) => columns.map((column) => String(row[column.key] ?? ""))),
      styles: { fontSize: 9 },
    });
    doc.save(`${fileName}.pdf`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn-ghost" onClick={onExportCsv} type="button">
        Exportar CSV
      </button>
      <button className="btn-ghost" onClick={onExportPdf} type="button">
        Exportar PDF
      </button>
    </div>
  );
}
