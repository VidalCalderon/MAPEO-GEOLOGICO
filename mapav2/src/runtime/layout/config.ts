import type { ImmutableObject } from 'jimu-core'

export interface LayoutJson {
  elements: { [name: string]: GroupJson | ToolJson }
  layout: { [name: string]: LayoutItemJson }
  mobileResponsiveStrategy?: {
    [stage: string]: HiddenElementNames
  }
  lockToolNames?: string[]
}

export type IMLayoutJson = ImmutableObject<LayoutJson>

export type HiddenElementNames = string[]

export enum HorizontalVertical {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export enum GroupDirection {
  LeftTopToRightTop = 'left-top-to-right-top',
  LeftTopToLeftBottom = 'left-top-to-left-bottom',
  RightTopToLeftTop = 'right-top-to-left-top',
  RightTopToRightBottom = 'right-top-to-right-bottom',
  RightBottomToLeftBottom = 'right-bottom-to-left-bottom',
  RightBottomToRightTop = 'right-bottom-to-right-top',
  LeftBottomToRightBottom = 'left-bottom-to-right-bottom',
  LeftBottomToLeftTop = 'left-bottom-to-left-top'
}

export interface GroupJson {
  type: 'GROUP'
  groupName?: string
  display?: 'flex' | 'block' // default 'flex'
  direction: GroupDirection // only works when final display is flex
  watchSize?: boolean
  isResponsive?: boolean
  className?: string
  style?: React.CSSProperties & { [key: `--${string}`]: string | number }
}

export type ToolPanelPlacement = 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end'

export interface ToolJson {
  type: 'TOOL'
  toolName: string
  isOnlyExpanded: boolean
  isShowIconTitle: boolean
  panelPlacement?: ToolPanelPlacement
  className?: string
  style?: React.CSSProperties & { [key: `--${string}`]: string | number }
}

export interface LayoutItemJson {
  isMainGroup?: boolean
  children: string[]
  alwaysRenderForInlineEditing?: boolean
  isDropzone?: boolean
  // Used to indicate the final layout direction at runtime. It is used to calculate direction for map tool.
  // If use custom layout, the value is not null. If doesn't use custom layout, the value is null.
  // For null value, map tool should use default direction from ToolModulesConfig.
  finalHorizontalVertical?: HorizontalVertical
}
