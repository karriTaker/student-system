"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    var token = localStorage.getItem("token")
    if (!token) { setLoading(false); return }
    fetch("/api/auth/me", { headers: { Authorization: "Bearer " + token } })
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.user) {
          if (data.user.role === "TEACHER") router.push("/teacher")
          else router.push("/student")
        }
      })
      .catch(function() { })
      .finally(function() { setLoading(false) })
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl font-bold mb-4 text-slate-800">中文学习</h1>
        <p className="text-xl text-slate-500 mb-2">为越南学生设计的中文练习平台</p>
        <p className="text-base text-slate-400 mb-10">Học tiếng Trung – Luyện tập thông minh</p>
        <div className="flex gap-4">
          <a href="/login" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">登录</a>
          <a href="/register" className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition">注册</a>
        </div>
      </header>
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-3xl mb-3">🤓</div>
            <h3 className="text-lg font-semibold mb-2">AI 自动出题</h3>
            <p className="text-slate-500 text-sm">老师指定语法点，AI 自动生成练习题，每次都不一样</p>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl mb-3">📖</div>
            <h3 className="text-lg font-semibold mb-2">多种题型</h3>
            <p className="text-slate-500 text-sm">选择题、填空题、翻译题、判断题，全面提升语言能力</p>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">学习跟踪</h3>
            <p className="text-slate-500 text-sm">学生的答题记录、错题本、进步趋势一目了然</p>
          </div>
        </div>
      </section>
    </div>
  )
}
