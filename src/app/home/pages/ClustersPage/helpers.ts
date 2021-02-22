import { ICluster } from '../../../cluster/duck/types';
import { IMigMeta } from '../../../auth/duck/types';
import { IPlanCountByResourceName } from '../../../common/duck/types';

export const getClusterInfo = (
  cluster: ICluster,
  migMeta: IMigMeta,
  associatedPlans: IPlanCountByResourceName
) => {
  const clusterName = cluster.MigCluster.metadata.name;
  const isHostCluster = cluster.MigCluster.spec.isHostCluster;
  const clusterAzureResourceGroup = cluster.MigCluster.spec.azureResourceGroup;
  const operatorVersion = cluster.MigCluster?.status?.operatorVersion || '';
  const hasCriticalCondition = cluster.ClusterStatus.hasCriticalCondition;
  const hasWarnCondition = cluster.ClusterStatus.hasWarnCondition;
  const errorMessage = cluster.ClusterStatus.errorMessage;
  const conditionType = cluster.ClusterStatus.conditionType;

  return {
    clusterName,
    clusterStatus: !cluster.MigCluster.status?.conditions
      ? null
      : cluster.MigCluster.status.conditions.filter((c) => c.type === 'Ready').length > 0,
    clusterUrl: isHostCluster ? migMeta.clusterApi : cluster.MigCluster.spec.url,
    clusterSvcToken:
      !isHostCluster && cluster.Secret.data.saToken ? atob(cluster.Secret.data.saToken) : null,
    clusterRequireSSL: !cluster.MigCluster.spec.insecure,
    clusterCABundle: cluster.MigCluster.spec.caBundle,
    exposedRegistryPath: cluster.MigCluster.spec.exposedRegistryPath,
    associatedPlanCount: associatedPlans[clusterName],
    isHostCluster,
    clusterIsAzure: !!clusterAzureResourceGroup,
    clusterAzureResourceGroup,
    operatorVersion,
    hasCriticalCondition,
    hasWarnCondition,
    errorMessage,
    conditionType,
  };
};

export type IClusterInfo = ReturnType<typeof getClusterInfo>;
