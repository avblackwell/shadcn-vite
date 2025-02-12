import { Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

export function TableSkeleton({ columnCount = 6, rowCount = 10 }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columnCount }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-6 w-[100px]" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: columnCount }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function BulkActionBar({ selectedCount, onDelete, onEdit }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <span className="text-sm text-muted-foreground">
        {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <Button variant="outline" size="sm" onClick={onDelete} className="h-8 px-2 lg:px-3">
        <Trash2 className="h-4 w-4" />
        <span className="ml-2 hidden lg:inline">Delete</span>
      </Button>
      <Button variant="outline" size="sm" onClick={onEdit} className="h-8 px-2 lg:px-3">
        <Edit className="h-4 w-4" />
        <span className="ml-2 hidden lg:inline">Edit</span>
      </Button>
    </div>
  )
}
