import { loadConfig, StateMachineConfig } from './config';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

/**
 * Parses a YAML file using the loadConfig method and transforms the data model into a Mermaid markup syntax state diagram.
 * @param fileName The name of the YAML file to parse.
 */
function parseYamlToMermaid(fileName: string): void {
  const config: StateMachineConfig = loadConfig(fileName);
  let mermaidDiagram = 'graph LR\n    direction LR\n';

  config.states.forEach((state, index) => {
    const stateId = `s${index + 1}`;
    mermaidDiagram += `    ${stateId}["${state.description}"]\n`;

    state.transitions.forEach((transition) => {
      const targetState = config.states.find(s => s.label === transition.actions?.find(a => a.type === 'replace-label')?.label);
      const targetStateId = targetState ? `s${config.states.indexOf(targetState) + 1}` : stateId;
      const transitionDescription = `conditions: ${transition.conditions?.map(c => c.type).join(', ')} | action: ${transition.actions?.map(a => a.type).join(', ')}`;
      mermaidDiagram += `    ${stateId} --> ${targetStateId}:${transitionDescription}\n`;
    });
  });

  console.log(mermaidDiagram);
}

// Example usage
const fileName = process.argv[2];
if (!fileName) {
  console.error('Please provide a YAML file name as an argument.');
  process.exit(1);
}

parseYamlToMermaid(fileName);
