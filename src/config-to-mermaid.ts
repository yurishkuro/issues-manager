import { Action, Condition, StateMachineConfig } from './config'
import { loadConfig } from './load-config'
import wordwrap from 'wordwrap'

/**
 * Parses a YAML file using the loadConfig method and transforms the data model into a Mermaid markup syntax state diagram.
 * @param fileName The name of the YAML file to parse.
 */
function parseYamlToMermaid(fileName: string): void {
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
          case 'activity':
            return `- activity`
          case 'pull-request':
            return `- pull-request`
          case 'command':
            return `- command=${condition.command}`
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
          case 'post-comment':
            return `- post-comment`
          case 'close':
            return `- close`
        }
      })
      .join('\\n')
  }

  const config: StateMachineConfig = loadConfig(fileName)
  let mermaidDiagram = 'stateDiagram-v2\n    direction LR\n'
  mermaidDiagram += `    classDef transition fill:white\n`

  config.states.forEach((state, index) => {
    const stateId = `s${index + 1}`
    mermaidDiagram += `    ${stateId} : ${state.label}\\n\\n${wrap(state.description)}\n`
    if (index === 0) {
      mermaidDiagram += `    [*] --> ${stateId}\n`
    }

    state.transitions.forEach((transition, tIndex) => {
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
    })
  })

  console.log(mermaidDiagram)
}

// Example usage
const fileName = process.argv[2]
if (!fileName) {
  console.error('Please provide a YAML file name as an argument.')
  process.exit(1)
}

parseYamlToMermaid(fileName)
