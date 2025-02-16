// iTunes API 相关
export interface AppData {
  artworkUrl512: string
  screenshotUrls: string[]
  trackName: string
  sellerName: string
  version: string
  averageUserRating: number
  description: string
}

export async function fetchAppData(appId: string): Promise<AppData> {
  const response = await fetch(
    `https://itunes.apple.com/lookup?id=${appId}&country=us`
  )
  const data = await response.json()
  if (!data.results || data.results.length === 0) {
    throw new Error('App not found')
  }
  
  const result = data.results[0]
  return {
    artworkUrl512: result.artworkUrl512,
    screenshotUrls: result.screenshotUrls || [],
    trackName: result.trackName,
    sellerName: result.sellerName,
    version: result.version,
    averageUserRating: result.averageUserRating,
    description: result.description
  }
} 