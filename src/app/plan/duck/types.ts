import { INameNamespaceRef } from '../../common/duck/types';
import { ICurrentPlanStatus } from './reducers';

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

export interface IMigPlanStorageClass {
  name: string;
  provisioner: string;
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
    srcMigTokenRef?: INameNamespaceRef;
    destMigClusterRef?: INameNamespaceRef;
    destMigTokenRef?: INameNamespaceRef;
    namespaces?: string[];
    closed?: boolean;
    refresh?: boolean;
    hooks?: IPlanSpecHook[];
    indirectImageMigration: boolean;
    indirectVolumeMigration: boolean;
  };
  status?: IStatus;
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
  status?: IMigrationStatus;
  tableStatus?: {
    copied: number;
    end: string;
    isFailed: boolean;
    isSucceeded: boolean;
    isCanceled: boolean;
    isCanceling: boolean;
    migrationState: string;
    moved: number;
    progress: number;
    start: string;
    stepName: string;
    warnings: string[];
    currentStep: IStep;
    errorCondition: string;
    warnCondition: string;
  };
}

export interface IMigrationStatus extends IStatus {
  observedDigest: string;
  startTimestamp: string;
  phase: string;
  pipeline: IStep[];
  itenerary?: string;
  errors?: string[];
}

export interface IStep {
  message: string;
  name: string;
  phase?: string;
  started?: string;
  completed: string;
  failed?: boolean;
  progress?: string[];
  isError?: boolean;
  isWarning?: boolean;
}

export interface IStatus {
  conditions?: ICondition[];
  incompatibleNamespaces?: any;
  observedDigest?: string;
  srcStorageClasses?: IMigPlanStorageClass[];
  destStorageClasses?: IMigPlanStorageClass[];
}

export interface ICondition {
  category?: string;
  lastTransitionTime?: string;
  message?: string;
  status?: string;
  type?: string;
  reason?: string;
}

export interface IPlan {
  MigPlan: IMigPlan;
  Migrations: IMigration[];
  Analytics: any[];
  PlanStatus: {
    conflictErrorMsg: string;
    finalMigrationComplete: boolean;
    hasCanceledCondition: boolean;
    hasCancelingCondition: boolean;
    hasClosedCondition: boolean;
    hasConflictCondition: boolean;
    hasNotReadyCondition: boolean;
    hasPODWarnCondition: boolean;
    hasPVWarnCondition: boolean;
    hasReadyCondition: boolean;
    hasRunningMigrations: boolean;
    hasSucceededMigration: boolean;
    hasSucceededStage: boolean;
    isPlanLocked: boolean;
    latestType: string;
    latestIsFailed: boolean;
    namespaces: any[];
    latestAnalyticTransitionTime: string;
    latestAnalytic: IAnalytic;
    analyticPercentComplete: number;
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

export interface IAnalytic {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  spec: {
    analyzeImageCount: boolean;
    analyzeK8sResources: boolean;
    analyzePVCapacity: boolean;
    plan: {
      name: string;
      namespace: string;
    };
    quiescePods: boolean;
    stage: boolean;
  };
  status?: {
    analytics?: any;
    conditions?: any;
    observedGeneration?: any;
  };
}
