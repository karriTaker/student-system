import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, signToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password, name, role, teacherCode } = await request.json()

    if (!username || !password || !name) {
      return NextResponse.json({ error: "请填写所有必填字段" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    let teacherId = null
    if (teacherCode) {
      const teacher = await prisma.user.findFirst({
        where: { username: teacherCode, role: "TEACHER" }
      })
      if (teacher) teacherId = teacher.id
    }

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: role === "TEACHER" ? "TEACHER" : "STUDENT",
        teacherId
      }
    })

    const token = signToken({ userId: user.id, username: user.username, role: user.role })

    return NextResponse.json({
      token,
      user: { id: user.id, username: user.username, name: user.name, role: user.role }
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "注册失败" }, { status: 500 })
  }
}
