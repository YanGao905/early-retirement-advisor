"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  TrendingDown,
  TrendingUp,
  Clock,
  Heart,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Shield,
} from "lucide-react"
import type { UserData, RetirementResult } from "@/lib/retirement"
import { computeRetirement, flexibleRetirementRange } from "@/lib/retirement"
import { Timeline } from "./timeline"
import { ComparisonTable } from "./comparison-table"
import { AdviceSection } from "./advice-section"

interface ResultsProps {
  userData: UserData
  initialQuitAge: number
  onRestart: () => void
}

export function Results({
  userData,
  initialQuitAge,
  onRestart,
}: ResultsProps) {
  const flexRange = flexibleRetirementRange(
    userData.gender,
    userData.birthYear
  )

  const [strategy, setStrategy] = useState<"full" | "min">("full")
  const [claimAge, setClaimAge] = useState(flexRange.legalAge)
  const [quitAge, setQuitAge] = useState(initialQuitAge)
  const [newQuitAge, setNewQuitAge] = useState(String(initialQuitAge))

  const r = computeRetirement(
    userData,
    quitAge,
    strategy === "min",
    claimAge
  )

  const claimAgeOptions = [
    { age: flexRange.earliest, type: "early" as const },
    { age: flexRange.legalAge, type: "legal" as const },
    { age: flexRange.latest, type: "delay" as const },
  ]

  function divisor(age: number): number {
    const table: Record<number, number> = {
      40: 233, 41: 230, 42: 226, 43: 223, 44: 220,
      45: 216, 46: 212, 47: 208, 48: 204, 49: 199,
      50: 195, 51: 190, 52: 185, 53: 180, 54: 175,
      55: 170, 56: 164, 57: 158, 58: 152, 59: 145,
      60: 139, 61: 132, 62: 125, 63: 117, 64: 109,
      65: 101, 66: 93, 67: 84, 68: 75, 69: 65, 70: 56,
    }
    const intAge = Math.floor(age)
    const clamped = Math.max(40, Math.min(70, intAge))
    return table[clamped] || 139
  }

  function handleTryNewAge() {
    const age = parseFloat(newQuitAge)
    if (age > 0) setQuitAge(age)
  }

  const claimYear = userData.birthYear + Math.ceil(r.actualClaimAge)

  return (
    <div className="animate-fade-in space-y-4">
      {/* Summary header */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-foreground">
          你的提前退休分析
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          当前{" "}
          <strong className="text-foreground">{r.ageNow} 岁</strong>
          ，计划{" "}
          <strong className="text-foreground">{quitAge} 岁</strong>{" "}
          辞职，法定退休年龄{" "}
          <strong className="text-foreground">
            {r.legalAge.toFixed(1)} 岁
          </strong>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {r.hukou === "yes"
            ? "北京户籍：辞职后按灵活就业缴纳"
            : "非北京户籍：辞职后需公司代缴"}
          ，最低缴费年限 20 年
        </p>
      </div>

      {/* Main analysis card */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
        {/* Claim age selector */}
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          选择领取养老金年龄
        </h3>
        <div className="flex gap-3 mb-4">
          {claimAgeOptions.map((opt) => {
            const isActive = Math.abs(opt.age - claimAge) < 0.1
            return (
              <button
                key={opt.type}
                onClick={() => setClaimAge(opt.age)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm transition-all",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-md -translate-y-0.5"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5"
                )}
              >
                <span className="font-semibold">
                  {opt.age}岁
                </span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : opt.type === "early"
                        ? "bg-warning/10 text-warning-foreground"
                        : opt.type === "legal"
                          ? "bg-primary/10 text-primary"
                          : "bg-primary/10 text-primary"
                  )}
                >
                  {opt.type === "early"
                    ? "提前3年"
                    : opt.type === "legal"
                      ? "法定"
                      : "推迟3年"}
                </span>
              </button>
            )
          })}
        </div>

        <p className="mb-4 text-xs text-muted-foreground">
          {r.actualClaimAge < r.legalAge
            ? `提前领取：养老金较低（计发月数${divisor(r.actualClaimAge)}个月），但更早享受`
            : r.actualClaimAge > r.legalAge
              ? `推迟领取：养老金更高（计发月数${divisor(r.actualClaimAge)}个月），缴费时间更长`
              : `按法定年龄领取（计发月数${divisor(r.actualClaimAge)}个月）`}
        </p>

        {/* Strategy tabs */}
        <div className="flex gap-1 rounded-xl bg-muted p-1 mb-6">
          <button
            onClick={() => setStrategy("full")}
            className={cn(
              "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
              strategy === "full"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="block">缴到领取</span>
            <span className="block text-[11px] font-normal opacity-70">
              养老金更高
            </span>
          </button>
          <button
            onClick={() => setStrategy("min")}
            className={cn(
              "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
              strategy === "min"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="block">缴满20年即停</span>
            <span className="block text-[11px] font-normal opacity-70">
              省钱但养老金较低
            </span>
          </button>
        </div>

        {/* Timeline */}
        <Timeline result={r} userData={userData} />

        {/* 4050 subsidy */}
        {r.subsidy4050.eligible && (
          <div className="mt-5 flex gap-2 rounded-xl bg-success/10 border border-success/20 p-4">
            <Lightbulb className="h-5 w-5 shrink-0 text-success" />
            <div>
              <p className="text-sm font-semibold text-success">
                省钱提示：你符合4050政策条件
              </p>
              <p className="mt-1 text-xs text-success/80">
                如申请4050社保补贴，预计可节省约{" "}
                <strong>
                  {"\u00A5"}
                  {(r.subsidy4050.subsidyAmount / 10000).toFixed(1)}{" "}
                  万
                </strong>
                （{r.subsidy4050.subsidyYears.toFixed(1)}年 x 补贴
                {Math.round(r.subsidy4050.subsidyRate * 100)}%）
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                申请条件：北京户籍 + 失业登记 + 灵活就业缴纳社保
              </p>
            </div>
          </div>
        )}

        {/* Core stats */}
        <div className="mt-6 grid grid-cols-2 gap-5">
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <TrendingDown className="h-3.5 w-3.5" />
              辞职后总成本
            </h3>
            <p className="mt-2 text-2xl font-bold text-warning-foreground">
              {"\u00A5"}
              {(r.totalFlexCost / 10000).toFixed(1)} 万
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              社保 {"\u00A5"}
              {(r.pensionFlexCost / 10000).toFixed(1)}万
              {r.medicalExtraCost > 0 &&
                ` + 医保补缴 ¥${(r.medicalExtraCost / 10000).toFixed(1)}万`}
            </p>
            {r.subsidy4050.eligible && (
              <p className="mt-0.5 text-[11px] text-success">
                申请4050后仅需{" "}
                <strong>
                  {"\u00A5"}
                  {(
                    (r.totalFlexCost - r.subsidy4050.subsidyAmount) /
                    10000
                  ).toFixed(1)}
                  万
                </strong>
              </p>
            )}
          </div>
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              月养老金
            </h3>
            <p className="mt-2 text-2xl font-bold text-success">
              {"\u00A5"}
              {Math.round(r.monthlyPension)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              累计 {r.totalYears.toFixed(1)} 年 · 今日购买力 ≈{" "}
              {"\u00A5"}
              {Math.round(r.realPension)}
            </p>
          </div>
        </div>

        {/* Extra stats */}
        <div className="mt-5 space-y-2 border-t border-border pt-4">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              回本时间
            </span>
            <span className="font-semibold text-foreground">
              {r.paybackYears.toFixed(1)} 年
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
              活到80岁净收益
            </span>
            <span
              className={cn(
                "font-semibold",
                r.netGain > 0 ? "text-success" : "text-destructive"
              )}
            >
              {"\u00A5"}
              {(r.netGain / 10000).toFixed(1)} 万
            </span>
          </div>
        </div>
      </div>

      {/* Pension status */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Shield className="h-4 w-4" />
          养老保险缴费年限
        </h2>
        <div className="mt-3">
          <span
            className={cn(
              "inline-block rounded-md px-3 py-1.5 text-xs font-medium",
              r.pensionOK
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {r.pensionOK
              ? "满足最低缴费年限，可正常领取养老金"
              : `还差 ${r.pensionShortfall.toFixed(1)} 年才能领取养老金`}
          </span>
        </div>
        <table className="mt-4 w-full text-sm">
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2.5 text-muted-foreground">
                领取养老金年份
              </td>
              <td className="py-2.5 text-right font-medium text-foreground">
                {claimYear} 年
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2.5 text-muted-foreground">
                最低缴费年限要求
              </td>
              <td className="py-2.5 text-right font-medium text-foreground">
                20 年
              </td>
            </tr>
            <tr>
              <td className="py-2.5 text-muted-foreground">
                你的累计缴费年限
              </td>
              <td className="py-2.5 text-right font-medium text-foreground">
                {r.totalYears.toFixed(1)} 年
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Medical status */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Heart className="h-4 w-4" />
          医保状态
        </h2>
        <div className="mt-3">
          <span
            className={cn(
              "inline-block rounded-md px-3 py-1.5 text-xs font-medium",
              r.medicalOK
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {r.medicalOK
              ? "退休后终身享受医保"
              : `还差 ${r.medicalShortfall.toFixed(1)} 年，需补缴 ¥${(r.medicalExtraCost / 10000).toFixed(1)} 万`}
          </span>
        </div>
        <table className="mt-4 w-full text-sm">
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2.5 text-muted-foreground">
                {r.gender === "female" ? "女性" : "男性"}最低年限
              </td>
              <td className="py-2.5 text-right font-medium text-foreground">
                {r.needMedicalYears} 年
              </td>
            </tr>
            <tr className={r.medicalOK ? "" : "border-b border-border"}>
              <td className="py-2.5 text-muted-foreground">
                你的累计缴费年限
              </td>
              <td className="py-2.5 text-right font-medium text-foreground">
                {r.totalYears.toFixed(1)} 年
              </td>
            </tr>
            {!r.medicalOK && (
              <tr>
                <td className="py-2.5 text-muted-foreground">
                  补缴费用
                </td>
                <td className="py-2.5 text-right font-medium text-destructive">
                  {"\u00A5"}
                  {(r.medicalExtraCost / 10000).toFixed(1)} 万（
                  {r.medicalShortfall.toFixed(1)}年 x {"\u00A5"}
                  {r.medicalMonthly}/月）
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
        <h2 className="text-base font-semibold text-foreground">
          总结
        </h2>

        {!r.pensionOK && (
          <div className="mt-3 flex gap-2 rounded-lg bg-destructive/10 p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
            <p className="text-xs text-destructive">
              你的累计缴费年限不足 20 年，{claimYear}
              年领取养老金时无法正常领取！需延长缴费或一次性补缴。
            </p>
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm font-semibold text-foreground">
            你将付出：
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li>
              社保自缴 {"\u00A5"}
              {(r.pensionFlexCost / 10000).toFixed(1)} 万（
              {r.yearsFlexPay.toFixed(1)}年 x {"\u00A5"}
              {r.flexMonthly}/月）
            </li>
            {r.subsidy4050.eligible && (
              <li className="text-success">
                如申请4050补贴可节省 {"\u00A5"}
                {(r.subsidy4050.subsidyAmount / 10000).toFixed(1)} 万
              </li>
            )}
            {!r.medicalOK && (
              <li>
                医保补缴 {"\u00A5"}
                {(r.medicalExtraCost / 10000).toFixed(1)} 万（
                {r.medicalShortfall.toFixed(1)}年 x {"\u00A5"}
                {r.medicalMonthly}/月）
              </li>
            )}
            <li className="font-semibold text-foreground">
              总计 {"\u00A5"}
              {(r.totalFlexCost / 10000).toFixed(1)} 万
              {r.subsidy4050.eligible &&
                `（若申请4050可降至 ¥${((r.totalFlexCost - r.subsidy4050.subsidyAmount) / 10000).toFixed(1)}万）`}
            </li>
            <li>
              如投资理财（4%年化），{r.yearsFlexPay.toFixed(0)}年后约{" "}
              {"\u00A5"}
              {(
                (r.totalFlexCost *
                  Math.pow(1.04, r.yearsFlexPay)) /
                10000
              ).toFixed(1)}{" "}
              万
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-foreground">
            你将获得：
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {r.pensionOK ? (
              <>
                <li>
                  每月 {"\u00A5"}
                  {Math.round(r.monthlyPension)} 养老金，终身发放
                </li>
                <li>{r.paybackYears.toFixed(1)} 年回本</li>
                <li>
                  活到80岁净赚 {"\u00A5"}
                  {(r.netGain / 10000).toFixed(1)} 万
                </li>
              </>
            ) : (
              <li className="text-destructive">
                养老金需满足最低年限才能领取
              </li>
            )}
            <li>
              {r.medicalOK
                ? "退休后终身免费医保"
                : "补缴后终身免费医保"}
            </li>
          </ul>
        </div>
      </div>

      {/* Try another age */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
        <h2 className="text-base font-semibold text-foreground">
          尝试其他辞职年龄
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          调整辞职年龄，比较不同方案的差异
        </p>

        <div className="mt-4 flex gap-3 items-center">
          <input
            type="number"
            value={newQuitAge}
            onChange={(e) => setNewQuitAge(e.target.value)}
            className="flex-1 rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleTryNewAge}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md"
          >
            重新计算
          </button>
        </div>

        {/* Comparison table */}
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            快速对比
          </h3>
          <ComparisonTable
            userData={userData}
            currentAge={quitAge}
            strategy={strategy}
            claimAge={claimAge}
          />
        </div>

        {/* Advice */}
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            个性化建议
          </h3>
          <AdviceSection
            userData={userData}
            currentAge={quitAge}
            strategy={strategy}
            claimAge={claimAge}
          />
        </div>
      </div>

      {/* Restart */}
      <div className="flex justify-center pt-2 pb-4">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" />
          重新填写信息
        </button>
      </div>

      <footer className="pb-6 text-center text-xs text-muted-foreground">
        提前退休规划模拟器（北京） · 仅用于估算与决策参考
      </footer>
    </div>
  )
}
