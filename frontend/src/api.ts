export type TiktokCarousel = {
  url: string
  id: string
  author: string | null
  description: string
  images: string[]
}

export async function fetchTiktokImages(url: string): Promise<TiktokCarousel> {
  const response = await fetch(`/api/images?url=${encodeURIComponent(url)}`)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error ?? 'Unable to fetch images from this link.')
  }
  return data
}
