interface PageHeaderProps {
    title: string;
    description: string;
    children?: React.ReactNode;
}

/**
 * Consistent page header with title and description.
 * Optional children slot for action buttons on the right.
 */
export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children && <div className="shrink-0">{children}</div>}
        </div>
    );
}
