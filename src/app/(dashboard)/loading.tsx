export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8 animate-pulse">
      {/* Hero skeleton */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 pb-2 sm:pb-4">
        <div className="space-y-3">
          <div className="h-3 w-32 bg-surface-container-highest rounded-full" />
          <div className="h-8 w-56 bg-surface-container-highest rounded-lg" />
        </div>
        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none px-6 py-3 bg-surface-container-high rounded-xl h-16 w-28" />
          <div className="flex-1 sm:flex-none px-6 py-3 bg-surface-container-high rounded-xl h-16 w-28" />
        </div>
      </section>

      {/* Bento grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="sm:col-span-2 lg:col-span-8 bg-surface-container-high rounded-xl h-72" />
        <div className="sm:col-span-2 lg:col-span-4 bg-surface-container-high rounded-xl h-72" />
        <div className="sm:col-span-2 lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-high rounded-xl h-44" />
          ))}
        </div>
      </div>

      {/* Banner skeleton */}
      <div className="h-32 sm:h-48 bg-surface-container-high rounded-xl" />
    </div>
  );
}
