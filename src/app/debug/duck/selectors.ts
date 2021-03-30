import { createSelector } from 'reselect';
import {
  DebugStatusType,
  IDebugRefRes,
  IDebugRefWithStatus,
  IDerivedDebugStatusObject,
} from './types';

const debugRefsSelector = (state) => state.debug.debugRefs.map((r) => r);

const getDebugRefsWithStatus = createSelector([debugRefsSelector], (debugRefs: IDebugRefRes[]) => {
  const refsWithStatus: IDebugRefWithStatus[] = debugRefs.map((ref) => {
    const statusObject = {
      ...getResourceStatus(ref),
    };

    return {
      ...ref?.value.data?.object,
      refName: ref?.value.data?.name,
      debugResourceStatus: statusObject,
      resourceKind: ref.kind,
    };
  });

  return refsWithStatus;
});

const getResourceStatus = (debugRef: IDebugRefRes): IDerivedDebugStatusObject => {
  switch (debugRef.kind) {
    case 'Backup': {
      const { errors, warnings, phase } = debugRef.value.data.object.status;
      const hasWarning = warnings?.length > 0 || phase === 'PartiallyFailed';
      const hasFailure = errors?.length > 0 || phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
      };
    }
    case 'Restore': {
      const { errors, warnings, phase } = debugRef.value.data.object.status;
      const hasWarning = warnings?.length > 0 || phase === 'PartiallyFailed';
      const hasFailure = errors?.length > 0 || phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
      };
    }
    case 'PodVolumeBackup': {
      const { phase } = debugRef.value.data.object.status;
      const hasWarning = phase === 'PartiallyFailed';
      const hasFailure = phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
      };
    }
    case 'PodVolumeRestore': {
      const { errors, warnings, phase } = debugRef.value.data.object.status;
      const hasWarning = phase === 'PartiallyFailed';
      const hasFailure = phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
      };
    }
    case 'DirectImageMigration': {
      const { conditions } = debugRef.value.data.object.status;
      const hasWarning = conditions.some((c) => c.category === ('Critical' || 'Error' || 'Warn'));
      const hasFailure = conditions.some((c) => c.type === 'Failed');
      const hasCompleted = conditions.some((c) => c.type === 'Completed');
      const hasRunning = conditions.some((c) => c.type === 'Running');
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
      };
    }
    case 'DirectImageStreamMigration': {
      const { conditions } = debugRef.value.data.object.status;
      const hasWarning = conditions.some((c) => c.category === ('Critical' || 'Error' || 'Warn'));
      const hasFailure = conditions.some((c) => c.type === 'Failed');
      const hasCompleted = conditions.some((c) => c.type === 'Completed');
      const hasRunning = conditions.some((c) => c.type === 'Running');
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
      };
    }
    case 'DirectVolumeMigrationProgress': {
      const { conditions } = debugRef.value.data.object.status;
      const hasWarning = conditions.some((c) => c.category === ('Critical' || 'Error' || 'Warn'));
      const hasFailure = conditions.some((c) => c.type === ('InvalidPod' || 'InvalidPodRef'));
      const hasCompleted = false;
      const hasRunning = false;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
      };
    }
    case 'Migration': {
      const { conditions } = debugRef.value.data.object.status;
      const hasWarning = conditions.some((c) => c.category === ('Critical' || 'Error' || 'Warn'));
      const hasFailure = conditions.some((c) => c.type === 'Failed');
      const hasCompleted = conditions.some((c) => c.type === 'Completed');
      const hasRunning = conditions.some((c) => c.type === 'Running');
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
      };
    }
  }
};

const calculateCurrentStatus = (hasWarning, hasFailure, hasCompleted, hasRunning) => {
  let currentStatus;
  if (hasRunning) {
    currentStatus = DebugStatusType.Running;
  } else if (hasFailure) {
    currentStatus = DebugStatusType.Failure;
  } else if (hasWarning) {
    currentStatus = DebugStatusType.Warning;
  } else if (hasCompleted) {
    currentStatus = DebugStatusType.Completed;
  }
  return currentStatus;
};

export default {
  getDebugRefsWithStatus,
};
