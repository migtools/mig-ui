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
  const warningTextArr = [];
  const hasEventWarning =
    debugRef?.associatedEvents?.resources &&
    debugRef.associatedEvents?.resources.some((event) => event?.object?.type === 'Warning');

  const eventWarningList = hasEventWarning
    ? debugRef.associatedEvents?.resources.filter(
        (resource) => resource?.object?.type === 'Warning'
      )
    : [];
  eventWarningList.forEach((eventWarning) => {
    const eventWarningText = `${eventWarning.object.reason} - ${eventWarning.object.message}`;
    warningTextArr.push(eventWarningText);
  });
  switch (debugRef.kind) {
    case 'Job': {
      const { conditions, startTime, completionTime } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasRunning = startTime != undefined && completionTime == undefined;
      const hasTerminating = deletionTimestamp != undefined;
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) => c.type === 'Complete');
      const hasPending = startTime == undefined;
      return {
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        hasPending,
        currentStatus: calculateCurrentStatus(
          hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          hasPending,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
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
          hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          hasPending,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'PVC': {
      const { phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasFailure = phase === 'Lost';
      const hasPending = phase === 'Pending';
      const hasBound = phase === 'Bound';
      const hasCompleted = false;
      const hasRunning = false;
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        hasPending,
        currentStatus: calculateCurrentStatus(
          hasEventWarning,
          hasFailure,
          null,
          null,
          hasTerminating,
          hasPending,
          hasBound,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'PV': {
      const { phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasFailure = phase === 'Failed';
      const hasPending = phase === 'Pending';
      const hasBound = phase === 'Bound';
      const hasCompleted = false;
      const hasRunning = false;
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        hasPending,
        currentStatus: calculateCurrentStatus(
          hasEventWarning,
          hasFailure,
          null,
          null,
          hasTerminating,
          hasPending,
          hasBound,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'Route': {
      const { ingress } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;

      let admitted = '';
      ingress.forEach((ing) => ing.conditions.forEach((cond) => (admitted = cond.status)));

      const hasFailure = admitted === 'Unknown';
      const hasPending = admitted === 'False';
      const hasAdmitted = admitted === 'True';
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasFailure,
        hasPending,
        hasAdmitted,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasEventWarning,
          hasFailure,
          null,
          null,
          hasTerminating,
          hasPending,
          null,
          hasAdmitted,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'Backup': {
      const { errors, warnings, phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = warnings?.length > 0 || phase === 'PartiallyFailed';
      const hasFailure = errors?.length > 0 || phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      const hasPending = phase === undefined;
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        hasPending,
        currentStatus: calculateCurrentStatus(
          hasWarning || hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          hasPending,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'Restore': {
      const { errors, warnings, phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = warnings?.length > 0 || phase === 'PartiallyFailed';
      const hasFailure = errors?.length > 0 || phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      const hasPending = phase === undefined;
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        hasPending,
        currentStatus: calculateCurrentStatus(
          hasWarning || hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          hasPending,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'PodVolumeBackup': {
      const { phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = phase === 'PartiallyFailed';
      const hasFailure = phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      const hasPending = phase === undefined;
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        hasPending,
        currentStatus: calculateCurrentStatus(
          hasWarning || hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          hasPending,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'PodVolumeRestore': {
      const { errors, warnings, phase } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = phase === 'PartiallyFailed';
      const hasFailure = phase === 'Failed';
      const hasCompleted = phase === 'Completed';
      const hasRunning = phase === 'InProgress';
      const hasPending = phase === undefined;
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        hasPending,
        currentStatus: calculateCurrentStatus(
          hasWarning || hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          hasPending,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'DirectImageMigration': {
      const { conditions, startTimestamp } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Completed', 'Succeeded'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning || hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'DirectVolumeMigration': {
      const { conditions, startTimestamp } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Completed', 'Succeeded'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning || hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'DirectImageStreamMigration': {
      const { conditions, startTimestamp } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Completed', 'Succeeded'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning || hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
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
      const { deletionTimestamp } = debugRef.value.data.object.metadata;

      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some(
        (c) =>
          checkListContainsString(c.type, ['InvalidPod', 'InvalidPodRef']) || phase === 'Failed'
      );
      const hasCompleted = phase === 'Succeeded';
      const hasRunning = totalProgressPercentage !== '0%' && totalProgressPercentage !== '100%';
      const hasPending = !hasRunning && !hasCompleted;
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        hasPending,
        currentStatus: calculateCurrentStatus(
          hasWarning || hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          hasPending,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'Migration': {
      const { conditions, startTimestamp } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Succeeded', 'Completed'])
      );
      const hasRunning = false;
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning || hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'Plan': {
      const { conditions } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) =>
        checkListContainsString(c.category, warningConditionTypes)
      );
      const hasFailure = conditions?.some((c) => c.type === 'Failed');
      const hasCompleted = conditions?.some((c) =>
        checkListContainsString(c.type, ['Succeeded', 'Completed'])
      );
      const hasRunning = conditions?.some((c) => c.type === 'Running');
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasFailure,
        hasCompleted,
        hasRunning,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning || hasEventWarning,
          hasFailure,
          hasCompleted,
          hasRunning,
          hasTerminating,
          null,
          null,
          null,
          null
        ),
        warningTextArr: warningTextArr,
      };
    }
    case 'Hook': {
      const { conditions } = debugRef.value.data.object.status;
      const { deletionTimestamp } = debugRef.value.data.object.metadata;
      const hasWarning = conditions?.some((c) => c.type === 'Critical');
      const hasReady = conditions?.some((c) => c.type === 'Ready');
      const hasTerminating = deletionTimestamp != undefined;
      return {
        hasWarning,
        hasReady,
        hasTerminating,
        currentStatus: calculateCurrentStatus(
          hasWarning || hasEventWarning,
          null,
          null,
          null,
          hasTerminating,
          null,
          null,
          null,
          hasReady
        ),
        warningTextArr: warningTextArr,
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
  hasAdmitted?,
  hasReady?
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
  } else if (hasReady) {
    currentStatus = DebugStatusType.Ready;
  } else if (hasCompleted) {
    currentStatus = DebugStatusType.Completed;
  }
  return currentStatus;
};

export default {
  getDebugRefsWithStatus,
};
