import { React, hooks, css, Immutable } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Switch, Radio, Label, Checkbox, NumericInput } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { type LocateOptions, type IMLocateOptions, type IMTrackConfig, getDefaultNotEmptyIMTrackConfig } from '../../config'

export interface LocateSettingProps {
  // null/undefined means automatic scale and no tracking
  locateOptions: IMLocateOptions
  onChange: (scaleBarOptions: IMLocateOptions) => void
}

export default function LocateSetting (props: LocateSettingProps) {
  const locateOptionsProp = props.locateOptions
  const onChangeProp = props.onChange

  // make sure finalLocateOptions is no empty
  const finalLocateOptions = React.useMemo(() => {
    let result = locateOptionsProp

    if (!result) {
      result = Immutable({} as LocateOptions)
    }

    return result
  }, [locateOptionsProp])

  const trackConfig = finalLocateOptions.track
  const watchLocationEnabled = !!trackConfig
  const notEmptyTrackConfig = React.useMemo(() => {
    let result = trackConfig

    if (!result) {
      result = getDefaultNotEmptyIMTrackConfig()
    }

    return result
  }, [trackConfig])

  const isCustomScale = typeof finalLocateOptions.scale === 'number'

  const updateLocateOptions = React.useCallback((newLocateOptions: IMLocateOptions) => {
    if (onChangeProp) {
      onChangeProp(newLocateOptions)
    }
  }, [onChangeProp])

  const updateTrackOptions = React.useCallback((newTrackConfig: IMTrackConfig) => {
    const newLocateOptions = finalLocateOptions.set('track', newTrackConfig)
    updateLocateOptions(newLocateOptions)
  }, [finalLocateOptions, updateLocateOptions])

  const onWatchLocationSwitchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    let newLocateOptions: IMLocateOptions = finalLocateOptions

    if (checked) {
      // enable track with default options
      const defaultTrackConfig = getDefaultNotEmptyIMTrackConfig()
      newLocateOptions = finalLocateOptions.set('track', defaultTrackConfig)
    } else {
      // disable track
      newLocateOptions = finalLocateOptions.set('track', null)
    }

    updateLocateOptions(newLocateOptions)
  }, [finalLocateOptions, updateLocateOptions])

  const onShowLocationRadioChanged = React.useCallback(() => {
    const newTrackConfig = notEmptyTrackConfig.set('locationOnlyStateEnabled', true)
    updateTrackOptions(newTrackConfig)
  }, [notEmptyTrackConfig, updateTrackOptions])

  const onStartInactiveRadioChanged = React.useCallback(() => {
    const newTrackConfig = notEmptyTrackConfig.set('locationOnlyStateEnabled', false)
    updateTrackOptions(newTrackConfig)
  }, [notEmptyTrackConfig, updateTrackOptions])

  const onCenterOnlyStateCbxChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const newTrackConfig = notEmptyTrackConfig.set('mapNorthUpStateEnabled', !!checked)

    // make sure at least one of mapNorthUpStateEnabled and mapRotateStateEnabled is true
    if (newTrackConfig.mapNorthUpStateEnabled || newTrackConfig.mapRotateStateEnabled) {
      updateTrackOptions(newTrackConfig)
    }
  }, [notEmptyTrackConfig, updateTrackOptions])

  const onCenterAndRotateStateCbxChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const newTrackConfig = notEmptyTrackConfig.set('mapRotateStateEnabled', !!checked)

    // make sure at least one of mapNorthUpStateEnabled and mapRotateStateEnabled is true
    if (newTrackConfig.mapNorthUpStateEnabled || newTrackConfig.mapRotateStateEnabled) {
      updateTrackOptions(newTrackConfig)
    }
  }, [notEmptyTrackConfig, updateTrackOptions])

  const onAutomaticInitialZoomRadioChanged = React.useCallback(() => {
    const newLocateOptions = finalLocateOptions.set('scale', null)
    updateLocateOptions(newLocateOptions)
  }, [finalLocateOptions, updateLocateOptions])

  const onCustomInitialZoomRadioChanged = React.useCallback(() => {
    const newLocateOptions = finalLocateOptions.set('scale', 5000)
    updateLocateOptions(newLocateOptions)
  }, [finalLocateOptions, updateLocateOptions])

  const onScaleNumberInputChange = React.useCallback((value: number) => {
    if (value > 0) {
      const newLocateOptions = finalLocateOptions.set('scale', value)
      updateLocateOptions(newLocateOptions)
    }
  }, [finalLocateOptions, updateLocateOptions])

  const domStyle = css`
  padding: 0 16px 16px 16px;

  .paper-text-color-setting-row {
    .jimu-widget-setting--row-label {
      color: var(--sys-color-surface-paper-text) !important;
    }
  }

  .paper-text-color {
    color: var(--sys-color-surface-paper-text) !important;
  }

  .track-location-desc,
  .locate-btn-behavior-desc {
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    color: var(--sys-color-surface-paper-hint);
  }

  .divider {
    height: 0;
    border-bottom: 1px solid var(--sys-color-divider-primary, #707070);
    transform: scaleX(1.2);
  }
  `

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  const trackLocationLabel = translate('trackLocation')
  const trackLocationDescLabel = translate('trackLocationDesc')
  const initialStateLabel = translate('initialState')
  const activeInitialStateDescLabel = translate('activeInitialStateDesc')
  const inactiveInitialStateDescLabel = translate('inactiveInitialStateDesc')
  const locateButtonBehaviorsLabel = translate('locateButtonBehaviors')
  const locateButtonBehaviorsDescLabel = translate('locateButtonBehaviorsDesc')
  const mapNorthUpDescLabel = translate('mapNorthUpDesc')
  const mapRotateDescLabel = translate('mapRotateDesc')
  const initialZoomScaleLabel = translate('initialZoomScale')
  const automaticLabel = translate('mapZoomToAction_Automatic')
  const customLabel = translate('mapZoomToAction_Custom')
  const typeScaleLabel = translate('mapZoomToAction_TypeScale')

  const trackLocDescId = React.useId()

  return (
    <div className='locate-setting' css={domStyle}>
      <SettingRow
        className='paper-text-color-setting-row'
        level={1} tag='label'
        label={trackLocationLabel}
      >
        <Switch
          aria-describedby={trackLocDescId}
          checked={watchLocationEnabled}
          onChange={onWatchLocationSwitchChange}
        />
      </SettingRow>

      <div id={trackLocDescId} className='track-location-desc mt-3 mb-4'>{trackLocationDescLabel}</div>

      {
        trackConfig && (
          <React.Fragment>
            <SettingRow className='paper-text-color-setting-row' level={3} label={initialStateLabel} flow='wrap' role='radiogroup'>
              <div className='initial-state-radios paper-text-color' role='radiogroup' aria-label={initialStateLabel}>
                <div className='initial-state-radio-container d-flex align-items-center'>
                  <Radio
                    id='show-location-radio'
                    name='initial-state'
                    checked={trackConfig.locationOnlyStateEnabled}
                    className='initial-state-radio'
                    onChange={onShowLocationRadioChanged}
                  />
                  <Label
                    for='show-location-radio'
                    className='ml-2 mb-0 initial-state-label'
                    aria-label={activeInitialStateDescLabel}
                  >
                    {activeInitialStateDescLabel}
                  </Label>
                </div>

                <div className='initial-state-radio-container d-flex align-items-center mt-3'>
                  <Radio
                    id='start-inactive-radio'
                    name='initial-state'
                    checked={!trackConfig.locationOnlyStateEnabled}
                    className='initial-state-radio'
                    onChange={onStartInactiveRadioChanged}
                  />
                  <Label
                    for='start-inactive-radio'
                    className='ml-2 mb-0 initial-state-label'
                    aria-label={inactiveInitialStateDescLabel}
                  >
                    {inactiveInitialStateDescLabel}
                  </Label>
                </div>
              </div>
            </SettingRow>

            <SettingRow
              className='paper-text-color-setting-row'
              level={3}
              label={locateButtonBehaviorsLabel}
              flow='wrap'
              role='group'
              aria-label={`${locateButtonBehaviorsLabel} ${locateButtonBehaviorsDescLabel}`}
            >
              <span className='locate-btn-behavior-desc'>{locateButtonBehaviorsDescLabel}</span>
              <Label className='paper-text-color d-flex align-items-center mb-0' style={{ marginTop: '10px' }}>
                <Checkbox
                  className='mr-2 center-only-state-cbx'
                  style={{ cursor: 'pointer' }}
                  checked={notEmptyTrackConfig.mapNorthUpStateEnabled}
                  disabled={notEmptyTrackConfig.mapNorthUpStateEnabled && !notEmptyTrackConfig.mapRotateStateEnabled}
                  onChange={onCenterOnlyStateCbxChange}
                />
                {mapNorthUpDescLabel}
              </Label>
              <Label className='paper-text-color d-flex align-items-center mb-0' style={{ marginTop: '10px' }}>
                <Checkbox
                  className='mr-2 center-and-rotate-state-cbx'
                  style={{ cursor: 'pointer' }}
                  checked={notEmptyTrackConfig.mapRotateStateEnabled}
                  disabled={notEmptyTrackConfig.mapRotateStateEnabled && !notEmptyTrackConfig.mapNorthUpStateEnabled}
                  onChange={onCenterAndRotateStateCbxChange}
                />
                {mapRotateDescLabel}
              </Label>
            </SettingRow>
          </React.Fragment>
        )
      }

      <div className='divider mt-4 mb-4'></div>

      <SettingRow level={1} label={initialZoomScaleLabel} flow='wrap' role='radiogroup'>
        <div className='initial-scale-radios w-100' role='radiogroup' aria-label={initialZoomScaleLabel}>
          <div className='initial-scale-radio-container d-flex align-items-center'>
            <Radio
              id='automatic-initial-scale-radio'
              name='initial-scale'
              checked={!isCustomScale}
              className='initial-scale-radio'
              onChange={onAutomaticInitialZoomRadioChanged}
            />
            <Label
              for='automatic-initial-scale-radio'
              className='ml-2 mb-0 initial-scale-label'
              aria-label={automaticLabel}
            >
              {automaticLabel}
            </Label>
          </div>

          <div className='initial-scale-radio-container d-flex align-items-center mt-2'>
            <Radio
              id='custom-initial-scale-radio'
              name='initial-scale'
              checked={isCustomScale}
              className='initial-scale-radio'
              onChange={onCustomInitialZoomRadioChanged}
            />
            <Label
              for='custom-initial-scale-radio'
              className='ml-2 mb-0 initial-scale-label'
              aria-label={customLabel}
            >
              {customLabel}
            </Label>
          </div>

          {
            isCustomScale &&
            <NumericInput
              className='w-100 mt-3'
              placeholder={typeScaleLabel}
              min={1}
              value={finalLocateOptions.scale}
              onChange={onScaleNumberInputChange}
            />
          }
        </div>
      </SettingRow>
    </div>
  )
}