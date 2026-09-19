/** @jsx jsx */
import { React, type AllWidgetProps, jsx, css, type SerializedStyles } from 'jimu-core'
import { WidgetPlaceholder } from 'jimu-ui'
import { FlexRowLayoutViewer } from 'jimu-layouts/layout-runtime'
import type { IMFlexRowConfig } from '../config'
import defaultMessages from './translations/default'

const IconImage = require('../../icon.svg')

export default class Widget extends React.PureComponent<AllWidgetProps<IMFlexRowConfig>> {
  getStyle (): SerializedStyles {
    return css`
      background-color: transparent !important;
      
      /* Collapse layout items if their child widget is hidden or empty */
      .layout-item:has(.d-none),
      .layout-item:has([style*="display: none"]),
      .layout-item:has([style*="display:none"]),
      .layout-item:has([style*="visibility: hidden"]),
      .layout-item:has([style*="visibility:hidden"]),
      .layout-item[style*="visibility: hidden"],
      .layout-item[style*="visibility:hidden"],
      .layout-item[style*="display: none"],
      .layout-item[style*="display:none"],
      .layout-item:empty {
        display: none !important;
      }

      /* Same for ExB specific flex items */
      .flex-item:has(.d-none),
      .flex-item:has([style*="display: none"]),
      .flex-item:has([style*="display:none"]),
      .flex-item:has([style*="visibility: hidden"]),
      .flex-item:has([style*="visibility:hidden"]),
      .flex-item[style*="visibility: hidden"],
      .flex-item[style*="visibility:hidden"],
      .flex-item[style*="display: none"],
      .flex-item[style*="display:none"],
      .flex-item:empty {
        display: none !important;
      }
      
      & > div.flex-row-layout {
        height: 100%;
        overflow: hidden;
        display: flex;
        background-color: transparent !important;

        & > .trail-container {
          height: 100%;
          overflow: hidden;
          background-color: transparent !important;
        }
      }
    `
  }

  render () {
    const { layouts, id, intl, builderSupportModules } = this.props
    const LayoutComponent = !window.jimuConfig.isInBuilder
      ? FlexRowLayoutViewer
      : builderSupportModules.widgetModules.FlexRowLayoutBuilder

    if (LayoutComponent == null) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          No layout component!
        </div>
      )
    }
    const layoutName = Object.keys(layouts)[0]

    return (
      <div 
        className={`widget-flex-row-layout w-100 h-100 ${this.props.className || ''}`} 
        css={this.getStyle()} 
        style={{ overflow: 'auto', ...this.props.style }}
      >
        <LayoutComponent layouts={layouts[layoutName]}>
          <WidgetPlaceholder
            icon={IconImage} widgetId={id}
            style={{
              border: 'none',
              height: '100%',
              pointerEvents: 'none',
              position: 'absolute',
              backgroundColor: 'transparent'
            }}
            name={intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })}
          />
        </LayoutComponent>
      </div>
    )
  }
}
