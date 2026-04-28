"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export type TableColumn = {
  key: string;
  label: string;
  className?: string;
  render?: (value: unknown, row: Record<string, unknown>, index: number) => React.ReactNode;
};

export type ResponsiveTableWrapperProps = {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  keyExtractor?: (row: Record<string, unknown>, index: number) => string;
  rowClassName?: string;
  expandedRowContent?: (row: Record<string, unknown>, index: number) => React.ReactNode;
  onRowClick?: (row: Record<string, unknown>, index: number) => void;
};

/**
 * Responsive table wrapper that shows:
 * - Full table on desktop (md and up)
 * - Card view with expandable details on mobile/tablet
 */
export function ResponsiveTableWrapper({
  columns,
  data,
  keyExtractor = (row, idx) => `row-${idx}`,
  rowClassName = "border-b border-slate-100",
  expandedRowContent,
  onRowClick,
}: ResponsiveTableWrapperProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  // Desktop Table View
  const DesktopTable = () => (
    <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white md:block">
      <table className="w-full table-auto text-left text-xs text-slate-700 sm:text-sm">
        <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 sm:text-[11px]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`whitespace-nowrap px-3 py-3 sm:px-4 ${col.className || ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={keyExtractor(row, idx)}
              className={`${rowClassName} transition-colors hover:bg-slate-50`}
              onClick={() => onRowClick?.(row, idx)}
            >
              {columns.map((col) => (
                <td key={`${keyExtractor(row, idx)}-${col.key}`} className={`px-3 py-3 align-top sm:px-4 ${col.className || ""}`}>
                  {col.render ? col.render(row[col.key], row, idx) : String(row[col.key] || "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile Card View
  const MobileCards = () => (
    <div className="space-y-3 md:hidden">
      {data.map((row, idx) => {
        const rowKey = keyExtractor(row, idx);
        const isExpanded = expandedRows.has(rowKey);
        const primaryColumn = columns[0];

        return (
          <div
            key={rowKey}
            className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
          >
            {/* Card Header - Primary Info */}
            <button
              type="button"
              onClick={() => {
                toggleRow(rowKey);
                onRowClick?.(row, idx);
              }}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
                <div className="min-w-0 flex-1">
                  {primaryColumn && (
                    <div className="font-semibold text-slate-900 text-sm sm:text-base break-words">
                      {primaryColumn.render
                        ? primaryColumn.render(row[primaryColumn.key], row, idx)
                        : String(row[primaryColumn.key] || "-")}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-slate-400">
                  {expandedRowContent && (
                    isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />
                  )}
                </div>
              </div>
            </button>

            {/* Card Body - Other Info */}
            <div className="border-t border-slate-100 px-3 py-3 sm:px-4">
              <div className="grid gap-3 text-xs sm:text-sm">
                {columns.slice(1, 4).map((col) => (
                  <div key={`${rowKey}-${col.key}`} className="flex items-start justify-between gap-2">
                    <span className="font-medium text-slate-600 whitespace-nowrap">{col.label}:</span>
                    <span className="text-right text-slate-900 break-words flex-1">
                      {col.render
                        ? col.render(row[col.key], row, idx)
                        : String(row[col.key] || "-")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Expanded Content */}
            {expandedRowContent && isExpanded && (
              <div className="border-t border-slate-100 bg-slate-50 p-3 sm:p-4">
                {expandedRowContent(row, idx)}
              </div>
            )}
          </div>
        );
      })}

      {data.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-500 text-sm">No data available</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <DesktopTable />
      <MobileCards />
    </div>
  );
}
