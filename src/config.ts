/**
 * Defines the structure for the state machine configuration.
 */
export interface State {
  description: string
  label: string
  transitions: Transition[]
}

export interface Transition {
  description: string
  conditions: Condition[]
  actions: Action[]
}

export interface Condition {
  type: 'label' | 'timeout' | 'activity' | 'pull-request' | 'command'
  label?: string // for type=label
  command?: string // for type=command (typed in issue comments)
  timeout?: number // in days, for type=timeout
  linked?: boolean // for type=pull-request
}

export interface Action {
  type:
    | 'add-label'
    | 'replace-label'
    | 'remove-label'
    | 'post-comment'
    | 'close'
  label?: string
  comment?: string
}

export interface StateMachineConfig {
  states: State[]
}
