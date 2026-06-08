"use client"

import { useEffect, useState } from "react"

export default function PracticePage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ grammarPoint: "", difficulty: "", type: "" })

  function loadQuestions() {
    setLoading(true)
    const token = localStorage.getItem("token")
    const params = new URLSearchParams()
    if (filter.grammarPoint) params.set("grammarPoint", filter.grammarPoint)
    if (filter.difficulty) params.set("difficulty", filter.difficulty)
    if (filter.type) params.set("type", filter.type)

    fetch("/api/questions?" + params, { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(data => {
        setQuestions(data.questions || [])
        setCurrentIndex(0)
        setResult(null)
        setAnswer("")
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadQuestions() }, [])

  const current = questions[currentIndex]

  async function submitAnswer() {
    if (!answer.trim()) return
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ questionId: current.id, studentAnswer: answer })
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ correct: false, correctAnswer: "提交失败" })
    } finally {
      setLoading(false)
    }
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
      setAnswer("")
      setResult(null)
    }
  }

  if (loading && questions.length === 0) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
  }

  if (questions.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">开始练习</h1>
        <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
          <p className="text-slate-500 mb-4">暂无可用的题目</p>
          <p className="text-sm text-slate-400">请等待老师发布新题目</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">开始练习</h1>

      <div className="flex items-center gap-4 mb-4">
        <select value={filter.difficulty} onChange={e => setFilter(f => ({...f, difficulty: e.target.value}))}
          className="px-3 py-1.5 border border-slate-300 rounded text-sm">
          <option value="">全部难度</option>
          <option value="1">HSK 1</option>
          <option value="2">HSK 2</option>
          <option value="3">HSK 3</option>
          <option value="4">HSK 4</option>
          <option value="5">HSK 5</option>
          <option value="6">HSK 6</option>
        </select>
        <button onClick={loadQuestions} className="px-4 py-1.5 bg-slate-100 rounded text-sm hover:bg-slate-200 transition">
          筛选
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500">
            第 {currentIndex + 1} / {questions.length} 题
          </span>
          <span className={"text-xs px-2 py-0.5 rounded " + (
            current?.type === "MULTIPLE_CHOICE" ? "bg-blue-100 text-blue-700" :
            current?.type === "FILL_BLANK" ? "bg-green-100 text-green-700" :
            current?.type === "TRANSLATION" ? "bg-purple-100 text-purple-700" :
            "bg-amber-100 text-amber-700"
          )}>
            {current?.type === "MULTIPLE_CHOICE" ? "选择题" : current?.type === "FILL_BLANK" ? "填空题" : current?.type === "TRANSLATION" ? "翻译题" : "判断题"}
          </span>
        </div>

        <h2 className="text-lg font-medium mb-4">{current?.question}</h2>

        {current?.type === "MULTIPLE_CHOICE" && current?.options && (
          <div className="space-y-2 mb-4">
            {JSON.parse(current.options).map((opt: string, i: number) => (
              <label key={i} className={"block p-3 rounded-lg border cursor-pointer transition "
                + (answer === opt.charAt(0) ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300")}>
                <input type="radio" name="choice" value={opt.charAt(0)}
                  checked={answer === opt.charAt(0)}
                  onChange={e => setAnswer(e.target.value)}
                  className="mr-2" />
                {opt}
              </label>
            ))}
          </div>
        )}

        {(current?.type === "FILL_BLANK" || current?.type === "TRANSLATION") && (
          <div className="mb-4">
            <textarea value={answer} onChange={e => setAnswer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder={current?.type === "TRANSLATION" ? "请输入翻译..." : "请填写答案..."} />
          </div>
        )}

        {current?.type === "TRUE_FALSE" && (
          <div className="flex gap-4 mb-4">
            <button onClick={() => setAnswer("正确")}
              className={"flex-1 py-3 rounded-lg border " + (answer === "正确" ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 hover:border-green-300")}>
              ✔ 正确
            </button>
            <button onClick={() => setAnswer("错误")}
              className={"flex-1 py-3 rounded-lg border " + (answer === "错误" ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 hover:border-red-300")}>
              ✘ 错误
            </button>
          </div>
        )}

        {!result ? (
          <button onClick={submitAnswer} disabled={!answer.trim() || loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? "提交中..." : "提交答案"}
          </button>
        ) : (
          <div>
            <div className={"p-4 rounded-lg mb-4 " + (result.correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200")}>
              <p className={"font-medium mb-1 " + (result.correct ? "text-green-700" : "text-red-700")}>
                {result.correct ? "✔ 回答正确！" : "✘ 回答错误"}
              </p>
              {!result.correct && <p className="text-sm text-slate-600">正确答案：{result.correctAnswer}</p>}
              {result.explanation && <p className="text-sm text-slate-500 mt-1">{result.explanation}</p>}
            </div>
            {currentIndex < questions.length - 1 && (
              <button onClick={nextQuestion}
                className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition">
                下一题
              </button>
            )}
            {currentIndex === questions.length - 1 && (
              <p className="text-center text-sm text-slate-500 mt-2">全部完成！可以重新筛选练习</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
