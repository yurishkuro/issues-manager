import { loadConfig } from '../src/load-config'
import * as fs from 'fs'
import * as yaml from 'js-yaml'

jest.mock('fs')
jest.mock('js-yaml')

describe('loadConfig', () => {
  const mockYamlData = {
    states: [
      {
        description: 'Test State',
        label: 'test-state',
        transitions: [
          {
            description: 'Test Transition',
            conditions: [
              {
                type: 'label',
                label: 'test-label'
              }
            ],
            actions: [
              {
                type: 'add-label',
                label: 'added-label'
              }
            ]
          }
        ]
      }
    ]
  }

  let readFileSyncMock: jest.Mock
  let yamlLoadMock: jest.Mock

  beforeEach(() => {
    jest.resetAllMocks()

    readFileSyncMock = fs.readFileSync as jest.Mock
    readFileSyncMock.mockReturnValue('mock file content')

    yamlLoadMock = yaml.load as jest.Mock
    yamlLoadMock.mockReturnValue(mockYamlData)
  })

  it('should load and parse a YAML file correctly', () => {
    const config = loadConfig('test.yml')
    expect(fs.readFileSync).toHaveBeenCalledWith('test.yml', 'utf8')
    expect(yaml.load).toHaveBeenCalledWith('mock file content')
    expect(config).toEqual(mockYamlData)
  })

  it('should throw error if the file cannot be read', () => {
    readFileSyncMock.mockImplementation(() => {
      throw new Error('File read error')
    })
    expect(() => loadConfig('test.yml')).toThrow('File read error')
  })

  it('should throw error if the YAML is invalid', () => {
    yamlLoadMock.mockImplementation(() => {
      throw new Error('YAML parse error')
    })
    expect(() => loadConfig('test.yml')).toThrow('YAML parse error')
  })

  it('should throw error if the YAML is valid but does not match the schema', () => {
    yamlLoadMock.mockReturnValue({})
    expect(() => loadConfig('test.yml')).toThrow(
      `must have required property 'states'`
    )
  })
})
