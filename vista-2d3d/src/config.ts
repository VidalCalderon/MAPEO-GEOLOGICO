import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  allowDynamic3D: boolean
}

export type IMConfig = ImmutableObject<Config>
