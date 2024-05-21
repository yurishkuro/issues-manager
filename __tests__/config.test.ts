import { loadConfig } from '../src/config';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

jest.mock('fs');
jest.mock('js-yaml');

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
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (fs.readFileSync as jest.Mock).mockReturnValue('mock file content');
    (yaml.load as jest.Mock).mockReturnValue(mockYamlData);
  });

  it('should load and parse a YAML file correctly', () => {
    const config = loadConfig('test.yml');
    expect(fs.readFileSync).toHaveBeenCalledWith('test.yml', 'utf8');
    expect(yaml.load).toHaveBeenCalledWith('mock file content');
    expect(config).toEqual(mockYamlData);
  });

  it('should return null if the file cannot be read', () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('File read error');
    });
    const config = loadConfig('test.yml');
    expect(config).toBeNull();
  });

  it('should return null if the YAML is invalid', () => {
    (yaml.load as jest.Mock).mockReturnValue(undefined);
    const config = loadConfig('test.yml');
    expect(config).toBeNull();
  });
});
