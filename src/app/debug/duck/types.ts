import { IStatus } from '../../plan/duck/types';

export interface IDebugTreeNode {
  kind: string;
  namespace: string;
  name: string;
  objectLink: string;
  children: IDebugTreeNode[];
}
export interface IDebugRef {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  spec: any;
  status?: any;
  refName?: string;
  debugResourceStatus?: IDerivedDebugStatusObject;
}

export interface IDerivedDebugStatusObject {
  hasWarning: boolean;
  hasFailure: boolean;
  hasCompleted: boolean;
  hasRunning: boolean;
  currentStatus: DebugStatusType;
}
export enum DebugStatusType {
  Warning = 'Warning',
  Failure = 'Failure',
  Running = 'Running',
  Completed = 'Completed',
}

export const DEBUG_PATH_SEARCH_KEY = 'objPath';
export const RAW_OBJECT_VIEW_ROUTE = '/raw-debug-obj-view';
