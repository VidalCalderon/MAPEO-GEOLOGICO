/** @jsx jsx */
import { React, jsx, css, Immutable, ClauseLogic, type IMSqlExpression, type DataSource, dataSourceUtils, DataSourceComponent, ReactDOM, DataActionManager, DataLevel, type DataRecordSet } from 'jimu-core'
import { TextInput, Slider, Button, Dropdown, DropdownButton, DropdownMenu, DropdownItem, Switch, Popper } from 'jimu-ui'
import { SqlExpressionBuilder } from 'jimu-ui/advanced/sql-expression-builder'

import { DataSourceManager, getAppStore } from 'jimu-core'

interface LayerListProps {
  allViews: { [viewId: string]: any };
  allMapDataSources: any[];
  activeViewId?: string;
  widgetId?: string;
  mapWidgetId?: string;
}

const emptyExpr = Immutable({
  sql: '',
  displaySQL: '',
  logicalOperator: ClauseLogic.And,
  parts: []
}) as unknown as IMSqlExpression;

export const CustomLayerList = (props: LayerListProps) => {
  const { allViews, allMapDataSources, activeViewId, widgetId, mapWidgetId } = props;
  const widgetRef = React.useRef<HTMLDivElement>(null);
  const [layers, setLayers] = React.useState<any[]>([]);
  // Usaremos el dataSourceId en vez del viewId para identificar el tab activo, 
  // ya que no todos los maps tendrán view al inicio.
  const [activeTabId, setActiveTabId] = React.useState<string>('');
  const [searchText, setSearchText] = React.useState('');
  const [expanded, setExpanded] = React.useState<{ [id: string]: boolean }>({});
  
  // State for different panels
  const [showOpacity, setShowOpacity] = React.useState<{ [id: string]: boolean }>({});
  
  // State for the floating filter panel
  const [filterLayer, setFilterLayer] = React.useState<any>(null);
  const [filterDataSource, setFilterDataSource] = React.useState<DataSource>(null);
  const [filterExpression, setFilterExpression] = React.useState<IMSqlExpression>(emptyExpr);
  const [filterEnabled, setFilterEnabled] = React.useState<boolean>(false);
  const [savedExpressions, setSavedExpressions] = React.useState<{ [layerId: string]: IMSqlExpression }>({});
  const [schemaVersion, setSchemaVersion] = React.useState<number>(0);
  const [sortMode, setSortMode] = React.useState<'alpha' | 'map'>('map');

  React.useEffect(() => {
    // Al cargar o cambiar activeViewId, sincronizar el tab seleccionado.
    if (activeViewId && allViews[activeViewId]) {
      setActiveTabId(allViews[activeViewId].dataSourceId);
    } else if (allMapDataSources && allMapDataSources.length > 0 && !activeTabId) {
      const globalActiveDsId = (window as any)._currentActiveMapDsId;
      if (globalActiveDsId) {
        setActiveTabId(globalActiveDsId);
      } else {
        setActiveTabId(allMapDataSources[0].dataSourceId);
      }
    }
  }, [allViews, activeViewId, allMapDataSources]);

  // Cambia al mapa deseado instantáneamente usando la función global que agregamos en mapav2.
  const switchToView = (targetDsId: string) => {
    if ((window as any)._mapav2_switchToMap) {
      (window as any)._mapav2_switchToMap(targetDsId);
    }
  };

  // Encontrar el JimuMapView activo para extraer sus capas
  const activeJimuView = Object.values(allViews).find(jmv => jmv.dataSourceId === activeTabId);
  const activeView = activeJimuView?.view;

  // Emitir evento global del mapa activo para que otros widgets (como controladorv6) puedan filtrarse
  React.useEffect(() => {
    if (activeTabId) {
      let title = activeTabId;
      try {
        const ds = DataSourceManager.getInstance().getDataSource(activeTabId);
        const appConfigDs = getAppStore().getState().appConfig.dataSources[activeTabId];
        if (ds) {
          title = ds.getLabel();
        } else if (appConfigDs) {
          title = appConfigDs.label || appConfigDs.sourceLabel || appConfigDs.name || activeTabId;
        }
      } catch (e) {}

      // Emitimos un CustomEvent con el ID y el Nombre del mapa activo
      ;(window as any)._currentActiveMapName = title;
      ;(window as any)._currentActiveMapDsId = activeTabId;
      window.dispatchEvent(new CustomEvent('mapav2_activeMapChanged', { 
        detail: { dsId: activeTabId, mapName: title } 
      }));
    }
  }, [activeTabId]);

  // Ordena un array de capas alfabéticamente por título (A → Z, case-insensitive)
  const sortAlpha = (arr: any[]): any[] =>
    [...arr].sort((a, b) => {
      const titleA = (a.title || a.id || '').toLowerCase();
      const titleB = (b.title || b.id || '').toLowerCase();
      return titleA.localeCompare(titleB, 'es', { sensitivity: 'base' });
    });

  const getParentCollection = React.useCallback((layer: any) => {
    if (layer.parent && layer.parent.layers && layer.parent.layers.indexOf(layer) !== -1) {
      return layer.parent.layers;
    } else if (activeView?.map?.layers && activeView.map.layers.indexOf(layer) !== -1) {
      return activeView.map.layers;
    } else if (activeView?.map?.tables && activeView.map.tables.indexOf(layer) !== -1) {
      return activeView.map.tables;
    }
    return null;
  }, [activeView]);

  const isTopLayer = React.useCallback((layer: any) => {
    const parentCollection = getParentCollection(layer);
    if (!parentCollection) return true;
    return parentCollection.indexOf(layer) === parentCollection.length - 1;
  }, [getParentCollection]);

  const isBottomLayer = React.useCallback((layer: any) => {
    const parentCollection = getParentCollection(layer);
    if (!parentCollection) return true;
    return parentCollection.indexOf(layer) === 0;
  }, [getParentCollection]);

  const updateLayers = React.useCallback(() => {
    if (activeView && activeView.map) {
      const mapLayers = activeView.map.layers.toArray().filter((layer: any) => layer.listMode !== 'hide');
      const mapTables = activeView.map.tables ? activeView.map.tables.toArray().filter((table: any) => table.listMode !== 'hide') : [];
      
      let result = [...mapLayers, ...mapTables];
      if (sortMode === 'alpha') {
        result = sortAlpha(result);
      } else {
        const reversedLayers = [...mapLayers].reverse();
        result = [...reversedLayers, ...mapTables];
      }
      setLayers(result);
    } else {
      setLayers([]);
    }
  }, [activeView, sortMode]);

  const moveLayer = React.useCallback((layer: any, direction: 'up' | 'down') => {
    const parentCollection = getParentCollection(layer);
    if (!parentCollection) return;

    const currentIndex = parentCollection.indexOf(layer);
    if (direction === 'up' && currentIndex < parentCollection.length - 1) {
      parentCollection.reorder(layer, currentIndex + 1);
    } else if (direction === 'down' && currentIndex > 0) {
      parentCollection.reorder(layer, currentIndex - 1);
    }
    updateLayers();
  }, [getParentCollection, updateLayers]);

  const [draggedLayerId, setDraggedLayerId] = React.useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = React.useState<string | null>(null);
  const draggedLayerRef = React.useRef<any>(null);

  const onDragStart = React.useCallback((e: React.DragEvent, layer: any) => {
    if (sortMode !== 'map') {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    draggedLayerRef.current = layer;
    setDraggedLayerId(layer.id);
    e.dataTransfer.effectAllowed = 'move';
  }, [sortMode]);

  const onDragOver = React.useCallback((e: React.DragEvent, targetLayer: any) => {
    if (sortMode !== 'map' || !draggedLayerRef.current) return;
    
    const sourceParent = getParentCollection(draggedLayerRef.current);
    const targetParent = getParentCollection(targetLayer);
    
    if (sourceParent && sourceParent === targetParent && draggedLayerRef.current.id !== targetLayer.id) {
      e.preventDefault(); // Allow drop
      e.stopPropagation();
      if (dragOverLayerId !== targetLayer.id) {
        setDragOverLayerId(targetLayer.id);
      }
    }
  }, [sortMode, dragOverLayerId, getParentCollection]);

  const onDragLeave = React.useCallback((e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverLayerId(null);
  }, []);

  const onDrop = React.useCallback((e: React.DragEvent, targetLayer: any) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceLayer = draggedLayerRef.current;
    if (!sourceLayer) return;

    const parentCollection = getParentCollection(targetLayer);
    const sourceParent = getParentCollection(sourceLayer);

    if (parentCollection && parentCollection === sourceParent && sourceLayer.id !== targetLayer.id) {
      const targetIndex = parentCollection.indexOf(targetLayer);
      parentCollection.reorder(sourceLayer, targetIndex);
      updateLayers();
    }
    
    setDraggedLayerId(null);
    setDragOverLayerId(null);
    draggedLayerRef.current = null;
  }, [getParentCollection, updateLayers]);

  const onDragEnd = React.useCallback(() => {
    setDraggedLayerId(null);
    setDragOverLayerId(null);
    draggedLayerRef.current = null;
  }, []);

  React.useEffect(() => {
    updateLayers();
    if (activeView && activeView.map) {
      const handleLayers = activeView.map.layers.on("change", updateLayers);
      const handleTables = activeView.map.tables ? activeView.map.tables.on("change", updateLayers) : null;
      return () => {
        handleLayers.remove();
        if (handleTables) handleTables.remove();
      }
    }
  }, [activeView, updateLayers]);

  const [, setTick] = React.useState(0);
  const triggerRender = () => setTick(t => t + 1);

  const toggleVisibility = (layer: any) => {
    layer.visible = !layer.visible;
    triggerRender();
  };

  const toggleExpand = (layer: any) => {
    setExpanded(prev => ({ ...prev, [layer.id]: !prev[layer.id] }));
  };

  const zoomToLayer = async (layer: any) => {
    let extentToZoom = layer.fullExtent;
    
    // Si la capa permite consultar su extensión real (útil si hay filtros)
    if (layer.queryExtent) {
      try {
        const result = await layer.queryExtent();
        if (result && result.extent) {
          extentToZoom = result.extent;
        }
      } catch (e) {
        console.warn("No se pudo hacer queryExtent", e);
      }
    }

    if (extentToZoom) {
      // expand(1.2) da un margen del 20% para que no quede pegado a los bordes
      let expandedExtent = extentToZoom;
      if (extentToZoom.expand) {
         expandedExtent = extentToZoom.clone().expand(1.2);
      }
      
      activeView.goTo(expandedExtent).then(() => {
        // Corrección de escala: Si la capa tiene rangos de visibilidad y nos pasamos, corregimos la escala
        const currentScale = activeView.scale;
        let newScale = currentScale;

        // minScale es la escala más lejana (zoom out)
        if (layer.minScale && layer.minScale !== 0 && currentScale > layer.minScale) {
          newScale = layer.minScale - 10; // acercar un poquito más que el límite
        }
        
        // maxScale es la escala más cercana (zoom in)
        if (layer.maxScale && layer.maxScale !== 0 && currentScale < layer.maxScale) {
          newScale = layer.maxScale + 10; // alejar un poquito más que el límite
        }

        if (newScale !== currentScale) {
          activeView.goTo({ scale: newScale });
        }
      });
    } else {
      alert("Esta capa no tiene una extensión definida.");
    }
  };

  const onOpacityChange = (e: any, layer: any) => {
    layer.opacity = parseFloat(e.target.value) / 100;
    triggerRender();
  };

  // --- Advanced Actions ---

  const applyExpressionToLayer = (layer: any, sql: string, ds?: DataSource) => {
    const filterSql = sql || null;
    if (typeof layer.definitionExpression !== 'undefined') {
      layer.definitionExpression = filterSql;
    } else if (layer.type === 'map-image' && layer.sublayers) {
      layer.sublayers.forEach((sublayer: any) => {
        sublayer.definitionExpression = filterSql;
      });
    }

    const targetDs = ds || filterDataSource;
    if (targetDs && typeof targetDs.updateQueryParams === 'function') {
      const queryParams = {
        where: sql || '1=1'
      };
      targetDs.updateQueryParams(queryParams, widgetId || 'lista_capas');
    }
  };

  const openFilterPanel = async (layer: any) => {
    if (!activeJimuView) return;
    
    // Get the JimuLayerView for the layer
    let jimuLayerView = activeJimuView.getJimuLayerViewByAPILayer(layer);
    if (!jimuLayerView) {
      // Fallback: Search by ID or Title in jimuLayerViews (covers tables, sublayers, and dynamic layers)
      const layerId = layer.id;
      jimuLayerView = Object.values(activeJimuView.jimuLayerViews).find((lv: any) => {
        if (!lv) return false;
        if (lv.layer && lv.layer.id === layerId) return true;
        if (lv.id === layerId) return true;
        if (lv.layer && lv.layer.title === layer.title) return true;
        return false;
      });
    }

    if (!jimuLayerView) {
      alert('No se pudo encontrar la vista de la capa.');
      return;
    }

    try {
      // Get or create the DataSource
      let ds = jimuLayerView.getLayerDataSource();
      if (!ds) {
        ds = await jimuLayerView.createLayerDataSource();
      }
      
      if (!ds) {
        alert('No se pudo crear el origen de datos para esta capa.');
        return;
      }

      // If the data source is a set (e.g. MapServiceDataSource for a MapImageLayer),
      // we need to get its first child data source (FeatureLayerDataSource for the sublayer)
      // because SqlExpressionBuilder and DataSourceComponent require a queriable layer data source.
      let targetDs = ds;
      if (ds && typeof ds.isDataSourceSet === 'function' && ds.isDataSourceSet()) {
        try {
          // Force creation and readying of child data sources
          await (ds as any).childDataSourcesReady();
        } catch (readyErr) {
          console.warn('Error waiting for childDataSourcesReady:', readyErr);
        }
        const childDss = ds.getChildDataSources();
        if (childDss && childDss.length > 0) {
          targetDs = childDss[0];
        }
      }

      // Wait until the target data source is fully ready and initialized
      try {
        await targetDs.ready();
      } catch (err) {
        console.warn('Error waiting for target data source to be ready:', err);
      }

      // Resolve the API layer to find fields.
      // If it's a MapImageLayer, use its first sublayer.
      let apiLayer = layer;
      if (apiLayer && apiLayer.type === 'map-image' && apiLayer.sublayers && apiLayer.sublayers.length > 0) {
        apiLayer = apiLayer.sublayers.getItemAt(0);
      }

      if (apiLayer && typeof apiLayer.createFeatureLayer === 'function') {
        try {
          const tempLayer = await apiLayer.createFeatureLayer();
          if (tempLayer) {
            await tempLayer.load();
            apiLayer = tempLayer;
          }
        } catch (e) {
          console.warn('Error creating feature layer from sublayer:', e);
        }
      }

      if (apiLayer && typeof apiLayer.load === 'function' && apiLayer.loadStatus !== 'loaded') {
        try {
          await apiLayer.load();
        } catch (e) {
          console.warn('Error loading apiLayer:', e);
        }
      }

      let fields = apiLayer?.fields;
      if (!fields && jimuLayerView?.layer) {
        let jimuApiLayer = jimuLayerView.layer;
        if (jimuApiLayer && jimuApiLayer.type === 'map-image' && jimuApiLayer.sublayers && jimuApiLayer.sublayers.length > 0) {
          jimuApiLayer = jimuApiLayer.sublayers.getItemAt(0);
        }
        if (jimuApiLayer && typeof jimuApiLayer.createFeatureLayer === 'function') {
          try {
            const tempLayer = await jimuApiLayer.createFeatureLayer();
            if (tempLayer) {
              await tempLayer.load();
              jimuApiLayer = tempLayer;
            }
          } catch (e) {
            console.warn('Error creating feature layer from jimuApiLayer sublayer:', e);
          }
        }
        if (jimuApiLayer && typeof jimuApiLayer.load === 'function' && jimuApiLayer.loadStatus !== 'loaded') {
          try {
            await jimuApiLayer.load();
          } catch (e) {}
        }
        fields = jimuApiLayer?.fields;
      }

      const layerFieldsCount = fields ? fields.length : 0;
      const currentSchema = targetDs.getSchema();
      const schemaFieldsCount = (currentSchema && currentSchema.fields) ? Object.keys(currentSchema.fields).length : 0;

      console.log('=== LISTA CAPAS SCHEMA DEBUG ===');
      console.log('Layer Title:', layer.title || layer.id);
      console.log('Layer Type:', layer.type);
      console.log('Target DataSource ID:', targetDs.id);
      console.log('Target DataSource Type:', targetDs.type);
      console.log('Schema fields count:', schemaFieldsCount);
      console.log('ArcGIS JS API Layer fields count:', layerFieldsCount);

      if (schemaFieldsCount < 2 || schemaFieldsCount < layerFieldsCount) {
        if (fields && Array.isArray(fields)) {
          const fieldsSchema: any = {};
          fields.forEach((field: any) => {
            let esriType = field.type;
            if (esriType && !esriType.startsWith('esriFieldType')) {
              const typeLower = esriType.toLowerCase();
              if (typeLower === 'string') esriType = 'esriFieldTypeString';
              else if (typeLower === 'integer') esriType = 'esriFieldTypeInteger';
              else if (typeLower === 'double') esriType = 'esriFieldTypeDouble';
              else if (typeLower === 'date') esriType = 'esriFieldTypeDate';
              else if (typeLower === 'oid') esriType = 'esriFieldTypeOID';
              else if (typeLower === 'small-integer') esriType = 'esriFieldTypeSmallInteger';
              else if (typeLower === 'single') esriType = 'esriFieldTypeSingle';
              else if (typeLower === 'guid') esriType = 'esriFieldTypeGUID';
              else if (typeLower === 'global-id') esriType = 'esriFieldTypeGlobalID';
              else if (typeLower === 'geometry') esriType = 'esriFieldTypeGeometry';
              else if (typeLower === 'blob') esriType = 'esriFieldTypeBlob';
            }

            let jimuType = 'STRING';
            if (esriType === 'esriFieldTypeDate') {
              jimuType = 'DATE';
            } else if (
              esriType === 'esriFieldTypeDouble' ||
              esriType === 'esriFieldTypeInteger' ||
              esriType === 'esriFieldTypeOID' ||
              esriType === 'esriFieldTypeSingle' ||
              esriType === 'esriFieldTypeSmallInteger'
            ) {
              jimuType = 'NUMBER';
            }

            fieldsSchema[field.name] = {
              jimuName: field.name,
              name: field.name,
              alias: field.alias || field.name,
              type: jimuType,
              esriType: esriType
            };
          });

          let idField = apiLayer?.objectIdField || (jimuLayerView?.layer as any)?.objectIdField;
          if (!idField && fields) {
            const oidField = fields.find((f: any) => f.type === 'esriFieldTypeOID' || f.type === 'oid' || f.type === 'esriFieldTypeGlobalID' || f.type === 'global-id');
            if (oidField) {
              idField = oidField.name;
            }
          }
          if (!idField) {
            idField = 'OBJECTID';
          }

          const newSchema = {
            idField: idField,
            fields: fieldsSchema,
            label: apiLayer?.title || layer.title || targetDs.getLabel()
          };

          try {
            console.log('Setting schema on targetDs with fields:', Object.keys(fieldsSchema));
            targetDs.setSchema(Immutable(newSchema) as any);
            setSchemaVersion(v => v + 1);
          } catch (schemaErr) {
            console.error('Error setting schema on data source:', schemaErr);
          }
        }
      }

      setFilterDataSource(targetDs);
      setFilterLayer(layer);

      // Initialize expression from the layer's current definitionExpression or saved state
      let initialExpr = savedExpressions[layer.id];
      if (!initialExpr) {
        const currentDefExpr = layer.definitionExpression || '';
        if (currentDefExpr) {
          try {
            const parsed = dataSourceUtils.parserSQL(currentDefExpr);
            if (parsed) {
              initialExpr = Immutable(parsed) as unknown as IMSqlExpression;
            }
          } catch (err) {
            console.warn('Error parsing current definition expression', err);
          }
        }
      }

      if (!initialExpr) {
        initialExpr = emptyExpr;
      }

      setFilterExpression(initialExpr);
      // Enable filter switch by default so that filters apply immediately when built
      setFilterEnabled(true);
    } catch (err) {
      console.error('Error opening filter panel', err);
      alert('Error al abrir el panel de filtrado.');
    }
  };

  const onExpressionChange = (expr: IMSqlExpression) => {
    setFilterExpression(expr);
    setSavedExpressions(prev => ({ ...prev, [filterLayer.id]: expr }));
    if (filterEnabled && filterLayer) {
      applyExpressionToLayer(filterLayer, expr.sql);
    }
  };

  const onToggleFilterEnabled = (checked: boolean) => {
    setFilterEnabled(checked);
    if (filterLayer) {
      if (checked) {
        applyExpressionToLayer(filterLayer, filterExpression.sql);
      } else {
        applyExpressionToLayer(filterLayer, '');
      }
    }
  };


  const addToTable = async (layer: any) => {
    if (!activeJimuView) return;
    
    // Get the JimuLayerView for the layer
    let jimuLayerView = activeJimuView.getJimuLayerViewByAPILayer(layer);
    if (!jimuLayerView) {
      const layerId = layer.id;
      jimuLayerView = Object.values(activeJimuView.jimuLayerViews).find((lv: any) => {
        if (!lv) return false;
        if (lv.layer && lv.layer.id === layerId) return true;
        if (lv.id === layerId) return true;
        if (lv.layer && lv.layer.title === layer.title) return true;
        return false;
      });
    }

    if (!jimuLayerView) {
      alert('No se pudo encontrar la vista de la capa.');
      return;
    }

    try {
      let ds = jimuLayerView.getLayerDataSource();
      if (!ds) {
        ds = await jimuLayerView.createLayerDataSource();
      }
      
      if (!ds) {
        alert('No se pudo crear el origen de datos para esta capa.');
        return;
      }

      let targetDs = ds;
      if (ds && typeof ds.isDataSourceSet === 'function' && ds.isDataSourceSet()) {
        try {
          await (ds as any).childDataSourcesReady();
        } catch (readyErr) {
          console.warn('Error waiting for childDataSourcesReady:', readyErr);
        }
        const childDss = ds.getChildDataSources();
        if (childDss && childDss.length > 0) {
          targetDs = childDss[0];
        }
      }

      try {
        await targetDs.ready();
      } catch (err) {
        console.warn('Error waiting for target data source to be ready:', err);
      }

      // Check fields and populate schema if necessary (same as openFilterPanel)
      const schema = targetDs.getSchema();
      if (!schema || !schema.fields || Object.keys(schema.fields).length === 0) {
        let apiLayer = layer;
        if (apiLayer && apiLayer.type === 'map-image' && apiLayer.sublayers && apiLayer.sublayers.length > 0) {
          apiLayer = apiLayer.sublayers.getItemAt(0);
        }

        if (apiLayer && typeof apiLayer.createFeatureLayer === 'function') {
          try {
            const tempLayer = await apiLayer.createFeatureLayer();
            if (tempLayer) {
              await tempLayer.load();
              apiLayer = tempLayer;
            }
          } catch (e) {}
        }

        if (apiLayer && typeof apiLayer.load === 'function' && apiLayer.loadStatus !== 'loaded') {
          try {
            await apiLayer.load();
          } catch (e) {}
        }

        let fields = apiLayer?.fields;
        if (fields && Array.isArray(fields)) {
          const fieldsSchema: any = {};
          fields.forEach((field: any) => {
            let esriType = field.type;
            if (esriType && !esriType.startsWith('esriFieldType')) {
              const typeLower = esriType.toLowerCase();
              if (typeLower === 'string') esriType = 'esriFieldTypeString';
              else if (typeLower === 'integer') esriType = 'esriFieldTypeInteger';
              else if (typeLower === 'double') esriType = 'esriFieldTypeDouble';
              else if (typeLower === 'date') esriType = 'esriFieldTypeDate';
              else if (typeLower === 'oid') esriType = 'esriFieldTypeOID';
            }

            let jimuType = 'STRING';
            if (esriType === 'esriFieldTypeDate') {
              jimuType = 'DATE';
            } else if (
              esriType === 'esriFieldTypeDouble' ||
              esriType === 'esriFieldTypeInteger' ||
              esriType === 'esriFieldTypeOID'
            ) {
              jimuType = 'NUMBER';
            }

            fieldsSchema[field.name] = {
              jimuName: field.name,
              name: field.name,
              alias: field.alias || field.name,
              type: jimuType,
              esriType: esriType
            };
          });

          let idField = apiLayer?.objectIdField || 'OBJECTID';
          const newSchema = {
            idField: idField,
            fields: fieldsSchema,
            label: apiLayer?.title || layer.title || targetDs.getLabel()
          };

          try {
            targetDs.setSchema(Immutable(newSchema) as any);
          } catch (schemaErr) {
            console.error('Error setting schema:', schemaErr);
          }
        }
      }

      const dataSet: DataRecordSet = {
        dataSource: targetDs,
        name: layer.title || layer.id,
        type: 'loaded'
      };

      const actionManager = DataActionManager.getInstance();
      const actions = actionManager.getActions();
      const addToTableAction = actions.find(action => action.name === 'addToTable' || action.id.includes('addToTable'));
      
      if (!addToTableAction) {
        alert('No se encontró el widget Tabla configurado en la aplicación o no soporta agregar capas.');
        return;
      }

      const success = await actionManager.executeDataAction(
        addToTableAction,
        [dataSet],
        DataLevel.DataSource,
        widgetId || 'lista_capas'
      );

      if (!success) {
        alert('No se pudo agregar la capa a la tabla.');
      }
    } catch (err) {
      console.error('Error adding layer to table', err);
      alert('Ocurrió un error al intentar agregar la capa a la tabla.');
    }
  };





  const renderLayer = (layer: any, level: number = 0) => {
    const isGroup = layer.type === 'group';
    const layerTitle = layer.title || layer.id || 'Unnamed Layer';
    
    const matchesSearch = layerTitle.toLowerCase().includes(searchText.toLowerCase());
    
    let hasMatchingChildren = false;
    let childrenToRender = [];
    if (isGroup && layer.layers) {
      let children = layer.layers.toArray().filter((child: any) => child.listMode !== 'hide');
      if (sortMode === 'alpha') {
        children = sortAlpha(children);
      } else {
        children = [...children].reverse();
      }
      childrenToRender = children.map(child => renderLayer(child, level + 1)).filter(c => c !== null);
      if (childrenToRender.length > 0) hasMatchingChildren = true;
    }

    if (searchText && !matchesSearch && !hasMatchingChildren) {
      return null;
    }

    const isExpanded = expanded[layer.id];

    let bgColor = '#f8f9fa';
    if (isGroup && level < 3) {
      // Usar color base #556b2f (rgb(85, 107, 47)) de más oscuro a más transparente
      const opacity = 0.15 - level * 0.055;
      bgColor = `rgba(85, 107, 47, ${opacity})`;
    }

    return (
      <div 
        key={layer.id} 
        className={`layer-item-container ${dragOverLayerId === layer.id ? 'drag-over' : ''} ${draggedLayerId === layer.id ? 'dragging' : ''}`}
        style={{ marginLeft: level === 0 ? 0 : 6, marginBottom: '4px' }}
        onDragOver={(e) => onDragOver(e, layer)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, layer)}
      >
        <div className="layer-item-header d-flex align-items-center justify-content-between p-1 border-bottom" style={{backgroundColor: bgColor, borderRadius: '4px'}}>
          <div className="d-flex align-items-center" style={{ flex: 1, overflow: 'hidden' }}>
            {sortMode === 'map' && (
              <span 
                draggable 
                onDragStart={(e) => onDragStart(e, layer)}
                onDragEnd={onDragEnd}
                style={{
                  cursor: 'grab',
                  marginRight: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: '#999',
                  userSelect: 'none',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  padding: '0 2px'
                }}
                title="Arrastrar para reordenar"
              >
                ⋮⋮
              </span>
            )}
            {isGroup ? (
              <Button 
                size="sm" 
                type="tertiary" 
                icon 
                onClick={() => toggleExpand(layer)} 
                style={{
                  padding: '0',
                  width: '12px',
                  height: '12px',
                  minWidth: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  border: 'none',
                  background: 'transparent'
                }}
              >
                {isExpanded ? '▼' : '▶'}
              </Button>
            ) : (
              <span style={{ width: '12px', display: 'inline-block' }}></span>
            )}
            <input 
              type="checkbox" 
              checked={layer.visible} 
              onChange={() => toggleVisibility(layer)}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            />
            <span className="text-truncate" title={layerTitle} style={{ fontSize: '11px', fontWeight: isGroup ? 'bold' : 'normal' }}>
              {layerTitle}
            </span>
          </div>
          
          <div className="layer-actions d-flex align-items-center">
            {!isGroup && (
              <Button size="sm" type="tertiary" onClick={() => zoomToLayer(layer)} title="Zoom a la capa">
                 🔍
              </Button>
            )}
            
            {(sortMode === 'map' || !isGroup) && (
              <Dropdown>
                <DropdownButton size="sm" type="tertiary" icon title="Opciones">
                  ⋮
                </DropdownButton>
                <DropdownMenu>
                  {!isGroup && (
                    <React.Fragment>
                      <DropdownItem onClick={() => setShowOpacity(prev => ({ ...prev, [layer.id]: !prev[layer.id] }))}>
                        Transparencia
                      </DropdownItem>
                      <DropdownItem onClick={() => openFilterPanel(layer)}>
                        Definir filtro
                      </DropdownItem>
                      <DropdownItem onClick={() => addToTable(layer)}>
                        Agregar a tabla
                      </DropdownItem>
                    </React.Fragment>
                  )}
                  {sortMode === 'map' && (
                    <React.Fragment>
                      {!isGroup && <DropdownItem divider />}
                      <DropdownItem onClick={() => moveLayer(layer, 'up')} disabled={isTopLayer(layer)}>
                        Subir capa
                      </DropdownItem>
                      <DropdownItem onClick={() => moveLayer(layer, 'down')} disabled={isBottomLayer(layer)}>
                        Bajar capa
                      </DropdownItem>
                    </React.Fragment>
                  )}
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>

        {showOpacity[layer.id] && (
          <div className="layer-settings p-2 bg-light border rounded mt-1" style={{ fontSize: '10px' }}>
            <div className="d-flex align-items-center mb-1">
              <span style={{width: '80px'}}>Opacidad:</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={layer.opacity * 100} 
                onChange={(e) => onOpacityChange(e, layer)}
                style={{ flex: 1, marginLeft: '8px' }}
              />
              <span style={{marginLeft: '8px', width: '35px'}}>{Math.round(layer.opacity * 100)}%</span>
            </div>
          </div>
        )}



        {isGroup && isExpanded && (
          <div className="group-children mt-1">
            {childrenToRender}
          </div>
        )}
      </div>
    );
  };

  const widgetStyle = css`
    .layer-list-container {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      overflow-y: auto;
      overflow-x: hidden;
      /* Firefox */
      scrollbar-width: thin;
      scrollbar-color: #a0a0a0 transparent;
    }
    .header-container {
      position: sticky;
      top: 0;
      z-index: 10;
      background: white;
      border-bottom: 1px solid #ccc;
    }
    .search-container {
      padding: 10px;
    }
    .tabs-container {
      border-bottom: 1px solid #eee;
    }
    .layers-container {
      padding: 10px 5px 10px 10px;
    }
    /* Estilizar el scrollbar para WebKit (Chrome, Edge, Safari) */
    .layer-list-container::-webkit-scrollbar {
      width: 8px;
    }
    .layer-list-container::-webkit-scrollbar-track {
      background: transparent;
    }
    .layer-list-container::-webkit-scrollbar-thumb {
      background-color: #a0a0a0; 
      border-radius: 10px; 
      border: 2px solid #ffffff; 
    }
    .layer-list-container::-webkit-scrollbar-thumb:hover {
      background-color: #808080; 
    }
    .layer-item-header:hover {
      background-color: #e9ecef !important;
    }
    .layer-item-container.drag-over {
      border: 1px dashed #8c8c00;
      border-radius: 4px;
      opacity: 0.8;
    }
    .layer-item-container.dragging {
      opacity: 0.4;
    }
  `;

  const panelStyle = css`
    width: 380px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    max-height: 80vh;

    .filter-floating-panel-header {
      height: 40px;
      background: #8c8c00; /* olive green */
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      font-weight: bold;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
    }
    .filter-floating-panel-close {
      cursor: pointer;
      font-size: 20px;
      background: none;
      border: none;
      color: white;
      line-height: 1;
      padding: 0;
    }
    .filter-floating-panel-close:hover {
      color: #ddd;
    }
    .filter-floating-panel-content {
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      overflow: hidden;
      flex: 1;
    }
    .filter-floating-panel-layer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: bold;
      font-size: 13px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      flex-shrink: 0;
    }
  `;

  // Estilos inline para garantizar que el scroll funcione siempre
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'white',
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    background: 'white',
    borderBottom: '1px solid #ccc',
    flexShrink: 0
  };

  const layersContainerStyle: React.CSSProperties = {
    padding: '10px 5px 10px 10px',
    flex: 1,
    minHeight: 0
  };

  return (
    <div ref={widgetRef} css={widgetStyle} className="layer-list-container" style={containerStyle}>
      <div className="header-container" style={headerStyle}>
        {allMapDataSources && allMapDataSources.length > 1 && (
          <div className="tabs-container d-flex p-2" style={{ flexWrap: 'wrap', gap: '5px', borderBottom: '1px solid #eee' }}>
            {allMapDataSources.map(dsConfig => {
              const dsId = dsConfig.dataSourceId;
              let title = dsId;
              
              try {
                // 1. Intentamos obtener la instancia del mapa si ya está cargado en memoria
                const ds = DataSourceManager.getInstance().getDataSource(dsId);
                const appConfigDs = getAppStore().getState().appConfig.dataSources[dsId];

                if (ds) {
                  title = ds.getLabel();
                } else if (appConfigDs) {
                  // 2. Si no está cargado (lazy load), sacamos el nombre de la configuración base
                  title = appConfigDs.label || appConfigDs.sourceLabel || appConfigDs.name || dsId;
                } else {
                  title = dsConfig.label || dsId;
                }
              } catch (e) {}

              return (
                <Button
                  key={dsId}
                  type={activeTabId === dsId ? 'primary' : 'default'}
                  onClick={() => {
                    setActiveTabId(dsId); // actualizar UI inmediatamente
                    switchToView(dsId);   // saltar directamente usando la función expuesta
                  }}
                  size="sm"
                  style={{ 
                    flex: '1 1 auto', // Permite que los botones crezcan o se encojan según el espacio
                    whiteSpace: 'normal', // Permite salto de línea si el nombre es muy largo
                    minWidth: '100px', // Evita que se encojan demasiado
                    wordBreak: 'break-word',
                    padding: '4px 8px'
                  }}
                >
                  {title}
                </Button>
              )
            })}
          </div>
        )}
        <div className="search-container" style={{ padding: '10px' }}>
          <TextInput
            placeholder="Buscar capas..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-100"
          />
        </div>
      </div>
      <div className="layers-container" style={layersContainerStyle}>
        {layers.length === 0 ? (
          <div className="p-3 text-center text-muted">No hay capas en este mapa.</div>
        ) : (
          layers.map(layer => renderLayer(layer))
        )}
      </div>

      {filterLayer && (
        <Popper
          reference={widgetRef}
          placement="right-start"
          open={!!filterLayer}
          toggle={() => setFilterLayer(null)}
          offsetOptions={[0, 15]}
          arrowOptions={false}
          autoFocus={true}
          disablePortal={false}
        >
          <div className="filter-floating-panel" css={panelStyle}>
            <div className="filter-floating-panel-header">
              <span>Definir filtro</span>
              <button className="filter-floating-panel-close" onClick={() => setFilterLayer(null)}>×</button>
            </div>
            <div className="filter-floating-panel-content">
              <div className="filter-floating-panel-layer-row">
                <span className="text-truncate" title={filterLayer.title || filterLayer.id} style={{ maxWidth: '280px' }}>
                  {filterLayer.title || filterLayer.id}
                </span>
                <Switch checked={filterEnabled} onChange={(e, checked) => onToggleFilterEnabled(checked)} />
              </div>
              {filterDataSource && (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <SqlExpressionBuilder
                    key={`${filterDataSource.id}_${schemaVersion}`}
                    dataSource={filterDataSource}
                    expression={filterExpression}
                    onChange={onExpressionChange}
                  />
                </div>
              )}
            </div>
          </div>
        </Popper>
      )}
    </div>
  );
};
