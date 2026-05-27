import { useState, type CSSProperties } from 'react'
import './App.css'

type Orientation = 'portrait' | 'landscape'

type TabletPreset = {
  id: string
  name: string
  width: number
  height: number
}

type GridConfig = {
  columns: number
  padding: number
  gap: number
}

type PaneConfig = {
  listSpan: number
  boxSpan: number
  showBox: boolean
}

type SafeAreaConfig = {
  top: number
}

type Platform = 'apple' | 'android'

type NavItem =
  | {
      id: string
      label: string
      active?: boolean
      kind?: 'default'
    }
  | {
      id: string
      label: string
      kind: 'create'
    }

const TABLET_PRESETS: TabletPreset[] = [
  {
    id: 'amazon-fire-7',
    name: 'Amazon Fire 7',
    width: 600,
    height: 1024,
  },
  {
    id: 'ipad-mini-8',
    name: 'iPad mini 8.3',
    width: 744,
    height: 1133,
  },
  {
    id: 'ipad-air-11',
    name: 'iPad Air 11',
    width: 820,
    height: 1180,
  },
  {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11',
    width: 834,
    height: 1210,
  },
  {
    id: 'ipad-pro-13',
    name: 'iPad Pro 13',
    width: 1032,
    height: 1376,
  },
  {
    id: 'galaxy-tab-s9',
    name: 'Galaxy Tab S9',
    width: 800,
    height: 1280,
  },
  {
    id: 'galaxy-tab-s9-plus',
    name: 'Galaxy Tab S9+',
    width: 876,
    height: 1400,
  },
  {
    id: 'galaxy-tab-s9-ultra',
    name: 'Galaxy Tab S9 Ultra',
    width: 924,
    height: 1480,
  },
  {
    id: 'pixel-tablet',
    name: 'Pixel Tablet',
    width: 800,
    height: 1280,
  },
  {
    id: 'surface-pro-11',
    name: 'Surface Pro 11',
    width: 960,
    height: 1440,
  },
]

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'friends', label: 'Friends' },
  { id: 'create', label: 'Create', kind: 'create' },
  { id: 'inbox', label: 'Inbox', active: true },
  { id: 'profile', label: 'Profile' },
]

function getGridConfig(width: number): GridConfig {
  if (width < 600) {
    return { columns: 4, padding: 8, gap: 8 }
  }

  if (width < 840) {
    return { columns: 12, padding: 8, gap: 8 }
  }

  if (width < 1200) {
    return { columns: 12, padding: 16, gap: 8 }
  }

  if (width < 1600) {
    return { columns: 20, padding: 16, gap: 16 }
  }

  return { columns: 24, padding: 16, gap: 16 }
}

function getPaneConfig(columns: number): PaneConfig {
  if (columns <= 4) {
    return { listSpan: 1, boxSpan: columns - 1, showBox: true }
  }

  if (columns === 12) {
    return { listSpan: 4, boxSpan: 8, showBox: true }
  }

  if (columns === 20) {
    return { listSpan: 6, boxSpan: 14, showBox: true }
  }

  if (columns === 24) {
    return { listSpan: 6, boxSpan: 18, showBox: true }
  }

  const listSpan = Math.max(4, Math.floor(columns / 3))
  return { listSpan, boxSpan: columns - listSpan, showBox: true }
}

function computeListWidth(
  viewportWidth: number,
  gridConfig: GridConfig,
  listSpan: number,
): number {
  const usableWidth = viewportWidth - gridConfig.padding * 2
  const totalGapWidth = (gridConfig.columns - 1) * gridConfig.gap
  const singleColumnWidth = (usableWidth - totalGapWidth) / gridConfig.columns
  // list 右边沿 = grid 第 N 列的右边线
  // = 左 padding + N 个 column 宽 + (N-1) 个内部 gap
  const innerGapWidth = Math.max(0, listSpan - 1) * gridConfig.gap
  return gridConfig.padding + singleColumnWidth * listSpan + innerGapWidth
}

function resolvePaneConfig(
  viewportWidth: number,
  gridConfig: GridConfig,
  listMinWidth: number,
): PaneConfig {
  const basePaneConfig = getPaneConfig(gridConfig.columns)
  const listWidth = computeListWidth(viewportWidth, gridConfig, basePaneConfig.listSpan)

  if (listWidth < listMinWidth) {
    return {
      listSpan: gridConfig.columns,
      boxSpan: 0,
      showBox: false,
    }
  }

  return basePaneConfig
}

function getTabletPlatform(tabletId: string): Platform {
  return tabletId.startsWith('ipad') ? 'apple' : 'android'
}

function getListMinWidth(platform: Platform): number {
  return platform === 'apple' ? 288 : 288
}

function getSafeAreaConfig(tabletId: string): SafeAreaConfig {
  if (tabletId.startsWith('ipad')) {
    return { top: 24 }
  }

  return { top: 16 }
}

function getListPaneWidth(
  viewportWidth: number,
  gridConfig: GridConfig,
  paneConfig: PaneConfig,
): number {
  if (!paneConfig.showBox) {
    return viewportWidth
  }

  return computeListWidth(viewportWidth, gridConfig, paneConfig.listSpan)
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M15.3655 5.22669C15.7341 4.92444 16.2649 4.92444 16.6335 5.22667L27.3672 14.0267C27.694 14.2945 27.8171 14.7388 27.6749 15.1367C27.5326 15.5345 27.1557 15.8 26.7332 15.8H25.1792L24.3845 24.4852C24.306 25.3433 23.5864 26 22.7248 26H9.27501C8.41338 26 7.69379 25.3432 7.61527 24.4852L6.82055 15.8H5.26617C4.84368 15.8 4.46678 15.5345 4.32454 15.1367C4.18231 14.7388 4.30543 14.2946 4.63214 14.0267L15.3655 5.22669ZM15.9995 7.29312L8.0631 13.8H8.6459L9.57923 24H14.9995V18.8759C14.9995 18.5077 15.298 18.2092 15.6662 18.2092H16.3328C16.701 18.2092 16.9995 18.5077 16.9995 18.8759V24H22.4205L23.3539 13.8H23.9362L15.9995 7.29312Z" />
    </svg>
  )
}

function FriendsIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M11.9999 8.33331C10.3931 8.33331 9.0565 9.66782 9.0565 11.3563C9.0565 13.0448 10.3931 14.3793 11.9999 14.3793C13.6068 14.3793 14.9433 13.0448 14.9433 11.3563C14.9433 9.66782 13.6068 8.33331 11.9999 8.33331ZM7.0565 11.3563C7.0565 8.60111 9.251 6.33331 11.9999 6.33331C14.7488 6.33331 16.9433 8.60111 16.9433 11.3563C16.9433 14.1115 14.7488 16.3793 11.9999 16.3793C9.251 16.3793 7.0565 14.1115 7.0565 11.3563ZM11.9999 19.9195C9.38667 19.9195 7.1601 21.7077 6.46456 24.1782C6.36478 24.5326 6.02547 24.7805 5.66216 24.7207L5.00433 24.6126C4.64102 24.5528 4.39217 24.2087 4.48208 23.8517C5.33813 20.4525 8.36722 17.9195 11.9999 17.9195C15.6326 17.9195 18.6617 20.4525 19.5177 23.8517C19.6077 24.2087 19.3588 24.5528 18.9955 24.6126L18.3377 24.7207C17.9744 24.7805 17.635 24.5326 17.5353 24.1782C16.8397 21.7077 14.6132 19.9195 11.9999 19.9195Z" />
      <path d="M22 21.0247C21.4963 21.0247 21.0131 21.112 20.563 21.2728C20.2163 21.3967 19.8125 21.2828 19.6365 20.9594L19.3179 20.3739C19.1419 20.0504 19.2604 19.642 19.6005 19.5011C20.3419 19.194 21.1523 19.0247 22 19.0247C24.9702 19.0247 27.4395 21.0869 28.1804 23.8541C28.2756 24.2098 28.0257 24.5539 27.6623 24.6131L27.0043 24.7202C26.6409 24.7794 26.303 24.5304 26.1928 24.179C25.6144 22.3333 23.9399 21.0247 22 21.0247Z" />
      <path d="M21.9999 12.3333C21.0794 12.3333 20.3332 13.0795 20.3332 14C20.3332 14.9205 21.0794 15.6666 21.9999 15.6666C22.9204 15.6666 23.6666 14.9205 23.6666 14C23.6666 13.0795 22.9204 12.3333 21.9999 12.3333ZM18.3332 14C18.3332 11.9749 19.9749 10.3333 21.9999 10.3333C24.025 10.3333 25.6666 11.9749 25.6666 14C25.6666 16.025 24.025 17.6666 21.9999 17.6666C19.9749 17.6666 18.3332 16.025 18.3332 14Z" />
    </svg>
  )
}

function CreateIcon() {
  return (
    <svg viewBox="0 0 127 49" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M49.2 22.8C49.2 18.3196 49.2 16.0794 50.0719 14.3681C50.8389 12.8628 52.0627 11.6389 53.568 10.8719C55.2793 10 57.5195 10 62 10H71.8999C76.3803 10 78.6205 10 80.3318 10.8719C81.8371 11.6389 83.061 12.8628 83.828 14.3681C84.6999 16.0794 84.6999 18.3196 84.6999 22.8V25.2C84.6999 29.6804 84.6999 31.9206 83.828 33.6319C83.061 35.1372 81.8371 36.3611 80.3318 37.1281C78.6205 38 76.3803 38 71.8999 38H61.9999C57.5195 38 55.2793 38 53.568 37.1281C52.0627 36.3611 50.8389 35.1372 50.0719 33.6319C49.2 31.9206 49.2 29.6804 49.2 25.2V22.8Z"
        fill="#FA2D6C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M41.7 22.8C41.7 18.3196 41.7 16.0794 42.572 14.3681C43.3389 12.8628 44.5628 11.6389 46.0681 10.8719C47.7794 10 50.0196 10 54.5 10H64.4C68.8804 10 71.1206 10 72.8319 10.8719C74.3372 11.6389 75.561 12.8628 76.328 14.3681C77.2 16.0794 77.2 18.3196 77.2 22.8V25.2C77.2 29.6804 77.2 31.9206 76.328 33.6319C75.561 35.1372 74.3372 36.3611 72.8319 37.1281C71.1206 38 68.8804 38 64.4 38H54.5C50.0196 38 47.7794 38 46.0681 37.1281C44.5628 36.3611 43.3389 35.1372 42.572 33.6319C41.7 31.9206 41.7 29.6804 41.7 25.2V22.8Z"
        fill="#20D5EC"
      />
      <rect x="45.1998" y="10" width="36" height="28" rx="8" fill="black" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M62.1999 17.5C61.9237 17.5 61.6999 17.7239 61.6999 18V22.75H56.9498C56.6736 22.75 56.4498 22.9739 56.4498 23.25V24.75C56.4498 25.0261 56.6736 25.25 56.9498 25.25H61.6999V30C61.6999 30.2761 61.9237 30.5 62.1999 30.5H63.6999C63.976 30.5 64.1999 30.2761 64.1999 30V25.25H68.9498C69.2259 25.25 69.4498 25.0261 69.4498 24.75V23.25C69.4498 22.9739 69.2259 22.75 68.9498 22.75H64.1999V18C64.1999 17.7239 63.976 17.5 63.6999 17.5H62.1999Z"
        fill="white"
      />
    </svg>
  )
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.66513 6C6.74637 6 6.00089 6.74352 5.99847 7.66228L5.96161 21.6623C5.95919 22.5845 6.70609 23.3333 7.62828 23.3333H12.5264L14.7104 26.0026C15.3773 26.8176 16.6235 26.8176 17.2903 26.0026L19.4741 23.3333H24.3725C25.2947 23.3333 26.0416 22.5844 26.0391 21.6622L26.002 7.66224C25.9995 6.7435 25.2541 6 24.3353 6H7.66513ZM19.3334 14H12.6667C12.2985 14 12 14.2985 12 14.6667V15.3333C12 15.7015 12.2985 16 12.6667 16H19.3334C19.7015 16 20 15.7015 20 15.3333V14.6667C20 14.2985 19.7015 14 19.3334 14Z"
      />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 7.66669C13.9749 7.66669 12.3333 9.30831 12.3333 11.3334C12.3333 13.3584 13.9749 15 16 15C18.025 15 19.6667 13.3584 19.6667 11.3334C19.6667 9.30831 18.025 7.66669 16 7.66669ZM10.3333 11.3334C10.3333 8.20374 12.8704 5.66669 16 5.66669C19.1296 5.66669 21.6667 8.20374 21.6667 11.3334C21.6667 14.463 19.1296 17 16 17C12.8704 17 10.3333 14.463 10.3333 11.3334ZM16 20.3334C12.7638 20.3334 10.039 22.5303 9.23846 25.5141C9.14305 25.8697 8.80245 26.1161 8.43933 26.0552L7.78185 25.9449C7.41874 25.8839 7.17133 25.539 7.2591 25.1815C8.22405 21.2499 11.7705 18.3334 16 18.3334C20.2294 18.3334 23.7759 21.2499 24.7409 25.1815C24.8286 25.539 24.5812 25.8839 24.2181 25.9449L23.5606 26.0552C23.1975 26.1161 22.8569 25.8697 22.7615 25.5141C21.961 22.5303 19.2362 20.3334 16 20.3334Z" />
    </svg>
  )
}

function NavIcon({ id }: { id: string }) {
  switch (id) {
    case 'home':
      return <HomeIcon />
    case 'friends':
      return <FriendsIcon />
    case 'inbox':
      return <InboxIcon />
    case 'profile':
      return <ProfileIcon />
    default:
      return null
  }
}

function App() {
  const [activeTabletId, setActiveTabletId] = useState(TABLET_PRESETS[2].id)
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [showGraybox, setShowGraybox] = useState(true)
  const [showGrid, setShowGrid] = useState(true)

  const activeTablet =
    TABLET_PRESETS.find((tablet) => tablet.id === activeTabletId) ?? TABLET_PRESETS[0]

  const viewport =
    orientation === 'portrait'
      ? { width: activeTablet.width, height: activeTablet.height }
      : { width: activeTablet.height, height: activeTablet.width }
  const gridConfig = getGridConfig(viewport.width)
  const platform = getTabletPlatform(activeTablet.id)
  const listMinWidth = getListMinWidth(platform)
  const paneConfig = resolvePaneConfig(viewport.width, gridConfig, listMinWidth)
  const safeAreaConfig = getSafeAreaConfig(activeTablet.id)
  const listPaneWidth = getListPaneWidth(viewport.width, gridConfig, paneConfig)

  return (
    <main className="tablet-page">
      <section className="controls-shell">
        <div className="control-group">
          <span className="control-label">Device</span>
          <div className="segmented-control tablet-list" role="tablist" aria-label="选择平板尺寸">
            {TABLET_PRESETS.map((tablet) => (
              <button
                key={tablet.id}
                type="button"
                className="segment"
                data-active={tablet.id === activeTablet.id}
                aria-pressed={tablet.id === activeTablet.id}
                onClick={() => setActiveTabletId(tablet.id)}
              >
                <span>{tablet.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="control-inline-row">
          <div className="control-group">
            <span className="control-label">Orientation</span>
            <div className="segmented-control orientation-control" aria-label="切换方向">
              {(['portrait', 'landscape'] as Orientation[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="segment"
                  data-active={orientation === value}
                  aria-pressed={orientation === value}
                  onClick={() => setOrientation(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">Layers</span>
            <div className="toggle-row">
              <label className="toggle-control">
                <input
                  type="checkbox"
                  checked={showGraybox}
                  onChange={(event) => setShowGraybox(event.target.checked)}
                />
                <span className="toggle-track" aria-hidden="true">
                  <span className="toggle-thumb" />
                </span>
                <span className="toggle-text">Graybox</span>
              </label>

              <label className="toggle-control">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(event) => setShowGrid(event.target.checked)}
                />
                <span className="toggle-track" aria-hidden="true">
                  <span className="toggle-thumb" />
                </span>
                <span className="toggle-text">Grid</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="preview-shell">
        <div className="device-stage">
          <div
            className="tablet-frame"
            style={{
              width: `${viewport.width}px`,
              height: `${viewport.height}px`,
            }}
          >
            <div
              className="tablet-screen"
              style={
                {
                  '--safe-area-top': `${safeAreaConfig.top}px`,
                  '--nav-height': '80.5px',
                } as CSSProperties
              }
            >
              <div className="tablet-canvas">
                <div
                  className="tablet-column-grid"
                  data-visible={showGrid ? 'true' : 'false'}
                  style={{
                    gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(0, 1fr))`,
                    padding: `0 ${gridConfig.padding}px`,
                    gap: `${gridConfig.gap}px`,
                  }}
                  aria-hidden="true"
                >
                  {Array.from({ length: gridConfig.columns }).map((_, index) => (
                    <span key={index} className="tablet-column-grid-line" />
                  ))}
                </div>
                <div
                  className="tablet-content-layout"
                  data-visible={showGraybox ? 'true' : 'false'}
                  style={
                    {
                      gridTemplateColumns: paneConfig.showBox
                        ? `${listPaneWidth}px minmax(0, 1fr)`
                        : 'minmax(0, 1fr)',
                      padding: `${safeAreaConfig.top}px 0 0`,
                      gap: '0',
                    } as CSSProperties
                  }
                >
                  <section className="tablet-content-pane tablet-content-list" />
                  {paneConfig.showBox ? (
                    <section className="tablet-content-pane tablet-content-box" />
                  ) : null}
                </div>
              </div>
              <nav className="tablet-nav" aria-label="Bottom navigation">
                <div className="tablet-nav-inner">
                  {NAV_ITEMS.map((item) =>
                    item.kind === 'create' ? (
                      <button
                        key={item.id}
                        type="button"
                        className="tablet-nav-item tablet-nav-item-create"
                        aria-label={item.label}
                      >
                        <span className="tablet-nav-create-icon">
                          <CreateIcon />
                        </span>
                      </button>
                    ) : (
                      <button
                        key={item.id}
                        type="button"
                        className="tablet-nav-item"
                        data-active={item.active ? 'true' : 'false'}
                      >
                        <span className="tablet-nav-icon">
                          <NavIcon id={item.id} />
                        </span>
                        <span className="nav-label">{item.label}</span>
                      </button>
                    ),
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
