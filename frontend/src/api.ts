import type { Layout, Quality } from './types'

export type TiktokCarousel = {
  url: string
  id: string
  author: string | null
  description: string
  images: string[]
}

export type ExportRequestBody = {
  layout: Layout
  columns: number
  spacing: number
  background: string
  qualityPreset: Quality
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

// Returns the merged image; errors are sent back as JSON instead
export async function mergeTiktokImages(
  body: ExportRequestBody
): Promise<Blob> {
  const response = await fetch('/api/merge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.error ?? 'Unable to export images.')
  }
  return response.blob()
}
