import { IStatusCondition } from '../../../common/duck/types';

export interface IMigHook {
  apiVersion?: string;
  kind?: string;
  metadata: {
    creationTimestamp?: any;
    generation?: number;
    generateName?: string;
    name?: string;
    namespace: string;
    resourceVersion?: string;
    selfLink?: string;
    uid?: string;
  };
  spec: {
    image: string;
    playbook?: any;
    targetCluster: string;
    custom?: boolean;
  };
  status?: {
    conditions?: IStatusCondition[];
    observedDigest: string;
    registryPath?: string;
  };
  id: string;
  HookStatus?: any;
  hookName?: string;
  custom?: boolean;
  image?: string;
  clusterTypeText?: string;
  phase?: string;
}
