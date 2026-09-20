import React, { useState, useEffect, useRef } from 'react'
import { AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'
import Basemap from '@arcgis/core/Basemap'
import WebTileLayer from '@arcgis/core/layers/WebTileLayer'
import { IMConfig } from '../config'
import './style.css'

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const [mapView, setMapView] = useState<JimuMapView | null>(null)
  const [selectedBasemapId, setSelectedBasemapId] = useState<string>('original')
  const [isRotating, setIsRotating] = useState(false)
  const animationFrameIdRef = useRef<number | null>(null)
  
  // Keep track of the original basemaps for both 2D and 3D views
  const originalBasemapsRef = useRef<{ [key: string]: any }>({
    '2d': null,
    '3d': null
  })

  // Start camera/map rotation loop
  const startRotation = () => {
    if (animationFrameIdRef.current) return

    const rotate = () => {
      if (mapView) {
        const view = mapView.view
        if (!view.navigating) {
          if (view.type === '3d') {
            const sceneView = view as any
            const camera = sceneView.camera.clone()
            camera.heading += 0.15 // smooth, slow rotation speed for 3D
            sceneView.camera = camera
          } else if (view.type === '2d') {
            const mapView2d = view as any
            mapView2d.rotation = (mapView2d.rotation + 0.35) % 360 // smooth, slow rotation speed for 2D
          }
        }
        animationFrameIdRef.current = requestAnimationFrame(rotate)
      }
    }
    animationFrameIdRef.current = requestAnimationFrame(rotate)
  }

  // Stop camera/map rotation loop
  const stopRotation = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }
  }

  const toggleRotation = () => {
    if (isRotating) {
      stopRotation()
      setIsRotating(false)
    } else {
      setIsRotating(true)
    }
  }

  // Handle map auto-rotation effect
  useEffect(() => {
    if (isRotating && mapView) {
      startRotation()
    } else {
      stopRotation()
      setIsRotating(false)
    }

    return () => {
      stopRotation()
    }
  }, [isRotating, mapView])


  // Apply selected Google basemap to the current view
  const applyBasemap = (jimuView: JimuMapView, basemapId: string) => {
    if (!jimuView?.view?.map) return

    if (basemapId === 'original') {
      const viewType = jimuView.view.type
      const originalBasemap = originalBasemapsRef.current[viewType]
      if (originalBasemap) {
        jimuView.view.map.basemap = originalBasemap
      }
      return
    }

    // Map google-earth selection to satellite tiles
    const tileType = basemapId === 'google-earth' ? 'google-hybrid' : basemapId
    const newBasemap = createGoogleBasemap(tileType)
    if (newBasemap) {
      jimuView.view.map.basemap = newBasemap
    }
  }

  // Handle active map view changes
  const handleMapViewChange = (jimuView: JimuMapView) => {
    setMapView(jimuView)
  }

  // Backup original basemap on load or switch
  useEffect(() => {
    if (!mapView?.view?.map) return

    const viewType = mapView.view.type // '2d' or '3d'
    if (!originalBasemapsRef.current[viewType]) {
      originalBasemapsRef.current[viewType] = mapView.view.map.basemap
    }

    // Apply the active selection to the new view
    if (selectedBasemapId !== 'original') {
      applyBasemap(mapView, selectedBasemapId)
    }
  }, [mapView])

  // Create Google WebTileLayer Basemap
  const createGoogleBasemap = (type: string) => {
    let urlTemplate = ''
    let title = ''
    let id = ''

    switch (type) {
      case 'google-roadmap':
        urlTemplate = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        title = 'Google Callejero'
        id = 'google-roadmap'
        break
      case 'google-satellite':
        urlTemplate = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
        title = 'Google Satélite'
        id = 'google-satellite'
        break
      case 'google-hybrid':
        urlTemplate = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        title = 'Google Híbrido'
        id = 'google-hybrid'
        break
      case 'google-terrain':
        urlTemplate = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}' // Terrain with roads and labels
        title = 'Google Terreno'
        id = 'google-terrain'
        break
      default:
        return null
    }

    const layer = new WebTileLayer({
      urlTemplate: urlTemplate,
      subDomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      copyright: 'Google'
    })

    return new Basemap({
      baseLayers: [layer],
      title: title,
      id: id
    })
  }

  // Basemap selection click handler
  const handleSelectBasemap = async (id: string) => {
    if (!mapView) return

    const isTarget3D = id === 'google-earth'
    const isCurrent3D = mapView.view.type === '3d'
    const viewGroup = mapView.jimuMapViewGroup

    setSelectedBasemapId(id)

    // Handle 2D / 3D switching
    if (viewGroup) {
      const has3DView = Object.values(viewGroup.jimuMapViews).some(
        (v: any) => v.view.type === '3d'
      )
      const has2DView = Object.values(viewGroup.jimuMapViews).some(
        (v: any) => v.view.type === '2d'
      )

      if (isTarget3D && !isCurrent3D && has3DView) {
        // Switch map widget to 3D scene mode
        await viewGroup.switchMap()
      } else if (!isTarget3D && isCurrent3D && has2DView) {
        // Switch map widget back to 2D map mode
        await viewGroup.switchMap()
      } else {
        // Standard basemap change without switching view type
        applyBasemap(mapView, id)
      }
    } else {
      // Apply basemap directly if no view group is available
      applyBasemap(mapView, id)
    }
  }

  // Restore the original map basemap
  const handleReset = () => {
    if (!mapView) return
    setSelectedBasemapId('original')
    applyBasemap(mapView, 'original')
  }

  // Check if map widget selection is missing
  if (!props.useMapWidgetIds || props.useMapWidgetIds.length === 0) {
    return (
      <div className="mapa-base-container justify-content-center align-items-center">
        <div className="warning-container">
          <div className="warning-icon">🗺️</div>
          <p className="warning-text">
            Por favor, vincule este widget con un widget de Mapa en el panel de configuración lateral de Experience Builder.
          </p>
        </div>
      </div>
    )
  }

  // Detect availability of 3D view in the map widget group
  const viewGroup = mapView?.jimuMapViewGroup
  const has3DView = viewGroup
    ? Object.values(viewGroup.jimuMapViews).some((v: any) => v.view.type === '3d')
    : false
  
  const currentViewType = mapView?.view?.type || '2d'

  return (
    <div className="mapa-base-container jimu-widget">
      <div className="mapa-base-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h4 className="mapa-base-title" style={{ margin: 0 }}>Mapas Base de Google</h4>
          <p className="mapa-base-subtitle" style={{ margin: '4px 0 0 0' }}>
            Vista activa: <strong style={{ color: 'var(--primary, #0070f3)' }}>{currentViewType.toUpperCase()}</strong>
          </p>
        </div>
        <button 
          className={`rotate-button ${isRotating ? 'active' : ''}`}
          onClick={toggleRotation}
          title={currentViewType === '3d' ? "Auto-rotación de globo 3D" : "Auto-rotación de mapa 2D"}
        >
          <span>{isRotating ? '⏹️' : '🔄'}</span>
          {isRotating ? 'Giro Activo' : 'Auto-rotar'}
        </button>
      </div>

      <div className="basemap-grid">
        {/* Google Callejero */}
        <div 
          className={`basemap-card ${selectedBasemapId === 'google-roadmap' ? 'active' : ''}`}
          onClick={() => handleSelectBasemap('google-roadmap')}
        >
          <div className="basemap-thumbnail thumb-roadmap" />
          {selectedBasemapId === 'google-roadmap' && <span className="card-badge">✓</span>}
          <div className="basemap-info">
            <h5 className="basemap-card-title">Google Callejero</h5>
            <span className="basemap-card-desc">Calles y carreteras</span>
          </div>
        </div>

        {/* Google Satélite */}
        <div 
          className={`basemap-card ${selectedBasemapId === 'google-satellite' ? 'active' : ''}`}
          onClick={() => handleSelectBasemap('google-satellite')}
        >
          <div className="basemap-thumbnail thumb-satellite" />
          {selectedBasemapId === 'google-satellite' && <span className="card-badge">✓</span>}
          <div className="basemap-info">
            <h5 className="basemap-card-title">Google Satélite</h5>
            <span className="basemap-card-desc">Imagen satelital pura</span>
          </div>
        </div>

        {/* Google Híbrido */}
        <div 
          className={`basemap-card ${selectedBasemapId === 'google-hybrid' ? 'active' : ''}`}
          onClick={() => handleSelectBasemap('google-hybrid')}
        >
          <div className="basemap-thumbnail thumb-hybrid" />
          {selectedBasemapId === 'google-hybrid' && <span className="card-badge">✓</span>}
          <div className="basemap-info">
            <h5 className="basemap-card-title">Google Híbrido</h5>
            <span className="basemap-card-desc">Satélite con etiquetas</span>
          </div>
        </div>

        {/* Google Terreno */}
        <div 
          className={`basemap-card ${selectedBasemapId === 'google-terrain' ? 'active' : ''}`}
          onClick={() => handleSelectBasemap('google-terrain')}
        >
          <div className="basemap-thumbnail thumb-terrain" />
          {selectedBasemapId === 'google-terrain' && <span className="card-badge">✓</span>}
          <div className="basemap-info">
            <h5 className="basemap-card-title">Google Terreno</h5>
            <span className="basemap-card-desc">Topografía y relieve</span>
          </div>
        </div>

        {/* Google Earth (Vista 3D) */}
        <div 
          className={`basemap-card ${selectedBasemapId === 'google-earth' ? 'active' : ''}`}
          onClick={() => handleSelectBasemap('google-earth')}
        >
          <div className="basemap-thumbnail thumb-earth" />
          {selectedBasemapId === 'google-earth' && <span className="card-badge">✓</span>}
          <span className="card-badge-3d">3D</span>
          <div className="basemap-info">
            <h5 className="basemap-card-title">Google Earth 3D</h5>
            <span className="basemap-card-desc">Navegación 3D satelital</span>
          </div>
        </div>
      </div>

      {/* Warning if Google Earth selected but no 3D View is configured in the Map Widget */}
      {selectedBasemapId === 'google-earth' && !has3DView && (
        <div className="notice-box mb-3">
          <span className="notice-icon">💡</span>
          <div>
            <strong>Nota de Google Earth:</strong> Para habilitar el efecto de relieve 3D real, asegúrese de agregar una <strong>Vista 3D (SceneView)</strong> en la configuración del widget de Mapa en Experience Builder.
          </div>
        </div>
      )}

      <div className="mapa-base-footer">
        <button 
          className="reset-button"
          disabled={selectedBasemapId === 'original'}
          onClick={handleReset}
          style={{ opacity: selectedBasemapId === 'original' ? 0.6 : 1 }}
        >
          <span>↩️</span> Restablecer Mapa Base Original
        </button>
      </div>

      <JimuMapViewComponent
        useMapWidgetId={props.useMapWidgetIds?.[0]}
        onActiveViewChange={handleMapViewChange}
      />
    </div>
  )
}

export default Widget
