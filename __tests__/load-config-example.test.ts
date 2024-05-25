import { loadConfig } from '../src/load-config'

describe('load issue-manager.yaml config', () => {
  it('should load and parse a YAML file correctly', () => {
    console.log(process.cwd())
    const config = loadConfig('.github/issue-manager.yml')
    expect(config.states).toHaveLength(4)
  })
})
