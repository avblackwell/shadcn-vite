export const mockPayments = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  amount: Math.floor(Math.random() * 10000) / 100,
  status: ['pending', 'processing', 'success', 'failed'][Math.floor(Math.random() * 4)],
  email: `user${i + 1}@example.com`,
  date: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
}))

export function fetchPaymentsPage({ pageIndex = 0, pageSize = 10, sorting = [] }) {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockPayments]

      // Apply sorting
      if (sorting.length) {
        const { id, desc } = sorting[0]
        filteredData.sort((a, b) => {
          if (desc) {
            return a[id] < b[id] ? 1 : -1
          }
          return a[id] > b[id] ? 1 : -1
        })
      }

      // Apply pagination
      const start = pageIndex * pageSize
      const end = start + pageSize
      const paginatedData = filteredData.slice(start, end)

      resolve({
        data: paginatedData,
        pageCount: Math.ceil(mockPayments.length / pageSize),
        totalRows: mockPayments.length,
      })
    }, 500) // 500ms delay to simulate network latency
  })
}
