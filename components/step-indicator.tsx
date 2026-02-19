"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  steps: string[]
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, idx) => {
        const step = idx + 1
        const isDone = step < currentStep
        const isActive = step === currentStep

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200",
                  isDone && "bg-success text-success-foreground",
                  isActive && "bg-primary text-primary-foreground",
                  !isDone &&
                    !isActive &&
                    "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : step}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-xs transition-colors",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "mx-3 mb-5 h-0.5 w-12 transition-colors",
                  isDone ? "bg-success" : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
