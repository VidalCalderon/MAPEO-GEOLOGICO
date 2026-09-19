/** @jsx jsx */
import { jsx, classNames, type IntlShape } from 'jimu-core'
import { UIComponent, type UIComponentProps } from './ui-component'
import type { ToolConfig, IMToolOptions, OverviewMapPosition } from '../../../config'
import type { ActiveToolInfo } from './base-tool'
import type { LayoutJson, ToolJson, GroupJson, LayoutItemJson } from '../config'
import ToolModules from '../tool-modules'
import mapDefaultMessages from '../../translations/default'

export interface ToolShellProps extends UIComponentProps {
  mapWidgetId: string
  layoutConfig: LayoutJson
  toolConfig: ToolConfig
  toolOptions: IMToolOptions
  toolName: string
  parentGroupName: string
  parentGroupJson: GroupJson
  parentLayoutItemJson: LayoutItemJson
  isMobile?: boolean
  isHidden?: boolean
  intl?: IntlShape
  className?: string
  indexInGroup: number
  isFakeTool: boolean
  isCustomLayout: boolean
  isCustomLayoutEditing: boolean
  overviewMapPosition: OverviewMapPosition

  activeToolInfo: ActiveToolInfo
  onActiveToolInfoChange: (activeToolInfo: ActiveToolInfo) => void
  autoControlWidgetId: string

  isRTL: boolean
  mapComponentsLoaded: boolean
  mapRootClassName: string

  onMouseOverPopper: () => void
  onMouseOutPopper: () => void
  onRemoveTool?: (toolName: string, toolIndexInGroup: number, groupName: string) => void
}

export default class BaseToolShell extends UIComponent<ToolShellProps, unknown> {
  render () {
    const ToolClass = ToolModules[this.props.toolName]

    let isAvailable = true

    if (ToolClass) {
      if ((ToolClass as any).isAvailable) {
        isAvailable = (ToolClass as any).isAvailable(this.props)
      } else {
        isAvailable = true
      }
    } else {
      isAvailable = false
    }

    if (isAvailable) {
      const toolName = this.props.toolName
      const className = `exbmap-ui exbmap-ui-tool-shell divitem exbmap-ui-tool-shell-${toolName}`
      const toolJson = this.props.layoutConfig.elements[toolName] as ToolJson
      const styleObj = toolJson.style || {}
      const selfToolOptions = (this.props.toolOptions && this.props.toolOptions[toolName]) || null
      const direction = this.props.parentLayoutItemJson?.finalHorizontalVertical
      const isCustomLayoutEditing = this.props.isCustomLayoutEditing
      const onRemoveTool = (toolName === 'Placeholder' && isCustomLayoutEditing) ? this.onRemoveTool : null
      let title = ''

      if (toolName === 'Placeholder' && isCustomLayoutEditing && this.props.isFakeTool) {
        title = this.formatMessage('moveToAddPlaceholder')
      }

      return (
        <div
          className={classNames(this.props.className, className, toolJson.className,
            {
              'exbmap-ui-hidden-element': this.props.isHidden,
              'rounded-pill': ['Compass'].includes(toolName)
            })}
          style={styleObj}
          title={title}
          map-tool-name={toolName}
          parent-group-name={this.props.parentGroupName}
          index-in-group={this.props.indexInGroup}
        >
          <ToolClass
            mapWidgetId={this.props.mapWidgetId}
            toolJson={toolJson}
            toolName={toolName}
            selfToolOptions={selfToolOptions}
            isFakeTool={this.props.isFakeTool}
            isCustomLayout={this.props.isCustomLayout}
            isCustomLayoutEditing={isCustomLayoutEditing}
            direction={direction}
            overviewMapPosition={this.props.overviewMapPosition}
            isMobile={this.props.isMobile}
            jimuMapView={this.props.jimuMapView}
            activeToolInfo={this.props.activeToolInfo}
            onActiveToolInfoChange={this.props.onActiveToolInfoChange}
            intl={this.props.intl}
            theme={this.props.theme}
            autoControlWidgetId={this.props.autoControlWidgetId}
            isRTL={this.props.isRTL}
            mapComponentsLoaded={this.props.mapComponentsLoaded}
            mapRootClassName={this.props.mapRootClassName}
            onMouseOverPopper={this.props.onMouseOverPopper}
            onMouseOutPopper={this.props.onMouseOutPopper}
            onRemoveTool={onRemoveTool}
          />
        </div>
      )
    } else {
      if (this.props.isMobile) {
        return <span />
      } else {
        return null
      }
    }
  }

  formatMessage (strId: string): string {
    const str = this.props.intl?.formatMessage({ id: strId, defaultMessage: mapDefaultMessages[strId] }) || mapDefaultMessages[strId] || ''
    return str
  }

  onRemoveTool = () => {
    if (this.props.onRemoveTool) {
      this.props.onRemoveTool(this.props.toolName, this.props.indexInGroup, this.props.parentGroupName)
    }
  }
}
