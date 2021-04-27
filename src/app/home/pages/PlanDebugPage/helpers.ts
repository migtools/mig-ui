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
  ocGetEventsCommand: string;
  clusterType: string;
}
export const getOCCommandAndClusterType = (rawNode: IDebugTreeNode): ICommandAndTypeObj => {
  const { kind, namespace, name } = rawNode;
  switch (kind) {
    case 'DirectImageStreamMigration':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dism":"${name}"'`,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=${kind},involvedObject.name=${name}'`,
        clusterType: 'host',
      };
    case 'DirectVolumeMigrationProgress':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dvmp":"${name}"'`,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=${kind},involvedObject.name=${name}'`,
        clusterType: 'host',
      };
    case 'Hook':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"migHook":"${name}"'`,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=MigHook,involvedObject.name=${name}'`,
        clusterType: 'host',
      };
    case 'Job':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=${kind},involvedObject.name=${name}'`,
        clusterType: '',
      };
    case 'PV':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} ${name}`,
        ocLogsCommand: null,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=PersistentVolume,involvedObject.name=${name}'`,
        clusterType: '',
      };
    case 'PVC':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=PersistentVolumeClaim,involvedObject.name=${name}'`,
        clusterType: '',
      };
    case 'Route':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=Route,involvedObject.name=${name}'`,
        clusterType: '',
      };
    case 'Pod':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs -n ${namespace} ${name}`,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=Pod,involvedObject.name=${name}'`,
        clusterType: '',
      };
    case 'Migration':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"migMigration":"${name}"'`,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=MigMigration,involvedObject.name=${name}'`,
        clusterType: 'host',
      };
    case 'Plan':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"migPlan":"${name}"'`,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=MigPlan,involvedObject.name=${name}'`,
        clusterType: 'host',
      };
    case 'Backup':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `velero backup logs ${name} -n ${namespace}`,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=Backup,involvedObject.name=${name}'`,
        clusterType: 'source',
      };
    case 'PodVolumeBackup':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=PodVolumeBackup,involvedObject.name=${name}'`,
        clusterType: 'source',
      };
    case 'Restore':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `velero restore logs ${name} -n ${namespace}`,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=${getFullKindName(
          kind
        )},involvedObject.name=${name}'`,
        clusterType: 'target',
      };
    case 'PodVolumeRestore':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: null,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=PodVolumeRestore,involvedObject.name=${name}'`,
        clusterType: 'target',
      };
    case 'DirectVolumeMigration':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dvm":"${name}"'`,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=${kind},involvedObject.name=${name}'`,
        clusterType: 'host',
      };
    case 'DirectImageMigration':
      return {
        ocGetCommand: `oc get ${getFullKindName(kind)} -n ${namespace} ${name}`,
        ocLogsCommand: `oc logs --selector control-plane=controller-manager -n ${namespace} --container mtc | grep '"dism":"${name}"'`,
        ocGetEventsCommand: `oc get events -n ${namespace} --field-selector 'involvedObject.kind=${kind},involvedObject.name=${name}'`,
        clusterType: 'host',
      };
    default:
      return {
        ocGetCommand: `Command was not copied.`,
        ocLogsCommand: `Command was not copied.`,
        ocGetEventsCommand: `Command was not copied.`,
        clusterType: '',
      };
  }
};
