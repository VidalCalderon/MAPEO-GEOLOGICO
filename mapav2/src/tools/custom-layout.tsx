import { type extensionSpec, appActions, getAppStore, type LayoutContextToolProps, i18n } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import EditPositionOutlined from 'jimu-icons/svg/outlined/editor/edit-position.svg'
import type { IMConfig } from '../config'

export default class CustomLayout implements extensionSpec.ContextToolExtension {
  id = 'custom-layout'
  index = 0

  getAppState () {
    const state = getAppStore().getState()
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    return appState
  }

  isCustomLayout (props: LayoutContextToolProps) {
    const widgetId = props.layoutItem?.widgetId
    const appState = this.getAppState()
    const appConfig = appState?.appConfig
    const widgetJson = widgetId && appConfig?.widgets?.[widgetId]
    const widgetConfig = widgetJson?.config as IMConfig
    return widgetConfig?.layoutIndex === 'custom-layout'
  }

  getCurrentInlineEditing (props: LayoutContextToolProps): boolean {
    const widgetId = props?.layoutItem?.widgetId
    const widgetsRuntimeInfo = this.getAppState().widgetsRuntimeInfo
    const isInlineEditing = widgetsRuntimeInfo?.[widgetId]?.isInlineEditing
    return !!isInlineEditing
  }

  isPcLayoutSize (props: LayoutContextToolProps): boolean {
    const widgetId = props?.layoutItem?.widgetId
    const appState = this.getAppState()
    const widthBreakpoint = appState?.widgetsState?.[widgetId]?.widthBreakpoint
    const isPcLayoutSize = !!(widthBreakpoint && widthBreakpoint !== 'xsmall')
    return isPcLayoutSize
  }

  getGroupId (): string {
    return null
  }

  getIcon (): React.ComponentClass<React.SVGAttributes<SVGElement>> {
    return EditPositionOutlined
  }

  getTitle (props: LayoutContextToolProps): string {
    const intl = i18n.getIntl('_jimu')
    return intl != null ? intl.formatMessage({ id: 'adjustMapToolLayout', defaultMessage: defaultMessages.adjustMapToolLayout }) : 'Adjust map tool layout'
  }

  visible (props: LayoutContextToolProps): boolean {
    const isCustomLayout = this.isCustomLayout(props)
    return isCustomLayout
  }

  disabled (props: LayoutContextToolProps): boolean {
    const isCustomLayout = this.isCustomLayout(props)
    const isPcLayoutSize = this.isPcLayoutSize(props)
    const enabled = isCustomLayout && isPcLayoutSize
    return !enabled
  }

  checked (props: LayoutContextToolProps): boolean {
    const enabled = !this.disabled(props)
    const isInlineEditing = this.getCurrentInlineEditing(props)
    return enabled && isInlineEditing
  }

  onClick (props: LayoutContextToolProps, evt?: React.MouseEvent<any>): void {
    const widgetId = props.layoutItem.widgetId
    const isInlineEditing = this.getCurrentInlineEditing(props)
    getAppStore().dispatch(appActions.setWidgetIsInlineEditingState(widgetId, !isInlineEditing))
  }

  getSettingPanel (props: LayoutContextToolProps): React.ComponentClass<any> | React.FunctionComponent<any> {
    return null
  }
}