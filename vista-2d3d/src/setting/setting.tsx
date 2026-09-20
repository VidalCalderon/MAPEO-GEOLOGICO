/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { type AllWidgetSettingProps } from 'jimu-for-builder'
import { SettingSection, SettingRow, MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import { Switch, Label } from 'jimu-ui'
import type { IMConfig } from '../config'

export default function Setting(props: AllWidgetSettingProps<IMConfig>) {
  const { id, useMapWidgetIds, config, onSettingChange } = props

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    onSettingChange({
      id: id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  const onToggleDynamic3D = (checked: boolean) => {
    onSettingChange({
      id: id,
      config: config.set('allowDynamic3D', checked)
    })
  }

  return (
    <div className="widget-setting-vista-2d3d p-3">
      <SettingSection title="Origen del Mapa">
        <SettingRow>
          <MapWidgetSelector
            onSelect={onMapWidgetSelected}
            useMapWidgetIds={useMapWidgetIds}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Configuración 3D">
        <SettingRow className="d-flex justify-content-between align-items-center">
          <Label className="m-0">Permitir Relieve 3D Dinámico:</Label>
          <Switch
            checked={config.allowDynamic3D !== false}
            onChange={(e) => onToggleDynamic3D(e.target.checked)}
          />
        </SettingRow>
      </SettingSection>
    </div>
  )
}
