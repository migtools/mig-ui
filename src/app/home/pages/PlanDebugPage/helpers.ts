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
    case 'DirectVolume':
      return 'directvolumemigration';
    case 'DirectImage':
      return 'directimagemigration';
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
    case 'DirectVolume':
      return {
        ocCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: '',
      };
    case 'DirectImage':
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
