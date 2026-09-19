import { React, hooks, css, Immutable, classNames, getAppStore } from 'jimu-core'
import { defaultMessages as jimuUIDefaultMessages, Image, Label, Checkbox } from 'jimu-ui'
import mapDefaultMessages from '../translations/default'
import type { IMOverviewMapOptions, IMConfig, OverviewMapPosition } from '../../config'
import { getOverviewMapPosition } from '../../utils'

export interface OverviewMapSettingProps {
  mapConfig: IMConfig
  onChange: (overviewMapOptions: IMOverviewMapOptions) => void
}

const style = css`
  padding: 0 16px 16px 16px;
  color: var(--sys-color-surface-paper-text) !important;
  font-size: 13px;

  .set-om-pos-desc {
    font-weight: 500;
    line-height: 20px;
  }

  .corner-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: auto;
    column-gap: 12px;
    row-gap: 12px;

    .cell {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .thumbnail-container {
        border: 2px solid transparent;

        &.selected {
          border-color: var(--sys-color-action-selected);
        }
      }

      label {
        font-size: 12px;
        margin-top: 2px;
        margin-bottom: 0;
        color: var(--sys-color-surface-paper-hint);
      }
    }
  }
`

interface PositionInfo {
  position: OverviewMapPosition
  thumbnail: string
  label: string
}

export default function OverviewMapSetting (props: OverviewMapSettingProps) {
  const mapConfig = props.mapConfig
  const onChangeProp = props.onChange
  const rawOverviewMapOptions = mapConfig?.toolOptions?.OverviewMap
  const initiallyExpand = rawOverviewMapOptions?.initiallyExpand || false

  const notEmptyOverviewMapOptions = React.useMemo(() => {
    let result: IMOverviewMapOptions = rawOverviewMapOptions

    if (!result) {
      result = Immutable({
        position: 'bottom-right',
        initiallyExpand: false
      })
    }
    return result
  }, [rawOverviewMapOptions])

  const position = React.useMemo(() => {
    return getOverviewMapPosition(mapConfig)
  }, [mapConfig])

  const updateOverviewMapOptions = React.useCallback((newOptions: IMOverviewMapOptions) => {
    if (onChangeProp) {
      onChangeProp(newOptions)
    }
  }, [onChangeProp])

  const onPositionClick = React.useCallback((position: OverviewMapPosition) => {
    const newOptions = notEmptyOverviewMapOptions.set('position', position)
    updateOverviewMapOptions(newOptions)
  }, [notEmptyOverviewMapOptions, updateOverviewMapOptions])

  const onPositionKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>, position: OverviewMapPosition) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onPositionClick(position)
    }
  }, [onPositionClick])

  const onInitiallyExpandCbxChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const newOptions = notEmptyOverviewMapOptions.set('initiallyExpand', checked)
    updateOverviewMapOptions(newOptions)
  }, [notEmptyOverviewMapOptions, updateOverviewMapOptions])

  const translate = hooks.useTranslation(jimuUIDefaultMessages, mapDefaultMessages)
  const specifyOverviewMapPositionLabel = translate('specifyOverviewMapPosition')

  const positionInfos: PositionInfo[] = React.useMemo(() => {
    const topLeftPositionInfo: PositionInfo = {
      position: 'top-left',
      thumbnail: require('../assets/overview-map-top-left.svg'),
      label: translate('TL')
    }

    const topRightPositionInfo: PositionInfo = {
      position: 'top-right',
      thumbnail: require('../assets/overview-map-top-right.svg'),
      label: translate('TR')
    }

    const bottomLeftPositionInfo: PositionInfo = {
      position: 'bottom-left',
      thumbnail: require('../assets/overview-map-bottom-left.svg'),
      label: translate('BL')
    }

    const bottomRightPositionInfo: PositionInfo = {
      position: 'bottom-right',
      thumbnail: require('../assets/overview-map-bottom-right.svg'),
      label: translate('BR')
    }

    const isRTL = getAppStore().getState().appContext?.isRTL

    const result: PositionInfo[] = isRTL ? [
      topRightPositionInfo,
      topLeftPositionInfo,
      bottomRightPositionInfo,
      bottomLeftPositionInfo
    ] : [
      topLeftPositionInfo,
      topRightPositionInfo,
      bottomLeftPositionInfo,
      bottomRightPositionInfo
    ]

    return result
  }, [translate])

  const initiallyExpandToolLabel = translate('initiallyExpandTool')

  return (
    <div className='overview-map-setting' css={style}>
      <span className='set-om-pos-desc'>{specifyOverviewMapPositionLabel}</span>
      <div
        className='corner-container mt-4'
        role='group'
        aria-label={specifyOverviewMapPositionLabel}
      >
          {
            positionInfos.map((item) => {
              return (
                <div className='cell'>
                  <div
                    key={item.position}
                    tabIndex={0}
                    role='button'
                    aria-label={item.label}
                    className={classNames('thumbnail-container', { selected: position === item.position })}
                    onClick={() => { onPositionClick(item.position) }}
                    onKeyDown={(evt) => { onPositionKeyDown(evt, item.position) } }
                  >
                    <Image src={item.thumbnail} />
                  </div>
                  <Label>{item.label}</Label>
                </div>
              )
            })
          }
      </div>

      <Label className='d-flex align-items-center mt-5'>
        <Checkbox
          className='mr-2'
          style={{ cursor: 'pointer' }}
          checked={initiallyExpand}
          onChange={onInitiallyExpandCbxChange}
        />
        {initiallyExpandToolLabel}
      </Label>
    </div>
  )
}