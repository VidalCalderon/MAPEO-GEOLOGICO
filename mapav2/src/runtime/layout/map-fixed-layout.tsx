/** @jsx jsx */
import { React, jsx, type AppMode, type IMSizeModeLayoutJson, Immutable } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import { LayoutEntry } from 'jimu-layouts/layout-runtime'

interface LayoutProps {
  jimuMapView?: JimuMapView

  appMode: AppMode
  layouts: { [name: string]: IMSizeModeLayoutJson }
  LayoutEntry?: any
  widgetManifestName: string
  children?: React.ReactNode
}

export default class Layout extends React.PureComponent<LayoutProps, any> {
  constructor (props) {
    super(props)

    this.state = {}
  }

  getMapFixedLayout = () => {
    const layout = this.props.layouts && this.props.layouts.MapFixedLayout

    // #1197, #2960
    if (window.jimuConfig.isInBuilder) {
      const LayoutEntry = this.props.LayoutEntry

      return (
        <LayoutEntry
          layouts={layout || null}
          isInWidget
          className='w-100 h-100 map-fix-layout'
        />
      )
    } else {
      return (
        <LayoutEntry
          layouts={layout ? Immutable(layout) : null}
          className='w-100 h-100 map-fix-layout'
        />
      )
    }
  }

  render () {
    return this.getMapFixedLayout()
  }
}
