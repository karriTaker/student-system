"use client"

import { useEffect, useState } from "react"

export default function TeacherStudents() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch("/api/auth/me", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(r => r.json())
      .then(async (me) => {
        if (!me.user) return
        fetch("/api/answers", {
          headers: { Authorization: "Bearer " + token }
        })
          .then(r => r.json())
          .then(data => {
            // For now show a simple list
            setLoading(false)
          })
          .catch(() => setLoading(false))
      })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">学生管理</h1>
      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          学生开始练习后，他们的记录将会显示在这里。
        </div>
      )}
    </div>
  )
}
