import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export function TableHeader({ title, onCreateNew }) {
  return (
    <div className="flex items-center justify-between pb-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <Button onClick={onCreateNew}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New
      </Button>
    </div>
  )
}
