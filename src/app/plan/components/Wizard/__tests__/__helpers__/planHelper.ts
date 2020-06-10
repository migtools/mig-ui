import { PvCopyMethod } from '../../types';

const pvCopyMethod: PvCopyMethod = 'filesystem';

export const planValue = {
  planName: 'plan-name-test',
  sourceCluster: 'src-cluster-test',
  targetCluster: 'host',
  selectedStorage: 'storage-test',
  selectedNamespaces: ['namespace-test-1'],
  persistentVolumes: [],
  pvStorageClassAssignment: {
    ['pvNameTest']: {
      name: 'test',
      provisioner: 'test',
    },
  },
  pvVerifyFlagAssignment: {
    ['pvNameTest']: false,
  },
  pvCopyMethodAssignment: {
    ['pvNameTest']: pvCopyMethod,
  },
};
