/* eslint-disable react-refresh/only-export-components */
import type React from 'react';

// --- Table ---

export const CleanTable = ({
    headers,
    children,
}: {
    headers: string[];
    children: React.ReactNode;
}) => (
    <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left tabular-nums">
            <thead>
                <tr className="border-b border-stone-200/40">
                    {headers.map((h, i) => (
                        <th
                            key={h}
                            className={`rail-label px-6 py-4 ${i === headers.length - 1 ? 'text-right' : ''}`}
                        >
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">{children}</tbody>
        </table>
    </div>
);

// CleanTableBody is a passthrough - CleanTable already wraps in <tbody>.
// Kept for API compatibility with consumers that imported it.
export const CleanTableBody = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const CleanTableRow = ({
    children,
    className = '',
    onClick,
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) => (
    <tr
        onClick={onClick}
        className={`${onClick ? 'cursor-pointer hover:bg-stone-50/40' : ''} group transition-colors ${className}`}
    >
        {children}
    </tr>
);

export interface CleanTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    children: React.ReactNode;
    isHeader?: boolean;
    align?: 'left' | 'center' | 'right';
}

export const CleanTableCell = ({
    children,
    className = '',
    isHeader,
    align,
    ...props
}: CleanTableCellProps) => {
    const alignClass =
        align === 'right' ? 'text-right'
        : align === 'center' ? 'text-center'
        : '';
    const Tag = isHeader ? 'th' : 'td';
    return (
        <Tag
            className={`px-6 py-4 text-sm ${alignClass} ${isHeader ? 'rail-label' : ''} ${className}`}
            {...props}
        >
            {children}
        </Tag>
    );
};
