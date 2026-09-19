import { lodash, type ImmutableArray, type UseDataSource, type IMAppConfig, getAppStore } from 'jimu-core'
import type {
  IMConfig, CustomLayoutDropzonePlacement, CustomLayoutDropzonePlacementChildrenKey,
  CustomLayoutPlacement, CustomLayoutPlacementGroupKey
} from '../../config'
import ToolModulesConfig from '../layout/tool-modules-config'


interface MapToolCustomLayoutPlacementsForBuiltinLayouts {
  [layoutIndex: number]: CustomLayoutPlacement
}

function getMapToolCustomLayoutPlacementsForBuiltinLayouts (): MapToolCustomLayoutPlacementsForBuiltinLayouts {
  const result: MapToolCustomLayoutPlacementsForBuiltinLayouts = {
    // layout1
    0: {
      // left top
      leftTop: {
        isCornerHorizontal: false,
        cornerGroupChildren: ['Zoom'],
        horizontalGroupChildren: ['Select'],
        verticalGroupChildren: ['Home', 'Navigation', 'ExtentNavigate', 'Locate', 'Compass'],
      },

      // right top
      rightTop: {
        isCornerHorizontal: false,
        cornerGroupChildren: ['Search'],
        horizontalGroupChildren: [],
        verticalGroupChildren: ['Layers', 'BaseMap', 'Measure'],
      },

      // right bottom
      rightBottom: {
        isCornerHorizontal: true,
        cornerGroupChildren: ['SelectState'],
        horizontalGroupChildren: [],
        verticalGroupChildren: ['ClearActionData', 'FullScreen'],
      },

      // left bottom
      leftBottom: {
        isCornerHorizontal: false,
        cornerGroupChildren: [],
        horizontalGroupChildren: [],
        verticalGroupChildren: []
      }
    },

    // layout2
    1: {
      // left top
      leftTop: {
        isCornerHorizontal: true,
        cornerGroupChildren: ['Search'],
        horizontalGroupChildren: ['Layers', 'BaseMap', 'Measure', 'Select'],
        verticalGroupChildren: [],
      },

      // right top
      rightTop: {
        isCornerHorizontal: true,
        cornerGroupChildren: ['ClearActionData'],
        horizontalGroupChildren: ['FullScreen'],
        verticalGroupChildren: [],
      },

      // right bottom
      rightBottom: {
        isCornerHorizontal: true,
        cornerGroupChildren: ['SelectState'],
        horizontalGroupChildren: [],
        verticalGroupChildren: ['Home', 'Zoom', 'Navigation', 'ExtentNavigate', 'Locate', 'Compass'],
      },

      // left bottom
      leftBottom: {
        isCornerHorizontal: false,
        cornerGroupChildren: [],
        horizontalGroupChildren: [],
        verticalGroupChildren: []
      }
    }
  }

  return result
}

/**
 * This function is used to update the config.customLayoutPlacement when switch to custom layout
 * @param config
 * @param useDataSources
 * @returns
 */
export function updateConfigForCustomLayoutPlacementWhenSwitchToCustomLayout (config: IMConfig, useDataSources: ImmutableArray<UseDataSource>): IMConfig {
  const oldLayoutIndex = config?.layoutIndex || 0

  if (!config) {
    return config
  }

  // get the customLayoutPlacement with all tools, including disabled tools
  let customLayoutPlacement: CustomLayoutPlacement = null

  const placementsForBuiltinLayouts = getMapToolCustomLayoutPlacementsForBuiltinLayouts()

  if (typeof oldLayoutIndex === 'number') {
    customLayoutPlacement = placementsForBuiltinLayouts[oldLayoutIndex]
  }

  if (!customLayoutPlacement) {
    customLayoutPlacement = placementsForBuiltinLayouts[0]
  }

  config = config.set('customLayoutPlacement', customLayoutPlacement)

  // make sure the custom layout is valid
  config = updateConfigToMakeSureCustomLayoutValid(config, useDataSources)

  return config
}

/**
 * This function is used to update the config.customLayoutPlacement when switch some map tools on/off
 * @param config
 * @param useDataSources
 * @param affectedTools
 * @param enabled
 * @returns
 */
export function updateConfigForCustomLayoutPlacementWhenSwitchMapTools (
  config: IMConfig,
  useDataSources: ImmutableArray<UseDataSource>,
  affectedTools: string[],
  enabled: boolean
): IMConfig {
  if (affectedTools.includes('Select') && !affectedTools.includes('SelectState')) {
    affectedTools.push('SelectState')
  }

  affectedTools = Array.from(new Set(affectedTools))

  if (!config || affectedTools.length === 0) {
    return config
  }

  if (enabled) {
    // adds the new tools to customLayoutPlacement
    config = updateConfigToEnableMapToolsForCustomLayoutPlacement(config, affectedTools)
  }

  // make sure the custom layout is valid, it will remove the not used map tools from custom layout
  config = updateConfigToMakeSureCustomLayoutValid(config, useDataSources)

  return config
}

export interface MoveMapToolParams {
  config: IMConfig;
  useDataSources: ImmutableArray<UseDataSource>;
  draggedToolName: string;
  oldDropzoneGroupName: string;
  draggedToolIndexInOldDropzone: number;
  newDropzoneGroupName: string;
  draggedToolIndexInNewDropzone: number;
}

/**
 * This function is used to move the map tool from old dropzone to new dropzone in custom layout.
 * @param moveMapToolParams
 * @returns
 */
export function moveMapToolToCustomLayoutPlacementDropzone (moveMapToolParams: MoveMapToolParams): IMConfig {
  const {
    useDataSources,
    draggedToolName,
    oldDropzoneGroupName,
    draggedToolIndexInOldDropzone,
    newDropzoneGroupName,
    draggedToolIndexInNewDropzone
  } = moveMapToolParams

  let config = moveMapToolParams.config

  if (!config) {
    return config
  }

  let customLayoutPlacement = config?.customLayoutPlacement?.asMutable({ deep: true })

  if (!customLayoutPlacement) {
    return config
  }

  customLayoutPlacement = lodash.cloneDeep(customLayoutPlacement)

  // get the target placement
  const oldDropzoneGroupKeyAndChildrenKey = getPlacementGroupKeyAndChildrenKeyByDropzoneGroupName(oldDropzoneGroupName)
  const newDropzoneGroupKeyAndChildrenKey = getPlacementGroupKeyAndChildrenKeyByDropzoneGroupName(newDropzoneGroupName)

  if (!oldDropzoneGroupKeyAndChildrenKey || !newDropzoneGroupKeyAndChildrenKey) {
    return config
  }

  const oldDropzonePlacement = customLayoutPlacement[oldDropzoneGroupKeyAndChildrenKey.placementGroupKey]
  const oldChildren: string[] = oldDropzonePlacement?.[oldDropzoneGroupKeyAndChildrenKey.placementChildrenKey]

  const newDropzonePlacement = customLayoutPlacement[newDropzoneGroupKeyAndChildrenKey.placementGroupKey]
  const newChildren: string[] = newDropzonePlacement?.[newDropzoneGroupKeyAndChildrenKey.placementChildrenKey]

  if (!oldChildren || !newChildren) {
    return config
  }

  if (newChildren === oldChildren && oldChildren.length === 1 && oldChildren[0] === draggedToolName) {
    return config
  }

  const tempTool: string = `temp-tool-${Math.random().toString().slice(2)}`

  // remove the tool from old dropzone and add a temp tool to keep the index not changed
  if (typeof draggedToolIndexInOldDropzone === 'number' && draggedToolIndexInOldDropzone >= 0 && (draggedToolIndexInOldDropzone <= oldChildren.length - 1)) {
    oldChildren.splice(draggedToolIndexInOldDropzone, 1, tempTool)
  }

  if (newDropzoneGroupKeyAndChildrenKey.placementChildrenKey === 'cornerGroupChildren') {
    // new dropzone is corner dropzone
    // if new dropzone is corner dropzone, we should move the existing tool of the corner dropzone to horizontal/vertical dropzone
    const cornerChildren = newDropzonePlacement.cornerGroupChildren

    if (cornerChildren) {
      if (cornerChildren.length > 0) {
        const existingCornerToolNames = cornerChildren.splice(0)

        const modifiedChildren = newDropzonePlacement.isCornerHorizontal ? newDropzonePlacement.horizontalGroupChildren : newDropzonePlacement.verticalGroupChildren

        if (modifiedChildren) {
          modifiedChildren.unshift(...existingCornerToolNames)
        }
      }

      cornerChildren.push(draggedToolName)
    }
  } else {
    // new dropzone is not corner dropzone
    // add the tool to new placement
    if (typeof draggedToolIndexInNewDropzone === 'number' && draggedToolIndexInNewDropzone >= 0) {
      newChildren.splice(draggedToolIndexInNewDropzone, 0, draggedToolName)
    } else {
      // If no insertion point found, append to the end
      newChildren.push(draggedToolName)
    }
  }

  // remove the temp tool from old placement
  traverseMapToolCustomLayoutChildrenKey(customLayoutPlacement, (groupKey, childrenKey, children) => {
    const index = children.indexOf(tempTool)

    if (index >= 0) {
      children.splice(index, 1)
    }
  })

  // set the new customLayoutPlacement to config
  config = config.set('customLayoutPlacement', customLayoutPlacement)

  // make sure the custom layout is valid
  config = updateConfigToMakeSureCustomLayoutValid(config, useDataSources)

  return config
}

export interface RemovePlaceholderParams {
  config: IMConfig;
  useDataSources: ImmutableArray<UseDataSource>;
  dropzoneGroupName: string;
  placeholderIndexInDropzone: number;
}

export function removePlaceholder (params: RemovePlaceholderParams): IMConfig {
  const {
    useDataSources,
    dropzoneGroupName,
    placeholderIndexInDropzone
  } = params

  let config = params.config

  if (!config) {
    return config
  }

  let customLayoutPlacement = config?.customLayoutPlacement?.asMutable({ deep: true })

  if (!customLayoutPlacement) {
    return config
  }

  customLayoutPlacement = lodash.cloneDeep(customLayoutPlacement)

  // get placement info
  const dropzoneGroupKeyAndChildrenKey = getPlacementGroupKeyAndChildrenKeyByDropzoneGroupName(dropzoneGroupName)

  if (!dropzoneGroupKeyAndChildrenKey) {
    return config
  }

  const {
    placementGroupKey,
    placementChildrenKey
  } = dropzoneGroupKeyAndChildrenKey

  const dropzonePlacement = customLayoutPlacement[placementGroupKey]
  const children: string[] = dropzonePlacement?.[placementChildrenKey]

  if (!children) {
    return config
  }

  // remove the placeholder from dropzone children
  if (typeof placeholderIndexInDropzone === 'number' &&
      placeholderIndexInDropzone >= 0 &&
      (placeholderIndexInDropzone <= children.length - 1) &&
      children[placeholderIndexInDropzone] === 'Placeholder'
  ) {
    // remove the placeholder
    children.splice(placeholderIndexInDropzone, 1)
  } else {
    // not found, just return
    return config
  }

  // set the new customLayoutPlacement to config
  config = config.set('customLayoutPlacement', customLayoutPlacement)

  // make sure the custom layout is valid
  config = updateConfigToMakeSureCustomLayoutValid(config, useDataSources)

  return config
}

interface PlacementGroupKeyAndChildrenKey {
  placementGroupKey: CustomLayoutPlacementGroupKey,
  placementChildrenKey: CustomLayoutDropzonePlacementChildrenKey
}

function getPlacementGroupKeyAndChildrenKeyByDropzoneGroupName (dropzoneGroupName: string): PlacementGroupKeyAndChildrenKey {
  const mapping: { [dropzoneGroupName: string]: PlacementGroupKeyAndChildrenKey } = {
    // left top
    leftTopCornerGroup: { placementGroupKey: 'leftTop', placementChildrenKey: 'cornerGroupChildren' },
    leftTopHorizontalGroup: { placementGroupKey: 'leftTop', placementChildrenKey: 'horizontalGroupChildren' },
    leftTopVerticalGroup: { placementGroupKey: 'leftTop', placementChildrenKey: 'verticalGroupChildren' },

    // right top
    rightTopCornerGroup: { placementGroupKey: 'rightTop', placementChildrenKey: 'cornerGroupChildren' },
    rightTopHorizontalGroup: { placementGroupKey: 'rightTop', placementChildrenKey: 'horizontalGroupChildren' },
    rightTopVerticalGroup: { placementGroupKey: 'rightTop', placementChildrenKey: 'verticalGroupChildren' },

    // right bottom
    rightBottomCornerGroup: { placementGroupKey: 'rightBottom', placementChildrenKey: 'cornerGroupChildren' },
    rightBottomHorizontalGroup: { placementGroupKey: 'rightBottom', placementChildrenKey: 'horizontalGroupChildren' },
    rightBottomVerticalGroup: { placementGroupKey: 'rightBottom', placementChildrenKey: 'verticalGroupChildren' },

    // left bottom
    leftBottomCornerDropzoneGroup: { placementGroupKey: 'leftBottom', placementChildrenKey: 'cornerGroupChildren' },
    leftBottomHorizontalGroup: { placementGroupKey: 'leftBottom', placementChildrenKey: 'horizontalGroupChildren' },
    leftBottomVerticalGroup: { placementGroupKey: 'leftBottom', placementChildrenKey: 'verticalGroupChildren' },
  }

  return mapping[dropzoneGroupName]
}

/**
 * This function is used to make sure the custom layout is valid.
 * @param config
 * @param useDataSources
 * @returns
 */
export function updateConfigToMakeSureCustomLayoutValid (config: IMConfig, useDataSources: ImmutableArray<UseDataSource>): IMConfig {
  let customLayoutPlacement = config?.customLayoutPlacement?.asMutable({ deep: true })

  if (!config) {
    return config
  }

  if (config.layoutIndex !== 'custom-layout' && !customLayoutPlacement) {
    // pc layout1 or pc layout2
    return config
  }

  // make sure customLayoutPlacement is not empty
  customLayoutPlacement = makeSureMapToolCustomLayoutPlacementNotEmpty(customLayoutPlacement)
  config = config.set('customLayoutPlacement', customLayoutPlacement)

  // remove the not used tools from config.customLayoutPlacement
  config = updateConfigToRemoveNotUsedMapToolsFromCustomLayoutPlacement(config)
  customLayoutPlacement = config.customLayoutPlacement?.asMutable({ deep: true })

  // remove duplicate tools from customLayoutPlacement
  customLayoutPlacement = removeDuplicateAndInvalidMapToolsFromCustomLayoutPlacement(customLayoutPlacement)
  config = config.set('customLayoutPlacement', customLayoutPlacement)

  // make sure corner dropzone is valid
  const renderMapSwitcherScalebarGroup = shouldRenderLeftBottomScalebarMapSwitcherGroup(config, useDataSources)
  customLayoutPlacement = makeSureCornerDropzoneValid(customLayoutPlacement, renderMapSwitcherScalebarGroup)
  config = config.set('customLayoutPlacement', customLayoutPlacement)

  return config
}


/**
 * This method is called when turn on some map tools.
 * This method just adds the new tools to customLayoutPlacement.
 * It doesn't call updateConfigToMakeSureCustomLayoutValid() inside.
 * @param config
 * @param newTools
 * @returns
 */
function updateConfigToEnableMapToolsForCustomLayoutPlacement (config: IMConfig, newTools: string[]): IMConfig {
  newTools = newTools.slice()
  newTools = Array.from(new Set(newTools))

  if (!config || newTools.length === 0) {
    return config
  }

  let customLayoutPlacement = config?.customLayoutPlacement?.asMutable({ deep: true })

  if (!customLayoutPlacement) {
    return config
  }

  // 1. make sure customLayoutPlacement is not empty
  customLayoutPlacement = makeSureMapToolCustomLayoutPlacementNotEmpty(customLayoutPlacement)

  // 2. add the new tools to customLayoutPlacement
  const preLayoutIndex = config.preLayoutIndex || 0
  newTools.forEach(toolName => {
    const groupKeyAndChildrenKey = getDefaultPlacementKeyOfMapTool(preLayoutIndex, toolName)

    if (groupKeyAndChildrenKey) {
      const { groupKey, isToolHorizontal } = groupKeyAndChildrenKey

      if (groupKey) {
        const dropzonePlacement = customLayoutPlacement[groupKey]

        if (dropzonePlacement) {
          const childrenKey: CustomLayoutDropzonePlacementChildrenKey = isToolHorizontal ? 'horizontalGroupChildren' : 'verticalGroupChildren'
          const children = dropzonePlacement[childrenKey]

          if (children && !children.includes(toolName)) {
            children.push(toolName)
          }
        }
      }
    }
  })

  // 3. set the new customLayoutPlacement to config
  config = config.set('customLayoutPlacement', customLayoutPlacement)

  return config
}


/**
 * This method is called to remove the not used map tools from custom layout placement.
 * This method doesn't call updateConfigToMakeSureCustomLayoutValid() inside.
 * @param config
 * @returns
 */
function updateConfigToRemoveNotUsedMapToolsFromCustomLayoutPlacement (config: IMConfig): IMConfig {
  let customLayoutPlacement = config?.customLayoutPlacement?.asMutable({ deep: true })

  if (!customLayoutPlacement) {
    return config
  }

  // make sure customLayoutPlacement is not empty
  customLayoutPlacement = makeSureMapToolCustomLayoutPlacementNotEmpty(customLayoutPlacement)

  // get the enabled tool names, enabledToolNames should also include the runtime tools (MapSwitch, ClearActionData)
  const enabledToolNames: string[] = []
  const toolConfig = config.toolConfig?.asMutable({ deep: true })

  if (toolConfig) {
    Object.keys(toolConfig).forEach(canToolName => {
      // canToolName: canZoom, canHome
      // toolConfig[canToolName] maybe false, so we need to check it here
      if (canToolName && canToolName.startsWith('can') && toolConfig[canToolName]) {
        // Zoom, Home
        const toolName = canToolName.substring(3)

        if (toolName) {
          enabledToolNames.push(toolName)
        }
      }
    })
  }

  if (enabledToolNames.includes('Select') && !enabledToolNames.includes('SelectState')) {
    enabledToolNames.push('SelectState')
  }

  // remove the disabled tools from customLayoutPlacement
  function filterGroupChildren (groupChildren: string[]) {
    return (groupChildren || []).filter(toolName => {
      const toolInfo = ToolModulesConfig[toolName]

      if (toolInfo) {
        if (toolInfo.renderByToolConfig) {
          // normal tools, like Zoom, Home, Locate
          return enabledToolNames.includes(toolName)
        } else {
          // ClearActionData, MapSwitch, Attribution, Placeholder
          return true
        }
      } else {
        // invalid tool, just skip it
        return false
      }
    })
  }

  customLayoutPlacement = filterGroupChildrenForCustomLayoutPlacement(customLayoutPlacement, filterGroupChildren)

  // set the new customLayoutPlacement to config
  config = config.set('customLayoutPlacement', customLayoutPlacement)

  return config
}

function makeSureMapToolCustomLayoutPlacementNotEmpty (customLayoutPlacement: CustomLayoutPlacement): CustomLayoutPlacement {
  if (!customLayoutPlacement) {
    customLayoutPlacement = {
      leftTop: null,
      rightTop: null,
      rightBottom: null,
      leftBottom: null
    }
  }

  const placementKeys = getMapToolCustomLayoutPlacementKeyList()

  placementKeys.forEach(key => {
    if (!customLayoutPlacement[key]) {
      customLayoutPlacement[key] = {
        isCornerHorizontal: false,
        cornerGroupChildren: [],
        horizontalGroupChildren: [],
        verticalGroupChildren: []
      }
    }

    const dropzonePlacement = customLayoutPlacement[key]

    if (!dropzonePlacement.cornerGroupChildren) {
      dropzonePlacement.cornerGroupChildren = []
    }

    if (!dropzonePlacement.horizontalGroupChildren) {
      dropzonePlacement.horizontalGroupChildren = []
    }

    if (!dropzonePlacement.verticalGroupChildren) {
      dropzonePlacement.verticalGroupChildren = []
    }
  })

  return customLayoutPlacement
}


/**
 * Make sure corner dropzone is valid.
 * 1. Make sure corner dropzone is not empty, if it is empty, move one tool from horizontal or vertical dropzone to corner dropzone.
 * 2. If the corner dropzone has more than one children, move the extra children to horizontal or vertical dropzone.
 * 3. If renderMapSwitcherScalebarGroup is true, move corner dropzone items to horizontal or vertical dropzone.
 * @param customLayoutPlacement
 * @param renderMapSwitcherScalebarGroup Used to indicate whether the leftBottomScalebarMapSwitcherGroup needs to be rendered.
 * @returns
 */
function makeSureCornerDropzoneValid (customLayoutPlacement: CustomLayoutPlacement, renderMapSwitcherScalebarGroup: boolean): CustomLayoutPlacement {
  customLayoutPlacement = makeSureMapToolCustomLayoutPlacementNotEmpty(customLayoutPlacement)

  const groupKeys = getMapToolCustomLayoutPlacementKeyList()

  groupKeys.forEach(groupKey => {
    const dropzonePlacement = customLayoutPlacement[groupKey]
    const {
      isCornerHorizontal,
      cornerGroupChildren,
      horizontalGroupChildren,
      verticalGroupChildren
    } = dropzonePlacement

    const shouldKeepCornerDropzoneEmpty = groupKey === 'leftBottom' && renderMapSwitcherScalebarGroup

    if (shouldKeepCornerDropzoneEmpty) {
      // 3. If renderMapSwitcherScalebarGroup is true, move corner dropzone items to horizontal or vertical dropzone.
      const cornerDropzoneMapTools: string[] = cornerGroupChildren.splice(0)
      const modifiedChildren = isCornerHorizontal ? horizontalGroupChildren : verticalGroupChildren
      modifiedChildren.unshift(...cornerDropzoneMapTools)
    } else {
      if (cornerGroupChildren.length === 0) {
        // 1. Make sure corner dropzone is not empty, if it is empty, move one tool from horizontal or vertical dropzone to corner dropzone.
        let modifiedChildren: string[] = null

        if (isCornerHorizontal) {
          // try to get from horizontal first
          if (horizontalGroupChildren.length > 0) {
            modifiedChildren = horizontalGroupChildren
          } else if (verticalGroupChildren.length > 0) {
            modifiedChildren = verticalGroupChildren
          }
        } else {
          // try to get from vertical first
          if (verticalGroupChildren.length > 0) {
            modifiedChildren = verticalGroupChildren
          } else if (horizontalGroupChildren.length > 0) {
            modifiedChildren = horizontalGroupChildren
          }
        }

        if (modifiedChildren) {
          const toolName = modifiedChildren.shift()
          cornerGroupChildren.push(toolName)
        }
      } else if (cornerGroupChildren.length > 1) {
        // 2. If the corner dropzone has more than one children, move the extra children to horizontal or vertical dropzone.
        const extraMapTools: string[] = cornerGroupChildren.splice(1)
        const modifiedChildren = isCornerHorizontal ? horizontalGroupChildren : verticalGroupChildren
        modifiedChildren.unshift(...extraMapTools)
      }
    }
  })

  return customLayoutPlacement
}

function removeDuplicateAndInvalidMapToolsFromCustomLayoutPlacement (customLayoutPlacement: CustomLayoutPlacement): CustomLayoutPlacement {
  const seen = new Set<string>()

  function filterGroupChildren (groupChildren: string[]) {
    return groupChildren.filter(toolName => {
      const toolModuleInfo = ToolModulesConfig[toolName]

      if (!toolModuleInfo) {
        // invalid tool, just skip it
        return false
      }

      if (toolModuleInfo.supportMultiple) {
        // Placeholder supports multiple instances
        return true
      } else {
        if (seen.has(toolName)) {
          return false
        } else {
          seen.add(toolName)
          return true
        }
      }
    })
  }

  const newPlacement = filterGroupChildrenForCustomLayoutPlacement(customLayoutPlacement, filterGroupChildren)
  return newPlacement
}

function filterGroupChildrenForCustomLayoutPlacement (
  customLayoutPlacement: CustomLayoutPlacement,
  filterGroupChildrenCallback: (groupChildren: string[]) => string[]
): CustomLayoutPlacement {
  const newPlacement = lodash.cloneDeep(customLayoutPlacement)

  traverseMapToolCustomLayoutChildrenKey(newPlacement, (groupKey, childrenKey, children) => {
    newPlacement[groupKey][childrenKey] = filterGroupChildrenCallback(children)
  })

  return newPlacement
}

interface GroupKeyAndChildrenKey {
  groupKey: CustomLayoutPlacementGroupKey,
  childrenKey: CustomLayoutDropzonePlacementChildrenKey,
  isToolHorizontal: boolean
}

function getDefaultPlacementKeyOfMapTool (
  layoutIndex: number | 'custom-layout',
  toolName: string
): GroupKeyAndChildrenKey {
  let result: GroupKeyAndChildrenKey = null
  const placementsForBuiltinLayouts = getMapToolCustomLayoutPlacementsForBuiltinLayouts()
  const layoutPlacement: CustomLayoutPlacement = placementsForBuiltinLayouts[layoutIndex] || placementsForBuiltinLayouts[0]

  traverseMapToolCustomLayoutGroupKey(layoutPlacement, (groupKey, dropzonePlacement) => {
    if (!result && dropzonePlacement) {
      if (dropzonePlacement.cornerGroupChildren?.includes(toolName)) {
        result = {
          groupKey,
          childrenKey: 'cornerGroupChildren',
          isToolHorizontal: dropzonePlacement.isCornerHorizontal
        }
      } else if (dropzonePlacement.horizontalGroupChildren?.includes(toolName)) {
        result = {
          groupKey,
          childrenKey: 'horizontalGroupChildren',
          isToolHorizontal: true
        }
      } else if (dropzonePlacement.verticalGroupChildren?.includes(toolName)) {
        result = {
          groupKey,
          childrenKey: 'verticalGroupChildren',
          isToolHorizontal: false
        }
      }
    }
  })

  return result
}

// function removeMapToolFromCustomLayoutPlacement (customLayoutPlacement: CustomLayoutPlacement, toolName: string): CustomLayoutPlacement {
//   traverseMapToolCustomLayoutChildrenKey(customLayoutPlacement, (groupKey, childrenKey, children) => {
//     const index = children.indexOf(toolName)

//     if (index >= 0) {
//       children.splice(index, 1)
//     }
//   })

//   return customLayoutPlacement
// }

function traverseMapToolCustomLayoutGroupKey (
  customLayoutPlacement: CustomLayoutPlacement,
  traverseCallback: (groupKey: CustomLayoutPlacementGroupKey, dropzonePlacement: CustomLayoutDropzonePlacement) => void
): void {
  const groupKeys = getMapToolCustomLayoutPlacementKeyList()

  groupKeys.forEach(groupKey => {
    const dropzonePlacement = customLayoutPlacement[groupKey]

    if (dropzonePlacement) {
      traverseCallback(groupKey, dropzonePlacement)
    }
  })
}

function traverseMapToolCustomLayoutChildrenKey (
  customLayoutPlacement: CustomLayoutPlacement,
  traverseCallback: (
    groupKey: CustomLayoutPlacementGroupKey,
    childrenKey: CustomLayoutDropzonePlacementChildrenKey,
    children: string[]
  ) => void
): void {
  const groupKeys = getMapToolCustomLayoutPlacementKeyList()

  groupKeys.forEach(groupKey => {
    const dropzonePlacement = customLayoutPlacement[groupKey]

    if (dropzonePlacement) {
      if (dropzonePlacement.cornerGroupChildren) {
        traverseCallback(groupKey, 'cornerGroupChildren', dropzonePlacement.cornerGroupChildren)
      }

      if (dropzonePlacement.horizontalGroupChildren) {
        traverseCallback(groupKey, 'horizontalGroupChildren', dropzonePlacement.horizontalGroupChildren)
      }

      if (dropzonePlacement.verticalGroupChildren) {
        traverseCallback(groupKey, 'verticalGroupChildren', dropzonePlacement.verticalGroupChildren)
      }
    }
  })
}

function getMapToolCustomLayoutPlacementKeyList (): CustomLayoutPlacementGroupKey[] {
  const result: CustomLayoutPlacementGroupKey[] = [
    'leftTop',
    'rightTop',
    'rightBottom',
    'leftBottom',
  ]

  return result
}

export function shouldRenderLeftBottomScalebarMapSwitcherGroup (config: IMConfig, useDataSources: ImmutableArray<UseDataSource>): boolean {
  const mapDataSourceCount = useDataSources?.length || 0

  if (mapDataSourceCount >= 2) {
    // show map switcher
    return true
  } else {
    // no map data source, or only one webmap or one webscene
    // check whether need to show scalebar, scalebar only render for webscene
    const canScaleBar = !!(config?.toolConfig?.canScaleBar)

    if (canScaleBar) {
      let isWebScene = false
      const dataSourceId = useDataSources?.[0]?.dataSourceId
      const appConfig = getRuntimeAppConfig()

      if (appConfig && appConfig?.dataSources && dataSourceId) {
        const dsInfo = appConfig.dataSources[dataSourceId]

        if (dsInfo && dsInfo.type === 'WEBSCENE') {
          isWebScene = true
        }
      }

      // scalebar only supports webmap
      return !isWebScene
    } else {
      // no scalebar
      return false
    }
  }
}

function getRuntimeAppConfig (): IMAppConfig {
  const appState = getAppStore().getState()
  const runtimeAppState = window.jimuConfig?.isBuilder ? appState.appStateInBuilder : appState
  return runtimeAppState?.appConfig
}