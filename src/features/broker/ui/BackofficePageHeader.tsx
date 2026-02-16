import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface BackofficePageHeaderProps {
  title: string;
  backTo: string;
  backLabel: string;
  children?: ReactNode;
}

export function BackofficePageHeader({
  title,
  backTo,
  backLabel,
  children,
}: BackofficePageHeaderProps) {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        {backLabel}
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {children}
      </div>
    </div>
  );
}
