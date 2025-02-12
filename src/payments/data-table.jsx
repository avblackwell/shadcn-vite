import { Fragment } from 'react'

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DataTablePagination } from './data-table-pagintation'

function ExpandedRow({ row }) {
  const data = row.original

  // Group fields into categories based on common prefixes or patterns
  const groupFields = (data) => {
    const groups = {
      'Payment Details': ['amount', 'status', 'currency', 'payment', 'transaction'],
      'Customer Details': ['email', 'name', 'customer', 'user', 'phone'],
      'Dates & Times': ['date', 'created', 'updated', 'time'],
      'Additional Details': [], // catch-all for other fields
    }

    const categorizedFields = {}

    Object.entries(data).forEach(([key, value]) => {
      // Find the group this field belongs to
      const group =
        Object.entries(groups).find(([_, patterns]) =>
          patterns.some((pattern) => key.toLowerCase().includes(pattern))
        )?.[0] || 'Additional Details'

      if (!categorizedFields[group]) {
        categorizedFields[group] = {}
      }
      categorizedFields[group][key] = value
    })

    return categorizedFields
  }

  const groupedData = groupFields(data)

  // Format value based on its type
  const formatValue = (value, key) => {
    if (value === null || value === undefined) return '-'
    if (value instanceof Date) return value.toLocaleString()
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    if (typeof value === 'number' && key.toLowerCase().includes('amount')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value)
    }
    return String(value)
  }

  // Format key to be more readable
  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  return (
    <div className="rounded-md border bg-background p-4">
      <div className="grid gap-6">
        {Object.entries(groupedData).map(([groupName, fields]) => {
          if (Object.keys(fields).length === 0) return null

          return (
            <div key={groupName}>
              <h3 className="font-semibold mb-2">{groupName}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(fields).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-sm font-medium text-muted-foreground">
                      {formatKey(key)}
                    </div>
                    <div className="text-sm break-words">{formatValue(value, key)}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DataTable({
  columns,
  data,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  pageCount,
  pageIndex,
  pageSize,
  onPaginationChange,
  expanded,
  onExpandedChange,
  renderSubComponent,
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    onPaginationChange,
    onSortingChange,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange,
    manualSorting: true,
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    enableExpanding: true,
    state: {
      sorting,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
      expanded,
    },
    onExpandedChange,
  })

  return (
    <div>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="p-4 bg-muted/50">
                          <ExpandedRow row={row} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
