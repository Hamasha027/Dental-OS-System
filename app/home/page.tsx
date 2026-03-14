'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Home, Users, FileText, Settings, X, Logs, Moon, Sun, Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useThemeMode } from '@/lib/useTheme'

export default function HomePage() {
  const router = useRouter()
  const { theme, setTheme, mounted } = useThemeMode()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [loginMethod, setLoginMethod] = useState('')
  const [activeMenu, setActiveMenu] = useState('داشبۆرد')
  const [searchQuery, setSearchQuery] = useState('')
  const [patients, setPatients] = useState<any[]>([])
  const [patientsLoading, setPatientsLoading] = useState(false)

  useEffect(() => {
    // Get user email and login method from localStorage
    const email = localStorage.getItem('userEmail') || ''
    const method = localStorage.getItem('loginMethod') || ''
    setUserEmail(email)
    setLoginMethod(method)
  }, [])

  useEffect(() => {
    // Fetch patients when activeMenu is set to patients section
    if (activeMenu === 'نەخۆشەکان') {
      fetchPatients()
    }
  }, [activeMenu])

  const fetchPatients = async () => {
    try {
      setPatientsLoading(true)
      const response = await fetch('/api/patients')
      const data = await response.json()
      
      if (data.success) {
        setPatients(data.data)
      }
    } catch (err) {
      console.error('Error fetching patients:', err)
    } finally {
      setPatientsLoading(false)
    }
  }

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) {
    return null
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Clear localStorage
        localStorage.removeItem('userEmail');
        localStorage.removeItem('loginMethod');
        
        // Redirect to login
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if API call fails
      router.push('/');
    }
  }

  const menuItems = [
    { label: 'داشبۆرد', icon: Home },
    { label: 'نەخۆشەکان', icon: Users, href: '/patients' },
    { label: 'قیستەکانی تەلی ددان', icon: FileText, href: '/invoices' },
    { label: 'وادەی چاوپێکەوتن', icon: Settings, href: '/appointments' },
    { label: 'خزمەتگوزارییەکان', icon: Home, href: '/services' },
    { label: 'ڕاپۆرتی دارایی', icon: FileText, href: '/reports' },
    { label: 'ڕێکخستن', icon: Settings, href: '/settings' },
  ]

  return (
    <div className="flex h-screen bg-white dark:bg-black font-sirwan" dir="rtl">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 h-full w-64 bg-white dark:bg-black shadow-xl flex flex-col transition-transform duration-300 z-50 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-black flex items-center justify-between bg-white dark:bg-black">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          >
            <X size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3498db] dark:text-blue-400 font-sirwan">Dr.hama</h1>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeMenu === item.label
            return (
              <button
                key={index}
                onClick={() => {
                  if (item.href) {
                    router.push(item.href)
                  } else {
                    setActiveMenu(item.label)
                  }
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-sirwan relative group ${
                  activeMenu === item.label
                    ? 'bg-[#3498db]/10 text-[#3498db] border-r-4 border-[#3498db] shadow-sm dark:bg-[#3498db]/20 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                }`}
              >
                {/* Icon */}
                <Icon size={22} className={`${isActive ? 'text-[#3498db]' : 'group-hover:translate-x-1'} transition-all duration-300`} />
                
                {/* Label */}
                <div className="flex items-center gap-2 flex-1">
                  <span className={`text-sm font-medium line-clamp-1 ${isActive ? 'font-semibold text-[#3498db]' : ''}`}>
                    {item.label}
                  </span>

                </div>
              </button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-black bg-white dark:bg-black">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-sirwan border-2 border-red-500/40 dark:border-red-600/40 bg-red-600/5 dark:bg-red-600/8 hover:bg-red-600/10 dark:hover:bg-red-600/15 hover:border-red-500/60 dark:hover:border-red-600/60 text-red-600 dark:text-red-500 font-semibold text-sm transition-all duration-300 group"
          >
            <LogOut size={18} className="text-red-600 dark:text-red-500 group-hover:scale-110 transition-transform duration-300" />
            <span>چوونە دەرەوە</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-black dark:border-white/20">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Left: Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#3498db]/10 rounded-lg transition duration-300"
            >
              <Logs size={24} className="text-gray-800 dark:text-white" />
            </button>

           

            {/* Right: Dark Mode & Doctor Profile */}
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

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto bg-[#f8f9fa] dark:bg-black text-gray-900 dark:text-gray-100">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white font-sirwan">داشبۆرد</h1>
        </div>
      </main>
    </div>
  )
}
