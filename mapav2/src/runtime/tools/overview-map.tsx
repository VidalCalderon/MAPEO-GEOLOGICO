/** @jsx jsx */
import { css, jsx, React, classNames } from 'jimu-core'
import { loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis'
import { SVG, Button, defaultMessages as jimuUiDefaultMessages } from 'jimu-ui'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import type { IMOverviewMapOptions } from '../../config'

const rbToLtArrowIcon = require('../assets/icons/overview/rb-to-lt-arrow.svg') // ↖
const ltToRbArrowIcon = require('../assets/icons/overview/lt-to-rb-arrow.svg') // ↘
const rtToLbArrowIcon = require('../assets/icons/overview/rt-to-lb-arrow.svg') // ↙
const lbToRtArrowIcon = require('../assets/icons/overview/lb-to-rt-arrow.svg') // ↗

enum SmallViewStatus {
  Initial = 'Initial',
  Creating = 'Creating',
  Created = 'Created',
  CreateError = 'CreateError'
}

interface States {
  apiLoaded: boolean
  isOpened: boolean
  smallViewStatus: SmallViewStatus
  overviewFocusDomStyle: React.CSSProperties
}

// Cache to record whether the overview map widget has been opened before for each map widget.
const widgetOverviewMapOpenCache: { [mapWidgetId: string]: boolean } = {}

export default class OverviewMap extends BaseTool<BaseToolProps, States> {
  toolName = 'OverviewMap'

  unmounted: boolean

  Map: typeof __esri.Map

  MapView: typeof __esri.MapView

  Basemap: typeof __esri.Basemap

  reactiveUtils: __esri.reactiveUtils

  rootDom: HTMLDivElement

  overviewFocusDom: HTMLDivElement

  boundMainJimuMapView: JimuMapView

  boundMainBasemap: __esri.Basemap

  // smallView is created by boundMainJimuMapView and boundMainBasemap
  smallView: __esri.MapView

  watchMainViewBasemapChangeHandle: __esri.Handle

  watchMainViewExtentChangeHandle: __esri.Handle

  watchSmallViewExtentChangeHandle: __esri.Handle

  focusExtent: __esri.Extent

  tempFixedFocusExtent: __esri.Extent

  // offset by mouse moving, mouseDownOffsetXY is relative to overviewDom
  mouseDownOffsetXY: [number, number] = null // [offsetX, offsetY]

  // offset by arrow keys (dedicated state for keyboard interactions)
  // dragging has higher priority than keyboard, during mouse dragging, ignore keyboard events
  keyboardArrowOffsetXY: [number, number] = null // [offsetX, offsetY]

  constructor (props) {
    super(props)

    this.state = {
      apiLoaded: false,
      isOpened: false,
      smallViewStatus: SmallViewStatus.Initial,
      overviewFocusDomStyle: {}
    }
  }

  getStyle (isOpened: boolean) {
    // Emotion will change 'left: 0' to 'right: 0' for right-to-left locales.
    // We don't want to the flip the css, so take some trick here.
    let leftKey = 'left'
    let rightKey = 'right'

    if (this.props.isRTL) {
      leftKey = 'right'
      rightKey = 'left'
    }

    const arrowIconOffset = isOpened ? '1px' : '0px'

    return css`
      position: relative;
      overflow: visible;

      .overview-window {
        box-sizing: content-box;
        position: absolute;
        width: 200px;
        height: 200px;
        overflow: hidden;
        background: white;
        border: 1px solid var(--ref-palette-neutral-1200, #050505);

        .overview-map-container {
          pointer-events: none;
          width: 100%;
          height: 100%;
        }

        .overview-mask {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          width: 100%;
          height: 100%;

          .overview-focus {
            position: absolute;
            box-sizing: border-box;
            ${leftKey}: 0;
            top: 0;
            width: 0;
            height: 0;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid var(--ref-palette-neutral-1200, #050505);
            cursor: move;
          }
        }
      }

      .overview-map-arrow-icon-btn {
        position: absolute;
        width: 14px !important;
        height: 14px !important;
        z-index: 1;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;

        .icon-btn-sizer {
          min-width: 0;
          min-height: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          border: 0;
        }
      }

      &.small-view-not-created {
        .overview-focus {
          display: none !important;
        }
      }

      &.bottom-left-corner {
        .overview-window {
          ${leftKey}: 0;
          bottom: 0;
        }

        .overview-map-arrow-icon-btn {
          ${leftKey}: ${arrowIconOffset};
          bottom: ${arrowIconOffset};
        }
      }

      &.top-left-corner {
        .overview-window {
          ${leftKey}: 0;
          top: 0;
        }

        .overview-map-arrow-icon-btn {
          ${leftKey}: ${arrowIconOffset};
          top: ${arrowIconOffset};
        }
      }

      &.top-right-corner {
        .overview-window {
          ${rightKey}: 0;
          top: 0;
        }

        .overview-map-arrow-icon-btn {
          ${rightKey}: ${arrowIconOffset};
          top: ${arrowIconOffset};
        }
      }

      &.bottom-right-corner {
        .overview-window {
          ${rightKey}: 0;
          bottom: 0;
        }

        .overview-map-arrow-icon-btn {
          ${rightKey}: ${arrowIconOffset};
          bottom: ${arrowIconOffset};
        }
      }

      &.overview-map-tool-not-opened {
        .overview-window {
          visibility: hidden;
          pointer-events: none;
        }
      }

      .esri-view-root {
        /* hide the builtin attribution (not in view.ui.components since API 5.0) in the map */
        .esri-attribution {
          display: none !important;
        }
      }
    `
  }

  getTitle () {
    return ''
  }

  getIcon (): IconType {
    return null
  }

  getExpandPanel (): React.JSX.Element {
    const isOpened = this.state.isOpened
    const overviewFocusDomStyle = this.state.overviewFocusDomStyle || {}
    const overviewMapPosition = this.props.overviewMapPosition || 'bottom-right'
    const isSmallViewCreated = this.state.smallViewStatus === SmallViewStatus.Created
    const isBottomLeft = overviewMapPosition === 'bottom-left'
    const isTopLeft = overviewMapPosition === 'top-left'
    const isTopRight = overviewMapPosition === 'top-right'
    const isBottomRight = overviewMapPosition === 'bottom-right'

    const className = classNames([
      'overview-map-tool',
      {
        'bottom-left-corner': isBottomLeft,
        'top-left-corner': isTopLeft,
        'top-right-corner': isTopRight,
        'bottom-right-corner': isBottomRight,
        'overview-map-tool-not-opened': !isOpened,
        'small-view-created': isSmallViewCreated,
        'small-view-not-created': !isSmallViewCreated
      }
    ])

    let iconSrc: string = ''

    if (isBottomLeft) {
      if (isOpened) {
        iconSrc = rtToLbArrowIcon
      } else {
        iconSrc = lbToRtArrowIcon
      }
    } else if (isTopLeft) {
      if (isOpened) {
        iconSrc = rbToLtArrowIcon
      } else {
        iconSrc = ltToRbArrowIcon
      }
    } else if (isTopRight) {
      if (isOpened) {
        iconSrc = lbToRtArrowIcon
      } else {
        iconSrc = rtToLbArrowIcon
      }
    } else {
      // default 'bottom-right'
      if (isOpened) {
        iconSrc = ltToRbArrowIcon
      } else {
        iconSrc = rbToLtArrowIcon
      }
    }

    let overviewMapLabel = jimuUiDefaultMessages.OverviewMapLabel || ''
    let navigateOverviewMapLabel = jimuUiDefaultMessages.navigateOverviewMap || ''

    const intl = this.props.intl

    if (intl) {
      overviewMapLabel = intl.formatMessage({ id: 'OverviewMapLabel', defaultMessage: overviewMapLabel })
      navigateOverviewMapLabel = intl.formatMessage({ id: 'navigateOverviewMap', defaultMessage: navigateOverviewMapLabel })
    }

    if (!overviewMapLabel) {
      overviewMapLabel = ''
    }

    if (!navigateOverviewMapLabel) {
      navigateOverviewMapLabel = ''
    }

    return (
      <div className={className} css={this.getStyle(isOpened)}>
        <Button
          className='overview-map-arrow-icon-btn'
          title={overviewMapLabel}
          aria-expanded={isOpened}
          icon={true}
          onClick={this.onClickArrowIcon}
        >
          <SVG
            className='overview-map-arrow-icon'
            src={iconSrc}
            size={14}
            color='var(--sys-color-action-text)'
          />
        </Button>
        <div className='overview-window' ref={this.onSetRootDom}>
          <div className='overview-mask'>
            <div
              ref={this.onSetOverviewFocusDom}
              className='overview-focus'
              style={overviewFocusDomStyle}
              // When NVDA is enabled, it will block the triggering of arrow key events. The workaround is to set the role to 'option' or 'application'.
              role='region'
              tabIndex={0}
              aria-label={navigateOverviewMapLabel}
              onMouseDown={this.onOverviewFocusDomMouseDown}
              onKeyDown={this.onOverviewFocusDomKeyDown}
              onKeyUp={this.onOverviewFocusDomKeyUp}
            />
          </div>
        </div>
      </div>
    )
  }

  onSetRootDom = (ref: HTMLDivElement): void => {
    this.rootDom = ref
  }

  onSetOverviewFocusDom = (ref: HTMLDivElement): void => {
    this.overviewFocusDom = ref
  }

  componentDidMount (): void {
    document.body.addEventListener('mousemove', this.onBodyMouseMove, false)
    document.body.addEventListener('mouseup', this.onBodyMouseUp, false)

    this.loadAPIModules()

    const selfToolOptions = this.props.selfToolOptions as IMOverviewMapOptions

    // only set opened state when the widget is opened for the first time, so we use widgetOverviewMapOpenCache to record the opened state for each map widget
    if (selfToolOptions?.initiallyExpand && !widgetOverviewMapOpenCache[this.props.mapWidgetId]) {
      this.setOpenState(true)
    }
  }

  componentDidUpdate (prevProps: BaseToolProps, prevState: States): void {
    const preAPILoaded = prevState?.apiLoaded
    const newAPILoaded = this.state.apiLoaded
    const isAPILoaded = preAPILoaded !== newAPILoaded

    const oldJimuMapView = prevProps?.jimuMapView || null
    const newJimuMapView = this.props.jimuMapView || null
    const isJimuMapViewChanged = oldJimuMapView !== newJimuMapView
    const preInitiallyExpand = (prevProps.selfToolOptions as IMOverviewMapOptions)?.initiallyExpand || false
    const initiallyExpand = (this.props.selfToolOptions as IMOverviewMapOptions)?.initiallyExpand || false

    if (isAPILoaded || isJimuMapViewChanged) {
      this.tryCreateNewSmallView()
    }

    if (preInitiallyExpand !== initiallyExpand) {
      this.setOpenState(initiallyExpand)
    }
  }

  componentWillUnmount (): void {
    this.unmounted = true

    document.body.removeEventListener('mousemove', this.onBodyMouseMove, false)
    document.body.removeEventListener('mouseup', this.onBodyMouseUp, false)

    this.destroySmallView()
  }

  async loadAPIModules (): Promise<void> {
    const modules = await loadArcGISJSAPIModules(
      [
        'esri/Map',
        'esri/views/MapView',
        'esri/Basemap',
        'esri/core/reactiveUtils'
      ]
    )

    this.Map = modules[0]
    this.MapView = modules[1]
    this.Basemap = modules[2]
    this.reactiveUtils = modules[3]

    this.setState({
      apiLoaded: true
    })
  }

  setOpenState (willOpen: boolean): void {
    if (this.state.isOpened === willOpen) {
      return
    }

    this.setState({
      isOpened: willOpen
    }, () => {
      if (willOpen) {
        const mapWidgetId = this.props.mapWidgetId

        if (mapWidgetId) {
          widgetOverviewMapOpenCache[mapWidgetId] = true
        }

        this.tryCreateNewSmallView()
      }
    })
  }

  onClickArrowIcon = () => {
    const willOpen = !this.state.isOpened
    this.setOpenState(willOpen)
  }

  async tryCreateNewSmallView (): Promise<void> {
    if (!this.rootDom) {
      return
    }

    if (!this.state.apiLoaded) {
      return
    }

    const newJimuMainView = this.props.jimuMapView

    if (!newJimuMainView) {
      this.destroySmallView()
      return
    }

    const newMainBasemap = newJimuMainView.view?.map?.basemap

    if (!newMainBasemap) {
      console.warn(`jimuMapView ${newJimuMainView.id} doesn't have basemap`)
      this.destroySmallView()
      return
    }

    if (this.isMainJimuMapViewExpected(this.boundMainJimuMapView) && this.isMainBasemapExpected(this.boundMainBasemap) && this.state.smallViewStatus !== SmallViewStatus.Initial) {
      return
    }

    this.destroySmallView()

    // Don't create small view if the tool is not opened
    if (!this.state.isOpened) {
      return
    }

    // create map container and append it into rootDom as the first child
    const mapContainer = document.createElement('div')
    mapContainer.className = 'overview-map-container'
    // disable the tab keyboard for mapContainer and its child elements otherwise tab key can focus on div.esri-view-surface
    mapContainer.setAttribute('inert', '')

    if (this.rootDom.firstChild) {
      this.rootDom.insertBefore(mapContainer, this.rootDom.firstChild)
    } else {
      this.rootDom.appendChild(mapContainer)
    }

    this.setState({
      smallViewStatus: SmallViewStatus.Creating
    })

    this.boundMainJimuMapView = newJimuMainView
    this.boundMainBasemap = newMainBasemap

    await newJimuMainView.whenJimuMapViewLoaded()

    // If we use basemap.clone() to get basemap for the second time, the created map renders empty and console shows the following error:
    // [esri.views.LayerViewManager] Failed to create layerview for layer title:'xxxx', id:'xxxx' of type 'tile'.
    // So don't use basemap.clone() here, use Basemap.fromJSON(basemapJson) instead.
    // const basemap = newMainBasemap.clone()
    const basemapJson = newMainBasemap.toJSON()
    const basemap = this.Basemap.fromJSON(basemapJson)

    const overviewMap = new this.Map({
      basemap
    })

    // Create the MapView for overview map
    const initSmallViewExtent = this.calSmallViewExtentByMainViewExtent(newJimuMainView.view)
    const smallView = new this.MapView({
      container: mapContainer,
      map: overviewMap,
      extent: initSmallViewExtent,
      popupEnabled: false,
      constraints: {
        rotationEnabled: false,
        snapToZoom: false
      },
      navigation: {
        browserTouchPanEnabled: false,
        // gamepad: false,
        momentumEnabled: false,
        actionMap: {
          mouseWheel: 'none'
        }
      }
    })

    // Remove the default widgets
    smallView.ui.components = []

    // smallView.ui.keyboardNavigationEnabled = false

    let viewWhenError: Error = null

    try {
      await smallView.when()
    } catch (e) {
      viewWhenError = e
      console.error('can not create MapView for OverviewMap tool', e)
    }

    // The time duration from smallView creating to smallView.when() resolved is about 700ms.

    if (this.isMainJimuMapViewExpected(newJimuMainView) && this.isMainBasemapExpected(newMainBasemap)) {
      // newJimuMainView and newMainBasemap are refresh, this is the last call of this.tryCreateNewSmallView()
      if (viewWhenError) {
        this.smallView = null
        this.setState({
          smallViewStatus: SmallViewStatus.CreateError
        })
      } else {
        this.smallView = smallView
        this.bindEventsToUpdateOverview()

        this.setState({
          smallViewStatus: SmallViewStatus.Created
        })
      }
    } else {
      // newJimuMainView and newMainBasemap are not refresh, this is not the last call of this.tryCreateNewSmallView()
      // so don't update this.smallView and this.state.smallViewStatus here because we only update theme in the last call of this.tryCreateNewSmallView()
      // mapContainer is useless now, remove it
      if (mapContainer.parentElement) {
        mapContainer.parentElement.removeChild(mapContainer)
      }
    }
  }

  isMainJimuMapViewExpected (mainJimuMapView: JimuMapView): boolean {
    return mainJimuMapView && mainJimuMapView === this.props.jimuMapView
  }

  isMainBasemapExpected (mainBasemap: __esri.Basemap): boolean {
    return mainBasemap && mainBasemap === this.props.jimuMapView?.view?.map?.basemap
  }

  destroySmallView (): void {
    this.releaseHandles()

    this.focusExtent = null
    this.tempFixedFocusExtent = null

    this.boundMainJimuMapView = null
    this.boundMainBasemap = null

    if (!this.unmounted) {
      this.setState({
        smallViewStatus: SmallViewStatus.Initial
      })
    }

    if (this.smallView) {
      const viewContainer = this.smallView.container

      if (!this.smallView.destroyed) {
        this.smallView.destroy()
      }

      if (viewContainer && viewContainer.parentElement) {
        viewContainer.parentElement.removeChild(viewContainer)
      }

      this.smallView = null
    }
  }

  releaseHandles (): void {
    if (this.watchMainViewBasemapChangeHandle) {
      this.watchMainViewBasemapChangeHandle.remove()
      this.watchMainViewBasemapChangeHandle = null
    }

    if (this.watchMainViewExtentChangeHandle) {
      this.watchMainViewExtentChangeHandle.remove()
      this.watchMainViewExtentChangeHandle = null
    }

    if (this.watchSmallViewExtentChangeHandle) {
      this.watchSmallViewExtentChangeHandle.remove()
      this.watchSmallViewExtentChangeHandle = null
    }
  }

  bindEventsToUpdateOverview () {
    this.releaseHandles()

    const mainView = this.boundMainJimuMapView.view
    const smallView = this.smallView

    this.watchMainViewBasemapChangeHandle = this.reactiveUtils.watch(() => mainView?.map?.basemap, () => {
      this.tryCreateNewSmallView()
    })

    this.watchMainViewExtentChangeHandle = this.reactiveUtils.watch(() => mainView?.extent, () => {
      this.onMainViewExtentChange()
    })

    this.watchSmallViewExtentChangeHandle = this.reactiveUtils.watch(() => smallView?.extent, () => {
      this.updateOverviewFocusByMainViewExtent()
    })

    this.onMainViewExtentChange()

    this.updateOverviewFocusByMainViewExtent()
  }

  onMainViewExtentChange (): void {
    if (!this.boundMainJimuMapView || !this.smallView) {
      return
    }

    // If mousedown, means user is dragging focus dom. Then we should not update smallView.extent, otherwise it will conflicts.
    if (this.mouseDownOffsetXY) {
      return
    }

    const expandExtent = this.calSmallViewExtentByMainViewExtent(this.boundMainJimuMapView.view)
    this.smallView.extent = expandExtent

    this.updateOverviewFocusByMainViewExtent()
  }

  calSmallViewExtentByMainViewExtent (mainView: __esri.MapView | __esri.SceneView): __esri.Extent {
    const mainMapExtent = this.getHandledMainViewExtent(mainView)

    // Note, extent.expand() will change extent self, so need to call extent.clone() first
    const expandExtent = mainMapExtent.clone().expand(3)

    return expandExtent
  }

  getHandledMainViewExtent (mainView: __esri.MapView | __esri.SceneView): __esri.Extent {
    let result: __esri.Extent = null

    if (mainView.type === '2d' && mainView.rotation !== 0) {
      const [mainViewWidth, mainViewHeight] = mainView.size
      const lt = mainView.toMap({
        x: 0,
        y: 0
      })
      const rt = mainView.toMap({
        x: mainViewWidth,
        y: 0
      })
      const rb = mainView.toMap({
        x: mainViewWidth,
        y: mainViewHeight
      })
      const lb = mainView.toMap({
        x: 0,
        y: mainViewHeight
      })

      const xArray: number[] = [lt.x, rt.x, rb.x, lb.x]
      const yArray: number[] = [lt.y, rt.y, rb.y, lb.y]
      const xmin = Math.min(...xArray)
      const xmax = Math.max(...xArray)
      const ymin = Math.min(...yArray)
      const ymax = Math.max(...yArray)
      result = mainView.extent.clone()
      result.xmin = xmin
      result.xmax = xmax
      result.ymin = ymin
      result.ymax = ymax
    } else {
      result = mainView.extent.clone()
    }

    return result
  }

  // Handle arrow key press: accumulate pixel movement and translate the focus box (visual only).
  onOverviewFocusDomKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>): void => {
    const key = evt.key
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

    if (!arrowKeys.includes(key)) {
      return
    }

    evt.preventDefault()
    evt.stopPropagation()

    if (this.mouseDownOffsetXY) {
      // dragging has higher priority than keyboard, during mouse dragging, ignore keyboard events
      return
    }

    const step = 1
    let dx = 0
    let dy = 0

    switch (key) {
      case 'ArrowLeft':
        dx = -step
        break
      case 'ArrowRight':
        dx = step
        break
      case 'ArrowUp':
        dy = -step
        break
      case 'ArrowDown':
        dy = step
        break
    }

    if (!this.keyboardArrowOffsetXY) {
      this.keyboardArrowOffsetXY = [0, 0]
    }

    this.keyboardArrowOffsetXY[0] += dx
    this.keyboardArrowOffsetXY[1] += dy

    this.mixinUpdateOverviewFocusDomStyle({
      transform: `translate(${this.keyboardArrowOffsetXY[0]}px, ${this.keyboardArrowOffsetXY[1]}px)`
    })
  }

  // Handle arrow key release: apply accumulated movement to map (recenter) and reset temp state.
  onOverviewFocusDomKeyUp = (evt: React.KeyboardEvent<HTMLDivElement>): void => {
    const key = evt.key
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

    if (!arrowKeys.includes(key)) {
      return
    }

    evt.preventDefault()
    evt.stopPropagation()

    // dragging has higher priority than keyboard, during mouse dragging, ignore keyboard events,
    // so we need to check !this.mouseDownOffsetXY here
    if (this.keyboardArrowOffsetXY && !this.mouseDownOffsetXY) {
      const deltaX = this.keyboardArrowOffsetXY ? this.keyboardArrowOffsetXY[0] : 0
      const deltaY = this.keyboardArrowOffsetXY ? this.keyboardArrowOffsetXY[1] : 0

      if (deltaX !== 0 || deltaY !== 0) {
        this.onFocusDomMoveEnd(deltaX, deltaY)
      }
    }

    this.keyboardArrowOffsetXY = null
  }

  /**
   * Start to drag overview focus dom.
   * @param evt
   */
  onOverviewFocusDomMouseDown = (evt): void => {
    if (!this.boundMainJimuMapView || !this.smallView) {
      return
    }

    this.mouseDownOffsetXY = this.getMouseEventRelativePosition(evt, this.rootDom)
    // dragging has higher priority than keyboard, during mouse dragging, ignore keyboard events, so set this.keyboardArrowOffsetXY to null here
    this.keyboardArrowOffsetXY = null
  }

  /**
   * Update overview focus dom position during drag.
   * @param evt
   */
  onBodyMouseMove = (evt: MouseEvent): void => {
    if (!this.mouseDownOffsetXY) {
      return
    }

    const newMouseOffsetXY = this.getMouseEventRelativePosition(evt, this.rootDom)
    const deltaX = newMouseOffsetXY[0] - this.mouseDownOffsetXY[0]
    const deltaY = newMouseOffsetXY[1] - this.mouseDownOffsetXY[1]

    this.mixinUpdateOverviewFocusDomStyle({
      transform: `translate(${deltaX}px, ${deltaY}px)`
    })
  }

  /**
   * Update mainView.center after drag end.
   * @param evt
   */
  onBodyMouseUp = (evt: MouseEvent): void => {
    if (!this.mouseDownOffsetXY) {
      return
    }

    const newMouseOffsetXY = this.getMouseEventRelativePosition(evt, this.rootDom)
    const deltaX = newMouseOffsetXY[0] - this.mouseDownOffsetXY[0]
    const deltaY = newMouseOffsetXY[1] - this.mouseDownOffsetXY[1]
    this.mouseDownOffsetXY = null
    // dragging has higher priority than keyboard, during mouse dragging, ignore keyboard events, so set this.keyboardArrowOffsetXY to null here
    this.keyboardArrowOffsetXY = null
    this.onFocusDomMoveEnd(deltaX, deltaY)
  }

  /**
   * This method is called when drag (or move by arrow keys) focus dom end.
   * @param deltaX mouse moved deltaX
   * @param deltaY mouse moved deltaY
   */
  onFocusDomMoveEnd (deltaX: number, deltaY: number): void {
    const mainView = this.boundMainJimuMapView?.view
    const smallView = this.smallView

    if (!mainView || !smallView || !this.focusExtent) {
      return
    }

    if (deltaX === 0 && deltaY === 0) {
      // not move
      this.mixinUpdateOverviewFocusDomStyle({
        transform: 'none'
      })
    } else {
      // moved

      // calculate dragged deltaMapX and deltaMapY
      const resolution = smallView.resolution
      const deltaMapX = resolution * deltaX
      const deltaMapY = -resolution * deltaY

      // update overviewFocus by temp focus extent during smallView.goTo()
      const newTempFocusExtent = this.focusExtent.clone()
      const newXmin = newTempFocusExtent.xmin + deltaMapX
      const newXmax = newTempFocusExtent.xmax + deltaMapX
      const newYmin = newTempFocusExtent.ymin + deltaMapY
      const newYmax = newTempFocusExtent.ymax + deltaMapY
      newTempFocusExtent.xmin = newXmin
      newTempFocusExtent.xmax = newXmax
      newTempFocusExtent.ymin = newYmin
      newTempFocusExtent.ymax = newYmax
      this.tempFixedFocusExtent = newTempFocusExtent

      // change the center of main view
      const newMainViewCenter = this.tempFixedFocusExtent.center.clone()
      const groundLayerCount = mainView.map.ground?.layers?.length

      if (groundLayerCount > 0) {
        // like this: new Map({ ground: "world-elevation" })
        // There is a bug for view.goTo() method.
        // After call view.goTo(), map will send a http request if view.map.ground.layers is not empty. Map will keep static until get the http response.
        // The experience is not good.
        mainView.center = newMainViewCenter
        this.tempFixedFocusExtent = null
        // this.updateOverviewFocusByMainViewExtent()
        this.onMainViewExtentChange()
      } else {
        mainView.goTo(newMainViewCenter).finally(() => {
          this.tempFixedFocusExtent = null
          // this.updateOverviewFocusByMainViewExtent()
          this.onMainViewExtentChange()
        })
      }
    }
  }

  mixinUpdateOverviewFocusDomStyle (partialStyle: React.CSSProperties): void {
    const overviewFocusDomStyle = Object.assign({}, this.state.overviewFocusDomStyle, partialStyle)
    this.setState({
      overviewFocusDomStyle
    })
  }

  /**
   * Update the position of overview focus dom by this.tempFixedFocusExtent or mainJimuMapView extent
   */
  updateOverviewFocusByMainViewExtent () {
    const mainView = this.boundMainJimuMapView.view
    // const extent = this.tempFixedFocusExtent || mainView.extent
    const extent = this.tempFixedFocusExtent || this.getHandledMainViewExtent(mainView)
    const focusExtent = extent.clone()
    this.updateOverviewFocusDomPosition(focusExtent)
  }

  /**
   * Update the position of overview focus dom by the input focusExtent
   * @param _focusExtent
   */
  updateOverviewFocusDomPosition (_focusExtent: __esri.Extent) {
    const smallView = this.smallView

    this.focusExtent = _focusExtent.clone()
    const center = this.focusExtent.center.clone()

    const ltPoint = center.clone()
    ltPoint.x = this.focusExtent.xmin
    ltPoint.y = this.focusExtent.ymax

    const rbPoint = center.clone()
    rbPoint.x = this.focusExtent.xmax
    rbPoint.y = this.focusExtent.ymin

    const ltPixel = smallView.toScreen(ltPoint)
    const rbPixel = smallView.toScreen(rbPoint)

    let shouldRenderOverviewFocus = false
    const [mapViewWidth, mapViewHeight] = smallView.size

    if (ltPixel && rbPixel) {
      const isValidX = ltPixel.x < rbPixel.x
      const isValidY = ltPixel.y < rbPixel.y

      if (isValidX && isValidY) {
        const isFocusCoverOverview = ltPixel.x < 0 && rbPixel.x > mapViewWidth && ltPixel.y < 0 && rbPixel.y > mapViewHeight
        shouldRenderOverviewFocus = !isFocusCoverOverview
      }
    }

    const overviewFocusDomStyle: React.CSSProperties = {
      transform: 'none'
    }

    if (shouldRenderOverviewFocus) {
      const width = rbPixel.x - ltPixel.x
      const height = rbPixel.y - ltPixel.y
      overviewFocusDomStyle.left = `${ltPixel.x}px`
      overviewFocusDomStyle.top = `${ltPixel.y}px`
      overviewFocusDomStyle.width = `${width}px`
      overviewFocusDomStyle.height = `${height}px`
      overviewFocusDomStyle.display = 'block'
    } else {
      overviewFocusDomStyle.display = 'none'
    }

    this.mixinUpdateOverviewFocusDomStyle(overviewFocusDomStyle)
  }

  /**
   * Get the mouse event coordinate relative to relativeTo.
   * cases:
   * 1. evt.target === relativeTo
   * 2. evt.target is the descendant of relativeTo
   * 3. evt.target is the ancestor of relativeTo
   * 4. evt.target is the external dom of relativeTo
   * @param evt
   * @param relativeTo
   */
  getMouseEventRelativePosition (evt: MouseEvent, relativeTo: HTMLElement): [number, number] {
    const {
      offsetX,
      offsetY
    } = evt

    const targetDom = evt.target

    if (targetDom === relativeTo) {
      return [offsetX, offsetY]
    }

    const relativeToRect = relativeTo.getBoundingClientRect()
    return [evt.clientX - relativeToRect.x, evt.clientY - relativeToRect.y]
  }
}
