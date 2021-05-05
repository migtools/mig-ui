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
}
export const getDebugCommand = (rawNode: IDebugTreeNode): ICommandAndTypeObj => {
  const { kind, namespace, name } = rawNode;
  switch (kind) {
    case 'DirectImageStreamMigration':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager --namespace ${namespace} --container mtc | grep '"dism":"${name}"'`,
      };
    case 'DirectVolumeMigrationProgress':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager --namespace ${namespace} --container mtc | grep '"dvmp":"${name}"'`,
      };
    case 'Hook':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager --namespace ${namespace} --container mtc | grep '"migHook":"${name}"'`,
      };
    case 'Job':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: null,
      };
    case 'PV':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} ${name}`,
        ocLogsCommand: null,
      };
    case 'PVC':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: null,
      };
    case 'Route':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: null,
      };
    case 'Pod':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: `oc logs --namespace ${namespace} ${name} --all-containers`,
      };
    case 'Migration':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager --namespace ${namespace} --container mtc | grep '"migMigration":"${name}"'`,
      };
    case 'Plan':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager --namespace ${namespace} --container mtc | grep '"migPlan":"${name}"'`,
      };
    case 'Backup':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: `velero backup logs ${name} --namespace ${namespace}`,
      };
    case 'PodVolumeBackup':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: null,
      };
    case 'Restore':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: `velero restore logs ${name} --namespace ${namespace}`,
      };
    case 'PodVolumeRestore':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: null,
      };
    case 'DirectVolumeMigration':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager --namespace ${namespace} --container mtc | grep '"dvm":"${name}"'`,
      };
    case 'DirectImageMigration':
      return {
        ocDescribeCommand: `oc describe ${getFullKindName(kind)} --namespace ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager --namespace ${namespace} --container mtc | grep '"dim":"${name}"'`,
      };
    default:
      return {
        ocDescribeCommand: `Command was not copied.`,
        ocLogsCommand: `Command was not copied.`,
      };
  }
};
