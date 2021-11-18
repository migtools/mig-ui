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
  id: string | number;
}
export interface IEditedPVsMap {
  oldPVCName: string;
  newPVCName: string;
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
