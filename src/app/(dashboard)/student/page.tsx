"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, correct: 0, answered: 0 })

  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch("/api/auth/me", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(async (data) => {
        if (data.user) setUser(data.user)
      })

    fetch("/api/answers", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(data => {
        if (data.answers) {
          const correct = data.answers.filter((a: any) => a.isCorrect).length
          setStats({ total: data.answers.length, correct, answered: data.answers.length })
        }
      })
      .catch(() => {})
  }, [])

  const accuracy = stats.total > 0 ? Math.round(stats.correct / stats.total * 100) : 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{user?.name}，欢迎回来！</h1>
      <p className="text-slate-500 mb-6">今天也要加油练习哦~</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-slate-500 text-sm mt-1">已答题数</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-3xl font-bold text-green-600">{stats.correct}</div>
          <div className="text-slate-500 text-sm mt-1">正确数</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-3xl font-bold text-amber-600">{accuracy}%</div>
          <div className="text-slate-500 text-sm mt-1">正确率</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/student/practice" className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 transition">
          <h3 className="font-semibold text-lg mb-2">📘 开始练习</h3>
          <p className="text-slate-500 text-sm">从所有发布的题目中随机练习</p>
        </Link>
        <Link href="/student/history" className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 transition">
          <h3 className="font-semibold text-lg mb-2">📊 练习记录</h3>
          <p className="text-slate-500 text-sm">查看答题历史和错题</p>
        </Link>
      </div>
    </div>
  )
}
