import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }: CardProps) => {
  return <div className={cn('px-6 py-4 border-b border-gray-200', className)}>{children}</div>;
};

export const CardContent = ({ children, className }: CardProps) => {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
};

export const CardFooter = ({ children, className }: CardProps) => {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between', className)}>
      {children}
    </div>
  );
};
