"use client"

import { cn } from "@/lib/utils"
import type { UserData } from "@/lib/retirement"
import {
  computeRetirement,
  ageFromBirth,
  flexibleRetirementRange,
} from "@/lib/retirement"

interface ComparisonTableProps {
  userData: UserData
  currentAge: number
  strategy: "full" | "min"
  claimAge: number
}

export function ComparisonTable({
  userData,
  currentAge,
  strategy,
  claimAge,
}: ComparisonTableProps) {
  const ageNow = ageFromBirth(userData.birthYear, userData.birthMonth)
  const stopAtMinYears = strategy === "min"

  const ages = [
    Math.ceil(ageNow),
    currentAge,
    Math.min(currentAge + 3, claimAge),
    Math.min(currentAge + 5, claimAge),
  ]
    .filter(
      (v, i, a) =>
        a.indexOf(v) === i && v >= ageNow && v <= claimAge
    )
    .sort((a, b) => a - b)

  const results = ages.map((age) => {
    const r = computeRetirement(userData, age, stopAtMinYears, claimAge)
    return { age, ...r }
  })

  const bestResult = results.reduce(
    (best, r) => (r.netGain > best.netGain ? r : best),
    results[0]
  )

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">
              辞职年龄
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
              自费投入
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
              月养老金
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
              净收益(80岁)
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const isCurrent = r.age === currentAge
            const isBest =
              r.age === bestResult.age && !isCurrent
            const isImmediate = r.age === Math.ceil(ageNow)

            return (
              <tr
                key={r.age}
                className={cn(
                  "border-b border-border last:border-b-0 transition-colors",
                  isCurrent && "bg-primary text-primary-foreground"
                )}
              >
                <td
                  className={cn(
                    "px-3 py-2.5 font-medium",
                    !isCurrent && "text-foreground"
                  )}
                >
                  {r.age} 岁
                  {isImmediate && !isCurrent && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      (立刻)
                    </span>
                  )}
                  {isCurrent && (
                    <span className="ml-1 text-xs opacity-80">
                      当前
                    </span>
                  )}
                  {isBest && (
                    <span className="ml-1 text-xs text-warning">
                      最优
                    </span>
                  )}
                </td>
                <td
                  className={cn(
                    "px-3 py-2.5 text-right",
                    !isCurrent && "text-foreground"
                  )}
                >
                  {"\u00A5"}
                  {(r.totalFlexCost / 10000).toFixed(1)}万
                </td>
                <td
                  className={cn(
                    "px-3 py-2.5 text-right",
                    !isCurrent && "text-foreground"
                  )}
                >
                  {"\u00A5"}
                  {Math.round(r.monthlyPension)}
                </td>
                <td
                  className={cn(
                    "px-3 py-2.5 text-right font-medium",
                    isCurrent
                      ? ""
                      : r.netGain > 0
                        ? "text-success"
                        : "text-destructive"
                  )}
                >
                  {"\u00A5"}
                  {(r.netGain / 10000).toFixed(1)}万
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
