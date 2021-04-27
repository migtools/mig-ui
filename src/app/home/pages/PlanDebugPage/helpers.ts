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
  ocGetCommand: string;
  ocLogsCommand: string;
  clusterType: string;
}
export const getOCCommandAndClusterType = (rawNode: IDebugTreeNode): ICommandAndTypeObj => {
  const { kind, namespace, name } = rawNode;
  switch (kind) {
    case 'DirectImageStreamMigration':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dism":"${name}"'`,
        clusterType: '',
      };
    case 'DirectVolumeMigrationProgress':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dvmp":"${name}"'`,
        clusterType: '',
      };
    case 'Hook':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"migHook":"${name}"'`,
        clusterType: '',
      };
    case 'Job':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        clusterType: '',
      };
    case 'PV':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} ${name}`,
        ocLogsCommand: null,
        clusterType: '',
      };
    case 'PVC':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        clusterType: '',
      };
    case 'Route':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        clusterType: '',
      };
    case 'Pod':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs ${getFullKindName(kind)} -n ${namespace} ${name}`,
        clusterType: '',
      };
    case 'Migration':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"migMigration":"${name}"'`,
        clusterType: 'source',
      };
    case 'Plan':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"migPlan":"${name}"'`,
        clusterType: 'source',
      };
    case 'Backup':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `velero backup logs ${name} -n ${namespace}`,
        clusterType: 'source',
      };
    case 'PodVolumeBackup':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        clusterType: 'source',
      };
    case 'Restore':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `velero restore logs ${name} -n ${namespace}`,
        clusterType: 'target',
      };
    case 'PodVolumeRestore':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        clusterType: 'target',
      };
    case 'DirectVolumeMigration':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dvm":"${name}"'`,
        clusterType: '',
      };
    case 'DirectImageMigration':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dism":"${name}"'`,
        clusterType: '',
      };
    default:
      return {
        ocGetCommand: `Command was not copied.`,
        ocLogsCommand: `Command was not copied.`,
        clusterType: '',
      };
  }
};
