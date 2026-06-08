"use client"

import { useEffect, useState } from "react"

export default function HistoryPage() {
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch("/api/answers", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(data => { setAnswers(data.answers || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const correct = answers.filter(a => a.isCorrect).length
  const accuracy = answers.length > 0 ? Math.round(correct / answers.length * 100) : 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">练习记录</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{answers.length}</div>
          <div className="text-xs text-slate-500">总答题</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <div className="text-2xl font-bold text-green-600">{correct}</div>
          <div className="text-xs text-slate-500">正确</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <div className="text-2xl font-bold text-amber-600">{accuracy}%</div>
          <div className="text-xs text-slate-500">正确率</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : answers.length === 0 ? (
        <div className="text-center py-12 text-slate-400">还没有练习记录，去<a href="/student/practice" className="text-blue-600 hover:underline"> 练习</a>吧</div>
      ) : (
        <div className="space-y-2">
          {answers.map((a: any) => (
            <div key={a.id} className={"bg-white p-4 rounded-lg border flex items-start gap-3 " + (a.isCorrect ? "border-green-200" : "border-red-200")}>
              <span className="text-lg mt-0.5">{a.isCorrect ? "✅" : "❌"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800">{a.question?.question}</p>
                <div className="flex gap-3 mt-1 text-xs text-slate-500">
                  <span>你的答案：{a.studentAnswer}</span>
                  {!a.isCorrect && <span>正确：{a.question?.answer}</span>}
                  {a.question?.grammarPoint && <span>语法点：{a.question.grammarPoint}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
