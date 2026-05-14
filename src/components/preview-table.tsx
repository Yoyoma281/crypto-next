import React from 'react';

export interface PreviewColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  align?: 'left' | 'right';
  className?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface PreviewTableProps<T extends Record<string, unknown>> {
  columns: PreviewColumn<T>[];
  rows: T[];
}

export default function PreviewTable<T extends Record<string, unknown>>({ columns, rows }: PreviewTableProps<T>) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`p-4 text-xs font-semibold text-muted-foreground ${col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`${i < rows.length - 1 ? 'border-b border-border/40' : ''}`}>
              {columns.map((col) => {
                const value = row[col.key as keyof T];
                return (
                  <td
                    key={String(col.key)}
                    className={`p-4 text-sm ${col.align === 'right' ? 'text-right' : ''} ${col.className ?? ''}`}
                  >
                    {col.render ? col.render(value, row) : String(value ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
