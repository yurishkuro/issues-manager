import { Action, Condition, StateMachineConfig } from './config'
import { loadConfig } from './load-config'
import wordwrap from 'wordwrap'

function wrap(s: string): string {
  const lines = wordwrap(20)(s)
  return lines.replace(/\n/g, '\\n')
}
function renderConditions(conditions: Condition[]): string {
  return conditions
    .map(condition => {
      switch (condition.type) {
        case 'label':
          return `- label=${condition.label}`
        case 'timeout':
          return `- timeout=${condition.timeout}d`
        case 'command':
          return `- command=${condition.command}`
        default:
          return `- ${condition.type}`
      }
    })
    .join('\\n')
}
function renderActions(actions: Action[]): string {
  return actions
    .map(action => {
      switch (action.type) {
        case 'add-label':
          return `- add-label=${action.label}`
        case 'replace-label':
          return `- replace-label=${action.label}`
        case 'remove-label':
          return `- remove-label=${action.label}`
        default:
          return `- ${action.type}`
      }
    })
    .join('\\n')
}

/**
 * Transforms the config data model into a Mermaid markup syntax state diagram.
 * @param config state machine config
 */
function configToMermaid(config: StateMachineConfig): string {
  let mermaidDiagram = 'stateDiagram-v2\n    direction LR\n'
  mermaidDiagram += `    classDef transition fill:white\n`

  for (let i = 0; i < config.states.length; i++) {
    const state = config.states[i]
    const stateId = `s${i + 1}`
    mermaidDiagram += `    ${stateId} : ${state.label}\\n\\n${wrap(state.description)}\n`
    if (i === 0) {
      mermaidDiagram += `    [*] --> ${stateId}\n`
    }

    for (let tIndex = 0; tIndex < state.transitions.length; tIndex++) {
      const transition = state.transitions[tIndex]
      const targetState = config.states.find(
        s =>
          s.label ===
          transition.actions?.find(a => a.type === 'replace-label')?.label
      )
      const targetStateId = transition.actions?.find(a => a.type === 'close')
        ? '[*]'
        : targetState
          ? `s${config.states.indexOf(targetState) + 1}`
          : stateId
      const transitionDescription = `Conditions\\n${renderConditions(transition.conditions)}\\nActions\\n${renderActions(transition.actions)}`
      const choiceId = `${stateId}_${tIndex}_choice`
      mermaidDiagram += `    ${choiceId} : ${transitionDescription}\n`
      mermaidDiagram += `    class ${choiceId} transition\n`
      mermaidDiagram += `    ${stateId} --> ${choiceId}\n`
      mermaidDiagram += `    ${choiceId} --> ${targetStateId}\n`
    }
  }
  return mermaidDiagram
}

const fileName = process.argv[2]
if (!fileName) {
  console.error('Please provide a YAML file name as an argument.')
  process.exit(1)
}

const config: StateMachineConfig = loadConfig(fileName)
const mermaidDiagram = configToMermaid(config)
console.log(mermaidDiagram)
