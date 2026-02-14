interface Tab {
  key: string
  label: string
  count?: number
}

interface CustomTabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
}

export function CustomTabBar({ tabs, activeTab, onTabChange }: CustomTabBarProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-white/10 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
            activeTab === tab.key
              ? 'text-primary'
              : 'text-tagadod-gray hover:text-tagadod-titles dark:hover:text-tagadod-dark-titles'
          }`}
        >
          <span>{tab.label}</span>
          {tab.count != null && (
            <span className={`ms-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.key
                ? 'bg-primary/10 text-primary'
                : 'bg-gray-100 dark:bg-white/10'
            }`}>
              {tab.count}
            </span>
          )}
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}
