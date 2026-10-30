import { Button } from '../Button'

type ImagePickerProps = {
  images: string[]
  activeImages: string[]
  onToggle: (image: string) => void
  onToggleAll: () => void
}

// Horizontally scrollable strip of slides; selected ones show their order in the merge
export function ImagePicker({ images, activeImages, onToggle, onToggleAll }: ImagePickerProps) {
  const allSelected = activeImages.length === images.length

  return (
    <div className="image-picker">
      <div className="picker-header">
        <span className="control-label">Slides</span>
        <span className="helper">{activeImages.length}/{images.length} selected</span>
        <Button className="picker-toggle" onClick={onToggleAll}>{allSelected ? 'Deselect all' : 'Select all'}</Button>
      </div>
      <div className="picker-strip">
        {images.map((image, index) => {
          const order = activeImages.indexOf(image)
          const selected = order !== -1
          return (
            <Button key={image} className={`picker-thumb ${selected ? 'selected' : ''}`} aria-pressed={selected} aria-label={`Slide ${index + 1}`} onClick={() => onToggle(image)}>
              <img src={image} alt="" referrerPolicy="no-referrer" draggable={false} />
              <span className="picker-badge">{selected ? order + 1 : ''}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
