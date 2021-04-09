import { IStatus } from '../../plan/duck/types';

export interface IDebugTreeNode {
  kind: string;
  namespace: string;
  name: string;
  objectLink: string;
  children: IDebugTreeNode[];
}
export interface IDebugRefRes {
  kind: string;
  value: any;
}
export interface IDebugRefWithStatus {
  apiVersion: string;
  kind?: string;
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  spec: any;
  status?: any;
  refName?: string;
  debugResourceStatus?: IDerivedDebugStatusObject;
  resourceKind: string;
}

export interface IDerivedDebugStatusObject {
  hasWarning?: boolean;
  hasFailure?: boolean;
  hasCompleted?: boolean;
  hasRunning?: boolean;
  hasPending?: boolean;
  hasTerminating?: boolean;
  hasBound?: boolean;
  hasAdmitted?: boolean;
  currentStatus: DebugStatusType;
}
export enum DebugStatusType {
  Warning = 'Warning',
  Failure = 'Failure',
  Running = 'Running',
  Completed = 'Completed',
  Pending = 'Pending',
  Terminating = 'Terminating',
  Bound = 'Bound',
  Admitted = 'Admitted',
}

export const DEBUG_PATH_SEARCH_KEY = 'objPath';
export const RAW_OBJECT_VIEW_ROUTE = '/raw-debug-obj-view';
