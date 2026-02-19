"use client"

import type { RetirementResult } from "@/lib/retirement"
import { ageFromBirth } from "@/lib/retirement"
import type { UserData } from "@/lib/retirement"

interface TimelineProps {
  result: RetirementResult
  userData: UserData
}

export function Timeline({ result, userData }: TimelineProps) {
  const {
    yearsWorking,
    yearsFlexPay,
    yearsWaiting,
    quitAge,
    actualClaimAge,
    stopPayAge,
    payMethod,
  } = result

  const ageNow = ageFromBirth(userData.birthYear, userData.birthMonth)
  const nowYear = new Date().getFullYear()
  const quitYear = nowYear + Math.round(quitAge - ageNow)
  const stopPayYear = stopPayAge
    ? nowYear + Math.round(stopPayAge - ageNow)
    : null
  const claimYear = userData.birthYear + Math.ceil(actualClaimAge)

  const total = yearsWorking + yearsFlexPay + yearsWaiting
  if (total <= 0) return null

  const workPct = (yearsWorking / total) * 100
  const flexPct = (yearsFlexPay / total) * 100
  const waitPct = (yearsWaiting / total) * 100

  const quitPos = (yearsWorking / total) * 100
  const stopPos = ((yearsWorking + yearsFlexPay) / total) * 100

  const showQuit = yearsWorking > 0.1 && quitPos >= 15 && quitPos <= 85
  const showStop = yearsWaiting > 0.1 && stopPos >= 15 && stopPos <= 85
  const tooClose =
    showQuit && showStop && Math.abs(stopPos - quitPos) < 15

  return (
    <div className="mt-2">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        人生时间线
      </h3>

      {/* Year labels */}
      <div className="relative mb-1.5 flex justify-between text-xs font-semibold text-foreground">
        <span>{nowYear}</span>
        {tooClose ? (
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${quitPos}%` }}
          >
            {quitYear}
          </span>
        ) : (
          <>
            {showQuit && (
              <span
                className="absolute -translate-x-1/2"
                style={{ left: `${quitPos}%` }}
              >
                {quitYear}
              </span>
            )}
            {showStop && stopPayYear && (
              <span
                className="absolute -translate-x-1/2"
                style={{ left: `${stopPos}%` }}
              >
                {stopPayYear}
              </span>
            )}
          </>
        )}
        <span>{claimYear}</span>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
          {yearsWorking > 0.1 && (
            <div
              className="h-full bg-success"
              style={{ width: `${workPct}%` }}
            />
          )}
          {yearsFlexPay > 0.1 && (
            <div
              className="h-full bg-warning"
              style={{ width: `${flexPct}%` }}
            />
          )}
          {yearsWaiting > 0.1 && (
            <div
              className="h-full bg-muted"
              style={{ width: `${waitPct}%` }}
            />
          )}
        </div>

        {/* Dots */}
        <div
          className="absolute top-1/2 left-0 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-success bg-card shadow-sm"
        />
        {yearsWorking > 0.1 && (
          <div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-warning bg-card shadow-sm"
            style={{ left: `${quitPos}%` }}
          />
        )}
        {yearsWaiting > 0.1 && (
          <div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-muted-foreground bg-card shadow-sm"
            style={{ left: `${stopPos}%` }}
          />
        )}
        <div
          className="absolute top-1/2 right-0 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-primary bg-card shadow-sm"
        />
      </div>

      {/* Event labels */}
      <div className="relative mt-1.5 flex justify-between text-[11px] text-muted-foreground h-4">
        <span>{Math.round(ageNow)}岁</span>
        {tooClose ? (
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${quitPos}%` }}
          >
            {quitAge}岁 辞职停缴
          </span>
        ) : (
          <>
            {showQuit && (
              <span
                className="absolute -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${quitPos}%` }}
              >
                {quitAge}岁 辞职
              </span>
            )}
            {showStop && stopPayAge && (
              <span
                className="absolute -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${stopPos}%` }}
              >
                {Math.round(stopPayAge)}岁 停缴
              </span>
            )}
          </>
        )}
        <span>{actualClaimAge}岁 领取</span>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-4">
        {yearsWorking > 0.1 && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-success" />
            在职 {yearsWorking.toFixed(1)}年
          </span>
        )}
        {yearsFlexPay > 0.1 && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-warning" />
            {payMethod} {yearsFlexPay.toFixed(1)}年
          </span>
        )}
        {yearsWaiting > 0.1 && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-muted" />
            等待 {yearsWaiting.toFixed(1)}年
          </span>
        )}
      </div>
    </div>
  )
}
