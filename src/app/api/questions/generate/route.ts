import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== "TEACHER") {
    return NextResponse.json({ error: "权限不足" }, { status: 403 })
  }

  try {
    const { grammarPoint, difficulty, count = 5, questionType } = await request.json()

    if (!grammarPoint) {
      return NextResponse.json({ error: "请指定语法点" }, { status: 400 })
    }

    const deepseekKey = process.env.DEEPSEEK_API_KEY
    let questions: any[] = []

    if (deepseekKey) {
      const prompt = buildPrompt(grammarPoint, difficulty, count, questionType)

      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + deepseekKey
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "你是一个专业的中文教学题目生成器。请严格按照JSON格式输出。" },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error("DeepSeek API 错误: " + res.status + " " + errText)
      }

      const data = await res.json()
      const result = JSON.parse(data.choices[0].message.content || "{}")
      questions = result.questions || []
    } else {
      questions = generateMockQuestions(grammarPoint, difficulty, count, questionType)
    }

    const savedQuestions = []
    for (const q of questions) {
      const question = await prisma.question.create({
        data: {
          type: q.type || questionType || "MULTIPLE_CHOICE",
          question: q.question,
          options: q.options ? JSON.stringify(q.options) : null,
          answer: q.answer,
          explanation: q.explanation || "",
          grammarPoint,
          difficulty: difficulty || 1,
          published: false,
          createdById: payload.userId
        }
      })
      savedQuestions.push(question)
    }

    return NextResponse.json({ questions: savedQuestions, source: deepseekKey ? "deepseek" : "mock" })
  } catch (error) {
    console.error("Generate error:", error)
    return NextResponse.json({ error: "生成题目失败: " + (error as Error).message }, { status: 500 })
  }
}

function buildPrompt(grammarPoint: string, difficulty: number, count: number, questionType?: string): string {
  const typeLabel = getTypeLabel(questionType)
  return [
    "请为越南学生生成" + count + "道中文语法练习题。",
    "",
    "语法点: " + grammarPoint,
    "难度等级: HSK " + difficulty,
    "题目类型: " + typeLabel,
    "",
    "要求:",
    "1. 题目用中文，适当加入越南语提示",
    "2. 选择题给出4个选项",
    "3. 标注正确答案",
    "4. 给出中文解析",
    "5. 题目内容贴近日常生活",
    "",
    "输出格式为JSON:",
    '{ "questions": [{ "type": "MULTIPLE_CHOICE", "question": "", "options": ["A.", "B.", "C.", "D."], "answer": "", "explanation": "" }] }'
  ].join("\n")
}

function getTypeLabel(t?: string): string {
  if (t === "MULTIPLE_CHOICE") return "选择题"
  if (t === "FILL_BLANK") return "填空题"
  if (t === "TRANSLATION") return "翻译题"
  if (t === "TRUE_FALSE") return "判断题"
  return "混合题型"
}

function generateMockQuestions(grammarPoint: string, difficulty: number, count: number, questionType?: string): any[] {
  const mockQuestions = [
    { type: "MULTIPLE_CHOICE", question: "关于[" + grammarPoint + "]，以下哪个句子是正确的？", options: ["A. 我吃饭了已经。", "B. 我已经吃饭了。", "C. 我吃了已经饭。", "D. 已经我吃饭了。"], answer: "B", explanation: "已经放在动词前。" },
    { type: "MULTIPLE_CHOICE", question: "请选择正确的句子(" + grammarPoint + ")：", options: ["A. 我比他高。", "B. 我高比他。", "C. 比他我高。", "D. 比我高他。"], answer: "A", explanation: "比字句结构: A + 比 + B + 形容词。" },
    { type: "FILL_BLANK", question: "用[" + grammarPoint + "]完成句子: 你昨天____我去公园？", options: [], answer: "跟", explanation: "句子为: 你昨天跟谁去公园？" },
    { type: "TRUE_FALSE", question: "判断对错: [我把作业做完了]这个句子是正确的。", options: [], answer: "正确", explanation: "把字句结构: 主语 + 把 + 宾语 + 动词 + 补语。" },
    { type: "TRANSLATION", question: "请翻译成中文: Toi da an com roi", options: [], answer: "我已经吃饭了。", explanation: "越南语的da...roi对应汉语的已经...了。" }
  ]
  return mockQuestions.slice(0, count)
}
