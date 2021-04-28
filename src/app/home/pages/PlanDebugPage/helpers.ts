import { IDebugTreeNode } from '../../../debug/duck/types';

export const getFullKindName = (kind: any) => {
  switch (kind) {
    case 'Migration':
      return 'migmigration';
    case 'Plan':
      return 'migplan';
    case 'Backup':
      return 'backup';
    case 'PodVolumeBackup':
      return 'podvolumebackup';
    case 'PodVolumeRestore':
      return 'podvolumerestore';
    case 'Restore':
      return 'restore';
    case 'DirectVolumeMigration':
      return 'directvolumemigration';
    case 'DirectImageMigration':
      return 'directimagemigration';
    case 'DirectImageStreamMigration':
      return 'directimagestreammigration';
    case 'DirectVolumeMigrationProgress':
      return 'directvolumemigrationprogress';
    case 'Hook':
      return 'mighook';
    case 'Job':
      return 'job';
    case 'Pod':
      return 'pod';
    case 'PV':
      return 'persistentvolume';
    case 'PVC':
      return 'persistentvolumeclaim';
    case 'Route':
      return 'route';
    default:
      return kind;
  }
};

export const hasLogsCommand = (kind: any) => {
  switch (kind) {
    case 'Migration':
      return true;
    case 'Plan':
      return true;
    case 'Backup':
      return true;
    case 'PodVolumeBackup':
      return false;
    case 'PodVolumeRestore':
      return false;
    case 'Restore':
      return true;
    case 'DirectVolumeMigration':
      return true;
    case 'DirectImageMigration':
      return true;
    case 'DirectImageStreamMigration':
      return true;
    case 'DirectVolumeMigrationProgress':
      return true;
    case 'Hook':
      return true;
    case 'Job':
      return false;
    case 'Pod':
      return true;
    case 'PV':
      return false;
    case 'PVC':
      return false;
    case 'Route':
      return false;
    default:
      return kind;
  }
};

interface ICommandAndTypeObj {
  ocDescribeCommand: string;
  ocLogsCommand: string;
  clusterType: string;
}
export const getOCCommandAndClusterType = (rawNode: IDebugTreeNode): ICommandAndTypeObj => {
  const { kind, namespace, name } = rawNode;
  switch (kind) {
    case 'DirectImageStreamMigration':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dism":"${name}"'`,
        clusterType: 'host',
      };
    case 'DirectVolumeMigrationProgress':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dvmp":"${name}"'`,
        clusterType: 'host',
      };
    case 'Hook':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"migHook":"${name}"'`,
        clusterType: 'host',
      };
    case 'Job':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        clusterType: '',
      };
    case 'PV':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} ${name}`,
        ocLogsCommand: null,
        clusterType: '',
      };
    case 'PVC':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        clusterType: '',
      };
    case 'Route':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        clusterType: '',
      };
    case 'Pod':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs -n ${namespace} ${name}`,
        clusterType: '',
      };
    case 'Migration':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"migMigration":"${name}"'`,
        clusterType: 'host',
      };
    case 'Plan':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"migPlan":"${name}"'`,
        clusterType: 'host',
      };
    case 'Backup':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `velero backup logs ${name} -n ${namespace}`,
        clusterType: 'source',
      };
    case 'PodVolumeBackup':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        clusterType: 'source',
      };
    case 'Restore':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `velero restore logs ${name} -n ${namespace}`,
        clusterType: 'target',
      };
    case 'PodVolumeRestore':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        clusterType: 'target',
      };
    case 'DirectVolumeMigration':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dvm":"${name}"'`,
        clusterType: 'host',
      };
    case 'DirectImageMigration':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dim":"${name}"'`,
        clusterType: 'host',
      };
    default:
      return {
        ocDescribeCommand: `Command was not copied.`,
        ocLogsCommand: `Command was not copied.`,
        clusterType: '',
      };
  }
};
