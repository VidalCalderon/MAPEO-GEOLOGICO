/** @jsx jsx */
import { React, css, jsx, classNames } from 'jimu-core'
import { Button, Icon, defaultMessages } from 'jimu-ui'
import { BaseTool, type BaseToolProps, type IconType } from '../../layout/base/base-tool'
import { SelectedNumber } from './selected-number'
import { HorizontalVertical } from '../../layout/config'

const SelectZoomtoIcon = require('../../assets/icons/select-tool/select-zoomto.svg')
const SelectClearIcon = require('jimu-icons/svg/outlined/editor/clear-selection-general.svg')

interface States {
  selectedGraphicCount: number
}

export default class SelectState extends BaseTool<BaseToolProps, States> {
  toolName = 'SelectState'

  constructor (props) {
    super(props)

    this.state = {
      selectedGraphicCount: 0
    }
  }

  getPcStyle () {
    return css`
      border-radius: 0;
      text-wrap: nowrap;

      &.vertical-direction {
        writing-mode: sideways-rl;
        padding: 16px 4px !important;
      }
    `
  }

  getMobileStyle () {
    return css`
      background-color: var(--sys-color-surface-overlay);
      color: var(--sys-color-surface-overlay-text);
    `
  }

  getTitle () {
    return ''
  }

  getIcon (): IconType {
    return null
  }

  handleSelectedGraphicsChanged = (selectedGraphicCount: number) => {
    this.setState({
      selectedGraphicCount
    })
  }

  onZoomToSelectedFeaturesKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        this.zoomToSelectedFeatures()
      }
    }
  }

  zoomToSelectedFeatures = async () => {
    const view = this.props.jimuMapView?.view

    if (view) {
      const graphics = await this.getSelectedGraphics()

      if (graphics.length > 0) {
        view.goTo(graphics)
      }
    }
  }

  async getSelectedGraphics () {
    let selectedGraphics = []

    if (this.props.jimuMapView) {
      selectedGraphics = await this.props.jimuMapView.getSelectedFeatures()
    }

    return selectedGraphics
  }

  onClearSelectedFeaturesKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        this.clearSelectedFeatures()
      }
    }
  }

  clearSelectedFeatures = async () => {
    const jimuMapView = this.props.jimuMapView

    if (jimuMapView) {
      try {
        const updateSelection = false
        await jimuMapView.cancelSelectByQuery(updateSelection)
      } catch (e) {
        console.error(`jimuMapView.cancelSelectByQuery() error, jimuMapViewId: ${jimuMapView.id}`, e)
      }

      setTimeout(() => {
        jimuMapView.clearSelectedFeatures()
      }, 200)
    }
  }

  getExpandPanel (): React.JSX.Element {
    const direction = this.props.direction || HorizontalVertical.Horizontal
    const isHorizontal = direction !== HorizontalVertical.Vertical
    const selectedFeaturesTip = this.props.intl.formatMessage({ id: 'SelectionSelectedFeatures', defaultMessage: defaultMessages.SelectionSelectedFeatures })
    const clearSelectionTitle = this.props.intl.formatMessage({ id: 'clearSelection', defaultMessage: defaultMessages.clearSelection })
    const zoomToSelectedFeaturesTip = this.props.intl.formatMessage({ id: 'SelectionZoomToSelectedFeatures', defaultMessage: defaultMessages.SelectionZoomToSelectedFeatures })
    const selectedFeaturesCountLabel = `${selectedFeaturesTip}: ${this.state.selectedGraphicCount}`

    if (this.props.isMobile) {
      return (
        <div
          className='mobile-select-state-map-tool w-100 d-flex justify-content-between align-items-center'
          css={this.getMobileStyle()}
          style={{ height: '40px' }}
          aria-label={selectedFeaturesCountLabel}
        >
          <div className='ml-2'>{selectedFeaturesCountLabel}</div>
          <div className='d-flex'>
            <div className='border-left' style={{ width: '0px', marginRight: '10px' }} />
            <div
              title={zoomToSelectedFeaturesTip}
              className='h-100 d-flex justify-content-center align-items-center'
              style={{ width: '20px', cursor: 'pointer' }}
              role='button'
              tabIndex={0}
              aria-label={zoomToSelectedFeaturesTip}
              onClick={this.zoomToSelectedFeatures}
              onKeyDown={this.onZoomToSelectedFeaturesKeyDown}
            >
              <Icon size={18} icon={SelectZoomtoIcon} />
            </div>
            <div className='border-left' style={{ width: '0px', marginLeft: '10px', marginRight: '10px' }} />
            <div
              title={clearSelectionTitle}
              className='h-100 d-flex justify-content-center align-items-center'
              style={{ width: '20px', marginRight: '4px', cursor: 'pointer' }}
              role='button'
              tabIndex={0}
              aria-label={clearSelectionTitle}
              onClick={this.clearSelectedFeatures}
              onKeyDown={this.onClearSelectedFeaturesKeyDown}
            >
              <Icon size={18} icon={SelectClearIcon} />
            </div>
          </div>
          <SelectedNumber jimuMapView={this.props.jimuMapView} onSelectedGraphicsChanged={this.handleSelectedGraphicsChanged} />
        </div>
      )
    } else {
      return (
        <React.Fragment>
          <Button
            className={classNames('pc-select-state-map-tool border-0', { 'horizontal-direction': isHorizontal, 'vertical-direction': !isHorizontal })}
            css={this.getPcStyle()}
            onClick={this.zoomToSelectedFeatures}
            title={zoomToSelectedFeaturesTip}
          >
            <Icon size={16} icon={SelectZoomtoIcon} className={classNames(isHorizontal ? 'mr-2' : 'mr-0 mb-2')} />
            <span>{selectedFeaturesCountLabel}</span>
          </Button>
          <SelectedNumber jimuMapView={this.props.jimuMapView} onSelectedGraphicsChanged={this.handleSelectedGraphicsChanged} />
        </React.Fragment>
      )
    }
  }
}
