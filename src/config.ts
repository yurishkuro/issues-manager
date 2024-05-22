/**
 * Defines the structure for the state machine configuration.
 */
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import Ajv, { JSONSchemaType } from 'ajv'
// import addFormats from 'ajv-formats';
import schemaJson from './config-schema.json' // assert { type: 'json' }

export interface State {
  description: string
  label: string
  transitions: Transition[]
}

export interface Transition {
  description: string
  conditions?: Condition[]
  actions?: Action[]
}

export interface Condition {
  type: 'label' | 'timeout' | 'activity' | 'pull-request'
  label?: string // for type=label
  timeout?: number // in days, for type=timeout
  linked?: boolean // for type=pull-request
}

export interface Action {
  type: 'add-label' | 'replace-label' | 'remove-label' | 'post-comment'
  label?: string
  comment?: string
}

export interface StateMachineConfig {
  states: State[]
}

/**
 * Loads a YAML file, parses it, validates it against the generated JSON Schema, and returns a StateMachineConfig object.
 * @param fileName The name of the YAML file to load.
 * @returns The parsed and validated StateMachineConfig object.
 */
export function loadConfig(fileName: string): StateMachineConfig {
  const data = fs.readFileSync(fileName, 'utf8')
  const doc = yaml.load(data)
  const ajv = new Ajv()
  // addFormats(ajv)
  const schema = schemaJson as unknown as JSONSchemaType<StateMachineConfig>
  const validate = ajv.compile(schema)
  if (validate(doc)) {
    return doc
  }
  const errorMessages = validate.errors?.map(e => e.message)
  throw new Error(errorMessages?.join('\n'))
}
