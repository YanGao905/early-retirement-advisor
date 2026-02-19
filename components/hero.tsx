"use client"

import { ArrowRight, Shield, Clock, Heart, Landmark } from "lucide-react"

interface HeroProps {
  onStart: () => void
}

export function Hero({ onStart }: HeroProps) {
  return (
    <div className="animate-fade-in text-center">
      <div className="rounded-2xl bg-card px-6 py-16 shadow-sm border border-border md:px-12 md:py-20">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
          <Landmark className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
          你离自由还有多远？
        </h1>

        <p className="mt-2 text-base text-muted-foreground">
          北京提前退休规划模拟器
        </p>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
          3分钟算清辞职成本，看看你能否提前实现财务自由。
        </p>

        <button
          onClick={onStart}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          开始测算
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Shield, text: "2024新政策" },
            { icon: Clock, text: "弹性退休" },
            { icon: Heart, text: "医保测算" },
            { icon: Landmark, text: "4050政策" },
          ].map((item) => (
            <span
              key={item.text}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
            >
              <item.icon className="h-3 w-3" />
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
