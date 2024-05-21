/**
 * Defines the structure for the state machine configuration.
 */

interface State {
  description: string;
  label: string;
  transitions: Transition[];
}

interface Transition {
  description: string;
  conditions?: Condition[];
  actions?: Action[];
}

interface Condition {
  type: 'label' | 'timeout' | 'activity' | 'pull-request';
  label?: string; // for type=label
  timeout?: number; // in days, for type=timeout
  linked?: boolean; // for type=pull-request
}

interface Action {
  type: 'add-label' | 'replace-label' | 'remove-label' | 'post-comment';
  label?: string;
  comment?: string;
}

interface StateMachineConfig {
  states: State[];
}

export { State, Transition, Condition, Action, StateMachineConfig };
