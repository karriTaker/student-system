"use client"

import { useState } from "react"

export default function CreateQuestionPage() {
  const [mode, setMode] = useState<"ai" | "manual">("ai")
  const [form, setForm] = useState({ grammarPoint: "", difficulty: 2, count: 5, questionType: "MIXED" })
  const [manualForm, setManualForm] = useState({ type: "MULTIPLE_CHOICE", question: "", options: "", answer: "", explanation: "", grammarPoint: "", difficulty: 2 })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function update(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function generateAI() {
    setError("")
    setLoading(true)
    setResult(null)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const body = { ...manualForm, options: manualForm.options ? manualForm.options.split("\n").filter(Boolean) : null }
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult({ created: 1 })
      setManualForm({ type: "MULTIPLE_CHOICE", question: "", options: "", answer: "", explanation: "", grammarPoint: "", difficulty: 2 })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新建题目</h1>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode("ai")}
          className={"px-4 py-2 rounded-lg text-sm font-medium " + (mode === "ai" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
          🤖 AI 自动生成
        </button>
        <button onClick={() => setMode("manual")}
          className={"px-4 py-2 rounded-lg text-sm font-medium " + (mode === "manual" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
          ✍️ 手动创建
        </button>
      </div>

      {mode === "ai" && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 max-w-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">语法点</label>
              <input type="text" value={form.grammarPoint} onChange={e => update("grammarPoint", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：把字句、比字句、“了”的用法" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">HSK 难度</label>
              <select value={form.difficulty} onChange={e => update("difficulty", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>HSK {n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">题目类型</label>
              <select value={form.questionType} onChange={e => update("questionType", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="MIXED">混合题型</option>
                <option value="MULTIPLE_CHOICE">选择题</option>
                <option value="FILL_BLANK">填空题</option>
                <option value="TRANSLATION">翻译题</option>
                <option value="TRUE_FALSE">判断题</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">生成数量</label>
              <input type="number" min={1} max={20} value={form.count} onChange={e => update("count", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generateAI} disabled={loading || !form.grammarPoint}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? "生成中..." : "🤖 生成题目"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          {result && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              已生成 {result.questions?.length || result.created} 道题目！
              <a href="/teacher/questions" className="ml-2 text-blue-600 hover:underline">查看列表</a>
            </div>
          )}
        </div>
      )}

      {mode === "manual" && (
        <form onSubmit={submitManual} className="bg-white p-6 rounded-lg border border-slate-200 max-w-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">题型</label>
            <select value={manualForm.type} onChange={e => setManualForm(p => ({...p, type: e.target.value}))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="MULTIPLE_CHOICE">选择题</option>
              <option value="FILL_BLANK">填空题</option>
              <option value="TRANSLATION">翻译题</option>
              <option value="TRUE_FALSE">判断题</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">题目</label>
            <textarea value={manualForm.question} onChange={e => setManualForm(p => ({...p, question: e.target.value}))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20" required />
          </div>
          {manualForm.type === "MULTIPLE_CHOICE" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">选项（每行一个）</label>
              <textarea value={manualForm.options} onChange={e => setManualForm(p => ({...p, options: e.target.value}))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="A. 选项1
B. 选项2
C. 选项3
D. 选项4" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">正确答案</label>
            <input type="text" value={manualForm.answer} onChange={e => setManualForm(p => ({...p, answer: e.target.value}))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">解析（可选）</label>
            <textarea value={manualForm.explanation} onChange={e => setManualForm(p => ({...p, explanation: e.target.value}))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">语法点（可选）</label>
            <input type="text" value={manualForm.grammarPoint} onChange={e => setManualForm(p => ({...p, grammarPoint: e.target.value}))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">HSK 难度</label>
            <select value={manualForm.difficulty} onChange={e => setManualForm(p => ({...p, difficulty: parseInt(e.target.value)}))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>HSK {n}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? "创建中..." : "创建题目"}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {result && <p className="text-green-600 text-sm">题目已创建！ <a href="/teacher/questions" className="text-blue-600 hover:underline">查看</a></p>}
        </form>
      )}
    </div>
  )
}
