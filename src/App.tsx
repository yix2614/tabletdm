import { useState, type CSSProperties } from 'react'
import { Copy } from 'lucide-react'
import './App.css'
import { Switch } from './components/ui/switch.tsx'

type Orientation = 'portrait' | 'landscape'

type TabletPreset = {
  id: string
  name: string
  width: number
  height: number
  frameRadius: number
  screenRadius: number
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
    frameRadius: 18,
    screenRadius: 16,
  },
  {
    id: 'ipad-mini-8',
    name: 'iPad mini 8.3',
    width: 744,
    height: 1133,
    frameRadius: 28,
    screenRadius: 26,
  },
  {
    id: 'ipad-air-11',
    name: 'iPad Air 11',
    width: 820,
    height: 1180,
    frameRadius: 30,
    screenRadius: 28,
  },
  {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11',
    width: 834,
    height: 1210,
    frameRadius: 30,
    screenRadius: 28,
  },
  {
    id: 'ipad-pro-13',
    name: 'iPad Pro 13',
    width: 1032,
    height: 1376,
    frameRadius: 32,
    screenRadius: 30,
  },
  {
    id: 'galaxy-tab-s9',
    name: 'Galaxy Tab S9',
    width: 800,
    height: 1280,
    frameRadius: 22,
    screenRadius: 20,
  },
  {
    id: 'galaxy-tab-s9-plus',
    name: 'Galaxy Tab S9+',
    width: 876,
    height: 1400,
    frameRadius: 22,
    screenRadius: 20,
  },
  {
    id: 'galaxy-tab-s9-ultra',
    name: 'Galaxy Tab S9 Ultra',
    width: 924,
    height: 1480,
    frameRadius: 24,
    screenRadius: 22,
  },
  {
    id: 'pixel-tablet',
    name: 'Pixel Tablet',
    width: 800,
    height: 1280,
    frameRadius: 24,
    screenRadius: 22,
  },
  {
    id: 'surface-pro-11',
    name: 'Surface Pro 11',
    width: 960,
    height: 1440,
    frameRadius: 18,
    screenRadius: 16,
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

function InboxNavLeadingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.4998 14.5C20.7759 14.5 20.9998 14.7239 20.9998 15V17H22.9998C23.2759 17 23.4998 17.2239 23.4998 17.5V18.5C23.4998 18.7761 23.2759 19 22.9998 19H20.9998V21C20.9998 21.2761 20.7759 21.5 20.4998 21.5H19.4998C19.2237 21.5 18.9998 21.2761 18.9998 21V19H16.9998C16.7237 19 16.4998 18.7761 16.4998 18.5V17.5C16.4998 17.2239 16.7237 17 16.9998 17H18.9998V15C18.9998 14.7239 19.2237 14.5 19.4998 14.5H20.4998ZM6.7371 13C7.22248 13 7.69716 13.035 8.15507 13.1074C8.12927 13.1303 8.10349 13.1535 8.07792 13.1768C7.48595 13.7151 6.9972 14.3285 6.61015 15.001C5.16436 15.0241 4.03434 15.4419 3.2703 16.1367C2.58273 16.7621 2.10259 17.6923 2.00565 19C1.98525 19.2754 1.76324 19.5 1.4871 19.5H0.487099C0.211153 19.4998 -0.0139132 19.2756 0.00174733 19C0.104517 17.1919 0.769984 15.7063 1.9246 14.6562C3.16982 13.5239 4.87092 13.0001 6.7371 13ZM14.2371 13C15.3827 13 16.4659 13.1978 17.4197 13.6123C17.1543 14.0093 16.9998 14.4866 16.9998 15V15.6328C16.2735 15.2278 15.3453 15.0001 14.2371 15C12.7302 15 11.5557 15.4216 10.7693 16.1367C10.0818 16.7621 9.60161 17.6923 9.50468 19C9.48428 19.2752 9.26304 19.4998 8.9871 19.5H7.9871C7.71096 19.5 7.4851 19.2757 7.50077 19C7.60354 17.1919 8.26901 15.7063 9.42362 14.6562C10.6689 13.5238 12.3707 13 14.2371 13ZM6.9871 2.5C7.8201 2.50008 8.60022 2.72649 9.26933 3.12109C8.87176 3.65488 8.55457 4.2523 8.33476 4.89453C7.94594 4.64517 7.48328 4.50008 6.9871 4.5C5.60639 4.5 4.4871 5.61929 4.4871 7C4.4871 8.38071 5.60639 9.5 6.9871 9.5C7.48328 9.49992 7.94594 9.35483 8.33476 9.10547C8.55457 9.7477 8.87176 10.3451 9.26933 10.8789C8.60022 11.2735 7.8201 11.4999 6.9871 11.5C4.50182 11.5 2.4871 9.48528 2.4871 7C2.4871 4.51472 4.50182 2.5 6.9871 2.5ZM14.4861 2.5C16.9713 2.50017 18.9861 4.51482 18.9861 7C18.9861 9.48518 16.9713 11.4998 14.4861 11.5C12.0008 11.5 9.98612 9.48528 9.98612 7C9.98612 4.51472 12.0008 2.5 14.4861 2.5ZM14.4861 4.5C13.1054 4.5 11.9861 5.61929 11.9861 7C11.9861 8.38071 13.1054 9.5 14.4861 9.5C15.8667 9.49983 16.9861 8.38061 16.9861 7C16.9861 5.61939 15.8667 4.50017 14.4861 4.5Z" />
    </svg>
  )
}

function InboxNavTrailingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.915 3.75C14.875 3.75 18.085 6.96 18.085 10.915C18.085 14.875 14.875 18.085 10.915 18.085C6.96 18.085 3.75 14.875 3.75 10.915C3.75 6.96 6.96 3.75 10.915 3.75ZM10.915 1.75C5.855 1.75 1.75 5.855 1.75 10.915C1.75 15.98 5.855 20.085 10.915 20.085C13.09 20.085 15.08 19.33 16.655 18.07L21.1064 22.5168C21.3017 22.7119 21.6182 22.7118 21.8134 22.5166L22.5166 21.8134C22.7118 21.6182 22.7119 21.3017 22.5168 21.1064L18.07 16.655C19.33 15.08 20.085 13.09 20.085 10.915C20.085 5.855 15.98 1.75 10.915 1.75Z"
      />
    </svg>
  )
}

function InboxListTopBar() {
  return (
    <div className="inbox-list-topbar" aria-label="Inbox navigation bar">
      <div className="inbox-list-topbar-leading">
        <button type="button" className="inbox-list-topbar-icon-button" aria-label="People plus">
          <span className="inbox-list-topbar-icon">
            <InboxNavLeadingIcon />
          </span>
        </button>
      </div>

      <div className="inbox-list-topbar-title-area">
        <div className="inbox-list-topbar-title-wrap">
          <div className="inbox-list-topbar-title">Inbox</div>
        </div>
      </div>

      <div className="inbox-list-topbar-trailing">
        <button type="button" className="inbox-list-topbar-icon-button" aria-label="Search">
          <span className="inbox-list-topbar-icon">
            <InboxNavTrailingIcon />
          </span>
        </button>
      </div>
    </div>
  )
}

function DmBoxPhoneIcon() {
  return (
    <svg viewBox="0 0 22 22" aria-hidden="true">
      <path
        d="M2.82896 2.53815C3.88744 1.04039 6.08779 0.978745 7.22837 2.4151C7.26357 2.45943 7.30382 2.51392 7.35142 2.57917L9.30943 5.26374C9.42072 5.41621 9.52932 5.56466 9.61314 5.69733C9.70481 5.84242 9.803 6.02226 9.85826 6.24323C9.97793 6.72228 9.8996 7.23014 9.64048 7.65045C9.52088 7.84441 9.37241 7.98618 9.24107 8.09674C9.12096 8.19782 8.97243 8.3064 8.82017 8.41803L8.06626 8.97174C9.07738 11.1771 10.8462 12.947 13.0516 13.9581L13.6053 13.2032C13.717 13.0509 13.8255 12.9024 13.9266 12.7823C14.0372 12.651 14.179 12.5025 14.3729 12.3829C14.7932 12.1238 15.3011 12.0454 15.7801 12.1651C16.0011 12.2203 16.1809 12.3186 16.326 12.4102C16.4588 12.4941 16.608 12.6026 16.7606 12.7139L19.4442 14.6729C19.5092 14.7204 19.564 14.7599 19.6083 14.795C21.0448 15.9357 20.9834 18.137 19.4852 19.1954C19.439 19.228 19.3821 19.2648 19.3143 19.3087L18.9422 19.5489C16.922 20.8561 14.3638 21.0082 12.203 19.9493C7.79664 17.79 4.23337 14.2267 2.07408 9.82038C1.01529 7.65971 1.16743 5.10227 2.47447 3.0821L2.7147 2.71002C2.75861 2.64214 2.79628 2.58441 2.82896 2.53815ZM5.79283 3.55475C5.41258 3.07598 4.6788 3.09736 4.32603 3.59674C4.3181 3.60798 4.30337 3.62999 4.244 3.72174L4.01353 4.07721C3.05601 5.55702 2.94495 7.43099 3.72056 9.01374C5.70086 13.0548 8.96861 16.3225 13.0096 18.3028C14.5924 19.0784 16.4663 18.9674 17.9461 18.0098L18.3026 17.7794C18.3947 17.7198 18.4164 17.7052 18.4276 17.6973C18.9266 17.3444 18.9473 16.6107 18.4686 16.2305C18.4579 16.222 18.4369 16.2072 18.3485 16.1426L15.6991 14.209C15.5199 14.0783 15.4209 14.007 15.3465 13.96C15.3432 13.9579 15.3398 13.956 15.3368 13.9542C15.3345 13.9568 15.3325 13.9599 15.3299 13.963C15.2733 14.0302 15.2004 14.1278 15.0692 14.3067L14.452 15.1485C13.9882 15.781 13.1467 16.0052 12.4295 15.6876C9.71166 14.484 7.53938 12.3117 6.33579 9.59381C6.01823 8.87664 6.24236 8.03519 6.87486 7.57135L7.71665 6.95417C7.89527 6.82318 7.99315 6.75098 8.0604 6.6944C8.06347 6.69182 8.06651 6.68889 8.06919 6.68659C8.06732 6.68356 8.06549 6.68023 8.06333 6.67682C8.01637 6.60249 7.94508 6.50349 7.81431 6.32428L5.88072 3.67585C5.81585 3.58695 5.80133 3.56547 5.79283 3.55475Z"
        fill="currentColor"
      />
    </svg>
  )
}

function DmBoxMoreIcon() {
  return (
    <svg viewBox="0 0 22 22" aria-hidden="true">
      <path
        d="M4.125 9.16699C5.13752 9.16699 5.95801 9.98748 5.95801 11C5.95801 12.0125 5.13752 12.833 4.125 12.833C3.11248 12.833 2.29199 12.0125 2.29199 11C2.29199 9.98748 3.11248 9.16699 4.125 9.16699ZM11 9.16699C12.0125 9.16699 12.833 9.98748 12.833 11C12.833 12.0125 12.0125 12.833 11 12.833C9.98748 12.833 9.16699 12.0125 9.16699 11C9.16699 9.98748 9.98748 9.16699 11 9.16699ZM17.875 9.16699C18.8875 9.16699 19.708 9.98748 19.708 11C19.708 12.0125 18.8875 12.833 17.875 12.833C16.8625 12.833 16.042 12.0125 16.042 11C16.042 9.98748 16.8625 9.16699 17.875 9.16699Z"
        fill="currentColor"
      />
    </svg>
  )
}

function DmBoxTopBar() {
  return (
    <div className="dm-box-topbar" aria-label="DM box top bar">
      <div className="dm-box-topbar-side dm-box-topbar-side-placeholder" aria-hidden="true">
        <div className="dm-box-topbar-icon-slot" />
        <div className="dm-box-topbar-icon-slot" />
      </div>

      <div className="dm-box-topbar-center">
        <div className="dm-box-topbar-avatar">
          <img
            src="/avatars/halo.jpg"
            alt="Taoo425 avatar"
            className="dm-box-topbar-avatar-image"
          />
        </div>
        <div className="dm-box-topbar-title">Taoo425</div>
      </div>

      <div className="dm-box-topbar-side">
        <button type="button" className="dm-box-topbar-icon-button" aria-label="Phone">
          <span className="dm-box-topbar-icon">
            <DmBoxPhoneIcon />
          </span>
        </button>
        <button type="button" className="dm-box-topbar-icon-button" aria-label="More">
          <span className="dm-box-topbar-icon">
            <DmBoxMoreIcon />
          </span>
        </button>
      </div>
    </div>
  )
}

function DmBoxReceiverBubble({ message }: { message: string }) {
  return (
    <div className="dm-box-message-row dm-box-message-row-receiver">
      <div className="dm-box-bubble dm-box-bubble-receiver">{message}</div>
    </div>
  )
}

function DmBoxTimestamp({ label }: { label: string }) {
  return <div className="dm-box-timestamp">{label}</div>
}

function DmBoxSenderBubble({ message }: { message: string }) {
  return (
    <div className="dm-box-message-row dm-box-message-row-sender">
      <div className="dm-box-bubble dm-box-bubble-sender">{message}</div>
    </div>
  )
}

function DmBoxInputCameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.9997 12C14.9997 13.6569 13.6566 15 11.9997 15C10.3428 15 8.9997 13.6569 8.9997 12C8.9997 10.3431 10.3428 9 11.9997 9C13.6566 9 14.9997 10.3431 14.9997 12Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.9941 4.26334C3.04475 4.55574 1.48438 6.03238 1.08501 7.96266C0.533446 10.6286 0.507794 13.3765 1.00949 16.0522L1.07626 16.4083C1.47914 18.557 3.20235 20.2126 5.36546 20.5291L6.30018 20.6659C10.0797 21.219 13.9197 21.219 17.6992 20.6659L18.6339 20.5291C20.797 20.2126 22.5203 18.557 22.9231 16.4083L22.9899 16.0522C23.4916 13.3765 23.466 10.6286 22.9144 7.96266C22.515 6.03238 20.9546 4.55574 19.0053 4.26334L17.9147 4.09974C17.4794 4.03446 17.0699 3.8529 16.7293 3.57421L16.2192 3.15685C15.749 2.77215 15.5139 2.57979 15.2623 2.42399C14.7207 2.08869 14.1142 1.87218 13.4827 1.78876C13.1893 1.75 12.8855 1.75 12.278 1.75H11.7214C11.1139 1.75 10.8101 1.75 10.5167 1.78876C9.88523 1.87218 9.27868 2.08869 8.73713 2.42399C8.48552 2.57979 8.25042 2.77214 7.78022 3.15684L7.2701 3.57421C6.92949 3.8529 6.51997 4.03446 6.08474 4.09974L4.9941 4.26334ZM16.9997 12C16.9997 14.7614 14.7611 17 11.9997 17C9.23827 17 6.9997 14.7614 6.9997 12C6.9997 9.23858 9.23827 7 11.9997 7C14.7611 7 16.9997 9.23858 16.9997 12Z"
        fill="currentColor"
      />
    </svg>
  )
}

function DmBoxInputMicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.69995 5.49922C7.69995 3.12439 9.62513 1.19922 12 1.19922C14.3748 1.19922 16.3 3.12439 16.3 5.49922V11.4992C16.3 13.874 14.3748 15.7992 12 15.7992C9.62513 15.7992 7.69995 13.874 7.69995 11.4992V5.49922ZM4.727 8.55352C4.62004 8.49902 4.48003 8.49902 4.2 8.49902H3.8C3.51998 8.49902 3.37996 8.49902 3.27301 8.55352C3.17893 8.60146 3.10243 8.67795 3.0545 8.77203C3 8.87898 3 9.019 3 9.29902V11.316C2.99999 11.7452 2.99999 12.0014 3.01165 12.224C3.23837 16.5501 6.68131 20.0103 11 20.2644V22.199C11 22.479 11 22.6191 11.0545 22.726C11.1024 22.8201 11.1789 22.8966 11.273 22.9445C11.38 22.999 11.52 22.999 11.8 22.999H12.2C12.48 22.999 12.62 22.999 12.727 22.9445C12.8211 22.8966 12.8976 22.8201 12.9455 22.726C13 22.6191 13 22.479 13 22.199V20.2644C17.3187 20.0103 20.7616 16.5501 20.9884 12.224C21 12.0014 21 11.7452 21 11.316V9.29902C21 9.019 21 8.87898 20.9455 8.77203C20.8976 8.67795 20.8211 8.60146 20.727 8.55352C20.62 8.49902 20.48 8.49902 20.2 8.49902H19.8C19.52 8.49902 19.38 8.49902 19.273 8.55352C19.1789 8.60146 19.1024 8.67795 19.0545 8.77203C19 8.87898 19 9.019 19 9.29902V11.2791C19 11.756 18.9997 11.9559 18.9911 12.1193C18.817 15.4415 16.1624 18.0961 12.8402 18.2702C12.6768 18.2788 12.4769 18.2791 12 18.2791C11.5231 18.2791 11.3232 18.2788 11.1598 18.2702C7.83756 18.0961 5.18302 15.4415 5.00891 12.1193C5.00035 11.9559 5 11.756 5 11.2791V9.29902C5 9.019 5 8.87898 4.9455 8.77203C4.89757 8.67795 4.82108 8.60146 4.727 8.55352Z"
        fill="currentColor"
      />
    </svg>
  )
}

function DmBoxInputStickerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.8231 1.06316C16.8633 0.413085 22.2869 4.78268 22.937 10.8229C23.5871 16.8632 19.2175 22.2868 13.1772 22.9368C7.13696 23.5869 1.71338 19.2173 1.0633 13.1771C0.413223 7.13683 4.78282 1.71324 10.8231 1.06316ZM16.8936 14.0821C16.5618 13.641 15.9346 13.5517 15.4932 13.8831C14.6128 14.5442 13.6448 14.9464 12.614 15.0573C11.5833 15.1682 10.5517 14.9812 9.55094 14.5227C9.0491 14.2931 8.455 14.5134 8.22492 15.015C7.99498 15.5169 8.21577 16.1107 8.7173 16.3411C10.0114 16.934 11.4038 17.199 12.828 17.0459C14.2524 16.8926 15.5563 16.3373 16.6947 15.4825C17.1362 15.1508 17.2252 14.5237 16.8936 14.0821ZM16.9913 6.50271C16.5613 6.15622 15.9319 6.22395 15.5854 6.65402L14.1228 8.46939C13.7763 8.89946 13.8441 9.52884 14.2741 9.87533L16.0895 11.3379C16.5196 11.6843 17.149 11.6166 17.4954 11.1866C17.8419 10.7566 17.7741 10.1272 17.3441 9.78066L16.3074 8.94539L17.1427 7.90865C17.4891 7.47861 17.4213 6.84922 16.9913 6.50271ZM7.42533 7.64029C6.73894 7.71416 6.24239 8.33048 6.31626 9.01687L6.53028 11.0054C6.60438 11.6915 7.22062 12.1883 7.90686 12.1145C8.59305 12.0406 9.08952 11.4241 9.01592 10.7379L8.80191 8.74935C8.72804 8.06299 8.11169 7.56646 7.42533 7.64029Z"
        fill="currentColor"
      />
    </svg>
  )
}

function DmBoxInputPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.7782 4.22183C15.4824 -0.0739417 8.51759 -0.0739417 4.22183 4.22183C-0.0739417 8.51759 -0.0739417 15.4824 4.22183 19.7782C8.51759 24.0739 15.4824 24.0739 19.7782 19.7782C24.0739 15.4824 24.0739 8.51759 19.7782 4.22183ZM11 17C11 17.2761 11.2239 17.5 11.5 17.5H12.5C12.7761 17.5 13 17.2761 13 17V13H17C17.2761 13 17.5 12.7761 17.5 12.5V11.5C17.5 11.2239 17.2761 11 17 11H13V7C13 6.72386 12.7761 6.5 12.5 6.5H11.5C11.2239 6.5 11 6.72386 11 7V11H7C6.72386 11 6.5 11.2239 6.5 11.5V12.5C6.5 12.7761 6.72386 13 7 13H11V17Z"
        fill="currentColor"
      />
    </svg>
  )
}

function DmBoxInputBar() {
  return (
    <div className="dm-box-input-bar" aria-label="DM input bar">
      <button type="button" className="dm-box-input-leading-button" aria-label="Camera">
        <span className="dm-box-input-leading-icon">
          <DmBoxInputCameraIcon />
        </span>
      </button>

      <div className="dm-box-input-field">
        <div className="dm-box-input-placeholder">Message</div>
        <div className="dm-box-input-cta">
          <button type="button" className="dm-box-input-icon-button" aria-label="Mic">
            <span className="dm-box-input-icon">
              <DmBoxInputMicIcon />
            </span>
          </button>
          <button type="button" className="dm-box-input-icon-button" aria-label="Sticker">
            <span className="dm-box-input-icon">
              <DmBoxInputStickerIcon />
            </span>
          </button>
          <button type="button" className="dm-box-input-icon-button" aria-label="Add">
            <span className="dm-box-input-icon">
              <DmBoxInputPlusIcon />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

function DmBoxChatContent() {
  return (
    <div className="dm-box-chat-canvas">
      <div className="dm-box-chat-scroll">
        <div className="dm-box-chat-content" aria-label="DM box chat content">
          <DmBoxReceiverBubble message="I just saw your new story, and it looks like you had so much fun." />
          <DmBoxReceiverBubble message="Heard any updates lately?" />
          <DmBoxTimestamp label="9:20 PM" />
          <DmBoxSenderBubble message="It looks like TikTok has updated its stickers!" />
        </div>
      </div>
    </div>
  )
}

type SkylightItem = {
  id: string
  label: string
  ringClassName: string
  avatarImageUrl: string
}

const SKYLIGHT_ITEMS: SkylightItem[] = [
  {
    id: 'create',
    label: 'Create',
    ringClassName: 'inbox-skylight-ring-story',
    avatarImageUrl: '/avatars/create.jpg',
  },
  {
    id: 'halo',
    label: 'Halo',
    ringClassName: 'inbox-skylight-ring-live',
    avatarImageUrl: '/avatars/halo.jpg',
  },
  {
    id: 'luna',
    label: 'Luna',
    ringClassName: 'inbox-skylight-ring-story',
    avatarImageUrl: '/avatars/luna.jpg',
  },
  {
    id: 'nova',
    label: 'Nova',
    ringClassName: 'inbox-skylight-ring-live',
    avatarImageUrl: '/avatars/nova.jpg',
  },
  {
    id: 'zoe',
    label: 'Zoe',
    ringClassName: 'inbox-skylight-ring-story',
    avatarImageUrl: '/avatars/zoe.jpg',
  },
]

function InboxSkylight() {
  return (
    <div className="inbox-skylight" aria-label="Inbox skylight">
      {SKYLIGHT_ITEMS.map((item) => (
        <div key={item.id} className="inbox-skylight-slot">
          <div className="inbox-skylight-item">
            <div className="inbox-skylight-avatar-stack">
              <div className={`inbox-skylight-ring ${item.ringClassName}`} aria-hidden="true" />
              <div className="inbox-skylight-avatar">
                <img
                  src={item.avatarImageUrl}
                  alt={`${item.label} avatar`}
                  className="inbox-skylight-avatar-image"
                />
                <div className="inbox-skylight-avatar-stroke" aria-hidden="true" />
              </div>
            </div>
            <div className="inbox-skylight-label">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

type InboxCellItem = {
  id: string
  avatarImageUrl: string
  avatarAlt: string
  title: string
  message: string
  time: string
}

const INBOX_CELL_ITEMS: InboxCellItem[] = [
  {
    id: 'summer',
    avatarImageUrl: '/avatars/summer.jpg',
    avatarAlt: 'summer avatar',
    title: 'summer',
    message: 'Keep chatting to unlock a Streak',
    time: '1h',
  },
  {
    id: 'cenis',
    avatarImageUrl: '/avatars/cenis.jpg',
    avatarAlt: 'Cenis Grimm avatar',
    title: 'Cenis Grimm',
    message: 'Hello how r u recently',
    time: '5m',
  },
  {
    id: 'aurora',
    avatarImageUrl: '/avatars/aurora.jpg',
    avatarAlt: 'Aurora avatar',
    title: 'Aurora',
    message: 'See you tonight after work?',
    time: '2h',
  },
  {
    id: 'mika',
    avatarImageUrl: '/avatars/mika.jpg',
    avatarAlt: 'Mika avatar',
    title: 'Mika',
    message: 'I just sent the files over',
    time: '3h',
  },
  {
    id: 'jay',
    avatarImageUrl: '/avatars/jay.jpg',
    avatarAlt: 'Jay avatar',
    title: 'Jay',
    message: 'You free to jump on a quick call?',
    time: '4h',
  },
  {
    id: 'nora',
    avatarImageUrl: '/avatars/nora.jpg',
    avatarAlt: 'Nora avatar',
    title: 'Nora',
    message: 'That video was actually so good',
    time: '6h',
  },
  {
    id: 'leo',
    avatarImageUrl: '/avatars/leo.jpg',
    avatarAlt: 'Leo avatar',
    title: 'Leo',
    message: 'Let me know when you get home',
    time: '8h',
  },
  {
    id: 'ivy',
    avatarImageUrl: '/avatars/ivy.jpg',
    avatarAlt: 'Ivy avatar',
    title: 'Ivy',
    message: 'Can you review the latest draft?',
    time: '1d',
  },
]

function InboxListRichCell({ item }: { item: InboxCellItem }) {
  return (
    <div className="inbox-list-rich-cell" aria-label="Inbox message preview">
      <div className="inbox-list-rich-cell-leading-area">
        <div className="inbox-list-rich-cell-avatar-wrap">
          <div className="inbox-list-rich-cell-avatar">
            <img
              src={item.avatarImageUrl}
              alt={item.avatarAlt}
              className="inbox-list-rich-cell-avatar-image"
            />
            <div className="inbox-list-rich-cell-avatar-image-stroke" aria-hidden="true" />
            <div className="inbox-list-rich-cell-avatar-stroke" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="inbox-list-rich-cell-message-area">
        <div className="inbox-list-rich-cell-label-stack">
          <div className="inbox-list-rich-cell-title-row">
            <div className="inbox-list-rich-cell-title">{item.title}</div>
          </div>

          <div className="inbox-list-rich-cell-message-row">
            <div className="inbox-list-rich-cell-message">{item.message}</div>
            <div className="inbox-list-rich-cell-message-trailing">
              <div className="inbox-list-rich-cell-time-wrap">
                <div className="inbox-list-rich-cell-time-dot" aria-hidden="true" />
                <div className="inbox-list-rich-cell-time">{item.time}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InboxListRichCellList() {
  return (
    <div className="inbox-list-rich-cell-list" aria-label="Inbox cells">
      {INBOX_CELL_ITEMS.map((item) => (
        <InboxListRichCell key={item.id} item={item} />
      ))}
    </div>
  )
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

function FloatingGearIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 21.5C22.0055 21.5 25.364 18.7294 26.2634 15H44C44.5523 15 45 14.5523 45 14V12C45 11.4477 44.5523 11 44 11H26.2634C25.364 7.27063 22.0055 4.5 18 4.5C13.9945 4.5 10.636 7.27063 9.73663 11H4C3.44772 11 3 11.4477 3 12V14C3 14.5523 3.44772 15 4 15H9.73663C10.636 18.7294 13.9945 21.5 18 21.5ZM22.5 13C22.5 15.4853 20.4853 17.5 18 17.5C15.5147 17.5 13.5 15.4853 13.5 13C13.5 10.5147 15.5147 8.5 18 8.5C20.4853 8.5 22.5 10.5147 22.5 13Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30 43.5C34.0055 43.5 37.364 40.7294 38.2634 37H44C44.5523 37 45 36.5523 45 36V34C45 33.4477 44.5523 33 44 33H38.2634C37.364 29.2706 34.0055 26.5 30 26.5C25.9945 26.5 22.636 29.2706 21.7366 33H4C3.44772 33 3 33.4477 3 34V36C3 36.5523 3.44772 37 4 37H21.7366C22.636 40.7294 25.9945 43.5 30 43.5ZM34.5 35C34.5 37.4853 32.4853 39.5 30 39.5C27.5147 39.5 25.5 37.4853 25.5 35C25.5 32.5147 27.5147 30.5 30 30.5C32.4853 30.5 34.5 32.5147 34.5 35Z"
        fill="currentColor"
      />
    </svg>
  )
}

function FloatingCloseIcon() {
  return (
    <svg viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <path
        d="M29.7071 3.12132C30.0976 2.7308 30.0976 2.09763 29.7071 1.70711L28.2929 0.292894C27.9024 -0.0976309 27.2692 -0.0976313 26.8787 0.292893L15 12.1716L3.12132 0.292895C2.7308 -0.0976285 2.09763 -0.0976294 1.70711 0.292895L0.292893 1.70711C-0.0976311 2.09763 -0.0976311 2.7308 0.292893 3.12132L12.1716 15L0.292894 26.8787C-0.0976301 27.2692 -0.0976311 27.9024 0.292893 28.2929L1.70711 29.7071C2.09763 30.0976 2.7308 30.0976 3.12132 29.7071L15 17.8284L26.8787 29.7071C27.2692 30.0976 27.9024 30.0976 28.2929 29.7071L29.7071 28.2929C30.0976 27.9024 30.0976 27.2692 29.7071 26.8787L17.8284 15L29.7071 3.12132Z"
        fill="currentColor"
      />
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

function TabletStatusWifiIcon() {
  return (
    <svg viewBox="0 0 18 12" fill="none" aria-hidden="true">
      <path
        d="M9 10.6C9.66274 10.6 10.2 10.0627 10.2 9.4C10.2 8.73726 9.66274 8.2 9 8.2C8.33726 8.2 7.8 8.73726 7.8 9.4C7.8 10.0627 8.33726 10.6 9 10.6Z"
        fill="currentColor"
      />
      <path
        d="M13.9492 6.64889C12.6372 5.33702 10.8589 4.6 9.00461 4.6C7.15027 4.6 5.3719 5.33702 4.05992 6.64889L5.47414 8.0631C6.41111 7.12615 7.68194 6.5998 9.00696 6.5998C10.332 6.5998 11.6028 7.12615 12.5398 8.0631L13.9492 6.64889Z"
        fill="currentColor"
      />
      <path
        d="M16.7783 3.8219C14.7163 1.75989 11.9197 0.601562 9.00363 0.601562C6.08754 0.601562 3.29097 1.75989 1.229 3.8219L2.64321 5.23611C4.33018 3.54913 6.6182 2.60115 9.00363 2.60115C11.3891 2.60115 13.6771 3.54913 15.3641 5.23611L16.7783 3.8219Z"
        fill="currentColor"
      />
    </svg>
  )
}

function TabletStatusCellularIcon() {
  return (
    <svg viewBox="0 0 14 12" fill="none" aria-hidden="true">
      <rect x="0.5" y="7.5" width="2" height="4" rx="1" fill="currentColor" />
      <rect x="4" y="5.5" width="2" height="6" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="7.5" y="3.5" width="2" height="8" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="11" y="1.5" width="2" height="10" rx="1" fill="currentColor" opacity="0.55" />
    </svg>
  )
}

function TabletStatusBatteryIcon() {
  return (
    <svg viewBox="0 0 22 12" fill="none" aria-hidden="true">
      <rect x="0.75" y="1.25" width="18.5" height="9.5" rx="2.75" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.75" y="3.25" width="12.5" height="5.5" rx="1.5" fill="currentColor" />
      <rect x="19.75" y="4" width="1.75" height="4" rx="0.875" fill="currentColor" />
    </svg>
  )
}

function TabletStatusBar({ platform }: { platform: Platform }) {
  return (
    <div className={`tablet-safe-area tablet-safe-area-${platform}`} aria-hidden="true">
      <div className="tablet-safe-area-time">{platform === 'apple' ? '9:41' : '9:30'}</div>
      <div className="tablet-safe-area-trailing">
        <span className="tablet-safe-area-icon tablet-safe-area-icon-cellular">
          <TabletStatusCellularIcon />
        </span>
        <span className="tablet-safe-area-icon tablet-safe-area-icon-wifi">
          <TabletStatusWifiIcon />
        </span>
        <span className="tablet-safe-area-icon tablet-safe-area-icon-battery">
          <TabletStatusBatteryIcon />
        </span>
      </div>
    </div>
  )
}

function App() {
  const [activeTabletId, setActiveTabletId] = useState('ipad-mini-8')
  const [orientation, setOrientation] = useState<Orientation>('landscape')
  const [showGraybox, setShowGraybox] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [showFloatingControls, setShowFloatingControls] = useState(true)
  const [copiedAdaptivePrompt, setCopiedAdaptivePrompt] = useState(false)

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
  const adaptivePrompt = `Build a TikTok DM tablet inbox with a single adaptive layout system instead of device-specific hardcoded screens.

Grid rules:
- Under 600px: use 4 columns, 8px horizontal padding, 8px gutter.
- 600px to 839px: use 12 columns, 8px horizontal padding, 8px gutter.
- 840px to 1199px: use 12 columns, 16px horizontal padding, 8px gutter.
- 1200px to 1599px: use 20 columns, 16px horizontal padding, 16px gutter.
- 1600px and above: use 24 columns, 16px horizontal padding, 16px gutter.

Pane allocation rules:
- On 12-column layouts, the DM list spans 4 columns and the DM box fills the remaining 8 columns.
- On 20-column and 24-column layouts, the DM list spans 6 columns and the DM box fills the remaining columns.
- On very narrow layouts, fall back to a compact split only if the DM list still respects its minimum width.

Width logic:
- On 12-column layouts, the DM list width equals left padding + 4 list columns + 3 internal gutters.
- On 20-column and 24-column layouts, the DM list width equals left padding + 6 list columns + 5 internal gutters.
- Do not add an extra pane gap between the DM list and the DM box.
- The DM box always fills the remaining width after the DM list width is resolved.

Minimum width rule:
- The DM list minimum width is 288px on both Apple and Android tablets.
- If the computed DM list width drops below 288px, hide the DM box and let the DM list take the full viewport width.
`

  async function handleCopyAdaptivePrompt() {
    try {
      await navigator.clipboard.writeText(adaptivePrompt)
      setCopiedAdaptivePrompt(true)
      window.setTimeout(() => setCopiedAdaptivePrompt(false), 1600)
    } catch {
      setCopiedAdaptivePrompt(false)
    }
  }

  return (
    <main className="tablet-page">
      <section className="preview-shell">
        <div className="device-stage">
          <div
            className="tablet-zoom-wrap"
            style={{
              width: `${viewport.width * zoom}px`,
              height: `${viewport.height * zoom}px`,
            }}
          >
            <div
              className="tablet-frame"
              style={
                {
                  borderRadius: `${activeTablet.frameRadius}px`,
                  width: `${viewport.width}px`,
                  height: `${viewport.height}px`,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                } as CSSProperties
              }
            >
            <div
              className="tablet-screen"
              style={
                {
                  '--screen-radius': `${activeTablet.screenRadius}px`,
                  '--safe-area-top': `${safeAreaConfig.top}px`,
                  '--nav-height': '80.5px',
                } as CSSProperties
              }
            >
              <TabletStatusBar platform={platform} />
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
                      '--list-pane-width': `${listPaneWidth}px`,
                      '--list-divider-opacity': paneConfig.showBox ? 1 : 0,
                      gridTemplateColumns: paneConfig.showBox
                        ? `${listPaneWidth}px minmax(0, 1fr)`
                        : 'minmax(0, 1fr)',
                      padding: `${safeAreaConfig.top}px 0 0`,
                      gap: '0',
                    } as CSSProperties
                  }
                >
                  <section className="tablet-content-pane tablet-content-list">
                    <InboxListTopBar />
                    <InboxSkylight />
                    <InboxListRichCellList />
                  </section>
                  {paneConfig.showBox ? (
                    <section className="tablet-content-pane tablet-content-box">
                      <DmBoxTopBar />
                      <DmBoxChatContent />
                      <DmBoxInputBar />
                    </section>
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
        </div>
      </section>

      {showFloatingControls ? (
        <section className="floating-controls-panel" aria-label="Preview settings">
          <div className="floating-controls-header">
            <div className="floating-controls-title">Preview Settings</div>
            <button
              type="button"
              className="floating-controls-close"
              aria-label="Hide floating controls"
              onClick={() => setShowFloatingControls(false)}
            >
              <span className="floating-controls-icon">
                <FloatingCloseIcon />
              </span>
            </button>
          </div>

          <div className="floating-controls-body">
            <div className="control-group floating-control-group">
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

            <div className="control-group floating-control-group">
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

            <div className="control-group floating-control-group">
              <span className="control-label">Layers</span>
              <div className="toggle-row">
                <label className="toggle-control" htmlFor="graybox-toggle">
                  <span className="toggle-text">Graybox</span>
                  <Switch
                    id="graybox-toggle"
                    checked={showGraybox}
                    onCheckedChange={setShowGraybox}
                    aria-label="Graybox"
                  />
                </label>

                <label className="toggle-control" htmlFor="grid-toggle">
                  <span className="toggle-text">Grid</span>
                  <Switch
                    id="grid-toggle"
                    checked={showGrid}
                    onCheckedChange={setShowGrid}
                    aria-label="Grid"
                  />
                </label>
              </div>
            </div>

            <div className="control-group floating-control-group">
              <span className="control-label">Zoom</span>
              <div className="segmented-control zoom-control" aria-label="缩放预览">
                {([0.5, 0.75, 1, 1.5] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="segment"
                    data-active={zoom === value}
                    aria-pressed={zoom === value}
                    onClick={() => setZoom(value)}
                  >
                    {Math.round(value * 100)}%
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group floating-control-group">
              <div className="floating-prompt-header">
                <span className="control-label">Adaptive Prompt</span>
                <button
                  type="button"
                  className="floating-controls-copy"
                  aria-label="Copy adaptive prompt"
                  onClick={() => void handleCopyAdaptivePrompt()}
                >
                  <span className="floating-controls-icon">
                    <Copy />
                  </span>
                </button>
              </div>
              <pre className="adaptive-prompt-panel">{adaptivePrompt}</pre>
              {copiedAdaptivePrompt ? (
                <div className="floating-prompt-status">Copied</div>
              ) : null}
            </div>
          </div>
        </section>
      ) : (
        <button
          type="button"
          className="floating-controls-trigger"
          aria-label="Show floating controls"
          onClick={() => setShowFloatingControls(true)}
        >
          <span className="floating-controls-icon">
            <FloatingGearIcon />
          </span>
        </button>
      )}
    </main>
  )
}

export default App
