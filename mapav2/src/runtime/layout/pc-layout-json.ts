import { type LayoutJson, GroupDirection } from './config'

const layoutJson1: LayoutJson = {
  elements: {
    leftTopContainer: {
      type: 'GROUP',
      groupName: 'leftTopContainer',
      direction: GroupDirection.LeftTopToRightTop,
      style: {
        position: 'absolute',
        top: '15px',
        left: '15px'
      }
    },
    navigator: {
      type: 'GROUP',
      groupName: 'navigator',
      direction: GroupDirection.LeftTopToLeftBottom,
      style: {
        marginRight: '8px'
      }
    },
    interact: {
      type: 'GROUP',
      groupName: 'interact',
      direction: GroupDirection.RightTopToRightBottom,
      isResponsive: true,
      style: {
        position: 'absolute',
        top: '15px',
        right: '15px'
      }
    },
    bottom: {
      type: 'GROUP',
      groupName: 'bottom',
      direction: GroupDirection.LeftTopToLeftBottom,
      className: 'w-100',
      style: {
        position: 'absolute',
        bottom: '0px',
        left: '0px'
      }
    },
    'bottom-line1': {
      type: 'GROUP',
      groupName: 'bottom-line1',
      direction: GroupDirection.LeftBottomToRightBottom,
      className: 'd-flex align-items-center justify-content-between w-100 scale-attribution-xy-group',
      style: {
        marginBottom: '0px',
        marginTop: '0px'
      }
    },
    'bottom-line2': {
      type: 'GROUP',
      groupName: 'bottom-line2',
      direction: GroupDirection.LeftBottomToRightBottom,
      className: 'd-flex align-items-end justify-content-between w-100',
      style: {
        paddingLeft: '15px',
        paddingRight: '15px',
        marginBottom: '8px'
      }
    },
    'SelectState-FullScreen-Container': {
      type: 'GROUP',
      groupName: 'SelectState-FullScreen-Container',
      direction: GroupDirection.RightTopToRightBottom
    },
    attributionGroup: {
      type: 'GROUP',
      groupName: 'attributionGroup',
      direction: GroupDirection.RightBottomToLeftBottom,
      style: {
        maxWidth: '60%'
      }
    },
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
      isShowIconTitle: false,
      style: {
        marginBottom: '8px'
      }
    },
    Home: {
      type: 'TOOL',
      toolName: 'Home',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginBottom: '8px'
      }
    },
    Compass: {
      type: 'TOOL',
      toolName: 'Compass',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },
    Navigation: {
      type: 'TOOL',
      toolName: 'Navigation',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginBottom: '8px'
      }
    },
    Locate: {
      type: 'TOOL',
      toolName: 'Locate',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginBottom: '8px'
      }
    },
    Layers: {
      type: 'TOOL',
      toolName: 'Layers',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start',
      style: {
        marginBottom: '8px'
      }
    },
    BaseMap: {
      type: 'TOOL',
      toolName: 'BaseMap',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start',
      style: {
        marginBottom: '8px'
      }
    },
    Select: {
      type: 'TOOL',
      toolName: 'Select',
      isOnlyExpanded: true,
      isShowIconTitle: true
    },
    SelectState: {
      type: 'TOOL',
      toolName: 'SelectState',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '8px'
      }
    },
    ExtentNavigate: {
      type: 'TOOL',
      toolName: 'ExtentNavigate',
      isOnlyExpanded: true,
      isShowIconTitle: true,
      style: {
        marginBottom: '8px'
      }
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
      isShowIconTitle: false,
      style: {
        marginTop: '8px'
      }
    },
    ScaleBar: {
      type: 'TOOL',
      toolName: 'ScaleBar',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginLeft: '6px'
      }
    },
    Attribution: {
      type: 'TOOL',
      toolName: 'Attribution',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      className: 'w-100'
    },
    Search: {
      type: 'TOOL',
      toolName: 'Search',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start',
      style: {
        marginBottom: '8px'
      }
    },
    OverviewMap: {
      type: 'TOOL',
      toolName: 'OverviewMap',
      isOnlyExpanded: true,
      isShowIconTitle: false
    }
  },

  layout: {
    leftTopContainer: {
      isMainGroup: true,
      children: ['navigator', 'Select']
    },
    navigator: {
      children: ['Zoom', 'Home', 'Navigation', 'ExtentNavigate', 'Locate', 'Compass']
    },

    interact: {
      isMainGroup: true,
      children: ['Search', 'Layers', 'BaseMap', 'Measure']
    },

    bottom: {
      isMainGroup: true,
      children: ['bottom-line2', 'bottom-line1']
    },
    'bottom-line2': {
      children: ['MapSwitch', 'SelectState-FullScreen-Container']
    },
    'SelectState-FullScreen-Container': {
      children: ['FullScreen', 'ClearActionData', 'SelectState']
    },
    'bottom-line1': {
      children: ['ScaleBar', 'attributionGroup']
    },
    attributionGroup: {
      children: ['Attribution']
    },


    overviewMapGroup: {
      isMainGroup: true,
      children: ['OverviewMap']
    }
  }
}

const layoutJson2: LayoutJson = {
  elements: {
    navigator: {
      type: 'GROUP',
      groupName: 'navigator',
      direction: GroupDirection.RightTopToRightBottom
    },
    interact: {
      type: 'GROUP',
      groupName: 'interact',
      direction: GroupDirection.LeftTopToRightTop,
      isResponsive: true,
      style: {
        position: 'absolute',
        top: '15px',
        left: '15px'
      }
    },
    fullScreenGroup: {
      type: 'GROUP',
      groupName: 'fullScreenGroup',
      direction: GroupDirection.LeftTopToRightTop,
      style: {
        position: 'absolute',
        top: '15px',
        right: '15px'
      }
    },
    bottom: {
      type: 'GROUP',
      groupName: 'bottom',
      direction: GroupDirection.LeftTopToLeftBottom,
      className: 'w-100',
      style: {
        position: 'absolute',
        bottom: '0px',
        left: '0px'
      }
    },
    'bottom-line1': {
      type: 'GROUP',
      groupName: 'bottom-line1',
      direction: GroupDirection.LeftBottomToRightBottom,
      className: 'd-flex align-items-center justify-content-between w-100 scale-attribution-xy-group',
      style: {
        marginBottom: '0px',
        marginTop: '0px'
      }
    },
    'bottom-line2': {
      type: 'GROUP',
      groupName: 'bottom-line2',
      direction: GroupDirection.LeftBottomToRightBottom,
      className: 'd-flex align-items-end justify-content-between w-100',
      style: {
        paddingLeft: '15px',
        paddingRight: '15px',
        marginBottom: '8px'
      }
    },
    attributionGroup: {
      type: 'GROUP',
      groupName: 'attributionGroup',
      direction: GroupDirection.RightBottomToLeftBottom,
      style: {
        maxWidth: '60%'
      },
      className: 'attribute-group'
    },
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
      isShowIconTitle: false,
      style: {
        marginTop: '8px'
      }
    },
    Home: {
      type: 'TOOL',
      toolName: 'Home',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '8px'
      }
    },
    Compass: {
      type: 'TOOL',
      toolName: 'Compass',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },
    Navigation: {
      type: 'TOOL',
      toolName: 'Navigation',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '8px'
      }
    },
    Locate: {
      type: 'TOOL',
      toolName: 'Locate',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '8px'
      }
    },
    ExtentNavigate: {
      type: 'TOOL',
      toolName: 'ExtentNavigate',
      isOnlyExpanded: true,
      isShowIconTitle: true,
      style: {
        marginTop: '8px'
      }
    },
    Layers: {
      type: 'TOOL',
      toolName: 'Layers',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'bottom',
      style: {
        marginRight: '8px'
      }
    },
    BaseMap: {
      type: 'TOOL',
      toolName: 'BaseMap',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'bottom',
      style: {
        marginRight: '8px'
      }
    },
    Select: {
      type: 'TOOL',
      toolName: 'Select',
      isOnlyExpanded: true,
      isShowIconTitle: true
    },
    SelectState: {
      type: 'TOOL',
      toolName: 'SelectState',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '8px'
      }
    },
    Measure: {
      type: 'TOOL',
      toolName: 'Measure',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'bottom',
      style: {
        marginRight: '8px'
      }
    },
    MapSwitch: {
      type: 'TOOL',
      toolName: 'MapSwitch',
      isOnlyExpanded: true,
      isShowIconTitle: true
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
      isShowIconTitle: false,
      style: {
        marginLeft: '8px'
      }
    },
    ScaleBar: {
      type: 'TOOL',
      toolName: 'ScaleBar',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginLeft: '6px'
      }
    },
    Attribution: {
      type: 'TOOL',
      toolName: 'Attribution',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      className: 'w-100'
    },
    Search: {
      type: 'TOOL',
      toolName: 'Search',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'bottom',
      style: {
        marginRight: '8px'
      }
    },
    OverviewMap: {
      type: 'TOOL',
      toolName: 'OverviewMap',
      isOnlyExpanded: true,
      isShowIconTitle: false
    }
  },
  layout: {
    interact: {
      isMainGroup: true,
      children: ['Search', 'Layers', 'BaseMap', 'Measure', 'Select']
    },

    fullScreenGroup: {
      isMainGroup: true,
      children: ['FullScreen', 'ClearActionData']
    },

    bottom: {
      isMainGroup: true,
      children: ['bottom-line2', 'bottom-line1']
    },
    'bottom-line2': {
      children: ['MapSwitch', 'navigator']
    },
    navigator: {
      children: ['Compass', 'Locate', 'ExtentNavigate', 'Navigation', 'Zoom', 'Home', 'SelectState']
    },
    'bottom-line1': {
      children: ['ScaleBar', 'attributionGroup']
    },
    attributionGroup: {
      children: ['Attribution']
    },

    overviewMapGroup: {
      isMainGroup: true,
      children: ['OverviewMap']
    }
  }
}

const layoutJsons: LayoutJson[] = [layoutJson1, layoutJson2]

export default layoutJsons
