import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export const exportToCSV = (data, filename = 'data.csv') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data, columns, filename = 'data.pdf') => {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [columns],
    body: data.map((item) => columns.map((key) => item[key] || '')),
  });
  doc.save(filename);
};
