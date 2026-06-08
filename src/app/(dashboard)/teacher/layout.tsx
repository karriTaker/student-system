"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetch("/api/auth/me", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(data => {
        if (!data.user || data.user.role !== "TEACHER") { router.push("/login"); return }
        setUser(data.user)
      })
      .catch(() => router.push("/login"))
  }, [router])

  function logout() {
    localStorage.removeItem("token")
    router.push("/")
  }

  if (!user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="min-h-screen flex">
      <nav className="w-56 bg-slate-900 text-white p-6 flex flex-col">
        <h2 className="text-lg font-bold mb-6">中文学习</h2>
        <p className="text-sm text-slate-400 mb-6">{user.name} · 教师</p>
        <div className="space-y-2 flex-1">
          <Link href="/teacher" className="block px-3 py-2 rounded hover:bg-slate-800 text-sm">楼盘应用程序</Link>
          <Link href="/teacher/questions" className="block px-3 py-2 rounded hover:bg-slate-800 text-sm">题目管理</Link>
          <Link href="/teacher/students" className="block px-3 py-2 rounded hover:bg-slate-800 text-sm">学生管理</Link>
        </div>
        <button onClick={logout} className="text-sm text-slate-400 hover:text-white mt-6 text-left">退出登录</button>
      </nav>
      <main className="flex-1 p-8 bg-slate-50">{children}</main>
    </div>
  )
}
