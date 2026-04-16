'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon, trend, loading, className = '' }: StatCardProps) {
  return (
    <div className={`bg-surface-container-low p-4 sm:p-5 rounded-2xl ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>}
        <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{label}</p>
      </div>
      {loading ? (
        <div className="h-6 w-16 bg-surface-container-high rounded animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-2">
          <p className="text-xl sm:text-2xl font-black text-on-surface">{value}</p>
          {trend && <span className="text-xs font-bold text-primary">{trend}</span>}
        </div>
      )}
    </div>
  );
}
