/** @jsx jsx */
import { React, css, jsx } from 'jimu-core'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import type { JimuMapView } from 'jimu-arcgis'
import { defaultMessages } from 'jimu-ui'
import { HorizontalVertical } from '../layout/config'
import { overrideCalciteStyle } from './utils'

export default class Zoom extends BaseTool<BaseToolProps, unknown> {
  toolName = 'Zoom'

  getTitle () {
    return this.props.intl.formatMessage({ id: 'ZoomLabel', defaultMessage: defaultMessages.ZoomLabel })
  }

  getIcon (): IconType {
    return null
  }

  getExpandPanel (): React.JSX.Element {
    return (
      <ZoomInner
        jimuMapView={this.props.jimuMapView}
        mapComponentsLoaded={this.props.mapComponentsLoaded}
        direction={this.props.direction}
      />
    )
  }
}

interface ZoomInnerProps {
  jimuMapView: JimuMapView
  mapComponentsLoaded: boolean
  direction: HorizontalVertical
}

class ZoomInner extends React.PureComponent<ZoomInnerProps, any> {
  zoomElement: HTMLArcgisZoomElement & { view: __esri.View }
  container: HTMLElement
  overrideStyleHandle: __esri.Handle

  constructor (props) {
    super(props)
    this.state = {}
  }

  onRef (ref) {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!ref) {
      return
    }

    this.container = ref
    this.tryUpdateZoomElement()
  }

  componentDidUpdate () {
    this.tryUpdateZoomElement()
  }

  tryUpdateZoomElement () {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!this.container) {
      return
    }

    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null

    // destroy current zoomElement when view changed or container changed
    if (this.zoomElement) {
      if (this.zoomElement.view !== currView || this.zoomElement.parentNode !== this.container) {
        this.destroyZoomElement()
      }
    }

    // create new zoomElement if this.zoomElement is empty and this.container & currView are not empty
    if (!this.zoomElement && this.props.mapComponentsLoaded && this.container && currView) {
      this.zoomElement = document.createElement('arcgis-zoom') as HTMLArcgisZoomElement & { view: __esri.View }
      this.zoomElement.view = currView
      this.overrideStyleHandle = overrideCalciteStyle(this.zoomElement)
      this.container.appendChild(this.zoomElement)

      jimuMapView.deleteJimuMapTool('Zoom')
      jimuMapView.addJimuMapTool({
        name: 'Zoom',
        element: this.zoomElement
      })
    }

    // update this.zoomElement.layout when needed
    const direction = this.props.direction || HorizontalVertical.Vertical

    if (direction && this.zoomElement) {
      if (this.zoomElement.layout !== direction) {
        this.zoomElement.layout = direction
      }
    }
  }

  destroyZoomElement () {
    if (this.zoomElement) {
      if (this.overrideStyleHandle) {
        this.overrideStyleHandle.remove()
        this.overrideStyleHandle = null
      }

      this.zoomElement.destroy()
      this.zoomElement = null
      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('Zoom')
      }
    }
  }

  componentWillUnmount () {
    this.destroyZoomElement()
  }

  getStyle () {
    const direction = this.props.direction || HorizontalVertical.Vertical
    const scale = (direction === HorizontalVertical.Horizontal) ? -1 : 1

    return css`
      arcgis-zoom {
        scale: ${scale};
        box-shadow: none;

        div.arcgis-zoom {
          box-shadow: none;
        }

        calcite-button {
          border: none;
        }
      }
    `
  }

  render () {
    return <div className='zoom-map-tool' css={this.getStyle()} ref={ref => { this.onRef(ref) }} />
  }
}
