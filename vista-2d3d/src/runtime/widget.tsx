/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import type { IMConfig } from '../config'

// Import standard Esri modules
import SceneView from 'esri/views/SceneView'
import Ground from 'esri/Ground'
import ElevationLayer from 'esri/layers/ElevationLayer'

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { useMapWidgetIds } = props

  // Map view reference
  const [jimuMapView, setJimuMapView] = React.useState<JimuMapView>(null)
  
  // State to track if 3D overlay is active
  const [is3DActive, setIs3DActive] = React.useState(false)

  // Ref to hold the dynamically created 3D SceneView instance
  const sceneViewRef = React.useRef<SceneView | null>(null)
  // Ref to hold the DOM element container for 3D
  const div3DRef = React.useRef<HTMLDivElement | null>(null)
  // Ref to hold the 2D graphics change event listener handle
  const graphicsHandleRef = React.useRef<any>(null)

  // Handle map view binding
  const activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv)
    } else {
      setJimuMapView(null)
      // Clean up if map is unmounted
      cleanup3D()
    }
  }

  // Clean up the 3D SceneView and restore 2D MapView position safely
  const cleanup3D = () => {
    const sceneView = sceneViewRef.current
    const div3D = div3DRef.current
    const graphicsHandle = graphicsHandleRef.current

    // 1. Remove the graphics listener
    if (graphicsHandle) {
      try {
        graphicsHandle.remove()
      } catch (err) {
        console.error('Error al remover el listener de gráficos:', err)
      }
      graphicsHandleRef.current = null
    }

    if (sceneView) {
      let center3D: any = null
      let scale3D: any = null

      try {
        center3D = sceneView.center
        scale3D = sceneView.scale
      } catch (err) {
        console.error('Error al obtener coordenadas de la cámara 3D:', err)
      }

      try {
        // 2. Detach the map from the 3D SceneView before destroying it.
        // IMPORTANT: If we don't set sceneView.map = null, Esri will recursively destroy
        // the shared Map instance and all its layers/basemap along with the SceneView,
        // leaving the 2D MapView completely blank/white and emptying the layers legend list.
        sceneView.map = null
        
        // 3. Destroy the SceneView
        sceneView.destroy()
      } catch (err) {
        console.error('Error al destruir la vista SceneView:', err)
      }
      
      sceneViewRef.current = null

      // 4. Update 2D MapView position
      if (jimuMapView && jimuMapView.view) {
        try {
          const mapView = jimuMapView.view
          
          // 5. Synchronize coordinates back to 2D MapView (stripping Z coordinate to prevent crash/freeze)
          if (center3D && typeof center3D.x === 'number' && !isNaN(center3D.x) && typeof center3D.y === 'number' && !isNaN(center3D.y)) {
            const center2D = {
              x: center3D.x,
              y: center3D.y,
              spatialReference: center3D.spatialReference
            }

            const goToParams: any = { center: center2D }
            if (typeof scale3D === 'number' && !isNaN(scale3D) && scale3D > 0) {
              goToParams.scale = scale3D
            }

            mapView.goTo(goToParams, { duration: 0 })
          }
        } catch (err) {
          console.error('Error al restaurar vista 2D:', err)
        }
      }
    }

    // 6. Remove the 3D overlay container from DOM
    if (div3D) {
      try {
        if (div3D.parentNode) {
          div3D.parentNode.removeChild(div3D)
        }
      } catch (err) {
        console.error('Error al remover el contenedor DOM de 3D:', err)
      }
      div3DRef.current = null
    }

    setIs3DActive(false)
  }

  // Toggle 2D/3D in-place using absolute DOM overlay
  const handleToggle2D3D = () => {
    if (!jimuMapView || !jimuMapView.view || !jimuMapView.view.map) return

    if (is3DActive) {
      // Switch back to 2D
      cleanup3D()
    } else {
      // Switch to 3D
      try {
        const mapView = jimuMapView.view
        const container = mapView.container
        const parentNode = container?.parentNode

        if (!container || !parentNode) {
          console.error('El contenedor de vista 2D o su nodo padre no son válidos.')
          return
        }

        // 1. Configure DEM (Digital Elevation Model) dynamically using Ground and ElevationLayer on the shared map
        const map = mapView.map
        const hasElevation = map.ground && map.ground.layers && map.ground.layers.length > 0
        if (!hasElevation) {
          map.ground = new Ground({
            layers: [
              new ElevationLayer({
                url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'
              })
            ]
          })
        }

        // 2. Save current 2D center, scale and spatial reference
        const center = mapView.center
        const scale = mapView.scale
        const spatialReference = mapView.spatialReference

        // 3. Compute camera altitude (Z) based on 2D map scale and extent
        let targetZ = 12000
        if (mapView.extent) {
          targetZ = Math.max(2000, mapView.extent.width * 1.4)
        } else if (scale) {
          targetZ = scale * 0.12
        }

        // 4. Create the DOM container for the 3D SceneView
        const div3D = document.createElement('div')
        div3D.style.position = 'absolute'
        div3D.style.top = '0'
        div3D.style.left = '0'
        div3D.style.width = '100%'
        div3D.style.height = '100%'
        div3D.style.zIndex = '5' // Overlay it directly on top of the MapView
        div3D.style.backgroundColor = '#0d1117'

        // Append the 3D container right next to the 2D container (overlaying it)
        parentNode.appendChild(div3D)
        div3DRef.current = div3D

        // 5. Instantiate the SceneView sharing the exact same Map instance directly
        // Sharing the map ensures all layers, services, and basemaps render perfectly in both views.
        const sceneView = new SceneView({
          container: div3D,
          map: map, // Sharing the original map directly!
          camera: {
            position: {
              x: center.x,
              y: center.y,
              z: targetZ,
              spatialReference: spatialReference
            },
            tilt: 0,
            heading: 0
          },
          popupEnabled: true
        })

        // Copy graphics over to the 3D scene
        if (mapView.graphics && mapView.graphics.length > 0) {
          sceneView.graphics.addMany(mapView.graphics.toArray())
        }

        // 6. Sync graphics from 2D to 3D in real-time (so searches while in 3D immediately show highlight)
        graphicsHandleRef.current = mapView.graphics.on('change', () => {
          if (sceneViewRef.current) {
            sceneViewRef.current.graphics.removeAll()
            sceneViewRef.current.graphics.addMany(mapView.graphics.toArray())
          }
        })

        sceneViewRef.current = sceneView
        setIs3DActive(true)
      } catch (err) {
        console.error('Error al iniciar la vista 3D:', err)
        cleanup3D()
      }
    }
  }

  // Cleanup on component unmount
  React.useEffect(() => {
    return () => {
      cleanup3D()
    }
  }, [jimuMapView])

  // Custom styling matching Esri OOTB map widgets for absolute pixel-perfect integration
  const widgetStyle = css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: transparent;

    .btn-toggle-2d3d {
      width: 34px;
      height: 34px;
      padding: 0;
      margin: 0;
      background-color: #ffffff;
      color: #2e2e2e;
      border: 1px solid rgba(0,0,0,0.15);
      border-radius: 2px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.2s ease-in-out;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

      &:hover {
        background-color: #f3f3f3;
        color: #000000;
      }

      &.active-3d {
        background-color: #007ac2;
        color: #ffffff;
        border-color: #005e99;
        box-shadow: 0 0 6px rgba(0, 122, 194, 0.5);
      }
    }
  `

  return (
    <div className="widget-vista-2d3d jimu-widget" style={{ width: '100%', height: '100%', background: 'transparent' }}>
      {useMapWidgetIds && useMapWidgetIds.length > 0 && (
        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds?.[0]}
          onActiveViewChange={activeViewChangeHandler}
        />
      )}

      {jimuMapView && (
        <div css={widgetStyle}>
          <button 
            className={`btn-toggle-2d3d ${is3DActive ? 'active-3d' : ''}`}
            onClick={handleToggle2D3D}
            title={is3DActive ? 'Cambiar a Vista 2D' : 'Cambiar a Vista 3D'}
          >
            {is3DActive ? '3D' : '2D'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Widget
