import { GeoLocation } from "./types"

export async function getGeoLocation(): Promise<GeoLocation> {
  try {
    const response = await fetch('https://ipwho.is/', { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`Erro ao obter localização: ${response.status}`)
    }

    const data = await response.json()
    return data as GeoLocation
  } catch (error) {
    console.error('Erro ao obter dados de geolocalização:', error)
    throw error
  }
}
