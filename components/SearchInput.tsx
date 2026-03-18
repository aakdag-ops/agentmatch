"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { SUGGESTION_PROMPTS } from "@/lib/types"

interface SearchInputProps {
  initialValue?: string
  size?: "hero" | "compact"
  onSearch?: (query: string) => void // if provided, called instead of navigating
  placeholder?: string
  showSuggestions?: boolean
}

export default function SearchInput({
  initialValue = "",
  size = "compact",
  onSearch,
  placeholder = "Describe what you want to automate…",
  showSuggestions = false,
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    if (onSearch) {
      onSearch(q)
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  function handleSuggestion(prompt: string) {
    setValue(prompt)
    if (onSearch) {
      onSearch(prompt)
    } else {
      router.push(`/search?q=${encodeURIComponent(prompt)}`)
    }
  }

  const isHero = size === "hero"

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center bg-white border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all ${
            isHero
              ? "border-gray-300 shadow-md gap-2 px-4 py-3"
              : "border-gray-200 gap-1.5 px-3 py-2"
          }`}
        >
          <svg
            className={`shrink-0 text-gray-400 ${isHero ? "w-5 h-5" : "w-4 h-4"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            maxLength={500}
            className={`flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 ${
              isHero ? "text-base" : "text-sm"
            }`}
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className={`shrink-0 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
              isHero ? "px-5 py-2 text-sm" : "px-3 py-1.5 text-xs"
            }`}
          >
            Search
          </button>
        </div>
      </form>

      {showSuggestions && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTION_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSuggestion(prompt)}
              className="text-sm bg-white border border-gray-200 text-gray-600 rounded-full px-3 py-1.5 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
