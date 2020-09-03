import { IStorage } from '../../../storage/duck/types';
import { IPlanCountByResourceName } from '../../../common/duck/types';

export const getStorageInfo = (storage: IStorage, associatedPlans: IPlanCountByResourceName) => {
  const storageName = storage.MigStorage.metadata.name;

  return {
    storageName,
    storageStatus: !storage.MigStorage.status?.conditions
      ? null
      : storage.MigStorage.status.conditions.filter((c) => c.type === 'Ready').length > 0,
    associatedPlanCount: associatedPlans[storageName],
    s3Url: storage.MigStorage.spec.backupStorageConfig.awsS3Url,
  };
};

export type IStorageInfo = ReturnType<typeof getStorageInfo>;
