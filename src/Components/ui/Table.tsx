import React, { ReactNode } from "react";

export const Table = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full bg-white divide-y divide-gray-200">
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <thead className={`bg-gray-50 border-b border-gray-200 ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = "", onClick }: { children: ReactNode, className?: string, onClick?: () => void }) => (
  <tr 
    className={`${onClick ? "cursor-pointer hover:bg-gray-50" : "hover:bg-gray-50"} ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <th className={`px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <td className={`px-4 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`}>
    {children}
  </td>
);
