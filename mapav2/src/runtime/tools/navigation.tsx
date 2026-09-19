import { React } from 'jimu-core'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import type { JimuMapView } from 'jimu-arcgis'
// import type { ToolShellProps } from '../layout/base/base-tool-shell'
import { HorizontalVertical } from '../layout/config'

import { overrideCalciteStyleWhenArcGISReady } from './utils'

export default class Navigation extends BaseTool<BaseToolProps, unknown> {
  toolName = 'Navigation'

  getTitle () {
    return 'Navigation'
  }

  getIcon (): IconType {
    return null
  }

  getExpandPanel (): React.JSX.Element {
    return (
      <NavigationInner
        jimuMapView={this.props.jimuMapView}
        mapComponentsLoaded={this.props.mapComponentsLoaded}
        isCustomLayoutEditing={this.props.isCustomLayoutEditing}
        direction={this.props.direction}
      />
    )
  }

  /**
   * Navigation only supports scene view, so ScaleBarTool.isAvailable() will return false if the map is map view.
   */
  // static isAvailable (toolShellProps: ToolShellProps): boolean {
  //   if (toolShellProps.isCustomLayoutEditing) {
  //     // always render Navigation in custom layout editing mode
  //     return true
  //   } else {
  //     return toolShellProps.jimuMapView?.view?.type === '3d'
  //   }
  // }
}

interface NavigationInnerProps {
  jimuMapView: JimuMapView
  mapComponentsLoaded: boolean
  isCustomLayoutEditing: boolean
  direction: HorizontalVertical
}

interface NavigationInnerState {
  apiLoaded: boolean
}

class NavigationInner extends React.PureComponent<NavigationInnerProps, NavigationInnerState> {
  navigationToggleElement: HTMLArcgisNavigationToggleElement & { view: __esri.SceneView }
  container: HTMLElement
  overrideStyleHandle: __esri.Handle

  constructor (props) {
    super(props)

    this.state = {
      apiLoaded: false
    }
  }

  onRef (ref) {
    // ref is set to null when switch active view then set to original dom, we need to avoid this special case
    if (!ref) {
      return
    }

    this.container = ref
    this.tryUpdateNavigationToggleElement()
  }

  componentDidUpdate () {
    this.tryUpdateNavigationToggleElement()
  }

  tryUpdateNavigationToggleElement () {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!this.container) {
      return
    }

    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null

    // destroy current navigationToggleElement when view changed or container changed
    if (this.navigationToggleElement) {
      if (this.navigationToggleElement.view !== currView || this.navigationToggleElement.parentNode !== this.container) {
        this.destroyNavigationToggleElement()
      }
    }

    // create new navigationToggleElement if this.navigationToggleElement is empty and this.container & currView are not empty
    // Although `arcgis-navigation-toggle` only supports `SceneView`, we still do not check the view type here,
    // because we need to render it in custom layout editing mode and we already hide it in render() when needed.
    if (!this.navigationToggleElement && this.props.mapComponentsLoaded && this.container && currView) {
      this.navigationToggleElement = document.createElement('arcgis-navigation-toggle') as HTMLArcgisNavigationToggleElement & { view: __esri.SceneView }
      this.navigationToggleElement.view = currView as __esri.SceneView
      this.overrideStyleHandle = overrideCalciteStyle(this.navigationToggleElement)
      this.container.appendChild(this.navigationToggleElement)

      jimuMapView.deleteJimuMapTool('Navigation')
      jimuMapView.addJimuMapTool({
        name: 'Navigation',
        element: this.navigationToggleElement
      })
    }

    // update this.navigationToggleElement layout when needed
    const direction = this.props.direction || HorizontalVertical.Vertical
    if (direction && this.navigationToggleElement) {
      if (this.navigationToggleElement.layout !== direction) {
        this.navigationToggleElement.layout = direction
      }
    }
  }

  destroyNavigationToggleElement () {
    if (this.navigationToggleElement) {
      if (this.overrideStyleHandle) {
        this.overrideStyleHandle.remove()
        this.overrideStyleHandle = null
      }

      this.navigationToggleElement.destroy()
      this.navigationToggleElement = null

      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('Navigation')
      }
    }
  }

  componentWillUnmount () {
    this.destroyNavigationToggleElement()
  }

  render () {
    if (this.props.jimuMapView?.view?.type === '2d' && !this.props.isCustomLayoutEditing) {
      return <div className='navigation-map-tool hidden-map-tool' />
    } else {
      return <div className='navigation-map-tool' ref={ref => { this.onRef(ref) }} />
    }
  }
}

function overrideCalciteStyle (mapToolComponent: HTMLArcgisNavigationToggleElement): __esri.Handle | null {
  function listener () {
    try {
      if (!mapToolComponent.shadowRoot) {
        return
      }

      const calciteActions = Array.from(mapToolComponent.shadowRoot.querySelectorAll('calcite-action'))
      calciteActions.forEach(calciteAction => {
        if (!calciteAction.shadowRoot) {
          return
        }

        const style = document.createElement('style')
        style.innerHTML = `
          button {
            min-block-size: 32px !important;
          }
        `
        calciteAction.shadowRoot.appendChild(style)
      })
    } catch (e) {
      console.error('overrideCalciteStyle error', e)
    }
  }

  return overrideCalciteStyleWhenArcGISReady(mapToolComponent, listener)
}