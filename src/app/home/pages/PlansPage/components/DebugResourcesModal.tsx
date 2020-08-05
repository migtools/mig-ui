import React from 'react';
import { Modal, Button } from '@patternfly/react-core';
import TreeView, { ITreeDataItem } from '../../../../common/components/TreeView/TreeView';

// TODO replace this dummy data with real data from redux
// This example came from https://github.com/konveyor/enhancements/pull/2/files
const DUMMY_DEBUG_DATA: ITreeDataItem[] = [
  {
    name: 'MigPlan: openshift-migration/myplan',
    children: [
      { name: 'MigCluster: openshift-migration/mycluster' },
      { name: 'MigStorage: openshift-migration/mystorage' },
      { name: 'MigHook: openshift-migration/myhook1' },
      { name: 'MigHook: openshift-migration/myhook2' },
      { name: 'BackupStorageLocation: openshift-migration/mybsl' },
      { name: 'VolumeSnapshotLocation: openshift-migration/myvsl' },
      {
        name: 'MigMigration: openshift-migration/mystagemigration',
        children: [
          {
            name: 'Backup: openshift-migration/StageBackup1',
            children: [
              { name: 'PodVolumeBackup: openshift-migration/mypvb1' },
              { name: 'PodVolumeBackup: openshift-migration/mypvb2' },
              { name: 'PodVolumeBackup: openshift-migration/mypvb3' },
            ],
          },
          {
            name: 'Restore: openshift-migration/StageRestore1',
            children: [
              { name: 'PodVolumeRestore: openshift-migration/mypvr1' },
              { name: 'PodVolumeRestore: openshift-migration/mypvr2' },
              { name: 'PodVolumeRestore: openshift-migration/mypvr3' },
            ],
          },
        ],
      },
      {
        name: 'MigMigration: openshift-migration/myfinalmigration',
        children: [
          { name: 'Backup: openshift-migration/FinalBackup2' },
          {
            name: 'Backup: openshift-migration/StageBackup2',
            children: [
              { name: 'PodVolumeBackup: openshift-migration/mypvb4' },
              { name: 'PodVolumeBackup: openshift-migration/mypvb5' },
              { name: 'PodVolumeBackup: openshift-migration/mypvb6' },
            ],
          },
          {
            name: 'Restore: openshift-migration/StageRestore2',
            children: [
              { name: 'PodVolumeRestore: openshift-migration/mypvr7' },
              { name: 'PodVolumeRestore: openshift-migration/mypvr8' },
              { name: 'PodVolumeRestore: openshift-migration/mypvr9' },
            ],
          },
          { name: 'Restore: openshift-migration/FinalRestore2' },
        ],
      },
    ],
  },
];

interface IDebugResourcesModalProps {
  onClose: () => void;
}

const DebugResourcesModal: React.FunctionComponent<IDebugResourcesModalProps> = ({
  onClose,
}: IDebugResourcesModalProps) => (
  <Modal
    id="debug-resources-modal"
    isSmall
    title="Migration Plan Resources (DEBUG)"
    isOpen
    isFooterLeftAligned
    onClose={onClose}
    actions={[
      <Button key="close" variant="primary" onClick={onClose}>
        Close
      </Button>,
    ]}
  >
    <TreeView data={DUMMY_DEBUG_DATA} defaultAllExpanded />
  </Modal>
);

export default DebugResourcesModal;
