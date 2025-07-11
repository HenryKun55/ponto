export type TimeEntry = {
  id: string
  employee: string
  date: string
  morningClockIn: string | null
  morningClockOut: string | null
  morningClockInLocation: GeoLocation | null
  morningClockOutLocation: GeoLocation | null
  realMorningClockInTime: string | null
  realMorningClockOutTime: string | null
  afternoonClockIn: string | null
  afternoonClockOut: string | null
  afternoonClockInLocation: GeoLocation | null
  afternoonClockOutLocation: GeoLocation | null
  realAfternoonClockInTime: string | null
  realAfternoonClockOutTime: string | null
  createdAt: string
  updatedAt: string
}

export type GeoLocation = {
  ip: string
  success: boolean
  type: string
  continent: string
  continent_code: string
  country: string
  country_code: string
  region: string
  region_code: string
  city: string
  latitude: number
  longitude: number
  is_eu: boolean
  postal: string
  calling_code: string
  capital: string
  borders: string
  flag: {
    img: string
    emoji: string
    emoji_unicode: string
  }
  connection: {
    asn: number
    org: string
    isp: string
    domain: string
  }
  timezone: {
    id: string
    abbr: string
    is_dst: boolean
    offset: number
    utc: string
    current_time: string
  }
}

export enum Period {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
}

export enum ActionType {
  CLOCK_IN = 'in',
  CLOCK_OUT = 'out',
}

export type ClockInInput = {
  employee: string
  selectedTime: string
  location: GeoLocation | null
  todayEntry: TimeEntry | null | undefined
  period: 'morning' | 'afternoon'
}

export type ClockOutInput = {
  employee: string
  selectedTime: string
  location: GeoLocation | null
  todayEntry: TimeEntry | null | undefined
  period: 'morning' | 'afternoon'
}
