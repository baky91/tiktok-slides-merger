import type { Layout, LineColor, Quality } from '../types'

export type ExportRequestBody = {
  layout: Layout
  columns: number
  spacing: number
  lineColor: LineColor
  qualityPreset: Quality
  images: string[]
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
