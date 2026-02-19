export interface UserData {
  birthYear: number
  birthMonth: number
  gender: "male" | "female"
  hukou: "yes" | "no"
  yearsPaidNow: number
  balanceNow: number
}

export interface FlexRange {
  legalAge: number
  originalAge: number
  earliest: number
  latest: number
}

export interface Subsidy4050 {
  eligible: boolean
  subsidyYears: number
  subsidyAmount: number
  subsidyRate: number
  reason?: string
  yearsToRetire?: number
}

export interface RetirementResult {
  ageNow: number
  legalAge: number
  quitAge: number
  gender: string
  hukou: string
  payMethod: string
  flexMonthly: number
  yearsWorking: number
  yearsFlexPay: number
  pensionFlexCost: number
  totalFlexCost: number
  totalYears: number
  finalBalance: number
  monthlyPension: number
  realPension: number
  paybackYears: number
  pensionOK: boolean
  pensionShortfall: number
  minPensionYearsRequired: number
  retireYear: number
  medicalOK: boolean
  medicalShortfall: number
  needMedicalYears: number
  medicalExtraCost: number
  medicalMonthly: number
  totalReceived: number
  netGain: number
  avgYearlyToAccount: number
  yearlyToAccountFlex: number
  balanceNow: number
  stopAtMinYears: boolean
  stopPayAge: number | null
  yearsWaiting: number
  actualClaimAge: number
  flexRange: FlexRange
  subsidy4050: Subsidy4050
}

export function ageFromBirth(year: number, month: number): number {
  const now = new Date()
  let age = now.getFullYear() - year
  if (now.getMonth() + 1 < month) age--
  return age
}

export function legalRetirementAge(
  gender: string,
  birthYear: number
): number {
  if (gender === "female") {
    const r = 50 + (birthYear - 1975) * 0.2
    return Math.min(Math.max(r, 50), 55)
  } else {
    const r = 60 + (birthYear - 1965) * 0.15
    return Math.min(Math.max(r, 60), 63)
  }
}

export function originalRetirementAge(gender: string): number {
  return gender === "female" ? 50 : 60
}

export function flexibleRetirementRange(
  gender: string,
  birthYear: number
): FlexRange {
  const legalAge = legalRetirementAge(gender, birthYear)
  const origAge = originalRetirementAge(gender)
  const earliest = Math.max(legalAge - 3, origAge)
  const latest = Math.min(legalAge + 3, 65)
  return { legalAge, originalAge: origAge, earliest, latest }
}

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

function purchasingPower(
  amount: number,
  years: number,
  inflation = 0.03
): number {
  return amount / Math.pow(1 + inflation, years)
}

function minPensionYears(): number {
  return 20
}

function calc4050Subsidy(
  gender: string,
  quitAge: number,
  claimAge: number,
  flexMonthly: number,
  hukou: string
): Subsidy4050 {
  if (hukou !== "yes")
    return {
      eligible: false,
      subsidyYears: 0,
      subsidyAmount: 0,
      subsidyRate: 0,
    }

  const threshold = gender === "female" ? 40 : 50
  if (quitAge < threshold) {
    return {
      eligible: false,
      subsidyYears: 0,
      subsidyAmount: 0,
      subsidyRate: 0,
      reason: `需年满${threshold}岁`,
    }
  }

  const subsidyRate = 0.6
  const yearsToRetire = claimAge - quitAge
  let subsidyYears: number
  if (yearsToRetire <= 5) {
    subsidyYears = yearsToRetire
  } else {
    subsidyYears = 3
  }
  subsidyYears = Math.max(0, subsidyYears)

  const subsidyAmount = flexMonthly * 12 * subsidyYears * subsidyRate

  return {
    eligible: true,
    subsidyYears,
    subsidyAmount,
    subsidyRate,
    yearsToRetire,
  }
}

export function computeRetirement(
  userData: UserData,
  quitAge: number,
  stopAtMinYears = false,
  claimAge: number | null = null
): RetirementResult {
  const { birthYear, birthMonth, gender, hukou, yearsPaidNow, balanceNow } =
    userData

  const minBase = 6326
  const flexMonthly = hukou === "yes" ? 1800 : 2800
  const payMethod = hukou === "yes" ? "灵活就业" : "公司代缴"
  const monthlyToAccount = minBase * 0.08

  const ageNow = ageFromBirth(birthYear, birthMonth)
  const flexRange = flexibleRetirementRange(gender, birthYear)
  const legalAge = flexRange.legalAge

  const actualClaimAge = claimAge !== null ? claimAge : legalAge

  const retireYear = birthYear + Math.ceil(actualClaimAge)
  const minPensionYearsRequired = minPensionYears()

  const yearsWorking = Math.max(quitAge - ageNow, 0)
  const avgYearlyToAccount = balanceNow / yearsPaidNow
  const yearsAtQuit = yearsPaidNow + yearsWorking
  const balanceAtQuit = balanceNow + avgYearlyToAccount * yearsWorking

  let yearsFlexPay: number
  let stopPayAge: number | null = null
  let yearsWaiting = 0

  if (stopAtMinYears) {
    const yearsNeededForMin = Math.max(
      minPensionYearsRequired - yearsAtQuit,
      0
    )
    yearsFlexPay = Math.min(yearsNeededForMin, actualClaimAge - quitAge)
    stopPayAge = quitAge + yearsFlexPay
    yearsWaiting = Math.max(actualClaimAge - stopPayAge, 0)
  } else {
    yearsFlexPay = Math.max(actualClaimAge - quitAge, 0)
  }

  const yearlyToAccountFlex = monthlyToAccount * 12
  const pensionFlexCost = flexMonthly * 12 * yearsFlexPay

  const subsidy4050 = calc4050Subsidy(
    gender,
    quitAge,
    actualClaimAge,
    flexMonthly,
    hukou
  )

  const totalYears = yearsAtQuit + yearsFlexPay
  const finalBalance = balanceAtQuit + yearlyToAccountFlex * yearsFlexPay

  const personalPension = finalBalance / divisor(actualClaimAge)
  const avgWage = 14000
  const basePension = avgWage * totalYears * 0.01 * 0.9
  const monthlyPension = personalPension + basePension

  const pensionOK = totalYears >= minPensionYearsRequired
  const pensionShortfall = pensionOK
    ? 0
    : minPensionYearsRequired - totalYears

  const needMedicalYears = gender === "female" ? 20 : 25
  const medicalOK = totalYears >= needMedicalYears
  const medicalShortfall = medicalOK ? 0 : needMedicalYears - totalYears

  const medicalMonthly = 500
  const medicalExtraCost = medicalOK
    ? 0
    : medicalShortfall * 12 * medicalMonthly

  const totalFlexCost = pensionFlexCost + medicalExtraCost

  const paybackYears =
    totalFlexCost > 0 ? totalFlexCost / (monthlyPension * 12) : 0

  const yearsFromNow = actualClaimAge - ageNow
  const realPension = purchasingPower(monthlyPension, yearsFromNow)

  const lifeExpectancy = 80
  const yearsReceiving = lifeExpectancy - actualClaimAge
  const totalReceived = monthlyPension * 12 * yearsReceiving
  const netGain = totalReceived - totalFlexCost

  return {
    ageNow,
    legalAge,
    quitAge,
    gender,
    hukou,
    payMethod,
    flexMonthly,
    yearsWorking,
    yearsFlexPay,
    pensionFlexCost,
    totalFlexCost,
    totalYears,
    finalBalance,
    monthlyPension,
    realPension,
    paybackYears,
    pensionOK,
    pensionShortfall,
    minPensionYearsRequired,
    retireYear,
    medicalOK,
    medicalShortfall,
    needMedicalYears,
    medicalExtraCost,
    medicalMonthly,
    totalReceived,
    netGain,
    avgYearlyToAccount,
    yearlyToAccountFlex,
    balanceNow,
    stopAtMinYears,
    stopPayAge,
    yearsWaiting,
    actualClaimAge,
    flexRange,
    subsidy4050,
  }
}
