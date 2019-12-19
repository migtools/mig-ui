export type INamespaceList = string[];

export enum ClusterKind {
  source = 'source',
  destination = 'destination',
  controller = 'controller',
}

export interface IPodLogSource {
  name: string;
  namespace: string;
  log: string;
}

export type IPlanLogSources = {
  [key in ClusterKind]: IPodLogSource[];
};

export interface IPlanReport extends IPlanLogSources {
  namespace: string;
  name: string;
}
