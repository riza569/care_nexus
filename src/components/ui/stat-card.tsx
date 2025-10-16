import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  delay?: number;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  className,
  delay = 0,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className={cn(
        'group relative overflow-hidden rounded-xl bg-gradient-card p-6 shadow-soft transition-all hover:shadow-medium',
        className
      )}
    >
      {/* Background Gradient Orb */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-transform group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trendUp ? 'text-secondary' : 'text-destructive'
              )}
            >
              {trend}
            </p>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};
