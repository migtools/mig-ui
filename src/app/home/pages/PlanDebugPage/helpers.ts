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
interface ICommandAndTypeObj {
  ocCommand: string;
  clusterType: string;
}
export const getOCCommandAndClusterType = (rawNode: IDebugTreeNode): ICommandAndTypeObj => {
  const { kind, namespace, name } = rawNode;
  switch (kind) {
    case 'DirectImageStreamMigration':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: '',
      };
    case 'DirectVolumeMigrationProgress':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: '',
      };
    case 'Hook':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: '',
      };
    case 'Job':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: '',
      };
    case 'PV':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} ${name}`,
        clusterType: '',
      };
    case 'PVC':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: '',
      };
    case 'Route':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: '',
      };
    case 'Pod':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: '',
      };
    case 'Migration':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: 'source',
      };
    case 'Plan':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: 'source',
      };
    case 'Backup':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: 'source',
      };
    case 'PodVolumeBackup':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: 'source',
      };
    case 'Restore':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: 'target',
      };
    case 'PodVolumeRestore':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: 'target',
      };
    case 'DirectVolumeMigration':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: '',
      };
    case 'DirectImageMigration':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: '',
      };
    default:
      return {
        ocCommand: `Command was not copied.`,
        clusterType: '',
      };
  }
};
