'use client';

import { trpc } from '@/trpc/client';
import { useState } from 'react';

export function ForecastChart() {
  const { data: forecast, isLoading } = trpc.features.getForecast.useQuery();

  if (isLoading) {
    return <div className="h-48 bg-surface-container-high rounded-xl animate-pulse" />;
  }

  if (!forecast || forecast.length === 0) return null;

  const maxCount = Math.max(1, ...forecast.map(d => d.count));

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-on-surface">
          Review Forecast
        </h3>
        <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Next 14 days</span>
      </div>

      <div className="flex items-end gap-1 sm:gap-2 h-32">
        {forecast.map((day, i) => {
          const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
          const isToday = i === 0;
          const date = new Date(day.date);
          const label = date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold text-primary whitespace-nowrap">
                {day.count}
              </div>
              {/* Bar */}
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  isToday
                    ? 'bg-gradient-to-t from-primary to-secondary shadow-lg shadow-primary/20'
                    : day.count > 0
                    ? 'bg-primary/40 group-hover:bg-primary/60'
                    : 'bg-surface-container-high'
                }`}
                style={{ height: `${Math.max(4, height)}%`, minHeight: '4px' }}
                title={`${day.date}: ${day.count} cards due`}
              />
              {/* Day label */}
              <span className={`text-[9px] font-medium ${isToday ? 'text-primary font-bold' : 'text-on-surface-variant/60'}`}>
                {isToday ? 'Today' : label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/10">
        <span className="text-xs text-on-surface-variant">
          <span className="font-bold text-on-surface">{forecast[0]?.count || 0}</span> cards due today
        </span>
        <span className="text-xs text-on-surface-variant">
          <span className="font-bold text-on-surface">{forecast.reduce((s, d) => s + d.count, 0)}</span> total upcoming
        </span>
      </div>
    </div>
  );
}
