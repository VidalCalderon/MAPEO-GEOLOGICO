import { React } from 'jimu-core'

// Mock Esri modules that fail under Jest/JSDOM environment
jest.mock('esri/views/SceneView', () => {
  return jest.fn().mockImplementation(() => ({}))
}, { virtual: true })

jest.mock('esri/Ground', () => {
  return jest.fn().mockImplementation(() => ({}))
}, { virtual: true })

jest.mock('esri/layers/ElevationLayer', () => {
  return jest.fn().mockImplementation(() => ({}))
}, { virtual: true })

jest.mock('esri/Map', () => {
  return jest.fn().mockImplementation(() => ({
    layers: {
      map: jest.fn().mockReturnValue({
        toArray: jest.fn().mockReturnValue([])
      })
    }
  }))
}, { virtual: true })

import _Widget from '../src/runtime/widget'
import { widgetRender, wrapWidget } from 'jimu-for-test'

const render = widgetRender()
describe('test vista-2d3d widget', () => {
  it('renders without crashing', () => {
    const Widget = wrapWidget(_Widget, {
      config: { allowDynamic3D: true }
    })
    const { container } = render(<Widget widgetId="Widget_1" />)
    expect(container.querySelector('.widget-vista-2d3d')).toBeTruthy()
  })
})
