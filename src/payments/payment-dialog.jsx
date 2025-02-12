import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const formSchema = z.object({
  amount: z.coerce
    .number()
    .min(0, 'Amount must be greater than 0')
    .max(1000000, 'Amount must be less than 1,000,000'),
  email: z.string().email('Invalid email address'),
  status: z.enum(['pending', 'processing', 'success'], {
    required_error: 'Please select a status',
  }),
  date: z.date({
    required_error: 'A date is required',
  }),
})

export function PaymentDialog({ open, onOpenChange, payment, mode = 'edit', onDelete }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: payment?.amount ?? 0,
      email: payment?.email ?? '',
      status: payment?.status ?? 'pending',
      date: payment?.date ? new Date(payment.date) : new Date(),
    },
    values: payment
      ? {
          amount: payment.amount,
          email: payment.email,
          status: payment.status,
          date: new Date(payment.date),
        }
      : undefined,
  })

  useEffect(() => {
    if (payment) {
      form.reset({
        amount: payment.amount,
        email: payment.email,
        status: payment.status,
        date: new Date(payment.date),
      })
    }
  }, [form, payment])

  const onSubmit = async (data) => {
    console.log('Form submitted:', data)
    // TODO: Implement your save/update logic here
    onOpenChange(false)
  }

  const handleDelete = async () => {
    console.log('Deleting payment:', payment?.id)
    // TODO: Implement your delete logic here
    onDelete?.(payment)
    onOpenChange(false)
  }

  // If mode is delete, show delete confirmation dialog
  if (mode === 'delete') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this payment? This action cannot be undone.
            </p>
            {payment && (
              <div className="mt-4 space-y-1">
                <p className="text-sm font-medium">Payment Details:</p>
                <p className="text-sm text-muted-foreground">Amount: ${payment.amount}</p>
                <p className="text-sm text-muted-foreground">Email: {payment.email}</p>
                <p className="text-sm text-muted-foreground">
                  Date: {format(new Date(payment.date), 'PPP')}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Regular edit/view dialog
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          form.reset()
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Payment' : 'View Payment'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" disabled={mode === 'view'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" disabled={mode === 'view'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    disabled={mode === 'view'}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                          disabled={mode === 'view'}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={mode === 'view'}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              {mode !== 'view' && <Button type="submit">Save changes</Button>}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
