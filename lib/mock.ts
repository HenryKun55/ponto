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

    const clockIn = new Date(currentDate)
    clockIn.setHours(
      8 + Math.floor(Math.random() * 2),
      Math.floor(Math.random() * 60)
    )

    const clockOut = new Date(clockIn)
    clockOut.setHours(clockIn.getHours() + 8, Math.floor(Math.random() * 60))

    const createdAt = new Date(clockOut.getTime() + 10000).toISOString()
    const realClockInTime = new Date(clockIn.getTime() + 1000).toISOString()
    const realClockOutTime = new Date(clockOut.getTime() + 2000).toISOString()

    entries.push({
      id: `emp-${i}-${clockIn.getTime()}`,
      employee: 'thalia',
      date: dateStr,
      clockIn: clockIn.toISOString(),
      clockOut: clockOut.toISOString(),
      clockInLocation: createGeoLocation(),
      clockOutLocation: createGeoLocation(),
      createdAt,
      realClockInTime,
      realClockOutTime,
    })
  }

  return entries
}
