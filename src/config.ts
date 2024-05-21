/**
 * Defines the structure for the state machine configuration.
 */
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';

interface State {
  description: string
  label: string
  transitions: Transition[]
}

interface Transition {
  description: string
  conditions?: Condition[]
  actions?: Action[]
}

interface Condition {
  type: 'label' | 'timeout' | 'activity' | 'pull-request'
  label?: string // for type=label
  timeout?: number // in days, for type=timeout
  linked?: boolean // for type=pull-request
}

interface Action {
  type: 'add-label' | 'replace-label' | 'remove-label' | 'post-comment'
  label?: string
  comment?: string
}

interface StateMachineConfig {
  states: State[]
}

/**
 * Loads a YAML file, parses it, validates it against the generated JSON Schema, and returns a StateMachineConfig object.
 * @param fileName The name of the YAML file to load.
 * @returns The parsed and validated StateMachineConfig object.
 */
function loadConfig(fileName: string): StateMachineConfig | null {
  try {
    const data = fs.readFileSync(fileName, 'utf8');
    const doc = yaml.load(data);
    const ajv = new Ajv();
    addFormats(ajv);
    const schema: JSONSchemaType<StateMachineConfig> = require('../schema/StateMachineConfig-schema.json');
    const validate = ajv.compile(schema);
    if (validate(doc)) {
      return doc as StateMachineConfig;
    } else {
      console.error(validate.errors);
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

export { State, Transition, Condition, Action, StateMachineConfig, loadConfig }
