import { getRuntimeAppConfig } from '../utils'

export function overrideCalciteStyleWhenArcGISReady (
  mapToolComponent: HTMLArcgisHomeElement | HTMLArcgisZoomElement | HTMLArcgisLocateElement | HTMLArcgisNavigationToggleElement,
  listener: () => void
): __esri.Handle | null {
  mapToolComponent.addEventListener('arcgisReady', listener, false)

  const handle: __esri.Handle = {
    remove () {
      mapToolComponent.removeEventListener('arcgisReady', listener, false)
    }
  }

  return handle
}

export function overrideCalciteStyle (mapToolComponent: HTMLArcgisHomeElement | HTMLArcgisZoomElement | HTMLArcgisLocateElement): __esri.Handle | null {
  const isInBuilder = window.jimuConfig?.isInBuilder
  const fontSizeChanged = doesRootFontSizeChanged()

  // for builder app, we always override calcite style even rem not changed because user can change it later
  // for launched app, we only override calcite style when rem changed for safety
  const shouldOverrideCalciteStyle = isInBuilder || fontSizeChanged

  if (!shouldOverrideCalciteStyle) {
    return null
  }

  function listener () {
    try {
      if (!mapToolComponent.shadowRoot) {
        return
      }

      const calciteBtns = Array.from(mapToolComponent.shadowRoot.querySelectorAll('calcite-button'))
      calciteBtns.forEach(calciteBtn => {
        if (!calciteBtn.shadowRoot) {
          return
        }

        const style = document.createElement('style')
        style.innerHTML = `
          button {
            --calcite-internal-button-padding-x: 7px !important;
            inline-size: 32px !important;
            min-block-size: 32px !important;
          }
        `
        calciteBtn.shadowRoot.appendChild(style)
      })
    } catch (e) {
      console.error('overrideCalciteStyle error', e)
    }
  }

  return overrideCalciteStyleWhenArcGISReady(mapToolComponent, listener)
}


function doesRootFontSizeChanged (): boolean {
  try {
    const appConfig = getRuntimeAppConfig()
    const htmlFontSize = appConfig?.customThemeOptions?.ref?.typeface?.htmlFontSize // new theme
    const fontSizeRoot = appConfig?.customTheme?.typography?.fontSizeRoot // old theme
    const remFontSize = htmlFontSize || fontSizeRoot

    if (remFontSize && typeof remFontSize === 'string' && remFontSize !== '100%') {
      return true
    }
  } catch (e) {
    console.error('doesRootFontSizeChanged error', e)
  }

  return false
}