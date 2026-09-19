import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  enableSearch?: boolean;
  enableOpacity?: boolean;
}

export type IMConfig = ImmutableObject<Config>
