'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TimePickerProps {
  label: string
  isOpen: boolean
  onChangeAction: (time: string) => void
  defaultValue?: string
}

export function TimePicker({
  label,
  isOpen,
  onChangeAction,
  defaultValue,
}: TimePickerProps) {
  // Formatar a hora atual no formato HH:MM
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const currentTime = `${hours}:${minutes}`

  const [time, setTime] = useState(defaultValue || currentTime)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value)
    onChangeAction(e.target.value)
  }

  useEffect(() => {
    if (!isOpen) return

    setTime(currentTime)
    onChangeAction(currentTime)
  }, [isOpen])

  return (
    <div className="space-y-2">
      <Label htmlFor="time-picker">{label}</Label>
      <Input
        id="time-picker"
        type="time"
        value={time}
        onChange={handleChange}
        className="w-full"
      />
    </div>
  )
}
