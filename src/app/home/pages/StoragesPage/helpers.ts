// TODO add type annotations for args
export const getStorageInfo = (storage, associatedPlans) => {
  const storageName = storage.MigStorage.metadata.name;

  return {
    storageName,
    storageStatus: !storage.MigStorage.status
      ? null
      : storage.MigStorage.status.conditions.filter((c) => c.type === 'Ready').length > 0,
    associatedPlanCount: associatedPlans[storageName],
    s3Url: storage.MigStorage.spec.backupStorageConfig.awsS3Url,
  };
};

export type IStorageInfo = ReturnType<typeof getStorageInfo>;
