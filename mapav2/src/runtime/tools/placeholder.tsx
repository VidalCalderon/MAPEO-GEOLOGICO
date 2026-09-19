import { React, css, classNames } from 'jimu-core'
import { Button, Icon } from 'jimu-ui'
import closeOutlined from 'jimu-icons/svg/outlined/editor/close.svg'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import type { HorizontalVertical } from '../layout/config'

export default class Placeholder extends BaseTool<BaseToolProps, unknown> {
  toolName = 'Placeholder'

  getTitle () {
    return ''
  }

  getIcon (): IconType {
    return null
  }

  getExpandPanel (): React.JSX.Element {
    return (
      <PlaceholderInner
        isCustomLayoutEditing={this.props.isCustomLayoutEditing}
        isFakeTool={this.props.isFakeTool}
        direction={this.props.direction}
        onRemoveTool={this.props.onRemoveTool}
      />
    )
  }
}

interface PlaceholderInnerProps {
  isCustomLayoutEditing: boolean
  isFakeTool: boolean
  direction: HorizontalVertical // If the layout is custom layout, direction is not null, otherwise direction is null (use default direction).
  onRemoveTool: () => void
}

class PlaceholderInner extends React.PureComponent<PlaceholderInnerProps, any> {
  constructor (props) {
    super(props)

    this.state = {}
  }

  getStyle () {
    let dividerWidth = '32px'
    let dividerHeight = '1px'

    if (this.props.direction === 'horizontal') {
      dividerWidth = '1px'
      dividerHeight = '32px'
    }

    return css`
      display: flex;

      .placeholder-divider {
        width: ${dividerWidth};
        height: ${dividerHeight};
        background: var(--sys-color-divider-primary);
      }

      .placeholder-content {
        position: relative;
        box-sizing: border-box;
        width: 32px;
        height: 32px;
        background: var(--sys-color-action);
        border: 1px solid #0AB;
        box-shadow: var(--sys-shadow-1);
      }

      &.placeholder-editing-mode.fake-placeholder {
        .placeholder-content {
          border-style: dashed;
        }
      }

      .remove-btn {
        display: none;
        pointer-events: auto !important;
        position: absolute;
        right: -6px;
        top: -6px;
        border-radius: 50%;

        .icon-btn-sizer {
          min-width: 10px;
          min-height: 10px;
        }
      }
    `
  }

  onRemoveClick = () => {
    if (this.props.onRemoveTool) {
      this.props.onRemoveTool()
    }
  }

  render () {
    const rootClassName = classNames('placeholder-map-tool', {
      'placeholder-editing-mode': this.props.isCustomLayoutEditing,
      'placeholder-live-mode': !this.props.isCustomLayoutEditing,
      'fake-placeholder': this.props.isFakeTool
    })

    return (
      <div className={rootClassName} css={this.getStyle()}>
        {
          this.props.isCustomLayoutEditing && this.props.isFakeTool && (
            <div className='placeholder-divider' />
          )
        }
        <div className='placeholder-content'>
          {
            this.props.isCustomLayoutEditing && !this.props.isFakeTool && (
              <Button
                className='remove-btn d-flex justify-content-center align-items-center p-0'
                size='sm'
                icon
                onClick={this.onRemoveClick}
              >
                <Icon size={8} icon={closeOutlined} />
              </Button>
            )
          }
        </div>
    </div>
    )
  }
}
