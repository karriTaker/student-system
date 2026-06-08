import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== "STUDENT") {
    return NextResponse.json({ error: "权限不足" }, { status: 403 })
  }

  try {
    const { questionId, studentAnswer } = await request.json()

    const question = await prisma.question.findUnique({ where: { id: questionId } })
    if (!question) {
      return NextResponse.json({ error: "题目不存在" }, { status: 404 })
    }

    let isCorrect = false
    if (question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") {
      isCorrect = studentAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()
    } else {
      isCorrect = studentAnswer.trim().includes(question.answer.trim()) ||
                  question.answer.trim().includes(studentAnswer.trim())
    }

    const answer = await prisma.answer.upsert({
      where: { userId_questionId: { userId: payload.userId, questionId } },
      update: { studentAnswer, isCorrect },
      create: { studentAnswer, isCorrect, userId: payload.userId, questionId }
    })

    return NextResponse.json({
      answer,
      correct: isCorrect,
      correctAnswer: question.answer,
      explanation: question.explanation
    })
  } catch (error) {
    console.error("Submit answer error:", error)
    return NextResponse.json({ error: "提交答案失败" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || payload.userId

  if (payload.role === "TEACHER") {
    const answers = await prisma.answer.findMany({
      where: { userId },
      include: { question: { select: { question: true, type: true, grammarPoint: true, difficulty: true, answer: true } } },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json({ answers })
  }

  if (payload.role === "STUDENT" && userId !== payload.userId) {
    return NextResponse.json({ error: "权限不足" }, { status: 403 })
  }

  const answers = await prisma.answer.findMany({
    where: { userId: payload.userId },
    include: { question: { select: { question: true, type: true, grammarPoint: true, difficulty: true, answer: true } } },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json({ answers })
}
