'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LogIn, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'


export default function Home() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogInfo, setDialogInfo] = useState({
    success: false,
    message: '',
    title: ''
  })
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Clear all inputs on page load/refresh
  useEffect(() => {
    // Check if user is already logged in
    const userEmail = localStorage.getItem('userEmail')
    if (userEmail) {
      router.push('/home')
      return
    }
    
    setEmail('')
    setPassword('')
    setCode(['', '', '', '', '', ''])
    setShowPassword(false)
    setErrors({ email: '', password: '' })
    setLoginMethod('email')
  }, [router])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newErrors = { email: '', password: '' }

    if (!email) {
      newErrors.email = 'تکایە ئیمەیڵەکەت بنووسە'
    }
    if (!password) {
      newErrors.password = 'تکایە وشەی نهێنی بنووسە'
    }

    setErrors(newErrors)

    if (email && password) {
      setLoading(true)
      try {
        // Get the current host to build full URL
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
        const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
        const apiUrl = `${protocol}//${host}/api/login`;
        
        console.log('Sending login request to:', apiUrl);
        console.log('Email:', email, 'Password length:', password.length);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim(), password: password.trim() }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId);
        const data = await response.json()

        if (response.ok && data.success) {
          // Store user email and login method
          localStorage.setItem('userEmail', data.user.email)
          localStorage.setItem('loginMethod', 'email')
          
          setDialogInfo({
            success: true,
            message: `بەخێر هاتی ${data.user.email}`,
            title: 'سەرکەوتووبوو'
          })
          setEmail('')
          setPassword('')
          setTimeout(() => {
            router.push('/home')
          }, 1500)
        } else {
          setDialogInfo({
            success: false,
            message: data.message || 'خرابی بڕوانامە',
            title: 'هەڵەیە'
          })
        }
        setDialogOpen(true)
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          setDialogInfo({
            success: false,
            message: 'وەقت کێشە بینی - تێبینیکە سێرڤەر پاشگێڕ',
            title: 'هەڵەیە'
          })
        } else {
          console.error('Login error:', error);
          setDialogInfo({
            success: false,
            message: 'خرابی پەیوەندیکردن بە سێرڤەر - دووبارە هەوڵ بدە',
            title: 'هەڵەیە'
          })
        }
        setDialogOpen(true)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSubmitCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fullCode = code.join('')

    if (fullCode.length !== 6) {
      setDialogInfo({
        success: false,
        message: 'تکایە هەموو کودەکان بنووسە',
        title: 'هەڵەیە'
      })
      setDialogOpen(true)
      return
    }

    setLoading(true)
    try {
      // Get the current host to build full URL
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
      const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
      const apiUrl = `${protocol}//${host}/api/verify-code`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: fullCode }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId);
      const data = await response.json()

      if (response.ok && data.success) {
        // Store login method for code-based login
        localStorage.setItem('userEmail', 'Code Login')
        localStorage.setItem('loginMethod', 'code')
        
        setDialogInfo({
          success: true,
          message: ' چونە ژوورەوە سەرکەوتوو بوو',
          title: 'سەرکەوتوو بوو'
        })
        setCode(['', '', '', '', '', ''])
        setTimeout(() => {
          router.push('/home')
        }, 1500)
      } else {
        setDialogInfo({
          success: false,
          message: data.message || 'خرابی کۆد',
          title: 'هەڵەیە'
        })
        setCode(['', '', '', '', '', ''])
      }
      setDialogOpen(true)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setDialogInfo({
          success: false,
          message: 'وەقت کێشە بینی - تێبینیکە سێرڤەر پاشگێڕ',
          title: 'هەڵەیە'
        })
      } else {
        console.error('Code login error:', error);
        setDialogInfo({
          success: false,
          message: 'خرابی پەیوەندیکردن بە سێرڤەر - دووبارە هەوڵ بدە',
          title: 'هەڵەیە'
        })
      }
      setDialogOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-screen overflow-hidden flex flex-col md:flex-row bg-white">
      <div className="hidden md:flex w-full md:w-[47%] h-1/4 md:h-screen relative overflow-hidden">
      <Image
        src="/images/f.jpg"
        alt="Hello Image"
        width={200}
        height={200}
        quality={100}
        priority
        className="w-full h-full object-cover font-sirwan scale-100 bg-black"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/20 via-transparent to-black/20"></div>
      <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent"></div>
      <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8">
        <div className="mr-4 md:mr-8 px-3 py-2 md:px-4 md:py-2 backdrop-blur-2xl bg-white/15 border border-white/30 rounded-lg md:rounded-xl shadow-xl hover:bg-white/25 transition duration-300 font-sirwan">
          <p className="text-white text-xs md:text-xs tracking-wide drop-shadow-lg text-center">
                ئێمە لێرەین بۆ پێشکەشکردنی بەرزترین کوالێتی و چارەسەر ، بە گەرەنتییەکی تەواو و هەمیشەیی بۆ ئەوەی خەندەیەکی تەندروست و بێ وێنەت پێ ببەخشینـــ   
          </p>
        </div>
      </div>
      </div>
      <div className="w-full md:w-[53%] min-h-screen md:h-screen flex flex-col items-center justify-between bg-white md:bg-linear-to-br md:from-slate-50 md:to-slate-100 font-sirwan px-0 md:p-0">
        <div className="w-full flex-1 flex items-center justify-center px-6 py-8 md:px-8" dir="rtl">
          <div className="w-full md:h-auto md:max-w-md flex flex-col items-center justify-center text-center md:text-right">
          <div className="mb-6 md:mb-10 w-full">
            <h1 className="text-4xl md:text-4xl font-bold mb-2 text-center font-sirwan">
             <span className="text-[#219ebc]">بەخێربێیت</span> <span className="text-gray-800">👋</span>
            </h1>
            <p className="text-center text-gray-600 text-sm md:text-sm font-sirwan">تەندروستی ددانتان ، خەندەی ئێمەیە </p>
           
          </div>
          {/* Email & Password Login Form */}
          {loginMethod === 'email' && (
            <form onSubmit={handleSubmitEmail} className="space-y-4 md:space-y-5 w-full md:w-96" dir="rtl">
              <div>
                <label className="block text-gray-700 text-md:text-sm font-semibold mb-2 md:mb-3 mr-2 md:mr-2 font-sirwan pointer-events-none text-right">
                  ئیمەیڵ
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ئیمەیڵەکەت بنووسە"
                  className="w-full px-4 md:px-5 py-2 md:py-3 text-base md:text-sm border-0 rounded-xl bg-white/90 shadow-[0_0_0_1.5px_rgba(33,158,188,0.3)] hover:shadow-[0_0_0_1.5px_rgba(33,158,188,0.5),0_0_8px_rgba(33,158,188,0.2)] focus:shadow-[0_0_0_2px_rgba(26,127,163,0.8),0_0_10px_rgba(33,158,188,0.25)] focus:outline-none transition duration-300 font-sirwan text-right"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1 font-sirwan text-right">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-gray-700 text-md:text-sm font-semibold mb-2 md:mb-3 mr-2 md:mr-2 font-sirwan pointer-events-none text-right">
                  وشەی نهێنی
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="وشەی نهێنی بنووسە"
                    className="w-full px-4 md:px-5 py-2 md:py-3 text-base md:text-sm border-0 rounded-xl bg-white/90 shadow-[0_0_0_1.5px_rgba(33,158,188,0.3)] hover:shadow-[0_0_0_1.5px_rgba(33,158,188,0.5),0_0_8px_rgba(33,158,188,0.2)] focus:shadow-[0_0_0_2px_rgba(26,127,163,0.8),0_0_10px_rgba(33,158,188,0.25)] focus:outline-none transition duration-300 font-sirwan text-right pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-[#219ebc] transition duration-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm mt-1 font-sirwan text-right">{errors.password}</p>}
              </div>
              <Button 
                type="submit"
                disabled={loading}
                className="w-full mt-8 md:mt-8 bg-[#219ebc] hover:bg-[#1a7fa3] text-white font-bold py-6 md:py-7 text-sm md:text-base rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center gap-2 font-sirwan disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                size="lg"
              >
                <LogIn size={20} className="md:w-5 md:h-5" />
                {loading ? 'چاوەڕێ بکە...' : 'چوونە ژوورەوە'}
              </Button>
            </form>
          )}

          {/* 6-Digit Code Login Form */}
          {loginMethod === 'code' && (
            <form onSubmit={handleSubmitCode} className="space-y-8 w-full md:w-[600px]" dir="rtl">
              {/* Code Login Header with Icon */}
              <div className="text-center space-y-3 md:space-y-4 pb-2 md:pb-4">
                <div className="flex justify-center">
                  <div className="p-3 md:p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full">
                    <Shield size={32} className="text-[#219ebc]" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-sirwan">چونەژوورەوە بە کۆد</h2>
                <p className="text-gray-600 text-sm md:text-base font-sirwan">کۆدی 6 ژمارەی تایبەت بنووسە</p>
              </div>
              
              {/* Code Input Section */}
              <div className="space-y-5">
                {/* 6-Digit Input Boxes */}
                <div className="flex justify-center gap-2 md:gap-3 flex-row-reverse">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      maxLength={1}
                      className="w-14 h-14 md:w-16 md:h-16 text-center text-2xl md:text-3xl font-bold border-2 border-[#219ebc]/30 rounded-lg md:rounded-xl bg-white/95 hover:border-[#219ebc]/60 focus:border-[#219ebc] focus:outline-none focus:ring-2 focus:ring-[#219ebc]/30 transition duration-300 transform hover:scale-105 focus:scale-110"
                      inputMode="numeric"
                      placeholder="•"
                    />
                  ))}
                </div>
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#219ebc] hover:bg-[#1a7fa3] text-white font-bold py-6 md:py-7 text-sm md:text-base rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center gap-2 font-sirwan disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                size="lg"
              >
                <LogIn size={20} className="md:w-5 md:h-5" />
                {loading ? 'دڵنیابوونەوە...' : 'چوونە ژوورەوە'}
              </Button>
            </form>
          )}
          <div className="mt-6 md:mt-8 text-right pl-2 md:pr-16">
            <p className="text-gray-600 text-xs md:text-sm font-sirwan">
              {loginMethod === 'email' ? 'هەژمارت نیە؟' : ' هەژمارت هەیە؟'}{' '}
              <button
                onClick={() => setLoginMethod(loginMethod === 'email' ? 'code' : 'email')}
                className="text-[#219ebc] font-semibold underline hover:text-[#1a7fa3] hover:no-underline transition duration-300 cursor-pointer active:scale-95"
              >
                {loginMethod === 'email' ? 'چونەژوورەوە لەڕێگای کۆدی تایبەتەوە' : ' چونەژوورەوە لەڕێگای ئیمەیڵی تایبەتەوە '}
              </button>
            </p>
          </div>
          </div>
        </div>
        
        <div className="w-full flex flex-row items-center justify-center gap-1 pb-2 md:pb-2">
          <p className='text-gray-500 text-xs md:text-sm font-sirwan'>
            Designed and developed by <a href="https://www.facebook.com/mahamad.khdir.104" target="_blank" rel="noopener noreferrer" className="font-bold underline text-gray-500 hover:text-blue-600">Hama Sah</a>
          </p>
          
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[90vw] max-w-xs sm:max-w-md p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-300 md:duration-500 ease-out">
          <DialogHeader>
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              {dialogInfo.success ? (
                <CheckCircle className="w-10 h-10 sm:w-16 sm:h-16 text-green-500 animate-in pulse duration-700" />
              ) : (
                <AlertCircle className="w-10 h-10 sm:w-16 sm:h-16 text-red-500 animate-in shake duration-500" />
              )}
            </div>
            <DialogTitle className="text-center text-lg sm:text-2xl font-sirwan">{dialogInfo.title}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center text-sm sm:text-base font-sirwan py-2 sm:py-4">
            {dialogInfo.message}
          </DialogDescription>
          <div className="flex justify-center mt-3 sm:mt-4">
            <Button
              onClick={() => setDialogOpen(false)}
              className="bg-[#219ebc] hover:bg-[#1a7fa3] text-white font-sirwan text-sm transition-all duration-300 hover:scale-105 active:scale-95"
            >
              باشە
            </Button>
          </div>
        </DialogContent>
      </Dialog>
   </main>
  );
}
