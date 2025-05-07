export type TimeEntry = {
  id: string
  employee: string
  date: string
  clockIn: string | null
  clockOut: string | null
  clockInLocation: GeoLocation | null
  clockOutLocation: GeoLocation | null
  createdAt: string
  realClockInTime: string | null
  realClockOutTime: string | null
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
