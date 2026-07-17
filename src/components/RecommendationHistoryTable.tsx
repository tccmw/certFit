import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'

import type { RecommendationRun } from '../types'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

const columnHelper = createColumnHelper<RecommendationRun>()

const columns = [
  columnHelper.accessor('created_at', {
    header: ({ column }) => <SortableHeader label="진단 일시" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />,
    cell: ({ getValue }) => new Date(getValue()).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' }),
  }),
  columnHelper.accessor((run) => run.profile_snapshot.target_field, {
    id: 'target_field',
    header: ({ column }) => <SortableHeader label="목표 분야" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />,
  }),
  columnHelper.accessor((run) => run.profile_snapshot.interested_role, {
    id: 'interested_role',
    header: ({ column }) => <SortableHeader label="관심 직무" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />,
  }),
  columnHelper.accessor((run) => run.items[0]?.certificate.name ?? '-', {
    id: 'top_recommendation',
    header: '최상위 추천',
    cell: ({ getValue }) => <span className="font-semibold text-foreground">{getValue()}</span>,
  }),
]

export function RecommendationHistoryTable({ data }: { data: RecommendationRun[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }])
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="mt-3 overflow-hidden rounded-md border border-border">
      <Table className="min-w-[680px]">
        <TableHeader className="bg-muted/60">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell className="h-24 text-center text-muted-foreground" colSpan={columns.length}>
                추천 기록이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function SortableHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" className="-ml-3 h-8 text-xs" onClick={onClick}>
      {label}
      <ArrowUpDown size={13} />
    </Button>
  )
}
