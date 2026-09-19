import { type LayoutJson, GroupDirection } from './config'

const mobileLayoutJson: LayoutJson = {
  elements: {
    mainGroup: {
      type: 'GROUP',
      groupName: 'mainGroup',
      direction: GroupDirection.LeftTopToLeftBottom,
      className: 'd-flex',
      style: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        bottom: '0px',
        right: '0px'
      }
    },
    topGroup: {
      type: 'GROUP',
      groupName: 'topGroup',
      direction: GroupDirection.LeftTopToRightTop,
      className: 'd-flex w-100 align-items-center justify-content-between',
      style: {
        padding: '8px 8px 0 8px'
      }
    },
    midGroup: {
      type: 'GROUP',
      groupName: 'midGroup',
      direction: GroupDirection.LeftTopToRightTop,
      className: 'flex-grow-1 d-flex w-100 justify-content-between',
      style: {
        position: 'relative'
      }
    },
    bottomGroup: {
      type: 'GROUP',
      groupName: 'bottomGroup',
      direction: GroupDirection.LeftBottomToRightBottom,
      className: 'd-flex w-100 align-items-center justify-content-between'
    },
    'midGroup-left-top': {
      type: 'GROUP',
      groupName: 'midGroup-left-top',
      direction: GroupDirection.LeftTopToLeftBottom,
      style: {
        position: 'absolute',
        left: '0px',
        top: '0px'
      }
    },
    'midGroup-left-bottom': {
      type: 'GROUP',
      groupName: 'midGroup-left-bottom',
      direction: GroupDirection.LeftTopToLeftBottom,
      className: 'd-flex',
      style: {
        position: 'absolute',
        left: '0px',
        bottom: '0px'
      }
    },
    'midGroup-right-content-top': {
      type: 'GROUP',
      groupName: 'midGroup-right-content-top',
      direction: GroupDirection.RightTopToRightBottom,
      style: {
        position: 'absolute',
        top: '0px',
        right: '8px'
      }
    },
    'midGroup-right-content-bottom': {
      type: 'GROUP',
      groupName: 'midGroup-right-content-bottom',
      direction: GroupDirection.RightTopToRightBottom,
      style: {
        position: 'absolute',
        bottom: '8px',
        right: '8px'
      }
    },
    Search: {
      type: 'TOOL',
      toolName: 'Search',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      className: 'flex-grow-1'
    },
    FullScreen: {
      type: 'TOOL',
      toolName: 'FullScreen',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      style: {
        marginLeft: '8px'
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
    ClearActionData: {
      type: 'TOOL',
      toolName: 'ClearActionData',
      isOnlyExpanded: true,
      isShowIconTitle: false
    },
    Compass: {
      type: 'TOOL',
      toolName: 'Compass',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      className: 'mb-0',
      style: {
        marginLeft: '8px',
        marginTop: '8px'
      }
    },
    MapSwitch: {
      type: 'TOOL',
      toolName: 'MapSwitch',
      isOnlyExpanded: true,
      isShowIconTitle: true,
      style: {
        marginLeft: '8px',
        marginBottom: '8px'
      }
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
        marginLeft: '8px',
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
        marginTop: '8px'
      }
    },
    BaseMap: {
      type: 'TOOL',
      toolName: 'BaseMap',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start',
      style: {
        marginTop: '8px'
      }
    },
    Select: {
      type: 'TOOL',
      toolName: 'Select',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        marginTop: '8px'
      }
    },
    SelectState: {
      type: 'TOOL',
      toolName: 'SelectState',
      isOnlyExpanded: true,
      isShowIconTitle: false,
      style: {
        width: '100%'
      }
    },
    Measure: {
      type: 'TOOL',
      toolName: 'Measure',
      isOnlyExpanded: false,
      isShowIconTitle: true,
      panelPlacement: 'left-start',
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
    }
  },
  layout: {
    mainGroup: {
      isMainGroup: true,
      children: ['topGroup', 'midGroup', 'bottomGroup']
    },

    topGroup: {
      children: ['Search', 'FullScreen']
    },

    midGroup: {
      children: ['midGroup-left-top', 'midGroup-left-bottom', 'midGroup-right-content-top', 'midGroup-right-content-bottom']
    },
    'midGroup-left-top': {
      children: ['Compass']
    },
    'midGroup-left-bottom': {
      children: ['ExtentNavigate', 'MapSwitch', 'ScaleBar']
    },
    'midGroup-right-content-top': {
      children: ['Layers', 'BaseMap', 'Measure', 'Select']
    },
    'midGroup-right-content-bottom': {
      children: ['Zoom', 'Home', 'Locate', 'ClearActionData']
    },

    bottomGroup: {
      children: ['SelectState']
    }
  },
  mobileResponsiveStrategy: {
    // height: 400-465
    stage1: ['Measure', 'Locate'],

    // height: 320-400
    stage2: ['Measure', 'Select', 'Locate', 'bottomGroup'],

    // height: 250-320
    stage3: ['ExtentNavigate', 'midGroup-right-content-top', 'Locate', 'bottomGroup'],

    // height: 160-250
    stage4: ['MapSwitch', 'midGroup-right-content-top', 'Home', 'Locate', 'ClearActionData', 'bottomGroup'],

    // height: 54-160
    stage5: ['midGroup', 'bottomGroup'],

    // height: 0-54
    stage6: ['topGroup', 'midGroup', 'bottomGroup']
  },
  lockToolNames: []
}

const mobileLayoutJsons: LayoutJson[] = [mobileLayoutJson]

export default mobileLayoutJsons
