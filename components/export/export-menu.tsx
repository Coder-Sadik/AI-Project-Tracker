'use client';

import { Requirement, Project } from '@/types';
import { format } from 'date-fns';
import { Download, FileText, Table, Hash } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  project: Project;
  requirements: Requirement[];
}

export default function ExportMenu({ project, requirements }: Props) {
  const [open, setOpen] = useState(false);

  function exportMarkdown() {
    const lines = [
      `# ${project.name}`,
      '',
      `_Exported ${format(new Date(), 'PPP')}_`,
      '',
      `## Requirements (${requirements.length} total, ${requirements.filter((r) => r.completed).length} completed)`,
      '',
      ...requirements.map((r, i) => `- [${r.completed ? 'x' : ' '}] **#${i + 1}** ${r.description}`),
    ];
    download(`${project.name}.md`, 'text/markdown', lines.join('\n'));
    toast.success('Exported as Markdown');
    setOpen(false);
  }

  function exportCSV() {
    const headers = ['#', 'Description', 'Completed', 'Last Editor', 'Due Date'];
    const rows = requirements.map((r, i) => [
      i + 1,
      `"${r.description.replace(/"/g, '""')}"`,
      r.completed ? 'Yes' : 'No',
      r.lastEditorName || '',
      r.dueDate ? format(r.dueDate.toDate(), 'yyyy-MM-dd') : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    download(`${project.name}.csv`, 'text/csv', csv);
    toast.success('Exported as CSV');
    setOpen(false);
  }

  async function exportPDF() {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxW = pageW - margin * 2;
      let y = margin;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(project.name, margin, y);
      y += 10;

      // Subtitle
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Exported ${format(new Date(), 'PPP')} · ${requirements.length} requirements`, margin, y);
      y += 8;

      // Line
      doc.setDrawColor(200);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      // Requirements
      requirements.forEach((req, i) => {
        const prefix = `${i + 1}. `;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(req.completed ? 150 : 30);

        const lines = doc.splitTextToSize(`${prefix}${req.description}`, maxW - 10);

        if (y + lines.length * 5 > 270) {
          doc.addPage();
          y = margin;
        }

        // Checkbox indicator
        doc.setFillColor(req.completed ? 59 : 220, req.completed ? 130 : 220, req.completed ? 246 : 220);
        doc.circle(margin - 5, y - 1, 2, 'F');

        doc.text(lines, margin, y);
        y += lines.length * 5 + 3;
      });

      doc.save(`${project.name}.pdf`);
      toast.success('Exported as PDF');
      setOpen(false);
    } catch {
      toast.error('PDF export failed');
    }
  }

  function download(filename: string, type: string, content: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative">
      <button
        id="export-btn"
        className="btn btn-secondary btn-sm"
        onClick={() => setOpen((v) => !v)}
      >
        <Download size={14} />
        Export
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 rounded-xl shadow-lg py-1 z-50"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            minWidth: 180,
          }}
          onMouseLeave={() => setOpen(false)}
        >
          <button
            id="export-markdown-btn"
            className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-[var(--bg-secondary)] transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
            onClick={exportMarkdown}
          >
            <Hash size={14} />
            Markdown
          </button>
          <button
            id="export-csv-btn"
            className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-[var(--bg-secondary)] transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
            onClick={exportCSV}
          >
            <Table size={14} />
            CSV (Excel)
          </button>
          <button
            id="export-pdf-btn"
            className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-[var(--bg-secondary)] transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
            onClick={exportPDF}
          >
            <FileText size={14} />
            PDF
          </button>
        </div>
      )}
    </div>
  );
}
