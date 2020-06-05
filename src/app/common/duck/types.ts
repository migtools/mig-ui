export interface IStatusCondition {
  category: string;
  lastTransitionTime: string;
  message: string;
  status: string;
  type: string;
}

export interface IPlanCountByResourceName {
  [resourceName: string]: number;
}

export interface INameNamespaceRef {
  name: string;
  namespace: string;
}
