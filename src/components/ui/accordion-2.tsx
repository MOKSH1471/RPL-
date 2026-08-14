"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export interface DropdownItem {
  id: string | number
  label: string
  icon?: React.ReactNode
}

export interface BasicDropdownProps {
  label: string
  items: DropdownItem[]
  value?: DropdownItem | null
  onChange?: (item: DropdownItem) => void
  className?: string
}

export default function BasicDropdown({
  label,
  items,
  value,
  onChange,
  className = "",
}: BasicDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DropdownItem | null>(value || null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value !== undefined) {
      setSelectedItem(value)
    }
  }, [value])

  const handleItemSelect = (item: DropdownItem) => {
    setSelectedItem(item)
    setIsOpen(false)
    onChange?.(item)
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const buttonId = "dropdown-button"

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${className}`}>
      <button
        type="button"
        id={buttonId}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 shadow-xs transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer min-h-[48px]"
      >
        <span className="flex items-center gap-2 truncate font-medium text-sm">
          {selectedItem?.icon && <span className="shrink-0">{selectedItem.icon}</span>}
          <span className={selectedItem ? "text-slate-900 font-bold" : "text-slate-500"}>
            {selectedItem ? selectedItem.label : label}
          </span>
        </span>
        <motion.div
          className="text-slate-500 shrink-0"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute left-0 z-50 mt-1.5 w-full origin-top rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl overflow-hidden max-h-60 overflow-y-auto"
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95, transition: { duration: 0.15 } }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby={buttonId}
          >
            <ul className="py-1.5 space-y-0.5">
              {items.map((item) => {
                const selected = selectedItem?.id === item.id
                return (
                  <motion.li
                    key={item.id}
                    role="none"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleItemSelect(item)}
                      className={[
                        "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer",
                        "focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500",
                        selected
                          ? "bg-slate-100 text-slate-900 font-extrabold border-l-4 border-amber-600"
                          : "text-slate-700 hover:bg-slate-50 font-medium"
                      ].join(" ")}
                    >
                      {item.icon && <span className="shrink-0">{item.icon}</span>}
                      <span className="truncate">{item.label}</span>

                      {selected && (
                        <motion.span
                          className="ml-auto text-amber-700 shrink-0 font-bold"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          aria-hidden
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.span>
                      )}
                    </button>

                  </motion.li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
