"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";

type DataTableWrapperProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  title?: string;
  searchPlaceholder?: string;
};

export default function DataTableWrapper<TData>({
  data,
  columns,
  title,
  searchPlaceholder = "Buscar en tabla...",
}: DataTableWrapperProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        {title ? <h3 className="text-lg font-semibold">{title}</h3> : null}
        <div className="w-full md:w-80">
          <SearchInput value={globalFilter} onChange={setGlobalFilter} placeholder={searchPlaceholder} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[rgba(148,163,184,0.15)] bg-[#1e293b]">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#0f172a] text-left text-slate-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-sm font-bold tracking-wide">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 font-bold outline-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className="text-xs">
                          {header.column.getIsSorted() === "asc" ? "▲" : header.column.getIsSorted() === "desc" ? "▼" : ""}
                        </span>
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-[rgba(148,163,184,0.15)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-slate-300 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={columns.length}>
                  Sin resultados
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination
        pageIndex={table.getState().pagination.pageIndex}
        pageCount={table.getPageCount()}
        canPreviousPage={table.getCanPreviousPage()}
        canNextPage={table.getCanNextPage()}
        onPreviousPage={() => table.previousPage()}
        onNextPage={() => table.nextPage()}
      />
    </div>
  );
}
