interface ToolModulesConfigType {
  [ModuleName: string]: {
    label: string,
    // In most cases, renderByToolConfig is same with isNeedSetting. SelectState is an exception.
    // For SelectState, renderByToolConfig is true, but isNeedSetting is false (it does not need setting).
    renderByToolConfig: boolean,
    isNeedSetting: boolean, // only used in setting.tsx
    hasSettingOptions?: boolean, // default false
    supportMultiple?: boolean // default false
    defaultDirection?: 'horizontal' | 'vertical'
  }
}

const ToolModulesConfig: ToolModulesConfigType = {
  Zoom: {
    label: 'Zoom',
    renderByToolConfig: true,
    isNeedSetting: true,
    defaultDirection: 'vertical'
  },
  Home: {
    label: 'Home',
    renderByToolConfig: true,
    isNeedSetting: true,
  },
  Navigation: {
    label: 'Navigation',
    renderByToolConfig: true,
    isNeedSetting: true,
    defaultDirection: 'vertical'
  },
  Locate: {
    label: 'Locate',
    renderByToolConfig: true,
    isNeedSetting: true,
    hasSettingOptions: true
  },
  ClearActionData: {
    label: 'ClearActionData',
    renderByToolConfig: false,
    isNeedSetting: false
  },
  Compass: {
    label: 'Compass',
    renderByToolConfig: true,
    isNeedSetting: true
  },
  Search: {
    label: 'Search',
    renderByToolConfig: true,
    isNeedSetting: true
  },
  Layers: {
    label: 'Layers',
    renderByToolConfig: true,
    isNeedSetting: true
  },
  BaseMap: {
    label: 'BaseMap',
    renderByToolConfig: true,
    isNeedSetting: true
  },
  Measure: {
    label: 'Measure',
    renderByToolConfig: true,
    isNeedSetting: true
  },
  MapSwitch: {
    label: 'MapSwitch',
    renderByToolConfig: false,
    isNeedSetting: false
  },
  FullScreen: {
    label: 'FullScreen',
    renderByToolConfig: true,
    isNeedSetting: true
  },
  ScaleBar: {
    label: 'ScaleBar',
    renderByToolConfig: true,
    isNeedSetting: true,
    hasSettingOptions: true
  },
  Attribution: {
    label: 'Attribution',
    renderByToolConfig: false,
    isNeedSetting: false
  },
  Select: {
    label: 'Select',
    renderByToolConfig: true,
    isNeedSetting: true,
    defaultDirection: 'horizontal'
  },
  SelectState: {
    label: 'SelectState',
    // renderByToolConfig is different with isNeedSetting
    renderByToolConfig: true,
    isNeedSetting: false,
    defaultDirection: 'horizontal'
  },
  ExtentNavigate: {
    label: 'ExtentNavigate',
    renderByToolConfig: true,
    isNeedSetting: true,
    defaultDirection: 'vertical'
  },
  OverviewMap: {
    label: 'OverviewMap',
    renderByToolConfig: true,
    isNeedSetting: true,
    hasSettingOptions: true
  },
  Placeholder: {
    label: 'Placeholder',
    renderByToolConfig: false,
    isNeedSetting: false,
    supportMultiple: true
  },
}

export default ToolModulesConfig
