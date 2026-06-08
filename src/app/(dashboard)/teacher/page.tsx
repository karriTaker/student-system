"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ questions: 0, students: 0, totalAnswers: 0 })

  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch("/api/questions", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(data => {
        if (data.questions) {
          setStats(prev => ({ ...prev, questions: data.questions.length }))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">教师楼盘应用程序</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-3xl font-bold text-blue-600">{stats.questions}</div>
          <div className="text-slate-500 text-sm mt-1">题目数量</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-3xl font-bold text-green-600">{stats.students}</div>
          <div className="text-slate-500 text-sm mt-1">学生数量</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="text-3xl font-bold text-amber-600">{stats.totalAnswers}</div>
          <div className="text-slate-500 text-sm mt-1">答题总数</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/teacher/questions/create" className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 transition">
          <h3 className="font-semibold text-lg mb-2">🤖 AI 自动出题</h3>
          <p className="text-slate-500 text-sm">指定语法点和难度，AI 自动生成练习题</p>
        </Link>
        <Link href="/teacher/questions" className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 transition">
          <h3 className="font-semibold text-lg mb-2">📝 题目管理</h3>
          <p className="text-slate-500 text-sm">查看、编辑、发布所有题目</p>
        </Link>
        <Link href="/teacher/students" className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 transition">
          <h3 className="font-semibold text-lg mb-2">👥 学生管理</h3>
          <p className="text-slate-500 text-sm">查看学生列表和答题进度</p>
        </Link>
      </div>
    </div>
  )
}
