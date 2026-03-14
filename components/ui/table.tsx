import React from "react"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className = "", ...props }, ref) => {
  // Filter out non-standard boolean attributes
  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(([key, value]) => {
      if (typeof value === 'boolean') return false;
      return true;
    })
  );
  
  return (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={`w-full caption-bottom text-sm ${className}`}
        {...filteredProps}
      />
    </div>
  );
})
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => {
  // Filter out non-standard boolean attributes
  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(([key, value]) => {
      if (typeof value === 'boolean') return false;
      return true;
    })
  );
  
  return (
    <thead ref={ref} className={`border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 ${className}`} {...filteredProps} />
  );
})
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => {
  // Filter out non-standard boolean attributes
  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(([key, value]) => {
      if (typeof value === 'boolean') return false;
      return true;
    })
  );
  
  return (
    <tbody ref={ref} className={`[&_tr:last-child]:border-0 ${className}`} {...filteredProps} />
  );
})
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => {
  // Filter out non-standard boolean attributes
  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(([key, value]) => {
      if (typeof value === 'boolean') return false;
      return true;
    })
  );
  
  return (
    <tfoot
      ref={ref}
      className={`border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-medium ${className}`}
      {...filteredProps}
    />
  );
})
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className = "", ...props }, ref) => {
  // Filter out non-standard boolean attributes
  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(([key, value]) => {
      if (typeof value === 'boolean') return false;
      return true;
    })
  );
  
  return (
    <tr
      ref={ref}
      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${className}`}
      {...filteredProps}
    />
  );
})
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => {
  // Filter out non-standard boolean attributes
  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(([key, value]) => {
      if (typeof value === 'boolean') return false;
      return true;
    })
  );
  
  return (
    <th
      ref={ref}
      className={`h-12 px-4 text-right align-middle font-semibold text-gray-700 dark:text-gray-300 [&:has([role=checkbox])]:pr-0 ${className}`}
      {...filteredProps}
    />
  );
})
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.HTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => {
  // Filter out non-standard boolean attributes
  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(([key, value]) => {
      // Keep standard HTML attributes and non-boolean values
      if (typeof value === 'boolean') return false;
      return true;
    })
  );
  
  return (
    <td
      ref={ref}
      className={`px-4 py-3 align-middle text-gray-600 dark:text-gray-400 [&:has([role=checkbox])]:pr-0 ${className}`}
      {...filteredProps}
    />
  );
})
TableCell.displayName = "TableCell"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
}
