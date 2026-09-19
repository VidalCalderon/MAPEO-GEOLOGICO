/** @jsx jsx */
import { css, jsx, polished, getAppStore, classNames, appActions } from 'jimu-core'
import { Icon, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import { MultiSourceMapContext } from '../components/multisourcemap-context'
import MapThumb from '../components/map-thumb'
import type { ToolShellProps } from '../layout/base/base-tool-shell'
import mapDefaultMessages from '../translations/default'

interface SwitchState {
  switchAnnouncement: string
}

export default class MapSwitch extends BaseTool<BaseToolProps, SwitchState> {
  toolName = 'MapSwitch'

  static isAvailable (toolShellProps: ToolShellProps): boolean {
    if (toolShellProps.isMobile) {
      const widgetId = toolShellProps.mapWidgetId

      if (widgetId) {
        const widgetInfo = getAppStore().getState().appConfig.widgets[widgetId]

        if (widgetInfo) {
          return widgetInfo.useDataSources && widgetInfo.useDataSources.length >= 2
        }
      }

      return false
    }

    // Always return true for pc layout because false will let SelectState-FullScreen-Container in wrong position.
    return true
  }

  constructor (props) {
    super(props)

    this.state = {
      switchAnnouncement: ''
    }
  }

  getStyle () {
    return css`
      width: ${polished.rem(68)};
      height: ${polished.rem(52)};
      cursor: pointer;
      position: relative;

      .mapthumb-item {
        position: absolute;
        width: ${polished.rem(64)};
        height: ${polished.rem(48)};
        transition: bottom 0.5s, left 0.5s, top 0.5s, right 0.5s, z-index 0.5s;
      }

      .aria-live-label {
        position: absolute;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        overflow: hidden;
        opacity: 0;
        color: transparent;
        pointer-events: none;
        z-index: 1;
      }

      .front {
        z-index: 1;
        bottom: 0;
        left: 0;
      }

      .back {
        z-index: 0;
        top: 0;
        right: 0;
      }
    `
  }

  getMobileStyle () {
    return css`
      .aria-live-label {
        position: absolute;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        overflow: hidden;
        opacity: 0;
        color: transparent;
        pointer-events: none;
        z-index: 1;
      }
    `
  }

  getTitle () {
    return 'MapSwitch'
  }

  getIcon (): IconType {
    return {
      icon: require('../assets/icons/exchange.svg'),
      onIconClick: () => {
        this.switchMap()
      }
    }
  }

  switchMap = () => null

  getExpandPanel (): React.JSX.Element {
    if (this.props.toolJson.isOnlyExpanded) {
      return (
        <MultiSourceMapContext.Consumer>
          {({ isShowMapSwitchBtn, dataSourceIds, activeDataSourceId, switchMap, mapWidgetId, theme }) => (
            this.getContent(isShowMapSwitchBtn, dataSourceIds, activeDataSourceId, switchMap, mapWidgetId, theme)
          )}
        </MultiSourceMapContext.Consumer>
      )
    } else {
      return null
    }
  }

  handleKeyDown = (e: React.KeyboardEvent<any>, onClick) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e?.preventDefault()
      onClick()
    }
  }

  announceActiveMapChange = (nextMapLabel: string) => {
    const baseMsg = this.props.intl.formatMessage({ id: 'activeMapChanged', defaultMessage: mapDefaultMessages.activeMapChanged })
    const fullMsg = nextMapLabel ? `${baseMsg} ${nextMapLabel}` : baseMsg

    // First clear the data, then write it asynchronously, forcing the screen reader to recognize the changes.
    this.setState({ switchAnnouncement: '' }, () => {
      setTimeout(() => {
        this.setState({ switchAnnouncement: fullMsg }, () => {
          // Clear the live region after a period of time to avoid occupying it.
          setTimeout(() => {
            // If switches and writes new content during this period, it will not be overwritten.
            if (this.state.switchAnnouncement === fullMsg) {
              this.setState({ switchAnnouncement: '' })
            }
          }, 4000)
        })
      }, 40)
    })
  }

  getContent = (isShowMapSwitchBtn: boolean, dataSourceIds: string[], activeDataSourceId: string, switchMap, mapWidgetId, theme) => {
    const dsJsons = getAppStore().getState().appConfig.dataSources

    const stringKey = 'switchTo'

    const firstDataSourceId = dataSourceIds[0]
    const firstDataSourceJson = firstDataSourceId ? dsJsons[firstDataSourceId] : null
    const firstDataSourcePortalUrl = firstDataSourceJson?.portalUrl || null
    const firstDataSourceMapItemId = firstDataSourceJson?.itemId || null
    const firstDataSourceLabel = firstDataSourceJson?.label || firstDataSourceJson?.sourceLabel || ''
    const firstDataSourceSwitchToLabel = firstDataSourceLabel ? this.props.intl.formatMessage({ id: stringKey, defaultMessage: mapDefaultMessages[stringKey] }, { webMapName: firstDataSourceLabel }) : ''

    const secondDataSourceId = dataSourceIds[1]
    const secondDataSourceJson = secondDataSourceId ? dsJsons[secondDataSourceId] : null
    const secondDataSourceMapPortalUrl = secondDataSourceJson?.portalUrl || null
    const secondDataSourceMapItemId = secondDataSourceJson?.itemId || null
    const secondDataSourceLabel = secondDataSourceJson?.label || secondDataSourceJson?.sourceLabel || ''
    const secondDataSourceSwitchToLabel = secondDataSourceLabel ? this.props.intl.formatMessage({ id: stringKey, defaultMessage: mapDefaultMessages[stringKey] }, { webMapName: secondDataSourceLabel }) : ''

    let switchMapTitle = ''
    let switchMapLabel = ''

    if (firstDataSourceId !== activeDataSourceId) {
      switchMapTitle = firstDataSourceLabel
      switchMapLabel = firstDataSourceSwitchToLabel
    } else if (secondDataSourceId !== activeDataSourceId) {
      switchMapTitle = secondDataSourceLabel
      switchMapLabel = secondDataSourceSwitchToLabel
    }

    if (!switchMapLabel) {
      switchMapLabel = this.props.intl.formatMessage({ id: 'SwitchMap', defaultMessage: jimuUIDefaultMessages.SwitchMap })
    }

    const onClick = () => {
      // First, deduce the name of the map that will be activated (the one that is not currently active).
      let nextMapLabel = ''
      if (firstDataSourceId !== activeDataSourceId) {
        nextMapLabel = firstDataSourceLabel
      } else if (secondDataSourceId !== activeDataSourceId) {
        nextMapLabel = secondDataSourceLabel
      }

      getAppStore().dispatch(appActions.requestAutoControlMapWidget(mapWidgetId, mapWidgetId))
      switchMap()

      this.announceActiveMapChange(nextMapLabel)
    }

    if (isShowMapSwitchBtn) {
      if (this.props.isMobile) {
        return (
          <div
            className='mapswitch-map-tool exbmap-ui-tool esri-widget--button-like'
            css={this.getMobileStyle()}
            onClick={onClick} role='button' tabIndex={0}
            onKeyDown={e => { this.handleKeyDown(e, onClick) }}
            title={switchMapTitle}
            aria-label={switchMapLabel}
          >
            <Icon size={16} className='exbmap-ui-tool-icon' icon={this.getIcon().icon} />
            <label className='aria-live-label' aria-live='polite'>{this.state.switchAnnouncement}</label>
          </div>
        )
      } else {
        return (
          <div
            className='mapswitch-map-tool'
            css={this.getStyle()}
            role='button'
            tabIndex={0}
            aria-label={switchMapLabel}
            onClick={onClick}
            onKeyDown={e => { this.handleKeyDown(e, onClick) }}
          >
            <div
              title={firstDataSourceLabel}
              className={classNames('mapthumb-item', { front: firstDataSourceId !== activeDataSourceId }, { back: firstDataSourceId === activeDataSourceId })}
            >
              <MapThumb
                usedInSetting={false}
                mapItemId={firstDataSourceMapItemId}
                portUrl={firstDataSourcePortalUrl}
                label={firstDataSourceSwitchToLabel}
                theme={theme}
              />
            </div>

            <div
              title={secondDataSourceLabel}
              className={classNames('mapthumb-item', { front: secondDataSourceId !== activeDataSourceId }, { back: secondDataSourceId === activeDataSourceId })}
            >
              <MapThumb
                usedInSetting={false}
                mapItemId={secondDataSourceMapItemId}
                portUrl={secondDataSourceMapPortalUrl}
                label={secondDataSourceSwitchToLabel}
                theme={theme}
              />
            </div>

            <label className='aria-live-label' aria-live='polite'>{this.state.switchAnnouncement}</label>
          </div>
        )
      }
    } else {
      return null
    }
  }

  getIconContent = (isShowMapSwitchBtn: boolean, dataSourceIds: string[], activeDataSourceId: string, switchMap) => {
    if (isShowMapSwitchBtn) {
      this.switchMap = switchMap
      return super.render()
    } else {
      return null
    }
  }

  render () {
    if (this.props.toolJson.isOnlyExpanded) {
      return super.render()
      // In fact, it never goes here.
    } else {
      return (
        <MultiSourceMapContext.Consumer>
          {({ isShowMapSwitchBtn, dataSourceIds, activeDataSourceId, switchMap }) => (
            this.getIconContent(isShowMapSwitchBtn, dataSourceIds, activeDataSourceId, switchMap)
          )}
        </MultiSourceMapContext.Consumer>
      )
    }
  }
}
