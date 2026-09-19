/** @jsx jsx */
import { React, css, jsx, AppMode, type SizeModeLayoutJson, type IntlShape, type IMThemeVariables, getAppStore, classNames } from 'jimu-core'
import Group from './base/group'
import type { IMConfig, OverviewMapPosition } from '../../config'
import type { LayoutJson, LayoutItemJson, HiddenElementNames } from './config'
import type { ActiveToolInfo } from './base/base-tool'
import type { JimuMapView } from 'jimu-arcgis'
import type { Size } from 'jimu-ui'
import { getOverviewMapPosition } from '../../utils'
// only import types from builder-support
import type { CustomLayoutInteract } from '../builder-support'

interface LayoutProps {
  mapWidgetId: string
  config: IMConfig
  layoutConfig: LayoutJson

  jimuMapView: JimuMapView
  isMobile: boolean
  theme: IMThemeVariables

  appMode: AppMode
  layouts: { [name: string]: SizeModeLayoutJson }
  LayoutEntry?: any
  widgetModules?: { customLayoutUtils, CustomLayoutInteract, getInlineEditingLayoutStyle }
  widgetManifestName: string

  widgetHeight?: number
  intl?: IntlShape

  activeToolInfo: ActiveToolInfo
  onActiveToolInfoChange: (activeToolInfo: ActiveToolInfo) => void
  autoControlWidgetId: string

  mapComponentsLoaded: boolean
  mapRootClassName: string

  isCustomLayout: boolean
  isCustomLayoutEditing: boolean
  isShowMapSwitchBtn: boolean

  onMouseOverPopper: () => void
  onMouseOutPopper: () => void
}

interface LayoutState {
  toolsContentInMobileExpandPanel?: React.JSX.Element
  hiddenElementNames: HiddenElementNames
  groupSizes: { [groupName: string]: Size }
}

interface CalculateCustomLayoutGroupInfoParams {
  groupType: 'left-top' | 'right-top' | 'right-bottom' | 'left-bottom';
  isCornerHorizontal: boolean;
  cornerGroupName: string;
  horizontalGroupName: string;
  verticalGroupName: string;
  horizontalBorderLineGroupName: string;
  verticalBorderLineGroupName: string;
}

export type { ActiveToolInfo }

export default class MapToolLayout extends React.PureComponent<LayoutProps, LayoutState> {
  container: HTMLElement
  customLayoutInteract: CustomLayoutInteract

  constructor (props) {
    super(props)

    this.state = {
      toolsContentInMobileExpandPanel: null,
      hiddenElementNames: [],
      groupSizes: {}
    }
  }

  getStyle (isRTL: boolean, overviewMapPosition: OverviewMapPosition) {
    const customLayoutStyle = this.props.isMobile ? '' : this.getCustomLayoutStyle()
    const overviewMapStyle = this.getOverviewMapGroupStyle(isRTL, overviewMapPosition)

    return css`
      z-index: 8;

      .expand-panel-transition {
        transition: opacity 0.3s, right 0.3s;
      }

      .scale-attribution-xy-group {
        > div:first-of-type:nth-last-of-type(1) {
          width: 100%;
          max-width: 100% !important;
        }
      }

      .exbmap-ui-hidden-element {
        display: none !important;
      }

      .exbmap-ui-pc-expand-maxheight {
        max-height: ${this.getMaxHeightForPcExpand(this.props.widgetHeight)}px;
        overflow: auto
      }

      .hidden-map-tool {
        display: none !important;
      }

      .exbmap-ui-tool-shell:has(.hidden-map-tool) {
        display: none !important;
      }

      .exbmap-ui-tool-shell.exbmap-ui-tool-shell-Placeholder {
        box-shadow: none !important;
      }

      .exbmap-ui-tool-shell-Placeholder.is-dragging {
        .placeholder-divider {
          background: transparent !important;
        }
      }

      .exbmap-ui-tool-shell-ScaleBar {
        box-shadow: none !important;
      }

      ${customLayoutStyle}

      ${overviewMapStyle}
      `
  }

  calculateCustomLayoutGroupCssVars (params: CalculateCustomLayoutGroupInfoParams): string {
    const {
      groupType,
      isCornerHorizontal,
      cornerGroupName,
      horizontalGroupName,
      verticalGroupName,
      horizontalBorderLineGroupName,
      verticalBorderLineGroupName
    } = params

    const cornerGroupSize = this.getGroupSize(cornerGroupName)
    const horizontalGroupSize = this.getGroupSize(horizontalGroupName)
    const verticalGroupSize = this.getGroupSize(verticalGroupName)

    let horizontalGroupLeftOrRight = 0
    let verticalGroupTopOrBottom = 0

    if (isCornerHorizontal) {
      // corner horizontal
      horizontalGroupLeftOrRight = cornerGroupSize.width
      verticalGroupTopOrBottom = cornerGroupSize.height || horizontalGroupSize.height
    } else {
      // corner vertical
      horizontalGroupLeftOrRight = cornerGroupSize.width || verticalGroupSize.width
      verticalGroupTopOrBottom = cornerGroupSize.height
    }

    horizontalGroupLeftOrRight = horizontalGroupLeftOrRight || 0
    verticalGroupTopOrBottom = verticalGroupTopOrBottom || 0

    const padding8px = 8
    const padding0px = 0
    const horizontalGroupPaddingLeftOrRight = horizontalGroupLeftOrRight > 0 ? padding8px : padding0px
    const verticalGroupPaddingTopOrBottom = verticalGroupTopOrBottom > 0 ? padding8px : padding0px

    const horizontalBorderLineGroupLeftOrRight =
      ((cornerGroupSize.width > verticalGroupSize.width &&
        cornerGroupSize.height > horizontalGroupSize.height) ?
        cornerGroupSize.width : verticalGroupSize.width) || 0
    const horizontalBorderLineGroupTopOrBottom = horizontalGroupSize.height || 0
    const horizontalBorderLineGroupWidth = (cornerGroupSize.width + horizontalGroupSize.width - horizontalBorderLineGroupLeftOrRight) || 0


    const verticalBorderLineGroupLeftOrRight = verticalGroupSize.width || 0
    const verticalBorderLineGroupTopOrBottom =
    ((cornerGroupSize.width > verticalGroupSize.width &&
      cornerGroupSize.height > horizontalGroupSize.height) ?
      cornerGroupSize.height : horizontalGroupSize.height) || 0
    const verticalBorderLineGroupHeight = (cornerGroupSize.height + verticalGroupSize.height - verticalBorderLineGroupTopOrBottom) || 0

    const horizontalLeftOrRightType: 'fixedleft' | 'fixedright' = (groupType === 'left-top' || groupType === 'left-bottom') ? 'fixedleft' : 'fixedright'
    const verticalTopOrBottomType: 'top' | 'bottom' = (groupType === 'left-top' || groupType === 'right-top') ? 'top' : 'bottom'

    const cssVars = `
      --${horizontalGroupName}-${horizontalLeftOrRightType}: ${horizontalGroupLeftOrRight}px;
      --${horizontalGroupName}-padding-${horizontalLeftOrRightType}: ${horizontalGroupPaddingLeftOrRight}px;
      --${verticalGroupName}-${verticalTopOrBottomType}: ${verticalGroupTopOrBottom}px;
      --${verticalGroupName}-padding-${verticalTopOrBottomType}: ${verticalGroupPaddingTopOrBottom}px;
      --${horizontalBorderLineGroupName}-${horizontalLeftOrRightType}: ${horizontalBorderLineGroupLeftOrRight}px;
      --${horizontalBorderLineGroupName}-${verticalTopOrBottomType}: ${horizontalBorderLineGroupTopOrBottom}px;
      --${horizontalBorderLineGroupName}-width: ${horizontalBorderLineGroupWidth}px;
      --${verticalBorderLineGroupName}-${horizontalLeftOrRightType}: ${verticalBorderLineGroupLeftOrRight}px;
      --${verticalBorderLineGroupName}-${verticalTopOrBottomType}: ${verticalBorderLineGroupTopOrBottom}px;
      --${verticalBorderLineGroupName}-height: ${verticalBorderLineGroupHeight}px;
    `

    return cssVars
  }

  getCustomLayoutStyle () {
    let customLayoutStyle: string = ''
    let inlineEditingStyle: string = ''

    const isRTL = getAppStore().getState()?.appContext?.isRTL || false
    const customLayoutPlacement = this.props.config?.customLayoutPlacement
    const customLayoutMode = this.props.isCustomLayout && customLayoutPlacement
    const marginPadding8px = '8px'
    const marginLeft8px = isRTL ? `margin-right: ${marginPadding8px};` : `margin-left: ${marginPadding8px};`
    const marginRight8px = isRTL ? `margin-left: ${marginPadding8px};` : `margin-right: ${marginPadding8px};`

    // create css for custom layout
    if (customLayoutMode) {
      // left top
      const isLeftTopCornerHorizontal = customLayoutPlacement?.leftTop?.isCornerHorizontal || false
      const leftTopCssVars = this.calculateCustomLayoutGroupCssVars({
        groupType: 'left-top',
        isCornerHorizontal: isLeftTopCornerHorizontal,
        cornerGroupName: 'leftTopCornerGroup',
        horizontalGroupName: 'leftTopHorizontalGroup',
        verticalGroupName: 'leftTopVerticalGroup',
        horizontalBorderLineGroupName: 'leftTopHorizontalBorderLineGroup',
        verticalBorderLineGroupName: 'leftTopVerticalBorderLineGroup'
      })

      // right top
      const isRightTopCornerHorizontal = customLayoutPlacement?.rightTop?.isCornerHorizontal || false
      const rightTopCssVars = this.calculateCustomLayoutGroupCssVars({
        groupType: 'right-top',
        isCornerHorizontal: isRightTopCornerHorizontal,
        cornerGroupName: 'rightTopCornerGroup',
        horizontalGroupName: 'rightTopHorizontalGroup',
        verticalGroupName: 'rightTopVerticalGroup',
        horizontalBorderLineGroupName: 'rightTopHorizontalBorderLineGroup',
        verticalBorderLineGroupName: 'rightTopVerticalBorderLineGroup'
      })

      // right bottom
      const rightBottomCornerHorizontal = customLayoutPlacement?.rightBottom?.isCornerHorizontal || false
      const rightBottomCssVars = this.calculateCustomLayoutGroupCssVars({
        groupType: 'right-bottom',
        isCornerHorizontal: rightBottomCornerHorizontal,
        cornerGroupName: 'rightBottomCornerGroup',
        horizontalGroupName: 'rightBottomHorizontalGroup',
        verticalGroupName: 'rightBottomVerticalGroup',
        horizontalBorderLineGroupName: 'rightBottomHorizontalBorderLineGroup',
        verticalBorderLineGroupName: 'rightBottomVerticalBorderLineGroup'
      })

      // left bottom
      const leftBottomCornerHorizontal = customLayoutPlacement?.leftBottom?.isCornerHorizontal || false
      const leftBottomCssVars = this.calculateCustomLayoutGroupCssVars({
        groupType: 'left-bottom',
        isCornerHorizontal: leftBottomCornerHorizontal,
        cornerGroupName: 'leftBottomCornerGroup',
        horizontalGroupName: 'leftBottomHorizontalGroup',
        verticalGroupName: 'leftBottomVerticalGroup',
        horizontalBorderLineGroupName: 'leftBottomHorizontalBorderLineGroup',
        verticalBorderLineGroupName: 'leftBottomVerticalBorderLineGroup'
      })

      // custom layout style
      customLayoutStyle = `
      /* css vars */
      ${leftTopCssVars}
      ${rightTopCssVars}
      ${rightBottomCssVars}
      ${leftBottomCssVars}

      /* margin between tools */
      .custom-layout-lt-group {
        .custom-layout-horizontal-group > * {
          ${marginRight8px}
        }

        .custom-layout-vertical-group > * {
          margin-bottom: ${marginPadding8px};
        }
      }

      .custom-layout-rt-group {
        .custom-layout-horizontal-group > * {
          ${marginLeft8px}
        }

        .custom-layout-vertical-group > * {
          margin-bottom: ${marginPadding8px};
        }
      }

      .custom-layout-rb-group {
        .custom-layout-horizontal-group > * {
          ${marginLeft8px}
        }

        .custom-layout-vertical-group > * {
          margin-top: ${marginPadding8px};
        }
      }

      .custom-layout-lb-group {
        .custom-layout-horizontal-group > * {
          ${marginRight8px}
        }

        .custom-layout-vertical-group > * {
          margin-top: ${marginPadding8px};
        }
      }

      &.render-map-switch {
        .custom-layout-lb-scalebar-mapswitcher-group:has(> .exbmap-ui-tool-shell-ScaleBar + .exbmap-ui-tool-shell-MapSwitch) {
          .exbmap-ui-tool-shell-MapSwitch {
            margin-bottom: ${marginPadding8px};
          }
        }
      }
      `
    }

    // create css for custom layout inline editing
    if (customLayoutMode && this.props.isCustomLayoutEditing) {
      const getInlineEditingLayoutStyle = this.props.widgetModules?.getInlineEditingLayoutStyle as (isRTL: boolean) => string

      if (getInlineEditingLayoutStyle) {
        inlineEditingStyle = getInlineEditingLayoutStyle(isRTL)
      }
    }

    return `
    ${customLayoutStyle}

    ${inlineEditingStyle}
    `
  }

  shouldRenderLeftBottomScalebarMapSwitcherGroup (): boolean {
    let result: boolean = false

    if (this.props.isShowMapSwitchBtn) {
      result = true
    }

    if (!result) {
      const canScaleBar = this.props.config?.toolConfig?.canScaleBar

      if (canScaleBar) {
        const isWebScene = this.props.jimuMapView?.view?.type === '3d'
        // ScaleBar only supports MapView.
        result = !isWebScene
      }
    }

    return result
  }

  getGroupSize (groupName): Size {
    return this.state.groupSizes[groupName] || { width: 0, height: 0 }
  }

  getOverviewMapGroupStyle (isRTL: boolean, overviewMapPosition: OverviewMapPosition): string {
    let left: string = 'auto'
    let top: string = 'auto'
    let right: string = '0px'
    let bottom: string = '16px'

    const position = overviewMapPosition

    if (position === 'bottom-left') {
      left = '0px'
      bottom = '16px'
      right = 'auto'
      top = 'auto'
    } else if (position === 'top-left') {
      left = '0px'
      top = '0px'
      right = 'auto'
      bottom = 'auto'
    } else if (position === 'top-right') {
      right = '0px'
      top = '0px'
      left = 'auto'
      bottom = 'auto'
    } else {
      // default bottom-right
      right = '0px'
      bottom = '16px'
      left = 'auto'
      top = 'auto'
    }

    if (isRTL) {
      [left, right] = [right, left]
    }

    const style = `
    .overview-map-group {
      z-index: 1;
      position: absolute;
      left: ${left} !important;
      top: ${top} !important;
      right: ${right} !important;
      bottom: ${bottom} !important;
    }
    `

    return style
  }

  getMaxHeightForPcExpand = (widgetHeight: number): number => {
    if (!widgetHeight) {
      return null
    } else {
      if (widgetHeight < 65) {
        return null
      } else {
        const resultHeight = widgetHeight - 65
        if (resultHeight < 300) {
          return resultHeight
        } else {
          return 300
        }
      }
    }
  }

  handSetHiddenElementNames = (elementNames: HiddenElementNames) => {
    this.setState({
      hiddenElementNames: elementNames
    })
  }

  onRef = (ref) => {
    if (!ref) {
      return
    }

    this.container = ref
  }

  getLayoutContent (layoutJson: LayoutJson) {
    const config = this.props.config
    const toolConfig = config?.toolConfig

    if (!layoutJson || !toolConfig) {
      return null
    } else {
      const appState = getAppStore().getState()
      const isRTL = appState?.appContext?.isRTL || false
      const shouldRenderScaleBarMapSwitchGroup = this.shouldRenderLeftBottomScalebarMapSwitcherGroup()
      const className = classNames('map-tool-layout esri-ui-inner-container', {
        'render-scalebar-mapswitcher-group': shouldRenderScaleBarMapSwitchGroup,
        'not-render-scalebar-mapswitcher-group': !shouldRenderScaleBarMapSwitchGroup,
        'render-map-switch': this.props.isShowMapSwitchBtn,
        'not-render-map-switch': !this.props.isShowMapSwitchBtn
      })
      const toolOptions = config.toolOptions
      const overviewMapPosition = getOverviewMapPosition(config)

      return (
        <div className={className} css={this.getStyle(isRTL, overviewMapPosition)} ref={this.onRef}>
          {Object.keys(layoutJson.layout).map((groupNameOrToolName, index) => {
            const elementItem = layoutJson.elements[groupNameOrToolName]
            const layoutItem: LayoutItemJson = layoutJson.layout[groupNameOrToolName]

            // make sure layout only render main group
            if (!elementItem || elementItem.type !== 'GROUP' || !layoutItem.isMainGroup) {
              return null
            }

            const groupJson = elementItem

            return (
              <Group
                key={groupNameOrToolName}
                mapWidgetId={this.props.mapWidgetId}
                groupName={groupNameOrToolName}
                groupJson={groupJson}
                className={groupJson.className}
                style={groupJson.style}
                isMobile={this.props.isMobile}
                isMainGroup
                layoutConfig={layoutJson}
                toolConfig={toolConfig}
                toolOptions={toolOptions}
                overviewMapPosition={overviewMapPosition}
                isShowMapSwitchBtn={this.props.isShowMapSwitchBtn}
                shouldRenderScaleBarMapSwitchGroup={shouldRenderScaleBarMapSwitchGroup}
                activeToolInfo={this.props.activeToolInfo}
                jimuMapView={this.props.jimuMapView}
                onActiveToolInfoChange={this.props.onActiveToolInfoChange}
                hiddenElementNames={layoutJson.mobileResponsiveStrategy && this.state.hiddenElementNames}
                intl={this.props.intl}
                onSetHiddenElementNames={this.handSetHiddenElementNames}
                theme={this.props.theme}
                autoControlWidgetId={this.props.autoControlWidgetId}
                isRTL={isRTL}
                mapComponentsLoaded={this.props.mapComponentsLoaded}
                mapRootClassName={this.props.mapRootClassName}
                isCustomLayout={this.props.isCustomLayout}
                isCustomLayoutEditing={this.props.isCustomLayoutEditing}
                groupSizes={this.state.groupSizes}
                onGroupSizeChange={this.onGroupSizeChange}
                onMouseOverPopper={this.props.onMouseOverPopper}
                onMouseOutPopper={this.props.onMouseOutPopper}
                onRemoveTool={this.onRemoveTool}
              />
            )
          })}
        </div>
      )
    }
  }

  componentDidUpdate (prevProps: LayoutProps) {
    if (prevProps.appMode !== this.props.appMode && this.props.appMode === AppMode.Design) {
      this.props.onActiveToolInfoChange(null)
    }

    this.checkIfIsInlineEditingChanged(prevProps)
  }

  checkIfIsInlineEditingChanged (prevProps: LayoutProps) {
    const preIsCustomLayoutEditing = prevProps.isCustomLayoutEditing || false
    const isCustomLayoutEditing = this.props.isCustomLayoutEditing || false

    if (isCustomLayoutEditing !== preIsCustomLayoutEditing) {
      if (isCustomLayoutEditing) {
        // Enter inline editing mode
        this.enableDragMode()
      } else {
        // Exit inline editing mode
        this.disableDragMode()
      }
    }
  }

  componentWillUnmount (): void {
    this.disableDragMode()
  }

  render () {
    return this.getLayoutContent(this.props.layoutConfig)
  }

  onGroupSizeChange = (groupName: string, width: number, height: number) => {
    this.setState((state) => {
      const newGroupSizes = { ...state.groupSizes }
      newGroupSizes[groupName] = { width, height }

      return {
        groupSizes: newGroupSizes
      }
    })
  }

  enableDragMode () {
    this.disableDragMode()
    const CustomLayoutInteract = this.props.widgetModules?.CustomLayoutInteract

    if (CustomLayoutInteract && this.container) {
      this.customLayoutInteract = new CustomLayoutInteract()
      this.customLayoutInteract.enableDragMode(this.props.mapWidgetId, this.container)
    }
  }

  disableDragMode () {
    if (this.customLayoutInteract) {
      this.customLayoutInteract.disableDragMode()
      this.customLayoutInteract = null
    }
  }

  onRemoveTool = (toolName: string, toolIndexInGroup: number, groupName: string): void => {
    if (toolName === 'Placeholder' && typeof toolIndexInGroup === 'number' && toolIndexInGroup >= 0 && groupName && this.customLayoutInteract) {
      this.customLayoutInteract.removePlaceholder(groupName, toolIndexInGroup)
    }
  }
}
