"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  var router = useRouter()
  var [username, setUsername] = useState("")
  var [password, setPassword] = useState("")
  var [error, setError] = useState("")
  var [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      var res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) })
      var data = await res.json()
      if (!res.ok) { setError(data.error || "登录失败"); return }
      localStorage.setItem("token", data.token)
      if (data.user.role === "TEACHER") router.push("/teacher")
      else router.push("/student")
    } catch { setError("网络错误") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">登录</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">用户名</label>
            <input type="text" value={username} onChange={function(e) { setUsername(e.target.value) }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
            <input type="password" value={password} onChange={function(e) { setPassword(e.target.value) }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          还没有账号？ <a href="/register" className="text-blue-600 hover:underline">注册</a>
        </p>
      </div>
    </div>
  )
}
