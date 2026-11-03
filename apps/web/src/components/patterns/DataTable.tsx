'use client';

import React, { useEffect, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

interface DataTableProps<TData, TValue> {
  columns: any[];
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No results.',
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageCount = table.getPageCount();
  useEffect(() => {
    if (pagination.pageIndex >= pageCount && pageCount > 0) {
      setPagination((current) => ({ ...current, pageIndex: pageCount - 1 }));
    }
  }, [pageCount, pagination.pageIndex]);

  const totalRows = table.getPrePaginationRowModel().rows.length;
  const firstRow = totalRows ? pagination.pageIndex * pagination.pageSize + 1 : 0;
  const lastRow = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalRows,
  );

  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-text-muted uppercase bg-surface-2 border-b border-border">
          {table.getHeaderGroups().map((headerGroup: any) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
                <th key={header.id} className="px-4 py-3 font-medium whitespace-nowrap">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-text-muted">
                Loading...
              </td>
            </tr>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row: any) => (
              <tr
                key={row.id}
                className="border-b border-border hover:bg-surface-2/50 transition-colors"
              >
                {row.getAllCells().map((cell: any) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {!isLoading && totalRows > 0 && (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {firstRow}-{lastRow} of {totalRows}
          </span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <span>Rows</span>
              <select
                value={pagination.pageSize}
                onChange={(event) => table.setPageSize(Number(event.target.value))}
                className="h-8 rounded border border-border bg-white px-2 text-sm text-text"
                aria-label="Rows per page"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <span>Page {pagination.pageIndex + 1} of {pageCount}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 rounded border border-border px-3 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-surface-2"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 rounded border border-border px-3 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-surface-2"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

