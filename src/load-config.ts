import * as yaml from 'js-yaml'
import * as fs from 'fs'
import Ajv, { JSONSchemaType } from 'ajv'
import schemaJson from './config-schema.json' // assert { type: 'json' }
import { StateMachineConfig } from './config'

/**
 * Loads a YAML file, parses it, validates it against the generated JSON Schema, and returns a StateMachineConfig object.
 * @param fileName The name of the YAML file to load.
 * @returns The parsed and validated StateMachineConfig object.
 */
export function loadConfig(fileName: string): StateMachineConfig {
  const data = fs.readFileSync(fileName, 'utf8')
  const doc = yaml.load(data)
  const ajv = new Ajv()
  const schema = schemaJson as unknown as JSONSchemaType<StateMachineConfig>
  const validate = ajv.compile(schema)
  if (validate(doc)) {
    return doc
  }
  const errorMessages = validate.errors?.map(
    e => `${e.message}: ${JSON.stringify(e)}`
  )
  throw new Error(errorMessages?.join('\n'))
}
