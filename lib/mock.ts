import { GeoLocation, TimeEntry } from './types'

export const createGeoLocation = (): GeoLocation => {
  return {
    ip: '179.127.35.225',
    success: true,
    type: 'IPv4',
    continent: 'South America',
    continent_code: 'SA',
    country: 'Brazil',
    country_code: 'BR',
    region: 'State of Pernambuco',
    region_code: 'PE',
    city: 'Belo Jardim',
    latitude: -8.3357786,
    longitude: -36.4235973,
    is_eu: false,
    postal: '55150-000',
    calling_code: '55',
    capital: 'Brasília',
    borders: 'AR,BO,CO,GF,GY,PE,PY,SR,UY,VE',
    flag: {
      img: 'https://cdn.ipwhois.io/flags/br.svg',
      emoji: '🇧🇷',
      emoji_unicode: 'U+1F1E7 U+1F1F7',
    },
    connection: {
      asn: 263637,
      org: 'DIGITAL TECNOLOGIA TELECOMUNICACAO LTDA',
      isp: 'DIGITAL TECNOLOGIA TELECOMUNICACAO LTDA',
      domain: 'digitalonline.com.br',
    },
    timezone: {
      id: 'America/Recife',
      abbr: '-03',
      is_dst: false,
      offset: -10800,
      utc: '-03:00',
      current_time: new Date().toISOString(),
    },
  }
}

const pad = (n: number) => {
  return n.toString().padStart(2, '0')
}

export const generateTimeEntries = (
  startDateStr: string,
  count = 25
): TimeEntry[] => {
  const entries: TimeEntry[] = []
  const startDate = new Date(startDateStr)

  for (let i = 0; i < count; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + i)
    const yyyy = currentDate.getFullYear()
    const mm = pad(currentDate.getMonth() + 1)
    const dd = pad(currentDate.getDate())
    const dateStr = `${yyyy}-${mm}-${dd}`

    const workedMorning = Math.random() > 0.1 // 90% chance of working morning
    const workedAfternoon = Math.random() > 0.3 // 70% chance of working afternoon

    let morningClockIn: string | null = null
    let morningClockOut: string | null = null
    let morningClockInLocation: GeoLocation | null = null
    let morningClockOutLocation: GeoLocation | null = null
    let realMorningClockInTime: string | null = null
    let realMorningClockOutTime: string | null = null

    let afternoonClockIn: string | null = null
    let afternoonClockOut: string | null = null
    let afternoonClockInLocation: GeoLocation | null = null
    let afternoonClockOutLocation: GeoLocation | null = null
    let realAfternoonClockInTime: string | null = null
    let realAfternoonClockOutTime: string | null = null

    const baseCreatedAt = new Date(currentDate)
    baseCreatedAt.setHours(18, 0, 0, 0) // Base time for created at

    if (workedMorning) {
      const morningIn = new Date(currentDate)
      morningIn.setHours(
        7 + Math.floor(Math.random() * 2), // 7-8 AM
        Math.floor(Math.random() * 60)
      )

      const morningOut = new Date(morningIn)
      morningOut.setHours(
        morningIn.getHours() + 3 + Math.floor(Math.random() * 2), // 3-4 hours later
        Math.floor(Math.random() * 60)
      )

      morningClockIn = morningIn.toISOString()
      morningClockOut = morningOut.toISOString()
      morningClockInLocation = createGeoLocation()
      morningClockOutLocation = createGeoLocation()
      realMorningClockInTime = new Date(
        morningIn.getTime() + 1000
      ).toISOString()
      realMorningClockOutTime = new Date(
        morningOut.getTime() + 2000
      ).toISOString()
    }

    if (workedAfternoon) {
      const afternoonIn = new Date(currentDate)
      afternoonIn.setHours(
        13 + Math.floor(Math.random() * 2), // 1-2 PM
        Math.floor(Math.random() * 60)
      )

      const afternoonOut = new Date(afternoonIn)
      afternoonOut.setHours(
        afternoonIn.getHours() + 3 + Math.floor(Math.random() * 2), // 3-4 hours later
        Math.floor(Math.random() * 60)
      )

      afternoonClockIn = afternoonIn.toISOString()
      afternoonClockOut = afternoonOut.toISOString()
      afternoonClockInLocation = createGeoLocation()
      afternoonClockOutLocation = createGeoLocation()
      realAfternoonClockInTime = new Date(
        afternoonIn.getTime() + 1000
      ).toISOString()
      realAfternoonClockOutTime = new Date(
        afternoonOut.getTime() + 2000
      ).toISOString()
    }

    const createdAt = new Date(
      baseCreatedAt.getTime() + Math.random() * 3600000
    ).toISOString() // Random time within an hour
    const updatedAt = new Date(
      new Date(createdAt).getTime() + Math.random() * 3600000
    ).toISOString() // Updated after created

    entries.push({
      id: `emp-${i}-${currentDate.getTime()}`,
      employee: 'thalia',
      date: dateStr,
      morningClockIn,
      morningClockOut,
      morningClockInLocation,
      morningClockOutLocation,
      realMorningClockInTime,
      realMorningClockOutTime,
      afternoonClockIn,
      afternoonClockOut,
      afternoonClockInLocation,
      afternoonClockOutLocation,
      realAfternoonClockInTime,
      realAfternoonClockOutTime,
      createdAt,
      updatedAt,
    })
  }

  return entries
}
