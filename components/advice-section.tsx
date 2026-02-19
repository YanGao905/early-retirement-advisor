"use client"

import { cn } from "@/lib/utils"
import {
  Clock,
  TrendingUp,
  Palmtree,
  Coins,
  AlertTriangle,
  Heart,
  Info,
} from "lucide-react"
import type { UserData } from "@/lib/retirement"
import {
  computeRetirement,
  ageFromBirth,
  flexibleRetirementRange,
} from "@/lib/retirement"

interface AdviceSectionProps {
  userData: UserData
  currentAge: number
  strategy: "full" | "min"
  claimAge: number
}

interface AdviceItem {
  icon: React.ReactNode
  title: string
  description: string
  type: "default" | "success" | "warning"
}

export function AdviceSection({
  userData,
  currentAge,
  strategy,
  claimAge,
}: AdviceSectionProps) {
  const ageNow = ageFromBirth(userData.birthYear, userData.birthMonth)
  const stopAtMinYears = strategy === "min"

  const currentResult = computeRetirement(
    userData,
    currentAge,
    stopAtMinYears,
    claimAge
  )
  const immediateAge = Math.ceil(ageNow)
  const immediateResult =
    immediateAge < currentAge
      ? computeRetirement(
          userData,
          immediateAge,
          stopAtMinYears,
          claimAge
        )
      : null

  const advice: AdviceItem[] = []

  // 1. Core advice: value of free years
  if (immediateResult && currentAge > immediateAge) {
    const freeYears = currentAge - immediateAge
    const moneyDiff =
      currentResult.netGain - immediateResult.netGain
    const pensionDiff =
      currentResult.monthlyPension - immediateResult.monthlyPension
    const yearlyValue = moneyDiff / freeYears

    if (moneyDiff > 0) {
      advice.push({
        icon: <Clock className="h-5 w-5" />,
        title: "你的自由时间值多少钱？",
        description: `继续工作到 ${currentAge} 岁，比现在辞职多赚 ¥${(moneyDiff / 10000).toFixed(1)} 万。换算下来，每多工作1年 ≈ 多赚 ¥${(yearlyValue / 10000).toFixed(1)} 万。如果你觉得一年自由值 ${(yearlyValue / 10000).toFixed(1)} 万以上，现在就辞！`,
        type: "default",
      })

      if (pensionDiff > 100) {
        advice.push({
          icon: <TrendingUp className="h-5 w-5" />,
          title: `月养老金差 ¥${Math.round(pensionDiff)}`,
          description: `现在辞职：月领 ¥${Math.round(immediateResult.monthlyPension)}。${currentAge}岁辞职：月领 ¥${Math.round(currentResult.monthlyPension)}。多工作 ${freeYears} 年换来每月多 ¥${Math.round(pensionDiff)}，你觉得值吗？`,
          type: "default",
        })
      }
    } else {
      advice.push({
        icon: <Palmtree className="h-5 w-5" />,
        title: "恭喜！现在辞职最划算",
        description: `立刻辞职不仅能早享受 ${freeYears} 年自由，还能多赚 ¥${(-moneyDiff / 10000).toFixed(1)} 万！工作越久反而越亏，建议早走。`,
        type: "success",
      })
    }
  }

  // 2. Strategy advice
  const fullR = computeRetirement(userData, currentAge, false, claimAge)
  const minR = computeRetirement(userData, currentAge, true, claimAge)
  const strategyDiff = Math.abs(fullR.netGain - minR.netGain)

  if (strategyDiff > 10000) {
    if (fullR.netGain > minR.netGain) {
      advice.push({
        icon: <Coins className="h-5 w-5" />,
        title: stopAtMinYears
          ? '换成"缴到退休"更划算'
          : "你选的缴费策略正确",
        description: `缴到领取年龄比缴满即停多赚 ¥${(strategyDiff / 10000).toFixed(1)} 万`,
        type: stopAtMinYears ? "default" : "success",
      })
    } else {
      advice.push({
        icon: <Coins className="h-5 w-5" />,
        title: !stopAtMinYears
          ? '换成"缴满即停"更划算'
          : "你选的缴费策略正确",
        description: `缴满20年即停比一直缴多赚 ¥${(strategyDiff / 10000).toFixed(1)} 万`,
        type: !stopAtMinYears ? "default" : "success",
      })
    }
  }

  // 3. Risk warnings
  if (!currentResult.pensionOK) {
    advice.push({
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "注意：养老保险年限不足",
      description: `还差 ${currentResult.pensionShortfall.toFixed(1)} 年才能领养老金，需要继续缴费`,
      type: "warning",
    })
  }

  if (!currentResult.medicalOK) {
    advice.push({
      icon: <Heart className="h-5 w-5" />,
      title: `医保需补缴 ${currentResult.medicalShortfall.toFixed(1)} 年`,
      description: `约 ¥${(currentResult.medicalExtraCost / 10000).toFixed(1)} 万，已计入总成本`,
      type: "warning",
    })
  }

  // 4. Default
  if (advice.length === 0) {
    advice.push({
      icon: <Info className="h-5 w-5" />,
      title: "试试调整辞职年龄看看变化",
      description: "在上方输入不同年龄，对比不同方案的收益差异",
      type: "default",
    })
  }

  return (
    <div className="space-y-2.5">
      {advice.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            "flex gap-3 rounded-xl p-4 border-l-[3px]",
            item.type === "success" &&
              "bg-success/5 border-l-success",
            item.type === "warning" &&
              "bg-warning/5 border-l-warning",
            item.type === "default" &&
              "bg-muted/50 border-l-border"
          )}
        >
          <div
            className={cn(
              "shrink-0 mt-0.5",
              item.type === "success" && "text-success",
              item.type === "warning" && "text-warning",
              item.type === "default" && "text-muted-foreground"
            )}
          >
            {item.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {item.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
