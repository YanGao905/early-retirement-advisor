"use client"

import { useState } from "react"
import { Hero } from "@/components/hero"
import { FormWizard } from "@/components/form-wizard"
import { Results } from "@/components/results"
import type { UserData } from "@/lib/retirement"

type View = "home" | "form" | "results"

export default function Home() {
  const [view, setView] = useState<View>("home")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [quitAge, setQuitAge] = useState(0)

  function handleCalculate(data: UserData, age: number) {
    setUserData(data)
    setQuitAge(age)
    setView("results")
  }

  function handleRestart() {
    setView("home")
    setUserData(null)
    setQuitAge(0)
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8 md:py-12">
      {view === "home" && <Hero onStart={() => setView("form")} />}

      {view === "form" && (
        <FormWizard
          onBack={() => setView("home")}
          onCalculate={handleCalculate}
        />
      )}

      {view === "results" && userData && (
        <Results
          userData={userData}
          initialQuitAge={quitAge}
          onRestart={handleRestart}
        />
      )}
    </main>
  )
}
