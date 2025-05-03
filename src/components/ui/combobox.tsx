"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Badge } from "./badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

export interface ComboboxOption {
  label: string
  value: string
}

interface MultiSelectComboboxProps {
  options: ComboboxOption[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  emptyText?: string
  className?: string
  allowCustomValues?: boolean
}

export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  emptyText = "No items found.",
  className,
  allowCustomValues = true,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  // Handle adding a custom value
  const handleAddCustomValue = () => {
    if (!inputValue.trim() || selected.includes(inputValue)) return
    
    onChange([...selected, inputValue])
    setInputValue("")
  }

  // Handle selecting an item from the dropdown
  const handleSelectItem = (currentValue: string) => {
    const newSelected = selected.includes(currentValue)
      ? selected.filter(value => value !== currentValue)
      : [...selected, currentValue]
    
    onChange(newSelected)
  }

  // Handle removing a selected item
  const handleRemove = (value: string) => {
    onChange(selected.filter(item => item !== value))
  }

  // Handle input keydown events (for custom value entry)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue && allowCustomValues) {
      e.preventDefault()
      handleAddCustomValue()
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            type="button"
            className="w-full justify-between font-normal"
          >
            {selected.length > 0 
              ? `${selected.length} selected` 
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0" 
          align="start"
          sideOffset={5}
        >
          <Command>
            <CommandInput 
              placeholder="Search..." 
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
              className="h-9"
            />
            <CommandEmpty>
              {emptyText}
              {allowCustomValues && inputValue.trim() && (
                <Button
                  type="button"
                  variant="outline" 
                  size="sm"
                  className="mt-2 w-full justify-start text-xs"
                  onClick={() => {
                    handleAddCustomValue();
                    setOpen(false);
                  }}
                >
                  Add "{inputValue}"
                </Button>
              )}
            </CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    handleSelectItem(option.value);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border",
                        selected.includes(option.value)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "opacity-50 border-muted-foreground"
                      )}
                    >
                      {selected.includes(option.value) && (
                        <Check className="h-3 w-3" />
                      )}
                    </span>
                    <span>{option.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selected.map(value => (
            <Badge 
              key={value} 
              variant="secondary" 
              className="flex items-center gap-1 px-2 py-1"
            >
              <span>{value}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(value)}
                className="h-auto w-auto p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {value}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}