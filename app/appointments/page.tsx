'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Home, Users, FileText, Settings, X, Logs, Moon, Sun, Plus } from 'lucide-react'
import { useState } from 'react'
import { useThemeMode } from '@/lib/useTheme'

export default function AppointmentsPage() {
  const router = useRouter()
  const { theme, setTheme, mounted } = useThemeMode()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      localStorage.removeItem('userEmail')
      localStorage.removeItem('loginMethod')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/')
    }
  }

  const menuItems = [
    { label: 'داشبۆرد', icon: Home, href: '/home' },
    { label: 'نەخۆشەکان', icon: Users, href: '/patients' },
    { label: 'قیستەکانی تەلی ددان', icon: FileText, href: '/invoices' },
    { label: 'وادەی چاوپێکەوتن', icon: Settings, href: '/appointments' },
    { label: 'خزمەتگوزارییەکان', icon: Home, href: '/services' },
    { label: 'ڕاپۆرتی دارایی', icon: FileText, href: '/reports' },
    { label: 'ڕێکخستن', icon: Settings, href: '/settings' },
  ]

  return (
    <div className="flex h-screen bg-white dark:bg-black font-sirwan" dir="rtl">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed right-0 top-0 h-full w-64 bg-white dark:bg-black shadow-xl flex flex-col transition-transform duration-300 z-50 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-black flex items-center justify-between bg-white dark:bg-black">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          >
            <X size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3498db] dark:text-blue-400 font-sirwan">Dr.hama</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={() => {
                  router.push(item.href)
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-sirwan text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <Icon size={22} />
                <span className="text-sm font-medium line-clamp-1">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-black bg-white dark:bg-black">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-sirwan border-2 border-red-500/40 dark:border-red-600/40 bg-red-600/5 dark:bg-red-600/8 hover:bg-red-600/10 dark:hover:bg-red-600/15 hover:border-red-500/60 dark:hover:border-red-600/60 text-red-600 dark:text-red-500 font-semibold text-sm transition-all duration-300"
          >
            <LogOut size={18} />
            <span>چوونە دەرەوە</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-black dark:border-white/20">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#3498db]/10 rounded-lg transition duration-300"
            >
              <Logs size={24} className="text-gray-800 dark:text-white" />
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition duration-300 transform hover:scale-110"
              >
                {theme === 'dark' ? (
                  <Sun size={22} />
                ) : (
                  <Moon size={22} className="text-gray-800" />
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto bg-[#f8f9fa] dark:bg-black text-gray-900 dark:text-gray-100">
          <p className="text-2xl font-bold text-gray-800 dark:text-white font-sirwan">وادەی چاوپێکەوتن</p>
        </div>
      </main>
    </div>
  )
}
