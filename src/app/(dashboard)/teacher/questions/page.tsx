"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function TeacherQuestions() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  function loadQuestions() {
    const token = localStorage.getItem("token")
    fetch("/api/questions?published=false", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(data => { setQuestions(data.questions || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  async function togglePublish(id: string, current: boolean) {
    const token = localStorage.getItem("token")
    await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ id, published: !current })
    })
    loadQuestions()
  }

  useEffect(() => { loadQuestions() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">题目管理</h1>
        <Link href="/teacher/questions/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + 新建题目
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          暂无题目，请<a href="/teacher/questions/create" className="text-blue-600 hover:underline"> 创建新题目</a>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q: any) => (
            <div key={q.id} className="bg-white p-4 rounded-lg border border-slate-200 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={"text-xs px-2 py-0.5 rounded " + (
                    q.type === "MULTIPLE_CHOICE" ? "bg-blue-100 text-blue-700" :
                    q.type === "FILL_BLANK" ? "bg-green-100 text-green-700" :
                    q.type === "TRANSLATION" ? "bg-purple-100 text-purple-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {q.type === "MULTIPLE_CHOICE" ? "选择题" : q.type === "FILL_BLANK" ? "填空题" : q.type === "TRANSLATION" ? "翻译题" : "判断题"}
                  </span>
                  <span className="text-xs text-slate-400">HSK {q.difficulty}</span>
                  {q.grammarPoint && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{q.grammarPoint}</span>}
                  <span className={"text-xs px-2 py-0.5 rounded " + (q.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}>
                    {q.published ? "已发布" : "草稿"}
                  </span>
                </div>
                <p className="text-slate-800">{q.question}</p>
              </div>
              <button onClick={() => togglePublish(q.id, q.published)}
                className={"ml-4 px-3 py-1 text-xs rounded " + (q.published ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-green-100 text-green-700 hover:bg-green-200")}>
                {q.published ? "取消发布" : "发布"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
