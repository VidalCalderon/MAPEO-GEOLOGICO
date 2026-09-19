import * as customLayoutUtils from './builder/custom-layout-utils'
import CustomLayoutInteract from './builder/custom-layout-interact'
import { getInlineEditingLayoutStyle } from './builder/custom-layout-style'

export type {
  customLayoutUtils,
  CustomLayoutInteract,
  getInlineEditingLayoutStyle
}

// These modules are rejected into map widget runtime as props.builderSupportModules.widgetModules only in builder mode.
export default { customLayoutUtils, CustomLayoutInteract, getInlineEditingLayoutStyle }