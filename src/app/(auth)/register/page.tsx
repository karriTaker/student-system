"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  var router = useRouter()
  var [form, setForm] = useState({ username: "", password: "", name: "", role: "STUDENT", teacherCode: "" })
  var [error, setError] = useState("")
  var [loading, setLoading] = useState(false)

  function update(key: string, value: string) { setForm(function(p) { return Object.assign({}, p, { [key]: value }) }) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      var res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      var data = await res.json()
      if (!res.ok) { setError(data.error || "注册失败"); return }
      localStorage.setItem("token", data.token)
      if (data.user.role === "TEACHER") router.push("/teacher")
      else router.push("/student")
    } catch { setError("网络错误") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">注册</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">用户名</label>
            <input type="text" value={form.username} onChange={function(e) { update("username", e.target.value) }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
            <input type="text" value={form.name} onChange={function(e) { update("name", e.target.value) }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
            <input type="password" value={form.password} onChange={function(e) { update("password", e.target.value) }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">角色</label>
            <select value={form.role} onChange={function(e) { update("role", e.target.value) }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="STUDENT">学生</option>
              <option value="TEACHER">教师</option>
            </select>
          </div>
          {form.role === "STUDENT" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">教师码（可选）</label>
              <input type="text" value={form.teacherCode} onChange={function(e) { update("teacherCode", e.target.value) }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入教师的用户名" />
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? "注册中..." : "注册"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          已有账号？ <a href="/login" className="text-blue-600 hover:underline">登录</a>
        </p>
      </div>
    </div>
  )
}
