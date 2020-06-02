export type PvCopyMethod = 'filesystem' | 'snapshot';

export interface IPlanPersistentVolume {
  name: string;
  pvc: {
    namespace: string;
    name: string;
  };
  storageClass?: string;
  capacity: string;
  supported: {
    actions: string[];
    copyMethods: PvCopyMethod[];
  };
  selection?: {
    action: string;
    storageClass: string;
    copyMethod: PvCopyMethod;
    verify: boolean;
  };
}

export interface INameNamespaceRef {
  name: string;
  namespace: string;
}

export interface IPlanSpecHook {
  reference: {
    name: string;
  };
}

export interface IMigPlan {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  spec: {
    persistentVolumes?: IPlanPersistentVolume[];
    migStorageRef?: INameNamespaceRef;
    srcMigClusterRef?: INameNamespaceRef;
    destMigClusterRef?: INameNamespaceRef;
    namespaces?: string[];
    closed?: boolean;
    hooks?: IPlanSpecHook[];
  };
}

export interface IMigration {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  spec: {
    migPlanRef: {
      name: string;
      namespace: string;
    };
    quiescePods: boolean;
    stage: boolean;
  };
}

export interface IPlan {
  MigPlan: IMigPlan;
  Migrations: IMigration[];
  PlanStatus: {
    conflictErrorMsg: string;
    finalMigrationComplete: boolean;
    hasCanceledCondition: boolean;
    hasCancelingCondition: boolean;
    hasClosedCondition: boolean;
    hasConflictCondition: boolean;
    hasFailedCondition: boolean;
    hasNotReadyCondition: boolean;
    hasPODWarnCondition: boolean;
    hasPVWarnCondition: boolean;
    hasPrevMigrations: boolean;
    hasReadyCondition: boolean;
    hasRunningMigrations: boolean;
    hasSucceededMigration: boolean;
    hasSucceededStage: boolean;
    isPlanLocked: boolean;
    latestType: string;
  };
}

export interface IPersistentVolumeResource {
  name: string;
}

export interface ISourceClusterNamespace {
  name: string;
  podCount: number;
  pvcCount: number;
  serviceCount: number;
}
