 "use client";

import { ReactNode, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../table";

export interface DataTableColumn<T> {
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | Date | null | undefined;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

const defaultHeaderCellClass =
  "py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400";
const defaultBodyCellClass =
  "py-3 text-gray-500 text-theme-sm dark:text-gray-400";

type SortDirection = "asc" | "desc";

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  loading = false,
  loadingMessage = "Loading...",
  emptyMessage = "No data found.",
  headerClassName = "border-gray-100 dark:border-gray-800 border-y",
  bodyClassName = "divide-y divide-gray-100 dark:divide-gray-800",
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<{
    index: number;
    direction: SortDirection;
  } | null>(null);
  const colCount = columns.length;

  const sortedData = useMemo(() => {
    if (!sortState) return data;

    const column = columns[sortState.index];
    if (!column?.sortable) return data;

    const getSortValue =
      column.sortValue ??
      ((row: T) => {
        const value = column.cell(row);
        return typeof value === "string" || typeof value === "number" ? value : "";
      });

    const normalize = (value: string | number | Date | null | undefined) => {
      if (value instanceof Date) return value.getTime();
      if (typeof value === "number") return value;
      if (value === null || value === undefined) return "";
      return String(value).toLowerCase();
    };

    const rows = [...data];
    rows.sort((a, b) => {
      const aValue = normalize(getSortValue(a));
      const bValue = normalize(getSortValue(b));

      if (aValue < bValue) return sortState.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortState.direction === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [columns, data, sortState]);

  const handleSort = (index: number) => {
    const column = columns[index];
    if (!column?.sortable) return;

    setSortState((prev) => {
      if (!prev || prev.index !== index) return { index, direction: "asc" };
      return { index, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  };

  return (
    <Table>
      <TableHeader className={headerClassName}>
        <TableRow>
          {columns.map((col, i) => (
            <TableCell
              key={i}
              isHeader
              className={col.headerClassName ?? defaultHeaderCellClass}
            >
              {col.sortable ? (
                <button
                  type="button"
                  onClick={() => handleSort(i)}
                  className="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-white/90"
                >
                  {col.header}
                  {sortState?.index === i
                    ? sortState.direction === "asc"
                      ? "↑"
                      : "↓"
                    : "↕"}
                </button>
              ) : (
                col.header
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody className={bodyClassName}>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={colCount}
              className="py-8 text-center text-gray-500"
            >
              {loadingMessage}
            </TableCell>
          </TableRow>
        ) : data.length > 0 ? (
          sortedData.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  className={col.cellClassName ?? defaultBodyCellClass}
                >
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={colCount}
              className="py-8 text-center text-gray-500"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
