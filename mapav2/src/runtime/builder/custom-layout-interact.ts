import { getAppStore, type IMWidgetJson } from 'jimu-core'
import { interact } from 'jimu-core/dnd'
import type { IMConfig } from '../../config'
import { moveMapToolToCustomLayoutPlacementDropzone, removePlaceholder, shouldRenderLeftBottomScalebarMapSwitcherGroup } from './custom-layout-utils'
import { getAppConfigAction } from 'jimu-for-builder'

export default class CustomLayoutInteract {
  widgetId: string
  container: HTMLElement
  draggableInteractable: Interact.Interactable
  dropzoneInteractable: Interact.Interactable

  updateConfig (newConfig: IMConfig) {
    if (newConfig) {
      getAppConfigAction().editWidgetConfig(this.widgetId, newConfig).exec()
    }
  }

  enableDragMode (mapWidgetId: string, container: HTMLElement) {
    this.widgetId = mapWidgetId
    this.disableDragMode()
    this.container = container
    this.createDraggableInteractable()
    this.createDropzoneInteractable()
  }

  /**
   * Configure draggable elements
   * drag callbacks flow:
   * drag item outside dropzone
   * 1. draggable start
   * 2. dropzone ondragenter
   * 3. dropzone ondragleave
   *
   * drag item into dropzone
   * 4. dropzone ondragenter
   * 5. dropzone ondrop
   * 6. draggable end
   */
  createDraggableInteractable () {
    this.releaseDraggableInteractable()

    // only handle elements in current
    this.draggableInteractable = interact('.draggable-map-tool-shell')
    this.draggableInteractable.draggable({
      // Enable inertia (optional, disabled here for precise control)
      inertia: false,
      autoScroll: true,
      listeners: {
        start: (event) => {
          // Add the "dragging" style class
          event.target.classList.add('is-dragging')
          // Mark the element as not successfully dropped yet
          // event.target.dataset.dropped = 'false'
        },

        /**
         * Drag move handler
         * Updates the visual position of the element (via transform)
         */
        move: (event) => {
          const target = event.target
          // Accumulate previous distance with current delta
          const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
          const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

          // Apply CSS transform for translation
          target.style.transform = `translate(${x}px, ${y}px)`

          // Update data attributes to persist current position
          target.setAttribute('data-x', x)
          target.setAttribute('data-y', y)
        },

        /**
        * Drag end handler
        */
        end: (event) => {
          const target = event.target
          target.classList.remove('is-dragging')

          // Clear transform to let element return to original DOM position via CSS layout
          target.style.transform = 'translate(0px, 0px)'
          target.setAttribute('data-x', 0)
          target.setAttribute('data-y', 0)
        }
      }
    })
  }

  /**
   * Configure dropzone
   */
  createDropzoneInteractable () {
    this.releaseDropzoneInteractable()

    // only handle elements in current
    this.dropzoneInteractable = interact('.custom-layout-map-tool-dropzone')
    this.dropzoneInteractable.dropzone({
      // Only accept elements with class .draggable-map-tool-shell
      accept: '.draggable-map-tool-shell',

      // only trigger drop when the intersection area exceeds 10% of the dragged element
      // 10% make it easier to drag a horizontal SelectState into a vertical dropzone or vice versa
      overlap: 0.1,

      // Listen for drag enter
      ondragenter: (event) => {
        // const draggableElement = event.relatedTarget
        const dropzoneElement = event.target

        // highlight in yellow on drag enter
        this.addHighlightClassName(dropzoneElement)
      },

      // Listen for drag leave
      ondragleave: (event) => {
        // Remove highlight
        this.removeHighlightClassName(event.target)
      },

      // Listen for drop (fires only when overlap >= 75%)
      ondrop: (event) => {
        const draggedElement = event.relatedTarget
        const newDropzoneElement = event.target
        const dragEvent = event.dragEvent

        // remove highlight
        this.removeHighlightClassName(newDropzoneElement)

        // get placement info
        const draggedToolName: string = draggedElement.getAttribute('map-tool-name')
        const oldDropzoneGroupName: string = draggedElement.getAttribute('parent-group-name')
        const draggedToolIndexInOldDropzone: number = parseInt(draggedElement.getAttribute('index-in-group'))
        const newDropzoneGroupName: string = newDropzoneElement.getAttribute('map-group-name')
        const widgetJson = this.getWidgetJson()
        let config = widgetJson?.config as IMConfig
        const layoutPlacement = config?.customLayoutPlacement?.asMutable({ deep: true })

        if (!draggedToolName || !newDropzoneGroupName || !dragEvent || !config || !layoutPlacement) {
          return
        }

        // Compute insertion position
        // Get all draggable children in the dropzone (exclude the one being dragged if it's already inside)
        // Determine insertion point by mouse position
        const domChildren = Array.from(newDropzoneElement.querySelectorAll('.draggable-map-tool-shell')).filter(el => el !== draggedElement) as HTMLElement[]

        // Get the dropzone flex direction to decide whether to compare X or Y axis
        const style = window.getComputedStyle(newDropzoneElement)
        const flexDir = style.flexDirection // row, column, row-reverse, column-reverse

        // new order: -> draggableElement -> insertBeforeElement
        let insertBeforeElement: HTMLElement = null
        let draggedToolIndexInNewDropzone: number = null

        // corner dropzone can only have one element, no need to compute insert position
        const isCornerDropzone = newDropzoneGroupName.toLowerCase().includes('corner')

        if (isCornerDropzone) {
          // corner dropzone
          draggedToolIndexInNewDropzone = 0
        } else {
          // not corner dropzone, compute insert position
          // Get mouse position on the page
          const mouseClientX = dragEvent.clientX
          const mouseClientY = dragEvent.clientY

          // Iterate children to find the first element "after the mouse"
          for (let i = 0; i < domChildren.length; i++) {
            const child = domChildren[i]
            const rect = child.getBoundingClientRect()
            const childCenterX = rect.left + rect.width / 2
            const childCenterY = rect.top + rect.height / 2

            let isChildAfterDraggableElement = false

            if (flexDir === 'row') {
              // Left to right: if mouse X < element center X, insert before this element
              if (mouseClientX < childCenterX) {
                isChildAfterDraggableElement = true
              }
            } else if (flexDir === 'row-reverse') {
              // Right to left: if mouse X > element center X, insert before this element (visually after)
              if (mouseClientX > childCenterX) {
                isChildAfterDraggableElement = true
              }
            } else if (flexDir === 'column') {
              // Top to bottom: if mouse Y < element center Y
              if (mouseClientY < childCenterY) {
                isChildAfterDraggableElement = true
              }
            } else if (flexDir === 'column-reverse') {
              // Bottom to top: if mouse Y > element center Y
              if (mouseClientY > childCenterY) {
                isChildAfterDraggableElement = true
              }
            }

            if (isChildAfterDraggableElement) {
              insertBeforeElement = child
              break
            }
          }

          if (insertBeforeElement) {
            draggedToolIndexInNewDropzone = parseInt(insertBeforeElement.getAttribute('index-in-group'))
          }
        }

        // Reset transform since we actually move DOM node
        draggedElement.style.transform = 'translate(0px, 0px)'
        draggedElement.setAttribute('data-x', 0)
        draggedElement.setAttribute('data-y', 0)

        // Update config to reflect new placement
        config = moveMapToolToCustomLayoutPlacementDropzone({
          config,
          useDataSources: widgetJson.useDataSources,
          draggedToolName,
          oldDropzoneGroupName,
          draggedToolIndexInOldDropzone,
          newDropzoneGroupName,
          draggedToolIndexInNewDropzone
        })
        this.updateConfig(config)
      }
    })
  }

  disableDragMode () {
    this.releaseDraggableInteractable()
    this.releaseDropzoneInteractable()
    this.container = null
  }

  releaseDraggableInteractable () {
    if (this.draggableInteractable) {
      this.draggableInteractable.unset()
      this.draggableInteractable = null
    }
  }

  releaseDropzoneInteractable () {
    if (this.dropzoneInteractable) {
      this.dropzoneInteractable.unset()
      this.dropzoneInteractable = null
    }
  }

  getAppConfig () {
    return getAppStore().getState()?.appConfig
  }

  getWidgetJson (): IMWidgetJson {
    const appConfig = this.getAppConfig()
    const widgetJson = appConfig?.widgets?.[this.widgetId]
    return widgetJson
  }

  addHighlightClassName (dropzoneElement: HTMLElement) {
    if (!dropzoneElement) {
      return
    }

    const highlightDom = this.getHighlightDom(dropzoneElement)
    ;(dropzoneElement as any).__highlightDom = highlightDom

    if (highlightDom) {
      highlightDom.classList.add('drop-target-highlight')
    }
  }

  removeHighlightClassName (dropzoneElement: HTMLElement) {
    if (!dropzoneElement) {
      return
    }

    const highlightDom = (dropzoneElement as any).__highlightDom
    ;(dropzoneElement as any).__highlightDom = null

    if (highlightDom) {
      highlightDom.classList.remove('drop-target-highlight')
    }
  }

  getHighlightDom (dropzoneElement: HTMLElement): HTMLElement {
    if (!dropzoneElement) {
      return null
    }

    let result: HTMLElement = null

    const isLbCornerDropzone = dropzoneElement.classList.contains('custom-layout-lb-corner-dropzone-group')
    const isLbHorizontalDropzone = dropzoneElement.classList.contains('custom-layout-lb-horizontal-group')
    const isLbVerticalDropzone = dropzoneElement.classList.contains('custom-layout-lb-vertical-group')

    if (isLbCornerDropzone || isLbHorizontalDropzone || isLbVerticalDropzone) {
      // left bottom
      const widgetJson = this.getWidgetJson()
      const areLbDropzonesConnected = !shouldRenderLeftBottomScalebarMapSwitcherGroup(widgetJson?.config, widgetJson?.useDataSources)

      if (areLbDropzonesConnected) {
        // connected, highlight the main group
        if (isLbCornerDropzone) {
          result = dropzoneElement.parentElement?.parentElement
        } else {
          result = dropzoneElement.parentElement
        }
      } else {
        // not connected, highlight the dropzone itself
        result = dropzoneElement
      }
    } else {
      // left top, right top, right bottom
      result = dropzoneElement.parentElement
    }

    return result
  }

  removePlaceholder (dropzoneGroupName: string, placeholderIndexInDropzone: number) {
    const widgetJson = this.getWidgetJson()
    let config = widgetJson?.config as IMConfig

    if (!config) {
      return
    }

    config = removePlaceholder({
      config,
      useDataSources: widgetJson.useDataSources,
      dropzoneGroupName,
      placeholderIndexInDropzone
    })

    this.updateConfig(config)
  }
}
