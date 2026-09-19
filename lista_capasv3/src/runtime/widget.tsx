import { React, AllWidgetProps, css, jsx, getAppStore } from 'jimu-core'
import { IMConfig } from '../config'
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'
import { CustomLayerList } from './LayerList'

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const [jimuMapView, setJimuMapView] = React.useState<JimuMapView>(null)
  const [allViews, setAllViews] = React.useState<{[viewId: string]: JimuMapView}>({})

  const activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv)
    }
  }

  const viewsCreateHandler = (views: {[viewId: string]: JimuMapView}) => {
    setAllViews(views)
  }

  const mapWidgetId = props.useMapWidgetIds?.[0]
  const mapWidgetConfig = mapWidgetId ? getAppStore().getState().appConfig.widgets[mapWidgetId] : null
  const allMapDataSources = mapWidgetConfig?.useDataSources || []

  return (
    <div className="widget-lista-capas jimu-widget" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' }}>
      {props.useMapWidgetIds && props.useMapWidgetIds.length > 0 && (
        <JimuMapViewComponent
          useMapWidgetId={props.useMapWidgetIds?.[0]}
          onActiveViewChange={activeViewChangeHandler}
          onViewsCreate={viewsCreateHandler}
          onViewsChange={viewsCreateHandler}
        />
      )}
      
      {!mapWidgetId && (
        <div className="d-flex align-items-center justify-content-center" style={{height: '100%', padding: '15px', textAlign: 'center', backgroundColor: '#fff'}}>
          Por favor, selecciona un mapa en la configuración del widget.
        </div>
      )}

      {mapWidgetId && (
        <CustomLayerList 
          allViews={allViews} 
          allMapDataSources={allMapDataSources}
          activeViewId={jimuMapView?.id} 
          widgetId={props.id} 
          mapWidgetId={mapWidgetId}
        />
      )}
    </div>
  )
}

export default Widget
