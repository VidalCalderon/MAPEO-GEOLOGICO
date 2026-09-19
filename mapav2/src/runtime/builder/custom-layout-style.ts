/* eslint-disable @typescript-eslint/naming-convention */
export function getInlineEditingLayoutStyle (isRTL: boolean): string {
  // inline editing style
  const dashBorder = '2px dashed #0AB'
  let borderLeftNone = 'border-left: none;'
  let borderRightNone = 'border-right: none;'
  let paddingLeft = 'padding-left'
  let left = 'left'
  let right = 'right'
  let transformTranslateX_8px = 'transform: translateX(-8px);'
  const padding8px = 'padding: 8px;'
  let paddingLeft0pxImportant = 'padding-left: 0px !important;'
  let paddingRight0pxImportant = 'padding-right: 0px !important;'
  let paddingLeft8px = 'padding-left: 8px;'
  let paddingRight8px = 'padding-right: 8px;'
  const paddingTop0pxImportant = 'padding-top: 0px !important;'
  const paddingBottom0pxImportant = 'padding-bottom: 0px !important;'
  const paddingTop8px = 'padding-top: 8px;'
  const paddingBottom8px = 'padding-bottom: 8px;'
  let marginLeft8px = 'margin-left: 8px;'
  let marginRight8px = 'margin-right: 8px;'
  const marginTop8px = 'margin-top: 8px;'
  const marginBottom8px = 'margin-bottom: 8px;'
  const minSize = '48px'
  const justifyContentCenterImportant = 'justify-content: center !important;'
  const alignItemsCenterImportant = 'align-items: center !important;'
  let flexDirectionRow = 'flex-direction: row;'
  let flexDirectionRowReverse = 'flex-direction: row-reverse;'

  if (isRTL) {
    borderLeftNone = 'border-right: none;'
    borderRightNone = 'border-left: none;'
    paddingLeft = 'padding-right'
    left = 'right'
    right = 'left'
    transformTranslateX_8px = 'transform: translateX(8px);'
    paddingLeft0pxImportant = 'padding-right: 0px;'
    paddingRight0pxImportant = 'padding-left: 0px;'
    paddingLeft8px = 'padding-right: 8px;'
    paddingRight8px = 'padding-left: 8px;'
    marginLeft8px = 'margin-right: 8px;'
    marginRight8px = 'margin-left: 8px;'
    flexDirectionRow = 'flex-direction: row-reverse;'
    flexDirectionRowReverse = 'flex-direction: row;'
  }

  const inlineEditingStyle = `
  /* size & padding */
  .custom-layout-map-tool-dropzone {
    min-width: ${minSize};
    min-height: ${minSize};
  }

  .custom-layout-lt-group {
    ${left}: 5px !important;
    top: 5px !important;

    .custom-layout-lt-corner-group {
      ${padding8px}
      ${justifyContentCenterImportant}
      ${alignItemsCenterImportant}
    }

    .custom-layout-horizontal-group {
      ${paddingLeft0pxImportant}
    }

    .custom-layout-vertical-group {
      ${paddingTop0pxImportant}
    }
  }

  .custom-layout-rt-group {
    ${right}: 5px !important;
    top: 5px !important;

    .custom-layout-rt-corner-group {
      ${padding8px}
      ${justifyContentCenterImportant}
      ${alignItemsCenterImportant}
    }

    .custom-layout-horizontal-group {
      ${paddingRight0pxImportant}
    }

    .custom-layout-vertical-group {
      ${paddingTop0pxImportant}
    }
  }

  .custom-layout-rb-group {
    ${right}: 5px !important;
    bottom: 20px !important;

    .custom-layout-rb-corner-group {
      ${padding8px}
      ${justifyContentCenterImportant}
      ${alignItemsCenterImportant}
    }

    .custom-layout-horizontal-group {
      ${paddingRight0pxImportant}
    }

    .custom-layout-vertical-group {
      ${paddingBottom0pxImportant}
    }
  }

  .custom-layout-lb-group {
    .custom-layout-lb-corner-dropzone-group {
      ${padding8px}
      ${justifyContentCenterImportant}
      ${alignItemsCenterImportant}
    }

    .custom-layout-horizontal-group {
      ${paddingLeft0pxImportant}
    }

    .custom-layout-vertical-group {
      ${paddingBottom0pxImportant}
    }
  }

  .custom-layout-horizontal-group.custom-layout-map-tool-dropzone {
    min-width: 200px;
    min-height: ${minSize};
    ${paddingTop8px}
    ${paddingBottom8px}
  }

  .custom-layout-vertical-group.custom-layout-map-tool-dropzone {
    min-height: 200px;
    min-width: ${minSize};
    ${paddingLeft8px}
    ${paddingRight8px}
  }

  /* background */
  .custom-layout-map-tool-dropzone {
    background-color: rgba(0, 170, 187, 0.20);
    transition: background-color 0.3s;
  }

  .drop-target-highlight {
    .custom-layout-map-tool-dropzone {
      background-color: rgba(0, 170, 187, 0.40); !important;
    }
  }
  .drop-target-highlight.custom-layout-map-tool-dropzone {
    background-color: rgba(0, 170, 187, 0.40); !important;
  }

  /* dash border */
  .custom-layout-corner-group,
  .custom-layout-horizontal-group,
  .custom-layout-vertical-group,
  .custom-layout-horizontal-border-line-group,
  .custom-layout-vertical-border-line-group {
    border: ${dashBorder};
  }

  .custom-layout-lt-group {
    .custom-layout-corner-group {
      ${borderRightNone}
      border-bottom: none;
    }

    .custom-layout-horizontal-group {
      ${borderLeftNone}
      border-bottom: none;
    }

    .custom-layout-vertical-group {
      border-top: none;
      ${borderRightNone}
    }

    .custom-layout-horizontal-border-line-group {
      ${borderLeftNone}
      ${borderRightNone}
      border-bottom: none;
    }

    .custom-layout-vertical-border-line-group {
      ${borderRightNone}
      border-top: none;
      border-bottom: none;
    }
  }

  .custom-layout-rt-group {
    .custom-layout-corner-group {
      ${borderLeftNone}
      border-bottom: none;
    }

    .custom-layout-horizontal-group {
      ${borderRightNone}
      border-bottom: none;
    }

    .custom-layout-vertical-group {
      border-top: none;
      ${borderLeftNone}
    }

    .custom-layout-horizontal-border-line-group {
      ${borderLeftNone}
      ${borderRightNone}
      border-bottom: none;
    }

    .custom-layout-vertical-border-line-group {
      ${borderLeftNone}
      border-top: none;
      border-bottom: none;
    }
  }

  .custom-layout-rb-group {
    .custom-layout-corner-group {
      ${borderLeftNone}
      border-top: none;
    }

    .custom-layout-horizontal-group {
      ${borderRightNone}
      border-top: none;
    }

    .custom-layout-vertical-group {
      border-bottom: none;
      ${borderLeftNone}
    }

    .custom-layout-horizontal-border-line-group {
      ${borderLeftNone}
      ${borderRightNone}
      border-top: none;
    }

    .custom-layout-vertical-border-line-group {
      ${borderLeftNone}
      border-top: none;
      border-bottom: none;
    }
  }

  .custom-layout-lb-group {
    .custom-layout-corner-group {
      ${borderRightNone}
      border-top: none;
    }

    .custom-layout-horizontal-group {
      ${borderLeftNone}
      border-top: none;
    }

    .custom-layout-vertical-group {
      border-bottom: none;
      ${borderRightNone}
    }

    .custom-layout-horizontal-border-line-group {
      ${borderLeftNone}
      ${borderRightNone}
      border-top: none;
    }

    .custom-layout-vertical-border-line-group {
      ${borderRightNone}
      border-top: none;
      border-bottom: none;
    }
  }

  /* special case for left bottom group */
  &.render-scalebar-mapswitcher-group {
    .custom-layout-lb-group {
      .custom-layout-lb-corner-dropzone-group {
        display: none !important;
      }

      .custom-layout-horizontal-border-line-group,.custom-layout-vertical-border-line-group {
        display: none !important;
      }

      .custom-layout-lb-corner-group {
        border: none !important;
      }

      .custom-layout-horizontal-group {
        ${paddingLeft}: 8px !important;
        transform: translateY(8px);
        border: ${dashBorder} !important;
      }

      .custom-layout-vertical-group {
        padding-bottom: 8px !important;
        ${transformTranslateX_8px}
        border: ${dashBorder} !important;
      }
    }
  }

  &.not-render-scalebar-mapswitcher-group {
    .custom-layout-lb-group {
      ${left}: 5px !important;
      bottom: 20px !important;

      .custom-layout-lb-scalebar-mapswitcher-group {
        display: none !important;
      }
    }
  }

  /* placeholder */
  .exbmap-ui-tool-shell-Placeholder:hover {
    .placeholder-map-tool {
      &.placeholder-editing-mode.fake-placeholder {
        .placeholder-content {
          opacity: 0.85;
        }
      }

      .remove-btn {
        display: block;
      }
    }
  }
  .custom-layout-lt-horizontal-group.custom-layout-map-tool-dropzone,
  .custom-layout-lb-horizontal-group.custom-layout-map-tool-dropzone {
    .placeholder-map-tool {
      ${flexDirectionRow}
      .placeholder-divider {
        ${marginRight8px}
      }
    }
  }

  .custom-layout-rt-horizontal-group.custom-layout-map-tool-dropzone,
  .custom-layout-rb-horizontal-group.custom-layout-map-tool-dropzone {
    .placeholder-map-tool {
      ${flexDirectionRowReverse}
      .placeholder-divider {
        ${marginLeft8px}
      }
    }
  }

  .custom-layout-lt-vertical-group.custom-layout-map-tool-dropzone,
  .custom-layout-rt-vertical-group.custom-layout-map-tool-dropzone {
    .placeholder-map-tool {
      flex-direction: column;
      .placeholder-divider {
        ${marginBottom8px}
      }
    }
  }

  .custom-layout-lb-vertical-group.custom-layout-map-tool-dropzone,
  .custom-layout-rb-vertical-group.custom-layout-map-tool-dropzone {
    .placeholder-map-tool {
      flex-direction: column-reverse;
      .placeholder-divider {
        ${marginTop8px}
      }
    }
  }
  `

  return inlineEditingStyle
}
