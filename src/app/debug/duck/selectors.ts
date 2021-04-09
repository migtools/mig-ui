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
        currentStatus: calculateCurrentStatus(
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          hasPending
        ),
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
        currentStatus: calculateCurrentStatus(hasFailure, hasPending, hasBound),
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
        currentStatus: calculateCurrentStatus(hasFailure, hasPending, hasBound),
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
        currentStatus: calculateCurrentStatus(hasFailure, hasPending, hasAdmitted),
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
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
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
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
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
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
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
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
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
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
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
        currentStatus: calculateCurrentStatus(hasWarning, hasFailure, hasCompleted, hasRunning),
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
