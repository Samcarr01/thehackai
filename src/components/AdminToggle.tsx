'use client'

import { useAdmin } from '@/contexts/AdminContext'

export default function AdminToggle() {
  const { adminViewMode, setAdminViewMode, isHydrated } = useAdmin()

  if (!isHydrated) {
    return (
      <div className="bg-slate-800/60 rounded-xl p-4 border border-white/10">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-32 mb-3"></div>
          <div className="h-10 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/60 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-medium text-gray-300 mb-3">
        🎭 Admin View Mode
      </h3>
      
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { mode: 'admin' as const, label: 'Admin', emoji: '👨‍💼', color: 'from-red-600 to-red-700' },
          { mode: 'free' as const, label: 'Free', emoji: '🆓', color: 'from-gray-600 to-gray-700' },
          { mode: 'pro' as const, label: 'Pro', emoji: '✨', color: 'from-purple-600 to-purple-700' },
          { mode: 'ultra' as const, label: 'Ultra', emoji: '🚀', color: 'from-pink-600 to-pink-700' },
        ].map((item) => (
          <button
            key={item.mode}
            onClick={() => {
              console.log('AdminToggle: Setting admin view mode to:', item.mode)
              setAdminViewMode(item.mode)
            }}
            className={`
              relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                adminViewMode === item.mode
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700 hover:text-white'
              }
            `}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-xs">{item.label}</span>
            </div>
            
            {adminViewMode === item.mode && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        Currently viewing as: <span className="text-white font-medium">{adminViewMode}</span>
      </div>
    </div>
  )
}