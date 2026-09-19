/** @jsx jsx */
import { css, jsx, React, type ImmutableObject, classNames, ReactResizeDetector, type IntlShape, focusElementInKeyboardMode } from 'jimu-core'
import { UIComponent, type UIComponentProps } from './ui-component'
import type { ToolConfig, IMToolOptions, OverviewMapPosition } from '../../../config'
import type { LayoutJson, GroupJson, HiddenElementNames, LayoutItemJson } from '../config'
import { GroupDirection } from '../config'
import BaseToolShell from './base-tool-shell'
import type { ActiveToolInfo } from './base-tool'
import ToolModulesConfig from '../tool-modules-config'
import { MobilePanel, type Size } from 'jimu-ui'
import { MultiSourceMapContext } from '../../components/multisourcemap-context'

interface GroupProps extends UIComponentProps {
  mapWidgetId: string
  layoutConfig: LayoutJson
  toolConfig: ImmutableObject<ToolConfig>
  toolOptions: IMToolOptions
  groupName: string
  groupJson: GroupJson
  className: string
  style: React.CSSProperties
  isMobile?: boolean
  isMainGroup?: boolean
  // checkResponsive() will check height and use props.onSetHiddenElementNames() to set element names that need to hide
  hiddenElementNames?: HiddenElementNames
  // true means we should hide the Group div with class .exbmap-ui-hidden-element because checkResponsive() method think the height is small.
  isHidden?: boolean
  isThumbMap?: boolean
  intl?: IntlShape
  isRTL: boolean
  mapComponentsLoaded: boolean
  mapRootClassName: string
  overviewMapPosition: OverviewMapPosition
  isShowMapSwitchBtn: boolean
  shouldRenderScaleBarMapSwitchGroup: boolean

  activeToolInfo: ActiveToolInfo
  onActiveToolInfoChange: (activeToolInfo: ActiveToolInfo) => void
  onSetHiddenElementNames?: (hiddenElementNames: HiddenElementNames) => void
  autoControlWidgetId: string

  isCustomLayout: boolean
  isCustomLayoutEditing: boolean
  groupSizes: { [groupName: string]: Size }
  onGroupSizeChange: (groupName: string, width: number, height: number) => void

  onMouseOverPopper: () => void
  onMouseOutPopper: () => void
  onRemoveTool?: (toolName: string, toolIndexInGroup: number, groupName: string) => void
}

interface GroupStates {
  bottomPanelHeight?: number
  widgetWidth?: number
  widgetHeight?: number
  isThumbMap?: boolean
}

export default class Group extends UIComponent<GroupProps, GroupStates> {
  reactResizeDetectorRef = React.createRef<HTMLDivElement>()
  groupConRef = React.createRef<HTMLDivElement>()
  preActiveIconBtn: HTMLElement
  resizeObserver: ResizeObserver
  observerOptions: ResizeObserverOptions

  getStyle () {
    const groupJson = this.props.layoutConfig.elements[this.props.groupName] as GroupJson
    const direction = groupJson.direction

    const display: 'flex' | 'block' = groupJson.display || 'flex'
    let flexDirection: 'row' | 'row-reverse' | 'column' | 'column-reverse' = 'row'
    let justifyContent: 'flex-start' | 'flex-end' = 'flex-start'
    let alignItems: 'flex-start' | 'flex-end' = 'flex-start'

    if (display === 'flex') {
      if (direction === GroupDirection.LeftTopToLeftBottom) {
        // ↓
        flexDirection = 'column'
        justifyContent = 'flex-start'
        alignItems = 'flex-start'
      } else if (direction === GroupDirection.LeftTopToRightTop) {
        // →
        flexDirection = 'row'
        justifyContent = 'flex-start'
        alignItems = 'flex-start'
      } else if (direction === GroupDirection.RightTopToRightBottom) {
        // ↓
        flexDirection = 'column'
        justifyContent = 'flex-start'
        alignItems = 'flex-end'
      } else if (direction === GroupDirection.RightTopToLeftTop) {
        // ←
        flexDirection = 'row-reverse'
        justifyContent = 'flex-start'
        alignItems = 'flex-start'
      } else if (direction === GroupDirection.RightBottomToRightTop) {
        // ↑
        flexDirection = 'column-reverse'
        justifyContent = 'flex-start'
        alignItems = 'flex-end'
      } else if (direction === GroupDirection.RightBottomToLeftBottom) {
        // ←
        flexDirection = 'row-reverse'
        justifyContent = 'flex-start'
        alignItems = 'flex-end'
      } else if (direction === GroupDirection.LeftBottomToLeftTop) {
        // ↑
        flexDirection = 'column-reverse'
        justifyContent = 'flex-start'
        alignItems = 'flex-start'
      } else if (direction === GroupDirection.LeftBottomToRightBottom) {
        // →
        flexDirection = 'row'
        justifyContent = 'flex-start'
        alignItems = 'flex-end'
      }
    }

    /**
     * FLEXBOX AXES & ALIGNMENT DIRECTION (LTR vs. RTL) CHEAT SHEET
     * --------------------------------------------------------------------------------------------------------------------------
     * Flexbox is logical: the start/end positions are determined by the document's writing mode (direction: ltr/rtl).
     * NOTE: "Flipped" indicates a change in physical direction (Left <-> Right) when switching between LTR and RTL environments.
    -----------------------------------------------------------------------------------------------------------------------------
    | flex-direction   | Axis / Property              | LTR (Left-to-Right) | RTL (Right-to-Left) | Flipped?
    |------------------|------------------------------|---------------------|---------------------|---------
    | row              | Main Axis Direction          | Left to Right       | Right to Left       | YES
    |                  | justify-content: flex-start  | Left to Right       | Right to Left       | YES
    |                  | justify-content: flex-end    | Right to Left       | Left to Right       | YES
    |                  | Cross Axis Direction         | Top to Bottom       | Top to Bottom       | NO
    |                  | align-items: flex-start      | Top to Bottom       | Top to Bottom       | NO
    |                  | align-items: flex-end        | Bottom to Top       | Bottom to Top       | NO
    |------------------|------------------------------|---------------------|---------------------|---------
    | row-reverse      | Main Axis Direction          | Right to Left       | Left to Right       | YES
    |                  | justify-content: flex-start  | Right to Left       | Left to Right       | YES
    |                  | justify-content: flex-end    | Left to Right       | Right to Left       | YES
    |                  | Cross Axis Direction         | Top to Bottom       | Top to Bottom       | NO
    |                  | align-items: flex-start      | Top to Bottom       | Top to Bottom       | NO
    |                  | align-items: flex-end        | Bottom to Top       | Bottom to Top       | NO
    |------------------|------------------------------|---------------------|---------------------|---------
    | column           | Main Axis Direction          | Top to Bottom       | Top to Bottom       | NO
    |                  | justify-content: flex-start  | Top to Bottom       | Top to Bottom       | NO
    |                  | justify-content: flex-end    | Bottom to Top       | Bottom to Top       | NO
    |                  | Cross Axis Direction         | Left to Right       | Right to Left       | YES
    |                  | align-items: flex-start      | Left to Right       | Right to Left       | YES
    |                  | align-items: flex-end        | Right to Left       | Left to Right       | YES
    |------------------|------------------------------|---------------------|---------------------|---------
    | column-reverse   | Main Axis Direction          | Bottom to Top       | Bottom to Top       | NO
    |                  | justify-content: flex-start  | Bottom to Top       | Bottom to Top       | NO
    |                  | justify-content: flex-end    | Top to Bottom       | Top to Bottom       | NO
    |                  | Cross Axis Direction         | Left to Right       | Right to Left       | YES
    |                  | align-items: flex-start      | Left to Right       | Right to Left       | YES
    |                  | align-items: flex-end        | Right to Left       | Left to Right       | YES
    |------------------------------------------------------------------------------------------------------
    */

    // fix the bug that map tools are flipped when RTL locales, #13622
    if (this.props.isRTL) {
      if (flexDirection === 'row' || flexDirection === 'row-reverse') {
        if (flexDirection === 'row') {
          flexDirection = 'row-reverse'
        } else if (flexDirection === 'row-reverse') {
          flexDirection = 'row'
        }

        // if (justifyContent === 'flex-start') {
        //   justifyContent = 'flex-end'
        // } else if (justifyContent === 'flex-end') {
        //   justifyContent = 'flex-start'
        // }
      } else if (flexDirection === 'column' || flexDirection === 'column-reverse') {
        if (alignItems === 'flex-start') {
          alignItems = 'flex-end'
        } else if (alignItems === 'flex-end') {
          alignItems = 'flex-start'
        }
      }
    }

    return css`
      display: ${display};
      flex-flow: ${flexDirection};
      justify-content: ${justifyContent};
      align-items: ${alignItems};

      .exbmap-ui-group-expand-icon {
        fill: black;
        left: 8px;
        top: 8px;
        position: absolute;
        display: block;
      }

      .expand-mobile-panel {
        box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 2px;
        border-radius: 10px 10px 0px 0px;
      }

      .expand-mobile-panel-transition {
        transition: height 0.3s;
      }

      .expand-mobile-panel-touch-container {
        top: 0;
        position: absolute;
        width: 100%;
        height: 31px;
      }

      .expand-mobile-panel-bar {
        width: 36px;
        height: 4px;
        background-color: #434343;
        border-radius: 2px;
      }
      `
  }

  constructor (props) {
    super(props)

    this.state = {
      bottomPanelHeight: 0,
      isThumbMap: !!this.props.isMobile
    }

    this.observerOptions = { box: 'border-box' }
  }

  componentDidMount (): void {
    this.checkResponsive()
  }

  checkIsHiddenElement = (elementName) => {
    if (this.props.hiddenElementNames) {
      if (this.props.hiddenElementNames.includes(elementName)) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  /**
   * Hide some tools if widget height is too small.
   * This method only hide child element names if current group is main group and in mobile size.
   * @returns
   */
  checkResponsive = () => {
    if (!this.props.onSetHiddenElementNames) {
      return
    }

    if (!this.props.isMainGroup || !this.props.isMobile) {
      this.props.onSetHiddenElementNames([])
      return
    }

    const aboveHeight = this.state.widgetHeight

    if (aboveHeight >= 465) {
      // no tools need to be hidden
      this.props.onSetHiddenElementNames([])
      return
    }

    // see issue #2862 for more details
    const normalHeight = 32 + 10 // 32px is the height of expand panel touch area, 10px is some extra space
    const verticalHeight = 32 * 2 + 10 // Select, ExtentNavigate, Zoom
    const selectMobileHeight = verticalHeight
    const selectStateHeight = 40 + 10
    const scaleBarHeight = 40 + 10
    const initialToolHeightMapping: { [toolName: string]: number } = {
      'Search': normalHeight,
      'FullScreen': normalHeight,
      'Compass': normalHeight,
      'Layers': normalHeight,
      'BaseMap': normalHeight,
      'Measure': normalHeight,
      'Select': selectMobileHeight + selectStateHeight,
      'ExtentNavigate': verticalHeight,
      'MapSwitch': normalHeight,
      'ScaleBar': scaleBarHeight,
      'Zoom': verticalHeight,
      'Home': normalHeight,
      'Locate': normalHeight,
      'ClearActionData': normalHeight,
      'SelectState': selectStateHeight
    }

    // top: [Search, FullScreen]
    // left top: [Compass]
    // right top: [Layers, BaseMap, Measure, Select]
    // left bottom: [ExtentNavigate, MapSwitch, ScaleBar]
    // right bottom: [Zoom, Home, Locate, ClearActionData]
    // bottom: [SelectState]

    // tool priority order from hight to low
    // top: Search/FullScreen
    // left: MapSwitch, Compass, ScaleBar, ExtentNavigate
    // right: Layers, Locate, Measure, BaseMap, Select, Home, ClearActionData, Zoom
    // bottom: SelectState

    let leftToolPriorityFromHightToLow = [
      'Search',
      'FullScreen',
      'MapSwitch',
      'Compass',
      'ScaleBar',
      'ExtentNavigate',
      'Select',
    ]

    let rightToolPriorityFromHightToLow = [
      'Search',
      'FullScreen',
      'Layers',
      'Locate',
      'Measure',
      'BaseMap',
      'Select',
      'Home',
      'ClearActionData',
      'Zoom',
    ]

    const enabledTools: string[] = []
    const toolConfig = this.props.toolConfig?.asMutable({ deep: true }) || {}
    Object.keys(toolConfig).forEach((key) => {
      if (toolConfig[key] && key.startsWith('can')) {
        let toolName = key.replace('can', '')

        if (toolName === 'SelectState') {
          toolName = 'Select'
        }

        if (!enabledTools.includes(toolName)) {
          enabledTools.push(toolName)
        }
      }
    })

    if (!enabledTools.includes('ClearActionData')) {
      enabledTools.push('ClearActionData')
    }

    if (this.props.isShowMapSwitchBtn && !enabledTools.includes('MapSwitch')) {
      enabledTools.push('MapSwitch')
    }

    // filter leftToolPriorityFromHightToLow and rightToolPriorityFromHightToLow by enabledTools
    leftToolPriorityFromHightToLow = leftToolPriorityFromHightToLow.filter(toolName => enabledTools.includes(toolName))
    rightToolPriorityFromHightToLow = rightToolPriorityFromHightToLow.filter(toolName => enabledTools.includes(toolName))

    // calculate keptLeftTools and keptRightTools
    const keptLeftTools: string[] = []
    const keptRightTools: string[] = []
    let leftSumHeight = 0
    let rightSumHeight = 0

    for (let i = 0; i < leftToolPriorityFromHightToLow.length; i++) {
      const toolName = leftToolPriorityFromHightToLow[i]

      if ((toolName === 'FullScreen' && keptLeftTools.includes('Search')) || (toolName === 'Search' && keptLeftTools.includes('FullScreen'))) {
        // Search tool and FullScreen tool are in the same line.
        keptLeftTools.push(toolName)
        continue
      }

      const newLeftSumHeight = leftSumHeight + initialToolHeightMapping[toolName] || 0

      if (newLeftSumHeight <= aboveHeight) {
        keptLeftTools.push(toolName)
        leftSumHeight = newLeftSumHeight
      } else {
        break
      }
    }

    for (let i = 0; i < rightToolPriorityFromHightToLow.length; i++) {
      const toolName = rightToolPriorityFromHightToLow[i]

      if ((toolName === 'FullScreen' && keptRightTools.includes('Search')) || (toolName === 'Search' && keptRightTools.includes('FullScreen'))) {
        // Search tool and FullScreen tool are in the same line.
        keptRightTools.push(toolName)
        continue
      }

      const newRightSumHeight = rightSumHeight + initialToolHeightMapping[toolName] || 0

      if (newRightSumHeight <= aboveHeight) {
        keptRightTools.push(toolName)
        rightSumHeight = newRightSumHeight
      } else {
        break
      }
    }

    const leftRightBothKeptTools = keptLeftTools.filter(value => keptRightTools.includes(value))
    const otherKeptTools = keptLeftTools.concat(keptRightTools).filter(value => !leftRightBothKeptTools.includes(value))
    let finalKeptTools = Array.from(new Set(leftRightBothKeptTools.concat(otherKeptTools)))

    if (finalKeptTools.includes('Select') && !finalKeptTools.includes('SelectState')) {
      finalKeptTools.push('SelectState')
    }

    if (finalKeptTools.includes('SelectState') && !finalKeptTools.includes('Select')) {
      finalKeptTools = finalKeptTools.filter(toolName => toolName !== 'SelectState')
    }

    let hiddenElementNames = enabledTools.filter(toolName => !finalKeptTools.includes(toolName))

    if (hiddenElementNames.includes('Select') && !hiddenElementNames.includes('SelectState')) {
      hiddenElementNames.push('SelectState')
    }

    hiddenElementNames = Array.from(new Set(hiddenElementNames))
    this.props.onSetHiddenElementNames(hiddenElementNames)
  }

  asyncUpdateSize (width: number, height: number) {
    setTimeout(() => {
      this.onResize({ width, height })
    }, 0)
  }

  onResize = ({ width, height }) => {
    const isMobileMainGroup = this.props.isMainGroup && this.props.isMobile

    if (isMobileMainGroup) {
      if (width && height) {
        this.setState({
          widgetWidth: width,
          widgetHeight: height
          // isThumbMap: false
        }, () => {
          this.checkResponsive()
        })
      }
    }

    if (this.props.groupJson?.watchSize) {
      if (this.props.onGroupSizeChange) {
        this.props.onGroupSizeChange(this.props.groupName, width, height)
      }
    }
  }

  returnNullNode = (key?) => {
    if (this.props.isMobile) {
      return <span key={key} />
    } else {
      return null
    }
  }

  handleToggleMobilePanel = () => {
    this.props.onActiveToolInfoChange(null)

    if (this.preActiveIconBtn) {
      // focus back the tool icon button in keyboard mode
      focusElementInKeyboardMode(this.preActiveIconBtn)
    }
  }

  handlePanelHeightChange = ({ width, height }) => {
    this.setState({ bottomPanelHeight: height }, () => {
      this.checkResponsive()
    })
  }

  getMobilePanelInContext = () => {
    if (document.activeElement && document.activeElement.classList.contains('exbmap-ui-tool')) {
      this.preActiveIconBtn = document.activeElement as HTMLElement
    }

    return (
      <MultiSourceMapContext.Consumer>
        {({ mobilePanelContainer, mapWidgetId }) => (
          <MobilePanel
            className={`map-tool-mobile-panel ${this.props.mapRootClassName}`}
            mapWidgetId={mapWidgetId}
            title={this.props.activeToolInfo && this.props.activeToolInfo.activeToolTitle}
            open={!!this.props.activeToolInfo}
            onClose={() => { this.handleToggleMobilePanel() }}
          >
            <div className='w-100 h-100' ref={(container) => { if (mobilePanelContainer && container) { container.appendChild(mobilePanelContainer) } }} />
          </MobilePanel>
        )}
      </MultiSourceMapContext.Consumer>
    )
  }

  getGroupContent = (layoutJson: LayoutJson) => {
    if (!layoutJson || !this.props.groupJson) {
      this.asyncUpdateSize(0, 0)
      return this.returnNullNode()
    } else {
      const isCustomLayout = this.props.isCustomLayout
      const isCustomLayoutEditing = this.props.isCustomLayoutEditing
      const groupName = this.props.groupName
      const layoutItemJson = layoutJson.layout[groupName]
      const children = (layoutItemJson && layoutItemJson.children?.slice()) || [] // use slice to avoid modifying original array

      if (this.checkIsShowGroup(layoutJson, layoutItemJson, children)) {
        let hasFakeTailPlaceholder = false
        if (this.shouldRenderFakeTailPlaceholder(this.props.groupName)) {
          // render a placeholder at the end of dropzone group in inline editing mode
          children.push('Placeholder')
          hasFakeTailPlaceholder = true
        }

        const groupClassName = classNames(
          `exbmap-ui exbmap-ui-group exbmap-ui-group-${groupName}`,
          this.props.className,
          { 'exbmap-ui-hidden-element': this.props.isHidden },
          { 'main-group': this.props.isMainGroup }
        )

        const styleObj = this.props.layoutConfig.elements[groupName].style || {}
        const shouldWatchResize = (this.props.isMainGroup && this.props.isMobile) || this.props.groupJson.watchSize

        return (
          <div
            id={(this.props.isMainGroup ? this.props.mapWidgetId : undefined)}
            css={this.getStyle()}
            className={groupClassName}
            style={styleObj}
            map-group-name={groupName}
            ref={this.groupConRef}
          >
            {children.map((groupNameOrToolName, index) => {
              const groupJsonOrToolJson = layoutJson.elements[groupNameOrToolName]

              if (!groupJsonOrToolJson) {
                return this.returnNullNode(index)
              }

              if (groupJsonOrToolJson.type === 'GROUP') {
                const groupJson = groupJsonOrToolJson

                return (
                  <Group
                    key={groupNameOrToolName}
                    groupName={groupNameOrToolName}
                    groupJson={groupJson}
                    mapWidgetId={this.props.mapWidgetId}
                    isHidden={this.checkIsHiddenElement(groupNameOrToolName)}
                    className={groupJson.className}
                    style={groupJson.style}
                    layoutConfig={layoutJson}
                    toolConfig={this.props.toolConfig}
                    toolOptions={this.props.toolOptions}
                    isMobile={this.props.isMobile}
                    intl={this.props.intl}
                    overviewMapPosition={this.props.overviewMapPosition}
                    isShowMapSwitchBtn={this.props.isShowMapSwitchBtn}
                    shouldRenderScaleBarMapSwitchGroup={this.props.shouldRenderScaleBarMapSwitchGroup}
                    jimuMapView={this.props.jimuMapView}
                    activeToolInfo={this.props.activeToolInfo}
                    hiddenElementNames={this.props.hiddenElementNames}
                    onActiveToolInfoChange={this.props.onActiveToolInfoChange}
                    theme={this.props.theme}
                    isThumbMap={this.props.isMainGroup ? this.state.isThumbMap : this.props.isThumbMap}
                    autoControlWidgetId={this.props.autoControlWidgetId}
                    isRTL={this.props.isRTL}
                    mapComponentsLoaded={this.props.mapComponentsLoaded}
                    mapRootClassName={this.props.mapRootClassName}
                    isCustomLayout={this.props.isCustomLayout}
                    isCustomLayoutEditing={this.props.isCustomLayoutEditing}
                    groupSizes={this.props.groupSizes}
                    onGroupSizeChange={this.props.onGroupSizeChange}
                    onMouseOverPopper={this.props.onMouseOverPopper}
                    onMouseOutPopper={this.props.onMouseOutPopper}
                    onRemoveTool={this.props.onRemoveTool}
                  />
                )
              } else if (groupJsonOrToolJson.type === 'TOOL') {
                const toolJson = groupJsonOrToolJson
                const toolName = toolJson.toolName
                const viewType = this.props.jimuMapView?.view?.type

                // Scalebar is not available for 3D SceneView.
                if ((toolName === 'ScaleBar' && viewType === '3d')) {
                  return this.returnNullNode(index)
                }

                // (toolName === 'MapSwitch' && !this.props.isShowMapSwitchBtn)

                const shouldRenderTool = this.shouldRenderTool(groupNameOrToolName, layoutJson)

                if (shouldRenderTool) {
                  const baseToolShellClassName = layoutItemJson?.isDropzone ? 'draggable-map-tool-shell' : ''
                  // Placeholder supports multiple instances, so groupNameOrToolName is not unique. We use index to make key unique.
                  const key = `${groupNameOrToolName}_${index}`
                  const isLastInGroup = index === children.length - 1
                  const isFakeTool = groupNameOrToolName === 'Placeholder' && isLastInGroup && hasFakeTailPlaceholder

                  return (
                    <BaseToolShell
                      key={key}
                      toolName={groupNameOrToolName}
                      parentGroupName={groupName}
                      parentGroupJson={this.props.groupJson}
                      parentLayoutItemJson={layoutItemJson}
                      mapWidgetId={this.props.mapWidgetId}
                      isHidden={this.checkIsHiddenElement(groupNameOrToolName)}
                      layoutConfig={layoutJson}
                      className={baseToolShellClassName}
                      indexInGroup={index}
                      isFakeTool={isFakeTool}
                      isCustomLayout={isCustomLayout}
                      isCustomLayoutEditing={isCustomLayoutEditing}
                      overviewMapPosition={this.props.overviewMapPosition}
                      activeToolInfo={this.props.activeToolInfo}
                      toolConfig={this.props.toolConfig}
                      toolOptions={this.props.toolOptions}
                      jimuMapView={this.props.jimuMapView}
                      theme={this.props.theme}
                      onActiveToolInfoChange={this.props.onActiveToolInfoChange}
                      intl={this.props.intl}
                      isMobile={this.props.isMobile}
                      autoControlWidgetId={this.props.autoControlWidgetId}
                      isRTL={this.props.isRTL}
                      mapComponentsLoaded={this.props.mapComponentsLoaded}
                      mapRootClassName={this.props.mapRootClassName}
                      onMouseOverPopper={this.props.onMouseOverPopper}
                      onMouseOutPopper={this.props.onMouseOutPopper}
                      onRemoveTool={this.props.onRemoveTool}
                    />
                  )
                } else {
                  return this.returnNullNode(index)
                }
              } else {
                return this.returnNullNode(index)
              }
            })}
            {shouldWatchResize && <ReactResizeDetector targetRef={this.groupConRef} handleWidth handleHeight onResize={this.onResize} observerOptions={this.observerOptions} />}
            {this.props.isMainGroup && this.props.isMobile && this.props.activeToolInfo && this.props.activeToolInfo.activeToolName !== 'Select' && this.getMobilePanelInContext()}
            {this.props.isMainGroup && <div
              className='exbmap-ui w-100'
              style={{
                position: 'relative',
                pointerEvents: 'auto',
                overflow: 'hidden',
                touchAction: 'none',
                display: this.props.isMobile && !(this.state.isThumbMap || this.props.isThumbMap) ? 'block' : 'none'
              }}
            >
              <div
                className={`${this.props.mapWidgetId}-bottom-panel exbmap-ui w-100 expand-mobile-panel`}
                style={{ overflow: 'hidden', pointerEvents: 'auto', position: 'relative', touchAction: 'none' }}
              >
                <div className='w-100 h-100' ref={this.reactResizeDetectorRef}>
                  <ReactResizeDetector targetRef={this.reactResizeDetectorRef} handleHeight onResize={this.handlePanelHeightChange} />
                </div>
              </div>
            </div>}
          </div>
        )
      } else {
        this.asyncUpdateSize(0, 0)
        return this.returnNullNode()
      }
    }
  }

  shouldRenderFakeTailPlaceholder (groupName: string): boolean {
    if (this.props.isCustomLayoutEditing) {
      const layout = this.props.layoutConfig?.layout

      if ((groupName === 'leftBottomHorizontalGroup' || groupName === 'leftBottomVerticalGroup') && this.props.shouldRenderScaleBarMapSwitchGroup) {
        const selfLayoutItemJson = layout?.[groupName]

        if (selfLayoutItemJson?.children?.length > 0) {
          return true
        }
      } else {
        const mapping: { [groupName: string]: string } = {
          leftTopHorizontalGroup: 'leftTopCornerGroup',
          leftTopVerticalGroup: 'leftTopCornerGroup',
          rightTopHorizontalGroup: 'rightTopCornerGroup',
          rightTopVerticalGroup: 'rightTopCornerGroup',
          rightBottomHorizontalGroup: 'rightBottomCornerGroup',
          rightBottomVerticalGroup: 'rightBottomCornerGroup',
          leftBottomHorizontalGroup: 'leftBottomCornerDropzoneGroup',
          leftBottomVerticalGroup: 'leftBottomCornerDropzoneGroup'
        }

        const cornerGroupName: string = mapping[groupName]

        if (cornerGroupName) {
          const cornerLayoutItemJson = layout?.[cornerGroupName]

          if (cornerLayoutItemJson?.children?.length > 0) {
            return true
          }
        }
      }
    }

    return false
  }

  checkIsShowGroup = (layoutJson: LayoutJson, layoutItemJson: LayoutItemJson, children: string[]) => {
    if (!layoutItemJson) {
      return false
    }

    if (this.props.isCustomLayoutEditing && layoutItemJson.alwaysRenderForInlineEditing) {
      // always render dropzone and there ancestors in inline editing mode
      return true
    }

    if (!children || children.length === 0) {
      return false
    } else {
      const toolNames = []
      this.findAllToolNames(layoutJson, children, toolNames)
      let isShowGroup = false

      for (let i = 0; i < toolNames.length; i++) {
        if (this.shouldRenderTool(toolNames[i], layoutJson)) {
          isShowGroup = true
          break
        }
      }

      return isShowGroup
    }
  }

  shouldRenderTool (toolName: string, layoutJson: LayoutJson): boolean {
    const toolInfo = ToolModulesConfig[toolName]

    if (!toolInfo) {
      // invalid tool name
      return false
    }

    const toolConfig = this.props.toolConfig
    const canToolName = `can${toolName}`
    const enabledInToolConfig = toolConfig && toolConfig[canToolName]
    const enabled = toolInfo.renderByToolConfig ? enabledInToolConfig : true
    const isLocked = (layoutJson.lockToolNames && layoutJson.lockToolNames.includes(toolName))
    const result = !!(enabled || isLocked)
    return result
  }

  findAllToolNames = (layoutJson: LayoutJson, children: string[], toolNames: string[]) => {
    if (!children || children.length === 0) {
      return
    }
    for (let i = 0; i < children.length; i++) {
      const childName = children[i]
      const elementInfo = layoutJson.elements[childName]

      if (elementInfo.type === 'GROUP') {
        const groupName = elementInfo.groupName
        this.findAllToolNames(layoutJson, layoutJson.layout[groupName] && layoutJson.layout[groupName].children, toolNames)
      } else {
        toolNames.push(children[i])
      }
    }
  }

  render () {
    if (this.props.isMainGroup && this.props.isMobile && this.props.toolConfig && this.props.toolConfig.canSelect) {
      return (
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
          <div id={`${this.props.mapWidgetId}-with-select-container`} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
            <div className='w-100 h-100' style={{ position: 'relative' }}>
              {this.getGroupContent(this.props.layoutConfig)}
            </div>
          </div>
        </div>
      )
    } else {
      return this.getGroupContent(this.props.layoutConfig)
    }
  }
}
