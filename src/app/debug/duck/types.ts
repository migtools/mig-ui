export interface IDebugTreeNode {
  kind: string;
  namespace: string;
  name: string;
  objectLink: string;
  children: IDebugTreeNode[];
}

export const DEBUG_PATH_SEARCH_KEY = 'objPath';
export const RAW_OBJECT_VIEW_ROUTE = '/raw-debug-obj-view';
