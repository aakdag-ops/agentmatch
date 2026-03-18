"use client"

import { createContext, useContext, useState } from "react"
import type { Agent } from "@prisma/client"

const MAX_COMPARE = 3

interface CompareContextType {
  compareList: Agent[]
  addToCompare: (agent: Agent) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  isInCompare: (id: string) => boolean
  isFull: boolean
}

const CompareContext = createContext<CompareContextType | null>(null)

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<Agent[]>([])

  function addToCompare(agent: Agent) {
    setCompareList((prev) => {
      if (prev.length >= MAX_COMPARE) return prev
      if (prev.find((a) => a.id === agent.id)) return prev
      return [...prev, agent]
    })
  }

  function removeFromCompare(id: string) {
    setCompareList((prev) => prev.filter((a) => a.id !== id))
  }

  function clearCompare() {
    setCompareList([])
  }

  function isInCompare(id: string) {
    return compareList.some((a) => a.id === id)
  }

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isFull: compareList.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error("useCompare must be used within CompareProvider")
  return ctx
}
