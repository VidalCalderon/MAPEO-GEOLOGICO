import { getAppStore, Immutable, appActions } from 'jimu-core'
import { getInitState } from 'jimu-for-test'
import type { Config, IMConfig, CustomLayoutPlacement } from '../../../src/config'
import {
  moveMapToolToCustomLayoutPlacementDropzone,
  removePlaceholder,
  shouldRenderLeftBottomScalebarMapSwitcherGroup,
  updateConfigForCustomLayoutPlacementWhenSwitchMapTools,
  updateConfigForCustomLayoutPlacementWhenSwitchToCustomLayout,
  updateConfigToMakeSureCustomLayoutValid
} from '../../../src/runtime/builder/custom-layout-utils'
import ToolModulesConfig from '../../../src/runtime/layout/tool-modules-config'

/**
 * Minimal immutable-like config object:
 * - set(key, value) returns a new config object
 * - supports .customLayoutPlacement?.asMutable({deep:true}) calls
 */
function makeConfig (overrides: Partial<any> = {}): IMConfig {
  const config: Config = {
    isUseCustomMapState: false,
    sceneQualityMode: null,
    layoutIndex: 0,
    preLayoutIndex: 0,
    toolConfig: {},
    customLayoutPlacement: null,
    ...overrides
  }

  return Immutable(config)
}

// Helper: set runtime appConfig into real store state via dispatch (no getState mocking).
function setRuntimeAppConfig (appConfig: any, inBuilder = false) {
  ;(window as any).jimuConfig = { isBuilder: inBuilder }

  const defaultAppConfig = Immutable(appConfig)

  const store = getAppStore()
  const baseState = getInitState().set('appConfig', defaultAppConfig)

  const nextState = inBuilder
    // In builder, getRuntimeAppConfig reads appStateInBuilder.appConfig
    ? baseState.set('appStateInBuilder', (baseState as any).appStateInBuilder?.set('appConfig', defaultAppConfig) ?? Immutable({ appConfig: defaultAppConfig }))
    : baseState

  store.dispatch(appActions.updateStoreState(nextState))
}

function makePlacement (partial: Partial<any> = {}): CustomLayoutPlacement {
  const placement: CustomLayoutPlacement = {
    leftTop: {
      isCornerHorizontal: false,
      cornerGroupChildren: [],
      horizontalGroupChildren: [],
      verticalGroupChildren: []
    },
    rightTop: {
      isCornerHorizontal: false,
      cornerGroupChildren: [],
      horizontalGroupChildren: [],
      verticalGroupChildren: []
    },
    rightBottom: {
      isCornerHorizontal: false,
      cornerGroupChildren: [],
      horizontalGroupChildren: [],
      verticalGroupChildren: []
    },
    leftBottom: {
      isCornerHorizontal: false,
      cornerGroupChildren: [],
      horizontalGroupChildren: [],
      verticalGroupChildren: []
    },
    ...partial
  }

  return placement
}

describe('custom-layout-utils', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    ;(window as any).jimuConfig = undefined

    // Provide a minimal appConfig by default
    setRuntimeAppConfig({ dataSources: {} }, false)
  })

  describe('updateConfigForCustomLayoutPlacementWhenSwitchToCustomLayout', () => {
    it('should return original when config is null', () => {
      const next = updateConfigForCustomLayoutPlacementWhenSwitchToCustomLayout(null, [] as any)
      expect(next).toBeNull()
    })

    it('custom layout placement should be empty if no tools turns on in builtin layout', () => {
      const cfg = makeConfig({ layoutIndex: 0, toolConfig: {} })
      const next = updateConfigForCustomLayoutPlacementWhenSwitchToCustomLayout(cfg, [] as any)
      expect(next.customLayoutPlacement).toEqual({
        // left top
        leftTop: {
          isCornerHorizontal: false,
          cornerGroupChildren: [],
          horizontalGroupChildren: [],
          verticalGroupChildren: [],
        },

        // right top
        rightTop: {
          isCornerHorizontal: false,
          cornerGroupChildren: [],
          horizontalGroupChildren: [],
          verticalGroupChildren: [],
        },

        // right bottom
        rightBottom: {
          isCornerHorizontal: true,
          cornerGroupChildren: ['ClearActionData'],
          horizontalGroupChildren: [],
          verticalGroupChildren: [],
        },

        // left bottom
        leftBottom: {
          isCornerHorizontal: false,
          cornerGroupChildren: [],
          horizontalGroupChildren: [],
          verticalGroupChildren: []
        }
      })
    })

    it('should initialize customLayoutPlacement from builtin layoutIndex 0 and make it valid', () => {
      const cfg = makeConfig({
        layoutIndex: 0,
        toolConfig: { canZoom: true, canHome: true }
      })

      const next = updateConfigForCustomLayoutPlacementWhenSwitchToCustomLayout(cfg, [] as any)

      expect(next.customLayoutPlacement).toBeTruthy()
      expect(next.customLayoutPlacement.leftTop.cornerGroupChildren).toContain('Zoom')

      const allChildren = []
      Object.keys(next.customLayoutPlacement).forEach((k) => {
        const p = (next.customLayoutPlacement as any)[k]
        if (p?.cornerGroupChildren) allChildren.push(...p.cornerGroupChildren)
        if (p?.horizontalGroupChildren) allChildren.push(...p.horizontalGroupChildren)
        if (p?.verticalGroupChildren) allChildren.push(...p.verticalGroupChildren)
      })

      expect(allChildren).toEqual(expect.arrayContaining(['Zoom', 'Home']))
    })

    it('should fallback to builtin layout 0 when layoutIndex is invalid', () => {
      const cfg = makeConfig({ layoutIndex: 999, toolConfig: { canZoom: true } })
      const next = updateConfigForCustomLayoutPlacementWhenSwitchToCustomLayout(cfg, [] as any)
      expect(next.customLayoutPlacement.leftTop.cornerGroupChildren).toContain('Zoom')
    })

    it('should treat missing layoutIndex as 0', () => {
      const cfg = makeConfig({ layoutIndex: undefined, toolConfig: { canZoom: true } })
      const next = updateConfigForCustomLayoutPlacementWhenSwitchToCustomLayout(cfg, [] as any)
      expect(next.customLayoutPlacement.leftTop.cornerGroupChildren).toContain('Zoom')
    })
  })

  describe('updateConfigForCustomLayoutPlacementWhenSwitchMapTools', () => {
    it('should return original when affectedTools is empty', () => {
      const cfg = makeConfig()
      const next = updateConfigForCustomLayoutPlacementWhenSwitchMapTools(cfg, [] as any, [], true)
      expect(next).toBe(cfg)
    })

    it('should auto-include SelectState when Select is affected', () => {
      const placement = makePlacement()

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        preLayoutIndex: 0,
        customLayoutPlacement: placement,
        toolConfig: { canSelect: true, canSelectState: true }
      })

      const next = updateConfigForCustomLayoutPlacementWhenSwitchMapTools(cfg, [] as any, ['Select'], true)

      expect(next.customLayoutPlacement.leftTop.cornerGroupChildren).toContain('Select')
      expect(next.customLayoutPlacement.rightBottom.cornerGroupChildren).toContain('SelectState')
    })

    it('should add enabled tools into placement based on preLayoutIndex', () => {
      const placement = makePlacement({
        leftTop: {
          isCornerHorizontal: false,
          cornerGroupChildren: ['Zoom'],
          horizontalGroupChildren: [],
          verticalGroupChildren: []
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        preLayoutIndex: 0,
        customLayoutPlacement: placement,
        toolConfig: { canZoom: true, canHome: true }
      })

      const next = updateConfigForCustomLayoutPlacementWhenSwitchMapTools(cfg, [] as any, ['Home'], true)
      expect(next.customLayoutPlacement.leftTop.verticalGroupChildren).toContain('Home')
    })

    it('should remove disabled need-setting tools after validity pass (enabled=false)', () => {
      const placement = makePlacement({
        leftTop: {
          isCornerHorizontal: false,
          cornerGroupChildren: ['Zoom'],
          horizontalGroupChildren: ['Select'],
          verticalGroupChildren: ['Home']
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        preLayoutIndex: 0,
        customLayoutPlacement: placement,
        toolConfig: { canZoom: true } // only Zoom enabled
      })

      const next = updateConfigForCustomLayoutPlacementWhenSwitchMapTools(cfg, [] as any, ['Home', 'Select'], false)

      expect(next.customLayoutPlacement.leftTop.cornerGroupChildren).toContain('Zoom')
      expect(next.customLayoutPlacement.leftTop.verticalGroupChildren).not.toContain('Home')
      expect(next.customLayoutPlacement.leftTop.horizontalGroupChildren).not.toContain('Select')
    })

    it('should keep runtime/no-setting tools even if not enabled in toolConfig (based on real ToolModulesConfig)', () => {
      // This assertion depends on real ToolModulesConfig: ClearActionData is runtime tool without setting.
      if (!ToolModulesConfig?.ClearActionData || ToolModulesConfig.ClearActionData.isNeedSetting) {
        // If product changes, keep test stable by exiting with explicit expectation.
        throw new Error('Expected ToolModulesConfig.ClearActionData.isNeedSetting to be false.')
      }

      const placement = makePlacement({
        rightBottom: {
          isCornerHorizontal: true,
          cornerGroupChildren: ['ClearActionData'],
          horizontalGroupChildren: [],
          verticalGroupChildren: []
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: {} // nothing enabled
      })

      const next = updateConfigForCustomLayoutPlacementWhenSwitchMapTools(cfg, [] as any, ['Zoom'], false)
      expect(next.customLayoutPlacement.rightBottom.cornerGroupChildren).toContain('ClearActionData')
    })
  })

  describe('moveMapToolToCustomLayoutPlacementDropzone', () => {
    it('should no-op when config is null', () => {
      const next = moveMapToolToCustomLayoutPlacementDropzone({
        config: null,
        useDataSources: [] as any,
        draggedToolName: 'Zoom',
        oldDropzoneGroupName: 'leftTopCornerGroup',
        draggedToolIndexInOldDropzone: 0,
        newDropzoneGroupName: 'rightTopVerticalGroup',
        draggedToolIndexInNewDropzone: 0
      })
      expect(next).toBeNull()
    })

    it('should no-op when dropzone group name is invalid', () => {
      const placement = makePlacement({
        leftTop: {
          isCornerHorizontal: false,
          cornerGroupChildren: ['Zoom'],
          horizontalGroupChildren: [],
          verticalGroupChildren: []
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canZoom: true }
      })

      const next = moveMapToolToCustomLayoutPlacementDropzone({
        config: cfg,
        useDataSources: [] as any,
        draggedToolName: 'Zoom',
        oldDropzoneGroupName: 'invalidOld',
        draggedToolIndexInOldDropzone: 0,
        newDropzoneGroupName: 'rightTopVerticalGroup',
        draggedToolIndexInNewDropzone: 0
      })

      expect(next).toBe(cfg)
    })

    it('should move tool from one dropzone to another (non-corner insertion)', () => {
      const placement = makePlacement({
        leftTop: {
          isCornerHorizontal: false,
          cornerGroupChildren: ['Zoom'],
          horizontalGroupChildren: ['Select'],
          verticalGroupChildren: []
        },
        rightTop: {
          isCornerHorizontal: false,
          cornerGroupChildren: ['Search'],
          horizontalGroupChildren: [],
          verticalGroupChildren: ['Layers']
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canZoom: true, canSelect: true, canSearch: true, canLayers: true }
      })

      const next = moveMapToolToCustomLayoutPlacementDropzone({
        config: cfg,
        useDataSources: [] as any,
        draggedToolName: 'Select',
        oldDropzoneGroupName: 'leftTopHorizontalGroup',
        draggedToolIndexInOldDropzone: 0,
        newDropzoneGroupName: 'rightTopVerticalGroup',
        draggedToolIndexInNewDropzone: 1
      })

      expect(next.customLayoutPlacement.leftTop.horizontalGroupChildren).not.toContain('Select')
      expect(next.customLayoutPlacement.rightTop.verticalGroupChildren[1]).toBe('Select')
    })

    it('should append tool when draggedToolIndexInNewDropzone is invalid', () => {
      const placement = makePlacement({
        leftTop: { isCornerHorizontal: false, cornerGroupChildren: ['Zoom'], horizontalGroupChildren: ['Select'], verticalGroupChildren: [] },
        rightTop: { isCornerHorizontal: false, cornerGroupChildren: ['Search'], horizontalGroupChildren: [], verticalGroupChildren: [] }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canZoom: true, canSelect: true, canSearch: true }
      })

      const next = moveMapToolToCustomLayoutPlacementDropzone({
        config: cfg,
        useDataSources: [] as any,
        draggedToolName: 'Select',
        oldDropzoneGroupName: 'leftTopHorizontalGroup',
        draggedToolIndexInOldDropzone: 0,
        newDropzoneGroupName: 'rightTopVerticalGroup',
        draggedToolIndexInNewDropzone: -1 // invalid -> append
      })

      expect(next.customLayoutPlacement.rightTop.verticalGroupChildren).toEqual(['Select'])
    })

    it('should handle moving into corner dropzone by pushing existing corner tool to horizontal/vertical', () => {
      const placement = makePlacement({
        rightTop: {
          isCornerHorizontal: false,
          cornerGroupChildren: ['Search'],
          horizontalGroupChildren: [],
          verticalGroupChildren: ['Layers']
        },
        leftTop: {
          isCornerHorizontal: false,
          cornerGroupChildren: ['Zoom'],
          horizontalGroupChildren: ['Select'],
          verticalGroupChildren: []
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canZoom: true, canSelect: true, canSearch: true, canLayers: true }
      })

      const next = moveMapToolToCustomLayoutPlacementDropzone({
        config: cfg,
        useDataSources: [] as any,
        draggedToolName: 'Select',
        oldDropzoneGroupName: 'leftTopHorizontalGroup',
        draggedToolIndexInOldDropzone: 0,
        newDropzoneGroupName: 'rightTopCornerGroup',
        draggedToolIndexInNewDropzone: 0
      })

      expect(next.customLayoutPlacement.rightTop.cornerGroupChildren).toEqual(['Select'])
      expect(next.customLayoutPlacement.rightTop.verticalGroupChildren).toEqual(expect.arrayContaining(['Search', 'Layers']))
    })

    it('should early return when moving the only tool within the same children array', () => {
      const placement = makePlacement({
        leftTop: {
          isCornerHorizontal: false,
          cornerGroupChildren: ['Zoom'],
          horizontalGroupChildren: [],
          verticalGroupChildren: []
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canZoom: true }
      })

      const next = moveMapToolToCustomLayoutPlacementDropzone({
        config: cfg,
        useDataSources: [] as any,
        draggedToolName: 'Zoom',
        oldDropzoneGroupName: 'leftTopCornerGroup',
        draggedToolIndexInOldDropzone: 0,
        newDropzoneGroupName: 'leftTopCornerGroup',
        draggedToolIndexInNewDropzone: 0
      })

      expect(next).toBe(cfg)
    })
  })

  describe('removePlaceholder', () => {
    it('should remove placeholder at the specified index', () => {
      const placement = makePlacement({
        rightBottom: {
          isCornerHorizontal: true,
          cornerGroupChildren: ['SelectState'],
          horizontalGroupChildren: ['Placeholder', 'FullScreen'],
          verticalGroupChildren: []
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canSelectState: true, canFullScreen: true }
      })

      const next = removePlaceholder({
        config: cfg,
        useDataSources: [] as any,
        dropzoneGroupName: 'rightBottomHorizontalGroup',
        placeholderIndexInDropzone: 0
      })

      expect(next.customLayoutPlacement.rightBottom.horizontalGroupChildren).toEqual(['FullScreen'])
    })

    it('should no-op if target is not Placeholder', () => {
      const placement = makePlacement({
        rightBottom: {
          isCornerHorizontal: true,
          cornerGroupChildren: ['SelectState'],
          horizontalGroupChildren: ['FullScreen'],
          verticalGroupChildren: []
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canSelectState: true, canFullScreen: true }
      })

      const next = removePlaceholder({
        config: cfg,
        useDataSources: [] as any,
        dropzoneGroupName: 'rightBottomHorizontalGroup',
        placeholderIndexInDropzone: 0
      })

      expect(next).toBe(cfg)
    })

    it('should no-op if dropzoneGroupName is invalid', () => {
      const placement = makePlacement()
      const cfg = makeConfig({ layoutIndex: 'custom-layout', customLayoutPlacement: placement, toolConfig: {} })

      const next = removePlaceholder({
        config: cfg,
        useDataSources: [] as any,
        dropzoneGroupName: 'invalidGroup',
        placeholderIndexInDropzone: 0
      })

      expect(next).toBe(cfg)
    })
  })

  describe('updateConfigToMakeSureCustomLayoutValid (corner rules + dedupe)', () => {
    it('should return config directly for non-custom layout when customLayoutPlacement is missing', () => {
      const cfg = makeConfig({ layoutIndex: 0, customLayoutPlacement: null })
      const next = updateConfigToMakeSureCustomLayoutValid(cfg, [] as any)
      expect(next).toBe(cfg)
    })

    it('should ensure empty corner gets one tool from preferred direction', () => {
      const placement = makePlacement({
        leftTop: {
          isCornerHorizontal: false, // prefer vertical first
          cornerGroupChildren: [],
          horizontalGroupChildren: ['Select'],
          verticalGroupChildren: ['Home']
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canHome: true, canSelect: true }
      })

      const next = updateConfigToMakeSureCustomLayoutValid(cfg, [] as any)

      expect(next.customLayoutPlacement.leftTop.cornerGroupChildren.length).toBe(1)
      expect(next.customLayoutPlacement.leftTop.cornerGroupChildren[0]).toBe('Home')
      expect(next.customLayoutPlacement.leftTop.verticalGroupChildren).not.toContain('Home')
    })

    it('should reduce corner children to one and push extras to correct group', () => {
      const placement = makePlacement({
        rightBottom: {
          isCornerHorizontal: true, // extras go to horizontal
          cornerGroupChildren: ['SelectState', 'Zoom', 'Home'],
          horizontalGroupChildren: ['FullScreen'],
          verticalGroupChildren: []
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canSelectState: true, canZoom: true, canHome: true, canFullScreen: true }
      })

      const next = updateConfigToMakeSureCustomLayoutValid(cfg, [] as any)

      expect(next.customLayoutPlacement.rightBottom.cornerGroupChildren).toEqual(['SelectState'])
      expect(next.customLayoutPlacement.rightBottom.horizontalGroupChildren).toEqual(
        expect.arrayContaining(['Zoom', 'Home', 'FullScreen'])
      )
    })

    it('should remove duplicates for non-multiple tools but allow multiple tools that supportMultiple in single children', () => {
      // This test uses real ToolModulesConfig; if Placeholder no longer supports multiple, fail with a clear message.
      if (!ToolModulesConfig?.Placeholder?.supportMultiple) {
        throw new Error('Expected ToolModulesConfig.Placeholder.supportMultiple to be true.')
      }

      const placement = makePlacement({
        leftTop: {
          isCornerHorizontal: false,
          // duplicate Zoom should be removed; Placeholder duplicates should remain only if it supports multiple
          cornerGroupChildren: ['Zoom', 'Zoom'],
          horizontalGroupChildren: ['Placeholder', 'Placeholder'],
          verticalGroupChildren: []
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canZoom: true }
      })

      const next = updateConfigToMakeSureCustomLayoutValid(cfg, [] as any)
      expect(next.customLayoutPlacement.leftTop.cornerGroupChildren).toEqual(['Zoom'])
      expect(next.customLayoutPlacement.leftTop.horizontalGroupChildren).toEqual(['Placeholder', 'Placeholder'])
    })

    it('should remove duplicates for non-multiple tools but allow multiple tools that supportMultiple in full custom layout placement', () => {
      // This test uses real ToolModulesConfig; if Placeholder no longer supports multiple, fail with a clear message.
      if (!ToolModulesConfig?.Placeholder?.supportMultiple) {
        throw new Error('Expected ToolModulesConfig.Placeholder.supportMultiple to be true.')
      }

      const placement = makePlacement({
        leftTop: {
          isCornerHorizontal: false,
          cornerGroupChildren: ['Zoom'],
          horizontalGroupChildren: ['Placeholder', 'Placeholder', 'Select'],
          verticalGroupChildren: ['Home']
        },
        rightBottom: {
          isCornerHorizontal: true,
          cornerGroupChildren: ['SelectState'],
          horizontalGroupChildren: ['SelectState'],
          verticalGroupChildren: ['Zoom', 'Placeholder']
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canZoom: true, canHome: true, canSelect: true, canSelectState: true }
      })

      const next = updateConfigToMakeSureCustomLayoutValid(cfg, [] as any)
      expect(next.customLayoutPlacement.leftTop).toEqual({
        isCornerHorizontal: false,
        cornerGroupChildren: ['Zoom'],
        horizontalGroupChildren: ['Placeholder', 'Placeholder', 'Select'],
        verticalGroupChildren: ['Home']
      })
      expect(next.customLayoutPlacement.rightBottom).toEqual({
        isCornerHorizontal: true,
        cornerGroupChildren: ['SelectState'],
        horizontalGroupChildren: [],
        verticalGroupChildren: ['Placeholder']
      })
    })

    it('should keep leftBottom corner empty when map switcher / scalebar group should render (>=2 datasources)', () => {
      const useDataSources = [{ dataSourceId: 'ds1' }, { dataSourceId: 'ds2' }] as any

      const placement = makePlacement({
        leftBottom: {
          isCornerHorizontal: false,
          cornerGroupChildren: ['Zoom'],
          horizontalGroupChildren: [],
          verticalGroupChildren: ['Home']
        }
      })

      const cfg = makeConfig({
        layoutIndex: 'custom-layout',
        customLayoutPlacement: placement,
        toolConfig: { canZoom: true, canHome: true }
      })

      const next = updateConfigToMakeSureCustomLayoutValid(cfg, useDataSources)

      expect(next.customLayoutPlacement.leftBottom.cornerGroupChildren).toEqual([])
      expect(next.customLayoutPlacement.leftBottom.verticalGroupChildren[0]).toBe('Zoom')
    })
  })

  describe('shouldRenderLeftBottomScalebarMapSwitcherGroup', () => {
    it('should return true when >= 2 map data sources', () => {
      const cfg = makeConfig({ toolConfig: { canScaleBar: false } })
      const useDataSources = [{ dataSourceId: 'ds1' }, { dataSourceId: 'ds2' }] as any
      expect(shouldRenderLeftBottomScalebarMapSwitcherGroup(cfg, useDataSources)).toBe(true)
    })

    it('should return false when scalebar is off and only 0/1 datasource', () => {
      const cfg = makeConfig({ toolConfig: { canScaleBar: false } })
      const useDataSources = [{ dataSourceId: 'ds1' }] as any
      expect(shouldRenderLeftBottomScalebarMapSwitcherGroup(cfg, useDataSources)).toBe(false)
    })

    it('should return false when scalebar is on but datasource is WEBSCENE (scalebar not supported)', () => {
      setRuntimeAppConfig({ dataSources: { ds1: { type: 'WEBSCENE' } } }, false)

      const cfg = makeConfig({ toolConfig: { canScaleBar: true } })
      const useDataSources = [{ dataSourceId: 'ds1' }] as any
      expect(shouldRenderLeftBottomScalebarMapSwitcherGroup(cfg, useDataSources)).toBe(false)
    })

    it('should return true when scalebar is on and datasource is WEBMAP', () => {
      setRuntimeAppConfig({ dataSources: { ds1: { type: 'WEBMAP' } } }, false)

      const cfg = makeConfig({ toolConfig: { canScaleBar: true } })
      const useDataSources = [{ dataSourceId: 'ds1' }] as any
      expect(shouldRenderLeftBottomScalebarMapSwitcherGroup(cfg, useDataSources)).toBe(true)
    })

    it('should read appConfig from appStateInBuilder when window.jimuConfig.isBuilder is true', () => {
      setRuntimeAppConfig({ dataSources: { ds1: { type: 'WEBSCENE' } } }, true)

      const cfg = makeConfig({ toolConfig: { canScaleBar: true } })
      const useDataSources = [{ dataSourceId: 'ds1' }] as any
      expect(shouldRenderLeftBottomScalebarMapSwitcherGroup(cfg, useDataSources)).toBe(false)
    })
  })

  // Note: leftBottom corner dropzone group name in source mapping is `leftBottomCornerDropzoneGroup` (not `leftBottomCornerGroup`). Keep tests aligned with implementation.
})
