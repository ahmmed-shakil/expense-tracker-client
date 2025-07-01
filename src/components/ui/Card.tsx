import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  actions,
}) => {
  const cardClasses = [
    "bg-white rounded-lg shadow-md border border-gray-200",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
        </div>
      )}
      <div className={title || actions ? "px-6 py-4" : "p-6"}>{children}</div>
    </div>
  );
};
