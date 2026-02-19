"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calculator } from "lucide-react"
import { StepIndicator } from "./step-indicator"
import type { UserData } from "@/lib/retirement"

interface FormWizardProps {
  onBack: () => void
  onCalculate: (data: UserData, quitAge: number) => void
}

const STEPS = ["基本信息", "社保情况", "退休计划"]

function generateYears(): number[] {
  const currentYear = new Date().getFullYear()
  const start = currentYear - 60
  const end = currentYear - 25
  const years: number[] = []
  for (let y = end; y >= start; y--) years.push(y)
  return years
}

export function FormWizard({ onBack, onCalculate }: FormWizardProps) {
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const [birthYear, setBirthYear] = useState(1988)
  const [birthMonth, setBirthMonth] = useState(6)
  const [gender, setGender] = useState<"male" | "female">("female")
  const [hukou, setHukou] = useState<"yes" | "no">("yes")

  const [yearsPaid, setYearsPaid] = useState("")
  const [balance, setBalance] = useState("")

  const [quitAge, setQuitAge] = useState("")

  const years = generateYears()

  function validateStep(s: number): boolean {
    const newErrors: Record<string, boolean> = {}

    if (s === 2) {
      if (!yearsPaid || parseFloat(yearsPaid) <= 0)
        newErrors.yearsPaid = true
      if (!balance || parseFloat(balance) <= 0) newErrors.balance = true
    }
    if (s === 3) {
      if (!quitAge || parseFloat(quitAge) <= 0) newErrors.quitAge = true
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (!validateStep(step)) return
    if (step < 3) setStep(step + 1)
  }

  function handlePrev() {
    if (step > 1) setStep(step - 1)
  }

  function handleCalculate() {
    if (!validateStep(3)) return
    onCalculate(
      {
        birthYear,
        birthMonth,
        gender,
        hukou,
        yearsPaidNow: parseFloat(yearsPaid),
        balanceNow: parseFloat(balance),
      },
      parseFloat(quitAge)
    )
  }

  const inputClass =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
  const inputErrorClass =
    "w-full rounded-xl border-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-foreground outline-none"
  const selectClass =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"

  return (
    <div className="animate-fade-in rounded-2xl bg-card p-6 shadow-sm border border-border md:p-8">
      <StepIndicator currentStep={step} steps={STEPS} />

      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            基本信息
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                出生年月
              </label>
              <div className="flex gap-3">
                <select
                  value={birthYear}
                  onChange={(e) =>
                    setBirthYear(parseInt(e.target.value))
                  }
                  className={`${selectClass} flex-[2]`}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}年
                    </option>
                  ))}
                </select>
                <select
                  value={birthMonth}
                  onChange={(e) =>
                    setBirthMonth(parseInt(e.target.value))
                  }
                  className={`${selectClass} flex-1`}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(
                    (m) => (
                      <option key={m} value={m}>
                        {m}月
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                性别
              </label>
              <select
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value as "male" | "female")
                }
                className={selectClass}
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                是否北京户籍
              </label>
              <select
                value={hukou}
                onChange={(e) =>
                  setHukou(e.target.value as "yes" | "no")
                }
                className={selectClass}
              >
                <option value="yes">是</option>
                <option value="no">否</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <span className="flex items-center justify-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                返回
              </span>
            </button>
            <button
              onClick={handleNext}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md"
            >
              <span className="flex items-center justify-center gap-1">
                下一步
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            当前社保情况
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                已累计缴费年限（年）
              </label>
              <input
                type="number"
                value={yearsPaid}
                onChange={(e) => {
                  setYearsPaid(e.target.value)
                  setErrors((prev) => ({ ...prev, yearsPaid: false }))
                }}
                placeholder="例如 10"
                className={
                  errors.yearsPaid ? inputErrorClass : inputClass
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                个人账户余额（元）
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => {
                  setBalance(e.target.value)
                  setErrors((prev) => ({ ...prev, balance: false }))
                }}
                placeholder="例如 80000"
                className={
                  errors.balance ? inputErrorClass : inputClass
                }
              />
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                查询方式：京通小程序 &rarr; 社保个人对账单 &rarr;
                选择上一个年份
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handlePrev}
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <span className="flex items-center justify-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                上一步
              </span>
            </button>
            <button
              onClick={handleNext}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md"
            >
              <span className="flex items-center justify-center gap-1">
                下一步
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            你的退休计划
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                计划辞职年龄（岁）
              </label>
              <input
                type="number"
                value={quitAge}
                onChange={(e) => {
                  setQuitAge(e.target.value)
                  setErrors((prev) => ({ ...prev, quitAge: false }))
                }}
                placeholder="例如 45"
                className={
                  errors.quitAge ? inputErrorClass : inputClass
                }
              />
              <div className="mt-3 rounded-lg bg-muted p-3">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  辞职后社保费用按北京最低基数估算：
                </p>
                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  <li>
                    {'北京户籍：灵活就业 ≈ ¥1,800/月'}
                  </li>
                  <li>
                    {'非北京户籍：公司代缴 ≈ ¥2,800/月'}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handlePrev}
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <span className="flex items-center justify-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                上一步
              </span>
            </button>
            <button
              onClick={handleCalculate}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md"
            >
              <span className="flex items-center justify-center gap-1">
                <Calculator className="h-4 w-4" />
                查看结果
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
