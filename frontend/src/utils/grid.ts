// A grid has at least 2 columns (the columns stepper never goes below)
export const MIN_COLUMNS = 2

// Number of columns that makes the merged image roughly square: the square
// root of the image count, rounded up. Rounding up suits portrait images
// (taller than wide): 20 images give 5 columns, a square, instead of 4
export function defaultColumnCount(imageCount: number): number {
  return Math.max(MIN_COLUMNS, Math.ceil(Math.sqrt(imageCount)))
}
