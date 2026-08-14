"use client"

import React from "react"
import BasicDropdown from "@/components/ui/accordion-2"

const items = [
  { id: 1, label: "Small (S)" },
  { id: 2, label: "Medium (M)" },
  { id: 3, label: "Large (L)" },
  { id: 4, label: "Extra Large (XL)" },
]

const DropdownDemo = () => {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4 p-8">
      <h3 className="text-lg font-medium text-slate-900">Select a size</h3>
      <BasicDropdown
        label="Choose a size"
        items={items}
        onChange={(item) => console.log("Selected:", item.label)}
      />
    </div>
  )
}

export default DropdownDemo
