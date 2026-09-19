/** @jsx jsx */
import { React, css, jsx, LocationChangeMessage, MessageManager, lodash, type IntlShape, focusElementInKeyboardMode } from 'jimu-core'
import { SVG, Loading, LoadingType } from 'jimu-ui'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import type { JimuMapView } from 'jimu-arcgis'
import type { ArcgisLocateCustomEvent, ArcgisTrackCustomEvent } from '@arcgis/map-components'
import type { IPoint } from '@esri/arcgis-rest-request'
import { type IMLocateOptions, type IMTrackConfig, getDefaultNotEmptyIMTrackConfig } from '../../config'
import mapDefaultMessages from '../translations/default'
import { overrideCalciteStyle } from './utils'

const locationOnlyIcon = require('../assets/icons/track/location-only.svg')
const northUpIcon = require('../assets/icons/track/north-up.svg')
const mapRotateIcon = require('../assets/icons/track/map-rotate.svg')

export default class Locate extends BaseTool<BaseToolProps, unknown> {
  toolName = 'Locate'

  getTitle () {
    return 'Locate'
  }

  getIcon (): IconType {
    return null
  }

  getExpandPanel (): React.JSX.Element {
    const locateOptions: IMLocateOptions = this.props.selfToolOptions
    const trackMode = locateOptions?.track

    if (trackMode) {
      return (
        <TrackInner
          mapWidgetId={this.props.mapWidgetId}
          jimuMapView={this.props.jimuMapView}
          mapComponentsLoaded={this.props.mapComponentsLoaded}
          locateOptions={locateOptions}
          intl={this.props.intl}
        />
      )
    } else {
      return (
        <LocateInner
          mapWidgetId={this.props.mapWidgetId}
          jimuMapView={this.props.jimuMapView}
          mapComponentsLoaded={this.props.mapComponentsLoaded}
          locateOptions={locateOptions}
          intl={this.props.intl}
        />
      )
    }
  }
}

interface LocateInnerProps {
  mapWidgetId: string
  jimuMapView: JimuMapView
  mapComponentsLoaded: boolean
  locateOptions?: IMLocateOptions
  intl: IntlShape
}

class LocateInner extends React.PureComponent<LocateInnerProps, any> {
  locateElement: HTMLArcgisLocateElement & { view: __esri.View }
  container: HTMLElement
  overrideStyleHandle: __esri.Handle

  constructor (props) {
    super(props)

    this.state = {}
  }

  onRef = (ref) => {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!ref) {
      return
    }

    this.container = ref
    this.tryUpdateLocateElement()
  }

  componentDidUpdate () {
    this.tryUpdateLocateElement()
  }

  tryUpdateLocateElement () {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!this.container) {
      return
    }

    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null

    // destroy current locateElement when view changed or container changed
    if (this.locateElement) {
      if (this.locateElement.view !== currView || this.locateElement.parentNode !== this.container) {
        this.destroyLocateElement()
      }
    }

    // create new locateElement if this.locateElement is empty and this.container & currView are not empty
    if (!this.locateElement && this.props.mapComponentsLoaded && this.container && currView) {
      this.locateElement = document.createElement('arcgis-locate') as HTMLArcgisLocateElement & { view: __esri.View }
      // https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition#options
      this.locateElement.geolocationOptions = {
        // A positive long value indicating the maximum age in milliseconds of a possible cached position that is acceptable to return.
        // If set to 0, it means that the device cannot use a cached position and must attempt to retrieve the real current position.
        maximumAge: 0,
        // A positive long value representing the maximum length of time (in milliseconds) the device is allowed to take in order to return a position.
        timeout: 15000,
        enableHighAccuracy: true
      }
      this.locateElement.view = currView
      this.locateElement.addEventListener('arcgisSuccess', this.onLocateArcgisSuccess)
      this.overrideStyleHandle = overrideCalciteStyle(this.locateElement)
      this.container.appendChild(this.locateElement)

      jimuMapView.deleteJimuMapTool('Locate')
      jimuMapView.addJimuMapTool({
        name: 'Locate',
        element: this.locateElement
      })
    }

    // check if scale changed
    if (this.locateElement) {
      const scale = getFinalScale(this.props.locateOptions, this.props.jimuMapView?.view)

      if (this.locateElement.scale !== scale) {
        this.locateElement.scale = scale
      }
    }
  }

  onLocateArcgisSuccess = (evt: ArcgisLocateCustomEvent<{position: GeolocationPosition;}>) => {
    const coords = evt?.detail?.position?.coords

    if (coords) {
      const { longitude, latitude } = coords
      const point: IPoint = {
        x: longitude,
        y: latitude,
        spatialReference: { wkid: 4326 }
      }
      const message = new LocationChangeMessage(this.props.mapWidgetId, point)
      MessageManager.getInstance().publishMessage(message)
    }
  }

  destroyLocateElement () {
    if (this.locateElement) {
      if (this.overrideStyleHandle) {
        this.overrideStyleHandle.remove()
        this.overrideStyleHandle = null
      }

      this.locateElement.removeEventListener('arcgisSuccess', this.onLocateArcgisSuccess)
      this.locateElement.destroy()
      this.locateElement = null
      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('Locate')
      }
    }
  }

  componentWillUnmount () {
    this.destroyLocateElement()
  }

  render () {
    return <div className='locate-map-tool' ref={this.onRef} />
  }
}

// status flow:
// a. INACTIVE      --> MAP_NORTH_UP --> MAP_ROTATE
// b. LOCATION_ONLY --> MAP_NORTH_UP --> MAP_ROTATE
export enum TrackStatus {
  /**
   * State 0: Inactive mode.
   * The map does not track the user's location.
   */
  INACTIVE = 'INACTIVE',

  /**
   * State 1: "Location-only" mode.
   * The map is static (does not move or rotate).
   * Only the blue location dot moves on the map.
   * The location is NOT guaranteed to be in the center of the viewport.
   * Only call safeGoToLatestLocation() once in app lifecycle for LOCATION_ONLY mode.
   * trackComponent.goToLocationDisabled = true
   * trackComponent.rotationDisabled = true
   */
  LOCATION_ONLY = 'LOCATION_ONLY',

  /**
   * State 2: "Map north up" mode.
   * The map automatically pans (moves) to keep the blue location dot centered in the viewport.
   * Map north always points upwards and doesn't automatically rotate.
   * Only change the zoom scale one when switch to MAP_NORTH_UP & MAP_ROTATE mode once in one status flow.
   * trackComponent.goToLocationDisabled = false
   * trackComponent.rotationDisabled = true
   * Need to override trackComponent.goToOverride to keep map north up and ignore the scale.
   */
  MAP_NORTH_UP = 'MAP_NORTH_UP',

  /**
   * State 3: "Map rotate" mode.
   * This is a combination of centering and automatic rotation.
   * The map automatically pans to keep the location dot centered, AND
   * the map automatically rotates so that the direction of travel is always 'up' (at the top of the viewport).
   * Only change the zoom scale one when switch to MAP_NORTH_UP & MAP_ROTATE mode once in one status flow.
   * trackComponent.goToLocationDisabled = false
   * trackComponent.rotationDisabled = false
   * Need to override trackComponent.goToOverride to ignore the scale.
   */
  MAP_ROTATE = 'MAP_ROTATE'
}

interface TrackInnerState {
  status: TrackStatus
  apiModulesLoaded: boolean
}

interface TrackConfigZoomInfo {
  isConfigZoomUsedForLocationOnly?: boolean // default false
  isConfigZoomUsedForNorthUpOrRotate?: boolean // default false
}

interface MapWidgetTrackInfo {
  [mapWidgetId: string]: TrackConfigZoomInfo
}

const mapWidgetTrackConfigZoomInfo: MapWidgetTrackInfo = {}

function updateTrackWidgetConfigZoomInfo (mapWidgetId: string, info: Partial<TrackConfigZoomInfo>) {
  if (!mapWidgetId || !info) {
    return
  }

  let trackInfo = mapWidgetTrackConfigZoomInfo[mapWidgetId]

  if (!trackInfo) {
    trackInfo = {
      isConfigZoomUsedForLocationOnly: false,
      isConfigZoomUsedForNorthUpOrRotate: false
    }
    mapWidgetTrackConfigZoomInfo[mapWidgetId] = trackInfo
  }

  Object.assign(trackInfo, info)
}

type MapbaseView = (__esri.MapView | __esri.SceneView)
type TrackElementType = HTMLArcgisTrackElement & {
  view: __esri.View,
  exbIsTrackComponentReady: boolean
}

// When change active JimuMapView for a map widget, we need to restore the track status for the new active JimuMapView.
// When map cached/restore, we need to keep the track status for map widget.
const mapWidgetTrackStatus: { [mapWidgetId: string]: TrackStatus } = {}

class TrackInner extends React.PureComponent<LocateInnerProps, TrackInnerState> {
  trackElement: TrackElementType
  container: HTMLElement
  latestLocation: __esri.Point
  Point: typeof __esri.Point
  onDebounceClick: () => void

  constructor (props) {
    super(props)

    this.state = {
      status: TrackStatus.INACTIVE,
      apiModulesLoaded: false
    }

    this.onDebounceClick = lodash.debounce(() => {
      this.handleClick()
    }, 1000, {
      // trigger the click listener for first click immediately
      leading: true,
      trailing: false
    })
  }

  onRef = (ref) => {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!ref) {
      return
    }

    this.container = ref
    this.tryUpdateTrackElement()
  }

  componentDidMount (): void {
    let initialStatus = null

    const mapWidgetId = this.props.jimuMapView?.mapWidgetId

    // If map restored or switch active view, we need to restore the previous track status.
    if (mapWidgetId) {
      initialStatus = mapWidgetTrackStatus[mapWidgetId]
    }

    if (!initialStatus) {
      // track first load in app lifecycle
      const trackConfig = this.getFinalTrackConfig()

      if (trackConfig.locationOnlyStateEnabled) {
        initialStatus = TrackStatus.LOCATION_ONLY
      } else {
        initialStatus = TrackStatus.INACTIVE
      }
    }

    if (!initialStatus) {
      initialStatus = TrackStatus.INACTIVE
    }

    this.switchToTrackStatus(initialStatus)

    this.loadAPIModules()
  }

  async loadAPIModules () {
    if (!this.state.apiModulesLoaded) {
      const modules = await loadArcGISJSAPIModules(['esri/geometry/Point'])
      this.Point = modules[0]

      this.setState({
        apiModulesLoaded: true
      })
    }
  }

  componentDidUpdate (prevProps: Readonly<LocateInnerProps>, prevState: Readonly<TrackInnerState>) {
    this.tryUpdateTrackElement()
    this.handleIfTrackConfigChanged(prevProps)
  }

  componentWillUnmount () {
    this.destroyTrackElement()
  }

  tryUpdateTrackElement () {
    if (!this.container) {
      return
    }

    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null

    // destroy current trackElement when view changed or container changed
    if (this.trackElement) {
      if (this.trackElement.view !== currView || this.trackElement.parentNode !== this.container) {
        this.destroyTrackElement()
      }
    }

    // create new trackElement if this.trackElement is empty and this.container & currView are not empty
    if (!this.trackElement && this.props.mapComponentsLoaded && this.state.apiModulesLoaded && this.Point && this.container && currView) {
      const trackElement = document.createElement('arcgis-track') as TrackElementType
      // https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition#options
      trackElement.geolocationOptions = {
        // A positive long value indicating the maximum age in milliseconds of a possible cached position that is acceptable to return.
        // If set to 0, it means that the device cannot use a cached position and must attempt to retrieve the real current position.
        maximumAge: 0,
        // A positive long value representing the maximum length of time (in milliseconds) the device is allowed to take in order to return a position.
        timeout: 15000,
        enableHighAccuracy: true
      }
      trackElement.view = currView
      trackElement.goToOverride = this.trackGoToOverride
      trackElement.addEventListener('arcgisReady', this.onTrackArcgisReady, false)
      trackElement.addEventListener('arcgisPropertyChange', this.onTrackArcgisPropertyChange, false)
      trackElement.addEventListener('arcgisComplete', this.onTrackArcgisComplete, false)
      this.container.appendChild(trackElement)
      this.trackElement = trackElement

      jimuMapView.deleteJimuMapTool('Track')
      jimuMapView.addJimuMapTool({
        name: 'Track',
        element: trackElement
      })
    }
  }

  handleIfTrackConfigChanged (preProps: LocateInnerProps) {
    if (!preProps) {
      return
    }

    const preTrackConfig = getFinalTrackConfig(preProps.locateOptions?.track)
    const currTrackConfig = this.getFinalTrackConfig()

    if (currTrackConfig.locationOnlyStateEnabled !== preTrackConfig.locationOnlyStateEnabled) {
      // locationOnlyStateEnabled changed
      if (currTrackConfig.locationOnlyStateEnabled) {
        this.switchToLocationOnlyStatus()
      } else {
        this.switchToInactiveStatus()
      }
    }

    if (currTrackConfig.mapNorthUpStateEnabled !== preTrackConfig.mapNorthUpStateEnabled) {
      // mapNorthUpStateEnabled changed
      if (!currTrackConfig.mapNorthUpStateEnabled) {
        if (currTrackConfig.locationOnlyStateEnabled) {
          this.switchToLocationOnlyStatus()
        } else {
          this.switchToInactiveStatus()
        }
      }
    }

    if (currTrackConfig.mapRotateStateEnabled !== preTrackConfig.mapRotateStateEnabled) {
      // mapRotateStateEnabled changed
      if (!currTrackConfig.mapRotateStateEnabled) {
        if (currTrackConfig.locationOnlyStateEnabled) {
          this.switchToLocationOnlyStatus()
        } else {
          this.switchToInactiveStatus()
        }
      }
    }
  }

  onTrackArcgisReady = (evt: ArcgisTrackCustomEvent<void>) => {
    if (this.trackElement && evt.target === (this.trackElement as any)) {
      this.trackElement.exbIsTrackComponentReady = true
      this.updateTrackElementByStatus()

      // make sure render() can get the latest state
      this.forceUpdate()
    }
  }

  onTrackArcgisPropertyChange = (evt: ArcgisTrackCustomEvent<{ name: 'state'; }>) => {
    const name = evt?.detail?.name

    if (name === 'state') {
      // state value: "disabled" | "error" | "feature-unsupported" | "ready" | "tracking" | "waiting"
      // disabled: not ready
      // error: no permission

      // track component state flow
      // 1. initial:  state=disabled, tracking=false, grey
      // 2. loaded: state=ready, tracking=false, show A icon
      // 3. first click: state=waiting, tracking=true, show loading icon
      //    a. get permission, state=tracking, tracking=true, show stop icon
      //    b. wait permission timeout, state=tracking, tracking=true, show stop icon
      //    c. permission denied, state=error, tracking=false, show A icon
      //    d. location changed, state=waiting, tracking=true, show loading icon
      // 4. click stop icon: state=ready, tracking=false, show A icon

      // make sure render() can get the latest state
      this.forceUpdate()
    }
  }

  onTrackArcgisComplete = (evt: ArcgisTrackCustomEvent<{position: GeolocationPosition;}>) => {
    const coords = evt?.detail?.position?.coords

    if (coords) {
      const { longitude, latitude } = coords

      if (this.Point) {
        this.latestLocation = new this.Point({
          longitude: longitude,
          latitude: latitude,
          spatialReference: { wkid: 4326 }
        })
      }

      const point: IPoint = {
        x: longitude,
        y: latitude,
        spatialReference: { wkid: 4326 }
      }

      const message = new LocationChangeMessage(this.props.mapWidgetId, point)
      MessageManager.getInstance().publishMessage(message)
    }

    if (this.state.status === TrackStatus.LOCATION_ONLY) {
      const rotation = 0
      this.safeGoToLatestLocation(rotation)
    }
  }

  shouldUseConfigScaleForCurrentStatus (): boolean {
    const mapWidgetId = this.props.mapWidgetId
    const trackInfo = mapWidgetTrackConfigZoomInfo[mapWidgetId] || {}
    const status = this.state.status

    if (status === TrackStatus.INACTIVE) {
      return false
    } else if (status === TrackStatus.LOCATION_ONLY) {
      return !trackInfo.isConfigZoomUsedForLocationOnly
    } else if (status === TrackStatus.MAP_NORTH_UP || status === TrackStatus.MAP_ROTATE) {
      return !trackInfo.isConfigZoomUsedForNorthUpOrRotate
    }

    return false
  }

  updateTrackWidgetConfigZoomInfo (info: Partial<TrackConfigZoomInfo>) {
    const mapWidgetId = this.props.mapWidgetId

    if (mapWidgetId) {
      updateTrackWidgetConfigZoomInfo(mapWidgetId, info)
    }
  }

  updateUseConfigScaleForCurrentStatus (used: boolean) {
    const status = this.state.status

    if (status === TrackStatus.LOCATION_ONLY) {
      this.updateTrackWidgetConfigZoomInfo({
        isConfigZoomUsedForLocationOnly: used
      })
    } else if (status === TrackStatus.MAP_NORTH_UP || status === TrackStatus.MAP_ROTATE) {
      this.updateTrackWidgetConfigZoomInfo({
        isConfigZoomUsedForNorthUpOrRotate: used
      })
    }
  }

  async safeGoToLatestLocation (rotation?: number): Promise<void> {
    try {
      const jimuMapView = this.props.jimuMapView
      const view = jimuMapView?.view as MapbaseView

      if (jimuMapView && view && !view.destroyed && !jimuMapView.isCached() && this.latestLocation) {
        const target: any = {
          center: this.latestLocation
        }

        const useConfigScale = this.shouldUseConfigScaleForCurrentStatus()

        if (useConfigScale) {
          target.scale = this.getFinalScale()
          this.updateUseConfigScaleForCurrentStatus(true)
        }

        if (typeof rotation === 'number') {
          target.rotation = rotation
        }

        await view.goTo(target)
      }
    } catch (e) {
      console.error('track safeGoToLatestLocation error:', e)
    }
  }

  trackGoToOverride: __esri.GoToOverride = (view: __esri.MapView | __esri.SceneView, goToParameters: __esri.GoToParameters): Promise<void> => {
    const target: any = goToParameters.target
    const options = goToParameters.options || {}
    const status = this.state.status

    if (status === TrackStatus.MAP_NORTH_UP) {
      // keep map north up, ignore scale
      target.rotation = 0
    }

    // by default, we should not change scale again because user may change scale by pinch or zoom in/out
    delete target.scale

    if (status === TrackStatus.MAP_NORTH_UP || status === TrackStatus.MAP_ROTATE) {
      if (this.shouldUseConfigScaleForCurrentStatus()) {
        // first trigger goToOverride, need to set scale from config
        const scale = this.getFinalScale()
        target.scale = scale
        this.updateUseConfigScaleForCurrentStatus(true)
      }
    }

    // default behavior
    return view.goTo(target, options)
  }

  getFinalTrackConfig (): IMTrackConfig {
    const result = getFinalTrackConfig(this.props.locateOptions?.track)
    return result
  }

  getFinalScale (): number {
    const scale = getFinalScale(this.props.locateOptions, this.props.jimuMapView?.view)
    return scale
  }

  destroyTrackElement () {
    if (this.trackElement) {
      this.trackElement.removeEventListener('arcgisReady', this.onTrackArcgisReady, false)
      this.trackElement.removeEventListener('arcgisPropertyChange', this.onTrackArcgisPropertyChange, false)
      this.trackElement.removeEventListener('arcgisComplete', this.onTrackArcgisComplete, false)
      this.trackElement.destroy()
      this.trackElement = null

      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('Track')
      }
    }
  }

  switchToTrackStatus (trackStatus: TrackStatus) {
    if (trackStatus === TrackStatus.INACTIVE) {
      this.switchToInactiveStatus()
    } else if (trackStatus === TrackStatus.LOCATION_ONLY) {
      this.switchToLocationOnlyStatus()
    } else if (trackStatus === TrackStatus.MAP_NORTH_UP) {
      this.switchToMapNorthUpStatus()
    } else if (trackStatus === TrackStatus.MAP_ROTATE) {
      this.switchToMapRotateStatus()
    }
  }

  switchToInactiveStatus () {
    this.setTrackStatus(TrackStatus.INACTIVE, () => {
      // Only change the zoom scale one when switch to MAP_NORTH_UP & MAP_ROTATE mode once in one status flow.
      // Now we create a new status flow, so we need to reset the zoom info.
      this.updateTrackWidgetConfigZoomInfo({
        isConfigZoomUsedForNorthUpOrRotate: false
      })
    })
  }

  switchToLocationOnlyStatus () {
    this.setTrackStatus(TrackStatus.LOCATION_ONLY, () => {
      // Only change the zoom scale one when switch to MAP_NORTH_UP & MAP_ROTATE mode once in one status flow.
      // Now we create a new status flow, so we need to reset the zoom info.
      this.updateTrackWidgetConfigZoomInfo({
        isConfigZoomUsedForNorthUpOrRotate: false
      })
    })
  }

  switchToMapNorthUpStatus () {
    // When switch track status from LOCATION_ONLY to MAP_NORTH_UP, track component doesn't move the map to center automatically,
    // it only moves the location symbol to center when location changes. We want to move the map to center immediately,
    // so we need to call safeGoToLatestLocation() here.
    this.setTrackStatus(TrackStatus.MAP_NORTH_UP, async () => {
      const rotation = 0
      await this.safeGoToLatestLocation(rotation)
    })
  }

  switchToMapRotateStatus () {
    this.setTrackStatus(TrackStatus.MAP_ROTATE, async () => {
      const rotation = undefined
      await this.safeGoToLatestLocation(rotation)
    })
  }

  // don't call setTrackStatus directly, call switchToXXXState instead
  setTrackStatus (status: TrackStatus, fn?: () => void | Promise<void>) {
    const mapWidgetId = this.props.jimuMapView?.mapWidgetId

    if (mapWidgetId) {
      mapWidgetTrackStatus[mapWidgetId] = status
    }

    this.setState({
      status: status
    }, async () => {
      if (fn) {
        const result = fn()

        if (typeof (result as any)?.then === 'function') {
          await result
        }
      }

      this.updateTrackElementByStatus()
    })
  }

  updateTrackElementByStatus () {
    if (this.trackElement && this.trackElement.exbIsTrackComponentReady) {
      const status = this.state.status

      // inactive by default
      let goToLocationDisabled = true
      let rotationDisabled = true
      let start = false

      if (status === TrackStatus.INACTIVE) {
        goToLocationDisabled = true
        rotationDisabled = true
        start = false
      } else if (status === TrackStatus.LOCATION_ONLY) {
        goToLocationDisabled = true
        rotationDisabled = true
        start = true
      } else if (status === TrackStatus.MAP_NORTH_UP) {
        goToLocationDisabled = false
        rotationDisabled = true
        start = true
      } else if (status === TrackStatus.MAP_ROTATE) {
        goToLocationDisabled = false
        rotationDisabled = false
        start = true
      }

      this.trackElement.goToLocationDisabled = goToLocationDisabled
      this.trackElement.rotationDisabled = rotationDisabled

      if (start) {
        // we need to check this.trackElement.tracking here to avoid multiple calls of start()
        if (!this.trackElement.tracking && typeof this.trackElement.start === 'function') {
          this.trackElement.start?.()
        }
      } else {
        if (typeof this.trackElement.stop === 'function') {
          this.trackElement.stop?.()
        }
      }
    }
  }

  onKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      this.onDebounceClick()

      if (this.container) {
        focusElementInKeyboardMode(this.container)
      }
    }
  }

  handleClick = () => {
    // status flow:
    // a. INACTIVE      --> MAP_NORTH_UP --> MAP_ROTATE
    // b. LOCATION_ONLY --> MAP_NORTH_UP --> MAP_ROTATE
    const trackStatus = this.state.status

    if (trackStatus === TrackStatus.INACTIVE) {
      this.handleClickForInactiveStatus()
    } else if (trackStatus === TrackStatus.LOCATION_ONLY) {
      this.handleClickForLocationOnlyStatus()
    } else if (trackStatus === TrackStatus.MAP_NORTH_UP) {
      this.handleClickForCenterOnlyStatus()
    } else if (trackStatus === TrackStatus.MAP_ROTATE) {
      this.handleClickForCenterAndRotateStatus()
    }
  }

  handleClickForInactiveStatus () {
    const trackConfig = this.getFinalTrackConfig()

    if (trackConfig.mapNorthUpStateEnabled) {
      // LOCATION_ONLY --> MAP_NORTH_UP
      this.switchToMapNorthUpStatus()
    } else if (trackConfig.mapRotateStateEnabled) {
      // LOCATION_ONLY --> MAP_ROTATE
      this.switchToMapRotateStatus()
    }
  }

  handleClickForLocationOnlyStatus () {
    const trackConfig = this.getFinalTrackConfig()

    if (trackConfig.mapNorthUpStateEnabled) {
      // LOCATION_ONLY --> MAP_NORTH_UP
      this.switchToMapNorthUpStatus()
    } else if (trackConfig.mapRotateStateEnabled) {
      // LOCATION_ONLY --> MAP_ROTATE
      this.switchToMapRotateStatus()
    }
  }

  handleClickForCenterOnlyStatus () {
    const trackConfig = this.getFinalTrackConfig()

    if (trackConfig.mapRotateStateEnabled) {
      // MAP_NORTH_UP --> MAP_ROTATE
      this.switchToMapRotateStatus()
    } else {
      if (trackConfig.locationOnlyStateEnabled) {
        // MAP_NORTH_UP --> LOCATION_ONLY
        this.switchToLocationOnlyStatus()
      } else {
        // MAP_NORTH_UP --> INACTIVE
        this.switchToInactiveStatus()
      }
    }
  }

  handleClickForCenterAndRotateStatus () {
    const trackConfig = this.getFinalTrackConfig()

    if (trackConfig.locationOnlyStateEnabled) {
      // MAP_ROTATE --> LOCATION_ONLY
      this.switchToLocationOnlyStatus()
    } else {
      // MAP_ROTATE --> INACTIVE
      this.switchToInactiveStatus()
    }
  }

  getStyle () {
    return css`
      .locate-map-tool {
        position: relative;
        width: 32px;
        height: 32px;
        cursor: pointer;
        overflow: hidden;
      }

      .overlap-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }

      arcgis-track {
        visibility: hidden;
        outline: none;
      }
    `
  }

  renderOverlapBtn () {
    const status = this.state.status
    let iconType: 'Inactive' | 'Loading' | 'LocationOnly' | 'MapNorthUp' | 'MapRotate' = 'Inactive'

    if (this.trackElement && this.trackElement.exbIsTrackComponentReady) {
      if (this.trackElement.state === 'waiting' && status !== TrackStatus.MAP_NORTH_UP && status !== TrackStatus.MAP_ROTATE) {
        iconType = 'Loading'
      } else if (this.trackElement.tracking) {
        if (status === TrackStatus.LOCATION_ONLY) {
          iconType = 'LocationOnly'
        } else if (status === TrackStatus.MAP_NORTH_UP) {
          iconType = 'MapNorthUp'
        } else if (status === TrackStatus.MAP_ROTATE) {
          iconType = 'MapRotate'
        }
      }
    } else {
      // show A with disabled state
      iconType = 'Inactive'
    }

    if (!iconType) {
      iconType = 'Inactive'
    }

    const overlapBtn = (
      <div className='overlap-btn'>
        {
          iconType === 'Inactive' && (
            <SVG
              src={locationOnlyIcon}
              size={14}
              color='var(--sys-color-action-text)'
            />
          )
        }
        {
          iconType === 'Loading' && (
            <Loading
              type={LoadingType.Donut}
              height={14}
              width={14}
            />
          )
        }
        {
          iconType === 'LocationOnly' && (
            <SVG
              src={locationOnlyIcon}
              size={14}
              color='var(--sys-color-action-text)'
            />
          )
        }
        {
          iconType === 'MapNorthUp' && (
            <SVG
              src={northUpIcon}
              size={14}
              color='var(--sys-color-action-text)'
            />
          )
        }
        {
          iconType === 'MapRotate' && (
            <SVG
              src={mapRotateIcon}
              size={14}
              color='var(--sys-color-action-text)'
            />
          )
        }
      </div>
    )

    return overlapBtn
  }

  formatMessage (strId: string) {
    let result = ''

    if (this.props.intl) {
      result = this.props.intl.formatMessage({ id: strId, defaultMessage: mapDefaultMessages[strId] })
    }

    if (!result) {
      result = ''
    }

    return result
  }

  render () {
    const overlapBtn = this.renderOverlapBtn()
    let titleStrKey = ''

    if (this.state.status === TrackStatus.MAP_NORTH_UP) {
      titleStrKey = 'trackLocationNorthUp'
    } else if (this.state.status === TrackStatus.MAP_ROTATE) {
      titleStrKey = 'trackLocationRotate'
    }

    if (this.trackElement && this.trackElement.state === 'error') {
      titleStrKey = 'noPermissionTip'
    }

    if (!titleStrKey) {
      titleStrKey = 'trackLocation'
    }

    const title = this.formatMessage(titleStrKey) || ''

    return (
      <div
        className='locate-map-tool esri-widget--button-like'
        ref={this.onRef}
        css={this.getStyle()}
        role='button'
        tabIndex={0}
        title={title}
        onClick={this.onDebounceClick}
        onKeyDown={this.onKeyDown}
      >
        {overlapBtn}
      </div>
    )
  }
}

function getFinalTrackConfig (trackConfig: IMTrackConfig): IMTrackConfig {
  let result = trackConfig

  if (!result) {
    result = getDefaultNotEmptyIMTrackConfig()
  }

  if (!result.mapNorthUpStateEnabled && !result.mapRotateStateEnabled) {
    result = result.set('mapNorthUpStateEnabled', true)
  }

  return result
}

function getFinalScale (locateOptions: IMLocateOptions, view: __esri.MapView | __esri.SceneView): number {
  let scale = locateOptions?.scale

  const isValidScale = typeof scale === 'number' && scale > 0

  if (!isValidScale) {
    scale = getAutomaticScale(view)
  }

  if (view?.type === '2d') {
    const constraints = view?.constraints

    if (constraints) {
      // we need to make sure maxScale <= scale <= minScale
      const minScale = constraints?.effectiveMinScale
      const maxScale = constraints?.effectiveMaxScale

      if (typeof minScale === 'number' && minScale > 0 && scale > minScale) {
        scale = minScale
      }

      if (typeof maxScale === 'number' && maxScale > 0 && scale < maxScale) {
        scale = maxScale
      }
    }
  }

  return scale
}

function getAutomaticScale (view: __esri.MapView | __esri.SceneView): number {
  const scale = view?.type === '3d' ? 2500 : 4514
  return scale
}