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
  const warningConditionTypes = ['Critical', 'Error', 'Warn'];
  const checkListContainsString = (val: string, stringList: Array<string>) => {
    if (stringList.indexOf(val) > -1) {
      return true;
    } else {
      return false;
    }
  };

  // currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning, hasTerminating, hasPending, hasBound, hasAdmitted),

  switch (debugRef.kind) {
    case 'Pod': {
      const { phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasFailure = phase === 'Failed' || phase === 'Unknown';
      const hasCompleted = phase === 'Succeeded';
      const hasRunning = phase === 'Running';
      const hasTerminating = deletionTimestamp != undefined;
      const hasPending = phase === 'Pending';
      return {
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        hasPending,
        currentStatus: calculateCurrentStatus(null, hasFailure, hasCompleted, hasRunning, hasTerminating, hasPending, null, null),
      };
    }
    case 'PVC': {
      const { phase } = debugRef.value.data.object.status;
      const hasFailure = phase === 'Lost';
      const hasPending = phase === 'Pending';
      const hasBound = phase === 'Bound';
      return {
        hasFailure,
        hasPending,
        hasBound,
        currentStatus: calculateCurrentStatus(null, hasFailure, null, null, null, hasPending, hasBound, null),
      };
    }
    case 'PV': {
      const { phase } = debugRef.value.data.object.status;
      const hasFailure = phase === 'Failed';
      const hasPending = phase === 'Pending';
      const hasBound = phase === 'Bound';
      return {
        hasFailure,
        hasPending,
        hasBound,
        currentStatus: calculateCurrentStatus(null, hasFailure, null, null, null, hasPending, hasBound, null),
      };
    }
    case 'Route': {
      const { ingress } = debugRef.value.data.object.status;

      let admitted = '';
      ingress.forEach((ing) => ing.conditions.forEach((cond) => (admitted = cond.status)));

      const hasFailure = admitted === 'Unknown';
      const hasPending = admitted === 'False';
      const hasAdmitted = admitted === 'True';
      return {
        hasFailure,
        hasPending,
        hasAdmitted,
        currentStatus: calculateCurrentStatus(null, hasFailure, null, null, null, hasPending, null, hasAdmitted),
      };
    }
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
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning, null, null, null, null),
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
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning, null, null, null, null),
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
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning, null, null, null, null),
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
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning, null, null, null, null),
      };
    }
    case 'DirectImageMigration': {
      const { conditions } = debugRef.value.data.object.status;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Completed', 'Succeeded'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning, null, null, null, null),
      };
    }
    case 'DirectVolumeMigration': {
      const { conditions } = debugRef.value.data.object.status;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Completed', 'Succeeded'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        // hasWarning?: any, hasFailure?: any, hasCompleted?: any, hasRunning?: any, hasTerminating?: any, hasPending?: any, hasBound?: any, hasAdmitted?: any
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning, null, null, null, null),
      };
    }
    case 'DirectImageStreamMigration': {
      const { conditions } = debugRef.value.data.object.status;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Completed', 'Succeeded'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        // hasWarning?: any, hasFailure?: any, hasCompleted?: any, hasRunning?: any, hasTerminating?: any, hasPending?: any, hasBound?: any, hasAdmitted?: any
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning, null, null, null, null),
      };
    }
    case 'DirectVolumeMigrationProgress': {
      const {
        errors,
        warnings,
        phase,
        conditions,
        totalProgressPercentage,
      } = debugRef.value.data.object.status;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some(
        (c) =>
          checkListContainsString(c.type, ['InvalidPod', 'InvalidPodRef']) || phase === 'Failed'
      );
      const hasCompleted = phase === 'Succeeded';
      const hasRunning = totalProgressPercentage !== '100%';
      return {
        hasWarning,
        hasFailure,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning, null, null, null, null),
      };
    }
    case 'Migration': {
      const { conditions } = debugRef.value.data.object.status;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Succeeded', 'Completed'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning, null, null, null, null),
      };
    }
    case 'Plan': {
      const { conditions } = debugRef.value.data.object.status;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Succeeded', 'Completed'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning, null, null, null, null),
      };
    }
  }
};

const calculateCurrentStatus = (
  hasWarning?,
  hasFailure?,
  hasCompleted?,
  hasRunning?,
  hasTerminating?,
  hasPending?,
  hasBound?,
  hasAdmitted?
) => {
  let currentStatus;
  if (hasTerminating) {
    currentStatus = DebugStatusType.Terminating;
  } else if (hasRunning) {
    currentStatus = DebugStatusType.Running;
  } else if (hasFailure) {
    currentStatus = DebugStatusType.Failure;
  } else if (hasWarning) {
    currentStatus = DebugStatusType.Warning;
  } else if (hasPending) {
    currentStatus = DebugStatusType.Pending;
  } else if (hasBound) {
    currentStatus = DebugStatusType.Bound;
  } else if (hasAdmitted) {
    currentStatus = DebugStatusType.Admitted;
  } else if (hasCompleted) {
    currentStatus = DebugStatusType.Completed;
  }
  return currentStatus;
};

export default {
  getDebugRefsWithStatus,
};
