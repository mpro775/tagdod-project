export function CartLoadingState() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm border border-gray-100 dark:border-white/5 animate-pulse"
          >
            <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-white/10 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10" />
                  <div className="w-8 h-8 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10" />
                </div>
                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-1">
        <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm border border-gray-100 dark:border-white/5 p-5 animate-pulse">
          <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-1/2 mb-4" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
            </div>
            <div className="border-t border-gray-100 dark:border-white/10 pt-3 flex justify-between">
              <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
              <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
            </div>
          </div>
          <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl mt-5" />
        </div>
      </div>
    </div>
  )
}
