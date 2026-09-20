import React from 'react'
import { AllWidgetSettingProps } from 'jimu-for-builder'
import { IMConfig } from '../config'
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const onMapWidgetIdsChange = (useMapWidgetIds: string[]) => {
    props.onSettingChange({
      id: props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  return (
    <div className="widget-setting-mapa-base p-3">
      <SettingSection title="Vincular con Mapa">
        <SettingRow>
          <div className="w-100">
            <p style={{ fontSize: '13px', color: 'var(--dark-600)', marginBottom: '8px', lineHeight: '1.4' }}>
              Seleccione el widget de mapa que controlará este selector de mapas base de Google:
            </p>
            <MapWidgetSelector
              onSelect={onMapWidgetIdsChange}
              useMapWidgetIds={props.useMapWidgetIds}
            />
          </div>
        </SettingRow>
      </SettingSection>
    </div>
  )
}

export default Setting
