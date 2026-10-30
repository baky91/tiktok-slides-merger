import { Icon } from './Icon'

export function Header() {
  return (
    <header className="topbar">
      <a className="brand" href='/'>
        <div className="brand-mark"><Icon name="spark" size={17} /></div>
        <span>SlidesMerger</span>
      </a>
    </header>
  )
}
