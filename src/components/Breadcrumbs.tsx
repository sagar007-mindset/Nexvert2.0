import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
  className?: string;
}

export default function Breadcrumbs({ items, onNavigate, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-1.5 text-xs text-slate-500 dark:text-zinc-400 overflow-x-auto py-1 ${className}`}
    >
      <a
        href="/"
        onClick={(e) => {
          if (onNavigate) {
            e.preventDefault();
            onNavigate('/');
          }
        }}
        className="inline-flex items-center gap-1 font-medium hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </a>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600 shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                onClick={(e) => {
                  if (onNavigate && item.href) {
                    e.preventDefault();
                    onNavigate(item.href);
                  }
                }}
                className="font-medium hover:text-red-600 dark:hover:text-red-400 transition-colors truncate max-w-[150px] shrink-0"
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
