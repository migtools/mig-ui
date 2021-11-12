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

export interface IEditedNamespaceMap {
  oldName: string;
  newName: string;
  id: string;
}
export interface IEditedPVsMap {
  oldName: string;
  newName: string;
  namespace: string;
  pvName?: string;
}

export interface IAlertModalObj {
  name: string;
  errorMessage: string;
}

export interface IVersionObject {
  versionList: any;
  currentVersion: any;
  operatorType: string;
  route: string;
}
