import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const grammarPoint = searchParams.get("grammarPoint")
  const difficulty = searchParams.get("difficulty")
  const type = searchParams.get("type")

  const where: Record<string, unknown> = {}
  if (payload.role === "STUDENT") {
    where.published = true
  }
  if (grammarPoint) where.grammarPoint = grammarPoint
  if (difficulty) where.difficulty = parseInt(difficulty)
  if (type) where.type = type

  const questions = await prisma.question.findMany({
    where,
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  })

  if (payload.role === "STUDENT") {
    const answers = await prisma.answer.findMany({
      where: { userId: payload.userId },
      select: { questionId: true, isCorrect: true }
    })
    const answerMap = new Map(answers.map(a => [a.questionId, a.isCorrect]))
    const questionsWithStatus = questions.map(q => ({
      ...q,
      answered: answerMap.has(q.id),
      correct: answerMap.get(q.id) || false
    }))
    return NextResponse.json({ questions: questionsWithStatus })
  }

  return NextResponse.json({ questions })
}

export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== "TEACHER") {
    return NextResponse.json({ error: "权限不足" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { type, question, options, answer, explanation, grammarPoint, difficulty, published } = body

    const q = await prisma.question.create({
      data: {
        type,
        question,
        options: options ? JSON.stringify(options) : null,
        answer,
        explanation,
        grammarPoint,
        difficulty: difficulty || 1,
        published: published || false,
        createdById: payload.userId
      }
    })

    return NextResponse.json({ question: q })
  } catch (error) {
    console.error("Create question error:", error)
    return NextResponse.json({ error: "创建题目失败" }, { status: 500 })
  }
}
