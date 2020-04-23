import { createSelector } from 'reselect';
import moment from 'moment-timezone';

const planSelector = (state) => state.plan.migPlanList.map((p) => p);

const getCurrentPlan = (state) => state.plan.currentPlan;

const getMigMeta = (state) => state.migMeta;

const lockedPlansSelector = (state) => state.plan.lockedPlanList;

const sourceClusterNamespacesSelector = (state) => state.plan.sourceClusterNamespaces;

const getHooks = (state) => state.plan.migHookList.map((h) => h);

const getFilteredNamespaces = createSelector(
  [sourceClusterNamespacesSelector],
  (sourceClusterNamespaces) => {
    const filteredSourceClusterNamespaces = sourceClusterNamespaces.filter((ns) => {
      const rejectedRegex = [
        RegExp('^kube-.*', 'i'),
        RegExp('^openshift-.*', 'i'),
        RegExp('^openshift$', 'i'),
        RegExp('^velero$', 'i'),
        RegExp('^default$', 'i'),
        RegExp('^ocp-workshop$', 'i'),
        RegExp('^management-infra$', 'i'),
        RegExp('^operator-lifecycle-manager$', 'i'),
      ];

      // Short circuit the regex check if any of them match a rejected regex and filter it out
      return !rejectedRegex.some((rx) => rx.test(ns.name));
    });

    return filteredSourceClusterNamespaces;
  }
);

const getPlansWithPlanStatus = createSelector(
  [planSelector, lockedPlansSelector],
  (plans, lockedPlans) => {
    const plansWithStatus = plans.map((plan) => {
      let isPlanLocked = null;
      let hasReadyCondition = null;
      let hasPlanError = null;
      let hasPrevMigrations = null;
      let hasRunningMigrations = null;
      let finalMigrationComplete = null;
      let hasAttemptedMigration = null;
      let hasSucceededMigration = null;
      let hasSucceededStage = null;
      let hasClosedCondition = null;
      let hasCancelingCondition = null;
      let hasCanceledCondition = null;
      const hasMigrationError = null;
      let latestType = null;
      let latestIsFailed = false;
      let hasConflictCondition = null;
      let conflictErrorMsg = null;
      let hasPVWarnCondition = null;
      let hasPODWarnCondition = null;
      //check to see if plan is locked
      isPlanLocked = !!lockedPlans.some((lockedPlan) => lockedPlan === plan.MigPlan.metadata.name);
      //

      if (!plan.MigPlan.status || !plan.MigPlan.status.conditions) {
        const emptyStatusObject = {
          hasSucceededStage,
          hasPrevMigrations,
          hasPVWarnCondition,
          hasPODWarnCondition,
          hasClosedCondition,
          hasReadyCondition,
          hasNotReadyCondition: hasPlanError,
          hasRunningMigrations,
          hasSucceededMigration,
          hasCancelingCondition,
          hasCanceledCondition,
          finalMigrationComplete,
          hasFailedCondition: hasMigrationError,
          latestType,
          isPlanLocked,
        };
        return { ...plan, PlanStatus: emptyStatusObject };
      }

      hasClosedCondition = !!plan.MigPlan.status.conditions.filter((c) => c.type === 'Closed')
        .length;
      hasReadyCondition = !!plan.MigPlan.status.conditions.filter((c) => c.type === 'Ready').length;
      hasPlanError = plan.MigPlan.status.conditions.filter((c) => c.category === 'Critical') > 0;
      hasConflictCondition = !!plan.MigPlan.status.conditions.some(
        (c) => c.type === 'PlanConflict'
      );
      hasPODWarnCondition = !!plan.MigPlan.status.conditions.some(
        (c) => c.type === 'PodLimitExceeded'
      );
      hasPVWarnCondition = !!plan.MigPlan.status.conditions.some(
        (c) => c.type === 'PVLimitExceeded'
      );

      const planConflictCond = plan.MigPlan.status.conditions.find(
        (c) => c.type === 'PlanConflict'
      );
      if (planConflictCond) {
        conflictErrorMsg = planConflictCond.message;
      }

      if (plan.Migrations.length) {
        const latest = plan.Migrations[0];

        hasPrevMigrations = !!plan.Migrations.length;
        latestType = latest.spec.stage ? 'Stage' : 'Migration';

        if (latest.status && latest.status.conditions) {
          latestIsFailed = !!latest.status.conditions.some((c) => c.type === 'Failed');
          hasCancelingCondition = !!latest.status.conditions.some((c) => c.type === 'Canceling');
          hasCanceledCondition = !!latest.status.conditions.some((c) => c.type === 'Canceled');
        }

        hasSucceededStage = !!plan.Migrations.filter((m) => {
          if (m.status && m.spec.stage) {
            return (
              m.status.conditions.some((c) => c.type === 'Succeeded') &&
              !m.status.conditions.some((c) => c.type === 'Canceled')
            );
          }
        }).length;

        hasSucceededMigration = !!plan.Migrations.filter((m) => {
          if (m.status && !m.spec.stage) {
            return (
              m.status.conditions.some((c) => c.type === 'Succeeded') &&
              !latest.status.conditions.some((c) => c.type === 'Canceled')
            );
          }
        }).length;

        hasAttemptedMigration = !!plan.Migrations.some((m) => !m.spec.stage);

        finalMigrationComplete = !!plan.Migrations.filter((m) => {
          if (m.status) {
            return m.spec.stage === false && hasSucceededMigration;
          }
        }).length;

        hasRunningMigrations = !!plan.Migrations.filter((m) => {
          if (m.status) {
            return m.status.conditions.some((c) => c.type === 'Running');
          }
        }).length;
      }

      const statusObject = {
        hasSucceededStage,
        hasPrevMigrations,
        hasClosedCondition,
        hasReadyCondition,
        hasNotReadyCondition: hasPlanError,
        hasRunningMigrations,
        hasSucceededMigration,
        finalMigrationComplete,
        hasFailedCondition: hasMigrationError,
        hasCancelingCondition,
        hasCanceledCondition,
        latestType,
        hasConflictCondition,
        conflictErrorMsg,
        isPlanLocked,
        hasPODWarnCondition,
        hasPVWarnCondition,
      };

      return { ...plan, PlanStatus: statusObject };
    });

    return plansWithStatus;
  }
);

const getCounts = createSelector([planSelector], (plans) => {
  const counts = {
    notStarted: [],
    inProgress: [],
    completed: [],
  };

  plans.filter((plan = []) => {
    let hasErrorCondition = null;
    let hasRunningMigrations = null;
    let hasSucceededMigration = null;
    let hasCancelCondition = null;
    if (!plan.MigPlan.status || !plan.MigPlan.status.conditions) {
      counts.notStarted.push(plan);
      return;
    }
    hasErrorCondition = !!plan.MigPlan.status.conditions.some((c) => c.category === 'Critical');

    if (plan.Migrations.length) {
      hasRunningMigrations = !!plan.Migrations.filter((m) => {
        if (m.status) {
          return m.status.conditions.some((c) => c.type === 'Running');
        }
      }).length;

      hasSucceededMigration = !!plan.Migrations.filter((m) => {
        if (m.status) {
          return m.status.conditions.some((c) => c.type === 'Succeeded');
        }
      }).length;

      hasCancelCondition = !!plan.Migrations.filter((m) => {
        if (m.status) {
          return m.status.conditions.some((c) => c.type === 'Canceling' || c.type === 'Canceled');
        }
      }).length;

      if (hasCancelCondition) {
        counts.notStarted.push(plan);
      } else if (hasRunningMigrations) {
        counts.inProgress.push(plan);
      } else if (hasSucceededMigration) {
        counts.completed.push(plan);
      } else {
        counts.notStarted.push(plan);
      }
    } else {
      counts.notStarted.push(plan);
    }
  });
  return counts;
});

const getPlansWithStatus = createSelector([getPlansWithPlanStatus], (plans) => {
  const getMigrationStatus = (plan, migration) => {
    const { MigPlan } = plan;
    const status = {
      progress: null,
      start: 'In progress',
      end: 'In progress',
      moved: 0,
      copied: 0,
      stepName: 'Not started',
      isFailed: false,
      isSucceeded: false,
    };
    const zone = moment.tz.guess();

    if (migration.status && migration.status.conditions) {
      const succeededCondition = migration.status.conditions.find((c) => {
        return c.type === 'Succeeded';
      });

      const canceledCondition = migration.status.conditions.find((c) => {
        return c.type === 'Canceled';
      });

      if (MigPlan.spec.persistentVolumes && !!succeededCondition) {
        status.copied = MigPlan.spec.persistentVolumes.filter(
          (p) => p.selection.action === 'copy'
        ).length;
        if (!migration.spec.stage) {
          status.moved = MigPlan.spec.persistentVolumes.length - status.copied;
        }
      }

      if (migration.status.startTimestamp) {
        status.start = moment
          .tz(migration.status.startTimestamp, zone)
          .format(`DD MMM YYYY, h:mm:ss z`);
      }
      const endTime = migration.status.conditions
        .filter((c) => c.type === 'Succeeded' || c.type === 'Failed')
        .map((c) => c.lastTransitionTime)
        .toString();
      status.end = endTime
        ? moment.tz(endTime, zone).format(`DD MMM YYYY, h:mm:ss z`)
        : 'In progress';

      if (migration.status.conditions.length) {
        // For canceled migrations, show 0% progress and `Canceled` step
        if (canceledCondition) {
          status.progress = 0;
          status.stepName = 'Canceled';
          return status;
        }

        // For successful migrations, show green 100% progress
        if (succeededCondition) {
          status.progress = 100;
          status.isSucceeded = true;
          status.stepName = 'Completed';
          return status;
        }

        // For critical migrations, show red 100% progress
        const criticalCondition = migration.status.conditions.find((c) => {
          return c.category === 'Critical';
        });
        if (criticalCondition) {
          status.progress = 100;
          status.isFailed = true;
          status.stepName = criticalCondition.message;
          status.end = '--';
          return status;
        }

        // For failed migrations, show red 100% progress
        const failedCondition = migration.status.conditions.find((c) => {
          return c.type === 'Failed';
        });
        if (failedCondition) {
          status.progress = 100;
          status.isFailed = true;
          status.stepName = failedCondition.reason;
          status.end = '--';
          return status;
        }

        // For cancel in progress migrations, show progress in red and a `Canceling - ` step with a running step name as a suffix
        const cancelingCondition = migration.status.conditions.find((c) => {
          return c.type === 'Canceling';
        });

        // For running migrations, calculate percent progress
        const runningCondition = migration.status.conditions.find((c) => {
          return c.type === 'Running';
        });

        if (runningCondition || cancelingCondition) {
          status.stepName = runningCondition.reason;
          if (cancelingCondition) {
            status.stepName = 'Canceling' + status.stepName;
          }
          // Match string in format 'Step: 16/26'. Capture both numbers.
          const matches = runningCondition.message.match(/(\d+)\/(\d+)/);
          if (matches && matches.length === 3) {
            const currentStep = parseInt(matches[1], 10);
            const totalSteps = parseInt(matches[2], 10);
            if (!isNaN(currentStep) && !isNaN(totalSteps)) {
              status.progress = (currentStep / totalSteps) * 100;
            }
          }
          return status;
        }
        // For running migrations, calculate percent progress
        const planNotReadyCondition = migration.status.conditions.find((c) => {
          return c.type === 'PlanNotReady';
        });
        if (planNotReadyCondition) {
          status.progress = 100;
          status.isFailed = true;
          status.stepName = planNotReadyCondition.message;
          status.end = '--';
          return status;
        }
      }
    }
    return status;
  };
  const plansWithMigrationStatus = plans.map((plan) => {
    const migrationsWithStatus = plan.Migrations.map((migration) => {
      const tableStatus = getMigrationStatus(plan, migration);
      return { ...migration, tableStatus };
    });
    return { ...plan, Migrations: migrationsWithStatus };
  });
  return plansWithMigrationStatus;
});

export default {
  getCurrentPlan,
  getPlansWithStatus,
  getMigMeta,
  getCounts,
  getFilteredNamespaces,
  getHooks,
};
