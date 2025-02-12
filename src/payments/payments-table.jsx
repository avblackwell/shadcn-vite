import { useQuery } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { DataTable } from './data-table'
import { fetchPaymentsPage } from './mock-data'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react'
import { TableSkeleton, BulkActionBar } from '@/components/table/shared-components'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { PaymentDialog } from './payment-dialog'
import { TableHeader } from '@/components/table/table-header'

export function PaymentsTable() {
  const [sorting, setSorting] = useState([])
  const [selectedRows, setSelectedRows] = useState({
    ids: new Set(),
    data: {},
  })
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [expanded, setExpanded] = useState({})
  const [dialogState, setDialogState] = useState({
    open: false,
    payment: null,
    mode: 'edit',
  })

  const columns = [
    {
      id: 'select-expand',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="mr-2"
            />
            <button
              onClick={() => {
                const id = row.id
                setExpanded((old) => ({
                  ...old,
                  [id]: !old[id],
                }))
              }}
              className="p-1 text-primary hover:text-primary/80"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div className="w-[80px]">{row.original.id}</div>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        return <div className="w-[80px]">${row.original.amount.toFixed(2)}</div>
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <div className="w-[80px]">{row.original.status}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div className="min-w-[200px]">{row.original.email}</div>,
      enableHiding: true,
      // Hide on mobile, show on medium and up
      meta: {
        className: 'hidden md:table-cell',
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        return <div className="w-[100px]">{new Date(row.original.date).toLocaleDateString()}</div>
      },
      enableHiding: true,
      // Hide on mobile, show on large and up
      meta: {
        className: 'hidden lg:table-cell',
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const payment = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setDialogState({
                    open: true,
                    payment,
                    mode: 'view',
                  })
                }}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDialogState({
                    open: true,
                    payment,
                    mode: 'edit',
                  })
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setDialogState({
                    open: true,
                    payment,
                    mode: 'delete',
                  })
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const { data, isPending, isFetching } = useQuery({
    queryKey: ['payments', pageIndex, pageSize, sorting],
    queryFn: () => fetchPaymentsPage({ pageIndex, pageSize, sorting }),
    keepPreviousData: true,
    placeholderData: (previousData) => previousData,
  })

  const handleExpandedChange = (updatedExpanded) => {
    console.log('Expansion change handler:', {
      previous: expanded,
      updated: updatedExpanded,
    })
    setExpanded(updatedExpanded)
  }

  const handleRowSelectionChange = (updatedSelection) => {
    const newSelection =
      typeof updatedSelection === 'function' ? updatedSelection(tableSelection) : updatedSelection

    setSelectedRows((prev) => {
      const newIds = new Set(prev.ids)
      const newData = { ...prev.data }

      // Update selection based on current page data
      data.data.forEach((row) => {
        const id = row.id.toString()
        if (newSelection[id]) {
          newIds.add(id)
          newData[id] = row
        } else {
          newIds.delete(id)
          delete newData[id]
        }
      })

      return { ids: newIds, data: newData }
    })
  }

  const handlePaginationChange = (updater) => {
    setPagination((prev) => {
      return typeof updater === 'function' ? updater(prev) : updater
    })
  }

  const handleBulkDelete = useCallback(() => {
    const selectedItems = Array.from(selectedRows.ids)
    console.log('Deleting items:', selectedItems)
    // TODO: Implement actual delete logic
  }, [selectedRows.ids])

  const handleBulkEdit = useCallback(() => {
    const selectedItems = Array.from(selectedRows.ids)
    console.log('Editing items:', selectedItems)
    // TODO: Implement actual edit logic
  }, [selectedRows.ids])

  const handleDelete = useCallback(async (payment) => {
    // Implement your delete logic here
    console.log('Payment deleted:', payment.id)
    // Refresh the table data after delete
  }, [])

  const handleCreateNew = useCallback(() => {
    setDialogState({
      open: true,
      payment: {
        amount: 0,
        email: '',
        status: 'pending',
        date: new Date(),
      },
      mode: 'edit',
    })
  }, [])

  const renderSubComponent = useCallback(({ row }) => {
    const payment = row.original

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

    const groupedData = groupFields(payment)

    return (
      <div className="p-4">
        <div className="grid gap-4">
          {Object.entries(groupedData).map(([groupName, fields]) => {
            if (Object.keys(fields).length === 0) return null

            return (
              <div key={groupName} className="space-y-2">
                <h3 className="font-medium">{groupName}</h3>
                <div className="grid gap-1">
                  {Object.entries(fields).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 gap-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:
                      </span>
                      <span className="text-sm">
                        {value === null || value === undefined
                          ? '-'
                          : typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }, [])

  if (!data) return <TableSkeleton columnCount={6} />

  // Create selection state for the table
  const tableSelection = {}
  data.data.forEach((row) => {
    const id = row.id.toString()
    if (selectedRows.ids.has(id)) {
      tableSelection[id] = true
    }
  })

  return (
    <div className="space-y-4">
      <TableHeader title="Payments" onCreateNew={handleCreateNew} />
      {selectedRows.ids.size > 0 && (
        <BulkActionBar
          selectedCount={selectedRows.ids.size}
          onDelete={handleBulkDelete}
          onEdit={handleBulkEdit}
        />
      )}
      <DataTable
        data={data.data}
        columns={columns}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={tableSelection}
        onRowSelectionChange={handleRowSelectionChange}
        pageCount={data.pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        expanded={expanded}
        onExpandedChange={handleExpandedChange}
        renderSubComponent={renderSubComponent}
      />
      <PaymentDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
        payment={dialogState.payment}
        mode={dialogState.mode}
        onDelete={handleDelete}
      />
      {isFetching && (
        <div className="text-center py-2 text-sm text-muted-foreground">Loading new data...</div>
      )}
    </div>
  )
}
