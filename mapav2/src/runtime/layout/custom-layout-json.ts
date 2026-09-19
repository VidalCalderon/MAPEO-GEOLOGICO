import { Immutable } from 'jimu-core'
import { type LayoutJson, type IMLayoutJson, GroupDirection, HorizontalVertical, type ToolPanelPlacement } from './config'
import type { IMConfig, CustomLayoutPlacement } from '../../config'
import pcLayoutJsons from './pc-layout-json'

const defaultLayoutJson: LayoutJson = {
  elements: {
    // left top
    leftTopGroup: {
      type: 'GROUP',
      groupName: 'leftTopGroup',
      display: 'block',
      direction: null,
      className: 'custom-layout-lt-group',
      style: {
        position: 'absolute',
        left: '15px',
        top: '15px'
      }
    },
    leftTopCornerGroup: {
      type: 'GROUP',
      groupName: 'leftTopCornerGroup',
      direction: null,
      watchSize: true,
      className: 'custom-layout-lt-corner-group custom-layout-map-tool-dropzone custom-layout-corner-group',
      style: {
        position: 'absolute',
        top: '0px',
        left: '0px'
      }
    },
    leftTopHorizontalGroup: {
      type: 'GROUP',
      groupName: 'leftTopHorizontalGroup',
      direction: GroupDirection.LeftTopToRightTop,
      watchSize: true,
      className: 'custom-layout-lt-horizontal-group custom-layout-map-tool-dropzone custom-layout-horizontal-group',
      style: {
        position: 'absolute',
        left: 'var(--leftTopHorizontalGroup-fixedleft, 0px)',
        top: '0px',
        paddingLeft: 'var(--leftTopHorizontalGroup-padding-fixedleft, 0px)'
      }
    },
    leftTopVerticalGroup: {
      type: 'GROUP',
      groupName: 'leftTopVerticalGroup',
      direction: GroupDirection.LeftTopToLeftBottom,
      watchSize: true,
      className: 'custom-layout-lt-vertical-group custom-layout-map-tool-dropzone custom-layout-vertical-group',
      style: {
        position: 'absolute',
        left: '0px',
        top: 'var(--leftTopVerticalGroup-top, 0px)',
        paddingTop: 'var(--leftTopVerticalGroup-padding-top, 0px)'
      }
    },
    leftTopHorizontalBorderLineGroup: {
      type: 'GROUP',
      groupName: 'leftTopHorizontalBorderLineGroup',
      direction: null,
      className: 'custom-layout-lt-horizontal-border-line-group custom-layout-horizontal-border-line-group',
      style: {
        position: 'absolute',
        left: 'var(--leftTopHorizontalBorderLineGroup-fixedleft, 0px)',
        top: 'var(--leftTopHorizontalBorderLineGroup-top, 0px)',
        width: 'var(--leftTopHorizontalBorderLineGroup-width, 0px)',
        height: '0px'
      }
    },
    leftTopVerticalBorderLineGroup: {
      type: 'GROUP',
      groupName: 'leftTopVerticalBorderLineGroup',
      direction: null,
      className: 'custom-layout-lt-vertical-border-line-group custom-layout-vertical-border-line-group',
      style: {
        position: 'absolute',
        left: 'var(--leftTopVerticalBorderLineGroup-fixedleft, 0px)',
        top: 'var(--leftTopVerticalBorderLineGroup-top, 0px)',
        width: '0px',
        height: 'var(--leftTopVerticalBorderLineGroup-height, 0px)'
      }
    },

    // right top
    rightTopGroup: {
      type: 'GROUP',
      groupName: 'rightTopGroup',
      display: 'block',
      direction: null,
      className: 'custom-layout-rt-group',
      style: {
        position: 'absolute',
        right: '15px',
        top: '15px'
      }
    },
    rightTopCornerGroup: {
      type: 'GROUP',
      groupName: 'rightTopCornerGroup',
      direction: null,
      watchSize: true,
      className: 'custom-layout-rt-corner-group custom-layout-map-tool-dropzone custom-layout-corner-group',
      style: {
        position: 'absolute',
        right: '0px',
        top: '0px'
      }
    },
    rightTopHorizontalGroup: {
      type: 'GROUP',
      groupName: 'rightTopHorizontalGroup',
      direction: GroupDirection.RightTopToLeftTop,
      watchSize: true,
      className: 'custom-layout-rt-horizontal-group custom-layout-map-tool-dropzone custom-layout-horizontal-group',
      style: {
        position: 'absolute',
        right: 'var(--rightTopHorizontalGroup-fixedright, 0px)',
        top: '0px',
        paddingRight: 'var(--rightTopHorizontalGroup-padding-fixedright, 0px)'
      }
    },
    rightTopVerticalGroup: {
      type: 'GROUP',
      groupName: 'rightTopVerticalGroup',
      direction: GroupDirection.RightTopToRightBottom,
      watchSize: true,
      className: 'custom-layout-rt-vertical-group custom-layout-map-tool-dropzone custom-layout-vertical-group',
      style: {
        position: 'absolute',
        right: '0px',
        top: 'var(--rightTopVerticalGroup-top, 0px)',
        paddingTop: 'var(--rightTopVerticalGroup-padding-top, 0px)'
      }
    },
    rightTopHorizontalBorderLineGroup: {
      type: 'GROUP',
      groupName: 'rightTopHorizontalBorderLineGroup',
      direction: null,
      className: 'custom-layout-rt-horizontal-border-line-group custom-layout-horizontal-border-line-group',
      style: {
        position: 'absolute',
        right: 'var(--rightTopHorizontalBorderLineGroup-fixedright, 0px)',
        top: 'var(--rightTopHorizontalBorderLineGroup-top, 0px)',
        width: 'var(--rightTopHorizontalBorderLineGroup-width, 0px)',
        height: '0px'
      }
    },
    rightTopVerticalBorderLineGroup: {
      type: 'GROUP',
      groupName: 'rightTopVerticalBorderLineGroup',
      direction: null,
      className: 'custom-layout-rt-vertical-border-line-group custom-layout-vertical-border-line-group',
      style: {
        position: 'absolute',
        right: 'var(--rightTopVerticalBorderLineGroup-fixedright, 0px)',
        top: 'var(--rightTopVerticalBorderLineGroup-top, 0px)',
        width: '0px',
        height: 'var(--rightTopVerticalBorderLineGroup-height, 0px)'
      }
    },

    // right bottom
    rightBottomGroup: {
      type: 'GROUP',
      groupName: 'rightBottomGroup',
      display: 'block',
      direction: GroupDirection.RightBottomToLeftBottom,
      className: 'custom-layout-rb-group',
      style: {
        position: 'absolute',
        right: '15px',
        bottom: '30px'
      }
    },
    rightBottomCornerGroup: {
      type: 'GROUP',
      groupName: 'rightBottomCornerGroup',
      direction: null,
      watchSize: true,
      className: 'custom-layout-rb-corner-group custom-layout-map-tool-dropzone custom-layout-corner-group',
      style: {
        position: 'absolute',
        right: '0px',
        bottom: '0px'
      }
    },
    rightBottomHorizontalGroup: {
      type: 'GROUP',
      groupName: 'rightBottomHorizontalGroup',
      direction: GroupDirection.RightBottomToLeftBottom,
      watchSize: true,
      className: 'custom-layout-rb-horizontal-group custom-layout-map-tool-dropzone custom-layout-horizontal-group',
      style: {
        position: 'absolute',
        right: 'var(--rightBottomHorizontalGroup-fixedright, 0px)',
        bottom: '0px',
        paddingRight: 'var(--rightBottomHorizontalGroup-padding-fixedright, 0px)'
      }
    },
    rightBottomVerticalGroup: {
      type: 'GROUP',
      groupName: 'rightBottomVerticalGroup',
      direction: GroupDirection.RightBottomToRightTop,
      watchSize: true,
      className: 'custom-layout-rb-vertical-group custom-layout-map-tool-dropzone custom-layout-vertical-group',
      style: {
        position: 'absolute',
        right: '0px',
        bottom: 'var(--rightBottomVerticalGroup-bottom, 0px)',
        paddingBottom: 'var(--rightBottomVerticalGroup-padding-bottom, 0px)'
      }
    },
    rightBottomHorizontalBorderLineGroup: {
      type: 'GROUP',
      groupName: 'rightBottomHorizontalBorderLineGroup',
      direction: null,
      className: 'custom-layout-rb-horizontal-border-line-group custom-layout-horizontal-border-line-group',
      style: {
        position: 'absolute',
        right: 'var(--rightBottomHorizontalBorderLineGroup-fixedright, 0px)',
        bottom: 'var(--rightBottomHorizontalBorderLineGroup-bottom, 0px)',
        width: 'var(--rightBottomHorizontalBorderLineGroup-width, 0px)',
        height: '0px'
      }
    },
    rightBottomVerticalBorderLineGroup: {
      type: 'GROUP',
      groupName: 'rightTopVerticalBorderLineGroup',
      direction: null,
      className: 'custom-layout-rb-vertical-border-line-group custom-layout-vertical-border-line-group',
      style: {
        position: 'absolute',
        right: 'var(--rightBottomVerticalBorderLineGroup-fixedright, 0px)',
        bottom: 'var(--rightBottomVerticalBorderLineGroup-bottom, 0px)',
        width: '0px',
        height: 'var(--rightBottomVerticalBorderLineGroup-height, 0px)'
      }
    },

    // left bottom
    leftBottomGroup: {
      type: 'GROUP',
      groupName: 'leftBottomGroup',
      display: 'block',
      direction: GroupDirection.LeftBottomToRightBottom,
      className: 'custom-layout-lb-group',
      style: {
        position: 'absolute',
        left: '15px',
        bottom: '30px'
      }
    },
    leftBottomCornerGroup: {
      type: 'GROUP',
      groupName: 'leftBottomCornerGroup',
      direction: GroupDirection.LeftBottomToLeftTop,
      watchSize: true,
      className: 'custom-layout-lb-corner-group custom-layout-corner-group',
      style: {
        position: 'absolute',
        left: '0px',
        bottom: '0px'
      }
    },
    leftBottomScalebarMapSwitcherGroup: {
      type: 'GROUP',
      groupName: 'leftBottomScalebarMapSwitcherGroup',
      direction: GroupDirection.LeftBottomToLeftTop,
      watchSize: true,
      className: 'custom-layout-lb-scalebar-mapswitcher-group'
    },
    leftBottomCornerDropzoneGroup: {
      type: 'GROUP',
      groupName: 'leftBottomCornerDropzoneGroup',
      direction: null,
      watchSize: true,
      className: 'custom-layout-lb-corner-dropzone-group custom-layout-map-tool-dropzone',
    },
    leftBottomHorizontalGroup: {
      type: 'GROUP',
      groupName: 'leftBottomHorizontalGroup',
      direction: GroupDirection.LeftBottomToRightBottom,
      watchSize: true,
      className: 'custom-layout-lb-horizontal-group custom-layout-map-tool-dropzone custom-layout-horizontal-group',
      style: {
        position: 'absolute',
        left: 'var(--leftBottomHorizontalGroup-fixedleft, 0px)',
        bottom: '0px',
        paddingLeft: 'var(--leftBottomHorizontalGroup-padding-fixedleft, 0px)'
      }
    },
    leftBottomVerticalGroup: {
      type: 'GROUP',
      groupName: 'leftBottomVerticalGroup',
      direction: GroupDirection.LeftBottomToLeftTop,
      watchSize: true,
      className: 'custom-layout-lb-vertical-group custom-layout-map-tool-dropzone custom-layout-vertical-group',
      style: {
        position: 'absolute',
        left: '0px',
        bottom: 'var(--leftBottomVerticalGroup-bottom, 0px)',
        paddingBottom: 'var(--leftBottomVerticalGroup-padding-bottom, 0px)'
      }
    },
    leftBottomHorizontalBorderLineGroup: {
      type: 'GROUP',
      groupName: 'leftBottomHorizontalBorderLineGroup',
      direction: null,
      className: 'custom-layout-lb-horizontal-border-line-group custom-layout-horizontal-border-line-group',
      style: {
        position: 'absolute',
        left: 'var(--leftBottomHorizontalBorderLineGroup-fixedleft, 0px)',
        bottom: 'var(--leftBottomHorizontalBorderLineGroup-bottom, 0px)',
        width: 'var(--leftBottomHorizontalBorderLineGroup-width, 0px)',
        height: '0px'
      }
    },
    leftBottomVerticalBorderLineGroup: {
      type: 'GROUP',
      groupName: 'leftBottomVerticalBorderLineGroup',
      direction: null,
      className: 'custom-layout-lb-vertical-border-line-group custom-layout-vertical-border-line-group',
      style: {
        position: 'absolute',
        left: 'var(--leftBottomVerticalBorderLineGroup-fixedleft, 0px)',
        bottom: 'var(--leftBottomVerticalBorderLineGroup-bottom, 0px)',
        width: '0px',
        height: 'var(--leftBottomVerticalBorderLineGroup-height, 0px)'
      }
    },

    // attribution group
    bottomAttributionGroup: {
      type: 'GROUP',
      groupName: 'bottomAttributionGroup',
      direction: GroupDirection.RightBottomToLeftBottom,
      className: 'custom-layout-bottom-attribution-group',
      style: {
        position: 'absolute',
        left: '0px',
        right: '0px',
        bottom: '0px',
        height: '20px'
      }
    },

    // overview map group
    overviewMapGroup: {
      // overviewMapGroup style will be calculated by overview map position setting and layout at runtime
      type: 'GROUP',
      groupName: 'overviewMapGroup',
      className: 'overview-map-group',
      direction: null
    },

    Zoom: {
      type: 'TOOL',
      toolName: 'Zoom',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },
    Home: {
      type: 'TOOL',
      toolName: 'Home',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },
    Navigation: {
      type: 'TOOL',
      toolName: 'Navigation',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },
    ExtentNavigate: {
      type: 'TOOL',
      toolName: 'ExtentNavigate',
      isOnlyExpanded: true,
      isShowIconTitle: true
    },
    Locate: {
      type: 'TOOL',
      toolName: 'Locate',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },
    Compass: {
      type: 'TOOL',
      toolName: 'Compass',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },

    Select: {
      type: 'TOOL',
      toolName: 'Select',
      isOnlyExpanded: true,
      isShowIconTitle: true
    },

    Search: {
      type: 'TOOL',
      toolName: 'Search',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start'
    },
    Layers: {
      type: 'TOOL',
      toolName: 'Layers',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start'
    },
    BaseMap: {
      type: 'TOOL',
      toolName: 'BaseMap',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start'
    },
    Measure: {
      type: 'TOOL',
      toolName: 'Measure',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start'
    },

    MapSwitch: {
      type: 'TOOL',
      toolName: 'MapSwitch',
      isOnlyExpanded: true,
      isShowIconTitle: true
    },
    ScaleBar: {
      type: 'TOOL',
      toolName: 'ScaleBar',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },

    FullScreen: {
      type: 'TOOL',
      toolName: 'FullScreen',
      isOnlyExpanded: false,
      isShowIconTitle: true
    },
    ClearActionData: {
      type: 'TOOL',
      toolName: 'ClearActionData',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },
    SelectState: {
      type: 'TOOL',
      toolName: 'SelectState',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },

    Attribution: {
      type: 'TOOL',
      toolName: 'Attribution',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      className: 'w-100'
    },

    OverviewMap: {
      type: 'TOOL',
      toolName: 'OverviewMap',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },

    Placeholder: {
      type: 'TOOL',
      toolName: 'Placeholder',
      isOnlyExpanded: true,
      isShowIconTitle: false
    }
  },
  layout: {
    // left top
    leftTopGroup: {
      isMainGroup: true,
      children: ['leftTopCornerGroup', 'leftTopHorizontalGroup', 'leftTopVerticalGroup', 'leftTopHorizontalBorderLineGroup', 'leftTopVerticalBorderLineGroup'],
      alwaysRenderForInlineEditing: true
    },
    leftTopCornerGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    leftTopHorizontalGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    leftTopVerticalGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    leftTopHorizontalBorderLineGroup: {
      children: [],
      alwaysRenderForInlineEditing: true
    },
    leftTopVerticalBorderLineGroup: {
      children: [],
      alwaysRenderForInlineEditing: true
    },

    // right top
    rightTopGroup: {
      isMainGroup: true,
      children: ['rightTopCornerGroup', 'rightTopHorizontalGroup', 'rightTopVerticalGroup', 'rightTopHorizontalBorderLineGroup', 'rightTopVerticalBorderLineGroup'],
      alwaysRenderForInlineEditing: true
    },
    rightTopCornerGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    rightTopHorizontalGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    rightTopVerticalGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    rightTopHorizontalBorderLineGroup: {
      children: [],
      alwaysRenderForInlineEditing: true
    },
    rightTopVerticalBorderLineGroup: {
      children: [],
      alwaysRenderForInlineEditing: true
    },

    // right bottom
    rightBottomGroup: {
      isMainGroup: true,
      children: ['rightBottomCornerGroup', 'rightBottomHorizontalGroup', 'rightBottomVerticalGroup', 'rightBottomHorizontalBorderLineGroup', 'rightBottomVerticalBorderLineGroup'],
      alwaysRenderForInlineEditing: true
    },
    rightBottomCornerGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    rightBottomHorizontalGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    rightBottomVerticalGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    rightBottomHorizontalBorderLineGroup: {
      children: [],
      alwaysRenderForInlineEditing: true
    },
    rightBottomVerticalBorderLineGroup: {
      children: [],
      alwaysRenderForInlineEditing: true
    },

    // left bottom
    leftBottomGroup: {
      isMainGroup: true,
      children: ['leftBottomCornerGroup', 'leftBottomHorizontalGroup', 'leftBottomVerticalGroup', 'leftBottomHorizontalBorderLineGroup', 'leftBottomVerticalBorderLineGroup'],
      alwaysRenderForInlineEditing: true
    },
    leftBottomCornerGroup: {
      children: ['leftBottomScalebarMapSwitcherGroup', 'leftBottomCornerDropzoneGroup'],
      alwaysRenderForInlineEditing: true
    },
    leftBottomScalebarMapSwitcherGroup: {
      children: ['ScaleBar', 'MapSwitch']
    },
    leftBottomCornerDropzoneGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    leftBottomHorizontalGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    leftBottomVerticalGroup: {
      children: [],
      alwaysRenderForInlineEditing: true,
      isDropzone: true
    },
    leftBottomHorizontalBorderLineGroup: {
      children: [],
      alwaysRenderForInlineEditing: true
    },
    leftBottomVerticalBorderLineGroup: {
      children: [],
      alwaysRenderForInlineEditing: true
    },

    // attribution
    bottomAttributionGroup: {
      isMainGroup: true,
      children: ['Attribution']
    },

    // overview map
    overviewMapGroup: {
      isMainGroup: true,
      children: ['OverviewMap']
    }
  }
}

const imDefaultLayoutJson: IMLayoutJson = Immutable(defaultLayoutJson)

export function getFinalLayoutJson (config: IMConfig): LayoutJson {
  let finalPcLayoutJson: LayoutJson = pcLayoutJsons[0]

  // config = updateConfigToMakeSureCustomLayoutValid(config, useDataSources)

  if (config) {
    const layoutIndex = config.layoutIndex || 0

    if (layoutIndex === 'custom-layout') {
      const customLayoutPlacement = config.customLayoutPlacement?.asMutable({ deep: true })
      finalPcLayoutJson = createMapToolCustomLayoutJson(customLayoutPlacement)
    } else if (typeof layoutIndex === 'number') {
      finalPcLayoutJson = pcLayoutJsons[layoutIndex]
    }
  }

  if (!finalPcLayoutJson) {
    finalPcLayoutJson = pcLayoutJsons[0]
  }

  return finalPcLayoutJson
}

function createMapToolCustomLayoutJson (params: CustomLayoutPlacement): LayoutJson {
  if (!params) {
    params = {} as CustomLayoutPlacement
  }

  const { leftTop, rightTop, rightBottom, leftBottom } = params
  const customLayoutJson = imDefaultLayoutJson.asMutable({ deep: true })
  const { elements, layout } = customLayoutJson

  function updatePanelPlacementOfToolJson (toolNames: string[], panelPlacement: ToolPanelPlacement) {
    if (toolNames?.length > 0) {
      toolNames.forEach(toolName => {
        const toolJson = elements[toolName]

        if (toolJson && toolJson.type === 'TOOL') {
          toolJson.panelPlacement = panelPlacement
        }
      })
    }
  }

  const {
    // left top
    leftTopCornerGroup,
    leftTopHorizontalGroup,
    leftTopVerticalGroup,

    // right top
    rightTopCornerGroup,
    rightTopHorizontalGroup,
    rightTopVerticalGroup,

    // right bottom
    rightBottomCornerGroup,
    rightBottomHorizontalGroup,
    rightBottomVerticalGroup,

    // left bottom
    leftBottomCornerDropzoneGroup,
    leftBottomHorizontalGroup,
    leftBottomVerticalGroup
  } = layout

  // left top
  if (leftTopCornerGroup) {
    leftTopCornerGroup.children = leftTop?.cornerGroupChildren?.slice() || []
    leftTopCornerGroup.finalHorizontalVertical = getFinalHorizontalVertical(leftTop?.isCornerHorizontal)
    const panelPlacement: ToolPanelPlacement = leftTopCornerGroup.finalHorizontalVertical === HorizontalVertical.Horizontal ? 'bottom-start' : 'right-start'
    updatePanelPlacementOfToolJson(leftTopCornerGroup.children, panelPlacement)
  }

  if (leftTopHorizontalGroup) {
    leftTopHorizontalGroup.children = leftTop?.horizontalGroupChildren?.slice() || []
    leftTopHorizontalGroup.finalHorizontalVertical = HorizontalVertical.Horizontal
    updatePanelPlacementOfToolJson(leftTopHorizontalGroup.children, 'bottom-start')
  }

  if (leftTopVerticalGroup) {
    leftTopVerticalGroup.children = leftTop?.verticalGroupChildren?.slice() || []
    leftTopVerticalGroup.finalHorizontalVertical = HorizontalVertical.Vertical
    updatePanelPlacementOfToolJson(leftTopVerticalGroup.children, 'right-start')
  }

  // right top
  if (rightTopCornerGroup) {
    rightTopCornerGroup.children = rightTop?.cornerGroupChildren?.slice() || []
    rightTopCornerGroup.finalHorizontalVertical = getFinalHorizontalVertical(rightTop?.isCornerHorizontal)
    const panelPlacement: ToolPanelPlacement = rightTopCornerGroup.finalHorizontalVertical === HorizontalVertical.Horizontal ? 'bottom-end' : 'left-start'
    updatePanelPlacementOfToolJson(rightTopCornerGroup.children, panelPlacement)
  }

  if (rightTopHorizontalGroup) {
    rightTopHorizontalGroup.children = rightTop?.horizontalGroupChildren?.slice() || []
    rightTopHorizontalGroup.finalHorizontalVertical = HorizontalVertical.Horizontal
    updatePanelPlacementOfToolJson(rightTopHorizontalGroup.children, 'bottom-end')
  }

  if (rightTopVerticalGroup) {
    rightTopVerticalGroup.children = rightTop?.verticalGroupChildren?.slice() || []
    rightTopVerticalGroup.finalHorizontalVertical = HorizontalVertical.Vertical
    updatePanelPlacementOfToolJson(rightTopVerticalGroup.children, 'left-start')
  }

  // right bottom
  if (rightBottomCornerGroup) {
    rightBottomCornerGroup.children = rightBottom?.cornerGroupChildren?.slice() || []
    rightBottomCornerGroup.finalHorizontalVertical = getFinalHorizontalVertical(rightBottom?.isCornerHorizontal)
    const panelPlacement: ToolPanelPlacement = rightBottomCornerGroup.finalHorizontalVertical === HorizontalVertical.Horizontal ? 'top-end' : 'left-end'
    updatePanelPlacementOfToolJson(rightBottomCornerGroup.children, panelPlacement)
  }

  if (rightBottomHorizontalGroup) {
    rightBottomHorizontalGroup.children = rightBottom?.horizontalGroupChildren?.slice() || []
    rightBottomHorizontalGroup.finalHorizontalVertical = HorizontalVertical.Horizontal
    updatePanelPlacementOfToolJson(rightBottomHorizontalGroup.children, 'top-end')
  }

  if (rightBottomVerticalGroup) {
    rightBottomVerticalGroup.children = rightBottom?.verticalGroupChildren?.slice() || []
    rightBottomVerticalGroup.finalHorizontalVertical = HorizontalVertical.Vertical
    updatePanelPlacementOfToolJson(rightBottomVerticalGroup.children, 'left-end')
  }

  // left bottom
  if (leftBottomCornerDropzoneGroup) {
    leftBottomCornerDropzoneGroup.children = leftBottom?.cornerGroupChildren?.slice() || []
    leftBottomCornerDropzoneGroup.finalHorizontalVertical = getFinalHorizontalVertical(leftBottom?.isCornerHorizontal)
    const panelPlacement: ToolPanelPlacement = leftBottomCornerDropzoneGroup.finalHorizontalVertical === HorizontalVertical.Horizontal ? 'top-start' : 'right-end'
    updatePanelPlacementOfToolJson(leftBottomCornerDropzoneGroup.children, panelPlacement)
  }

  if (leftBottomHorizontalGroup) {
    leftBottomHorizontalGroup.children = leftBottom?.horizontalGroupChildren?.slice() || []
    leftBottomHorizontalGroup.finalHorizontalVertical = HorizontalVertical.Horizontal
    updatePanelPlacementOfToolJson(leftBottomHorizontalGroup.children, 'top-start')
  }

  if (leftBottomVerticalGroup) {
    leftBottomVerticalGroup.children = leftBottom?.verticalGroupChildren?.slice() || []
    leftBottomVerticalGroup.finalHorizontalVertical = HorizontalVertical.Vertical
    updatePanelPlacementOfToolJson(leftBottomVerticalGroup.children, 'right-end')
  }

  return customLayoutJson
}

function getFinalHorizontalVertical (isHorizontal: boolean): HorizontalVertical {
  if (typeof isHorizontal === 'boolean') {
    return isHorizontal ? HorizontalVertical.Horizontal : HorizontalVertical.Vertical
  }

  return null
}