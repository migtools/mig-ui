import { createSelector } from 'reselect';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'; // import plugin
import utc from 'dayjs/plugin/utc'; // import plugin
dayjs.extend(timezone);
dayjs.extend(utc);
import {
  filterPlanConditions,
  filterLatestMigrationConditions,
  filterLatestAnalyticConditions,
} from './helpers';
import { IStep } from './types';
import { findCurrentStep } from '../../home/pages/PlansPage/helpers';

const planSelector = (state) => state.plan.migPlanList.map((p) => p);

const getCurrentPlan = (state) => state.plan.currentPlan;

const getCurrentPlanWithStatus = createSelector([getCurrentPlan], (currentPlan) => {
  if (currentPlan && currentPlan.status?.conditions) {
    let statusObject = {};
    let displayedConditions = currentPlan.status?.conditions
      .filter(
        (condition) =>
          condition.category === 'Warn' ||
          condition.category === 'Error' ||
          condition.category === 'Critical' ||
          condition.type === 'PlanConflict' ||
          condition.type === 'Ready'
      )
      .map((condition) => {
        const isGVKCondition = condition.type === 'GVKsIncompatible';
        if (isGVKCondition) {
          return {
            type: condition.category,
            message: condition.message,
            isGVKCondition: true,
          };
        }
        const isReadyCondition = condition.type === 'Ready';
        if (isReadyCondition) {
          return {
            type: condition.type,
            message: condition.message,
          };
        } else {
          return {
            type: condition.category || condition.type,
            message: condition.message,
          };
        }
      });

    let incompatibleNamespaces = [];

    if (currentPlan.status.incompatibleNamespaces) {
      incompatibleNamespaces = currentPlan.status.incompatibleNamespaces.map((namespace) => {
        return {
          namespaceName: namespace.name,
          gvks: namespace.gvks,
        };
      });
    }

    // Move ready condition to the end of the list if it exists
    const readyCondition = displayedConditions.find((condition) => condition.type === 'Ready');
    if (readyCondition) {
      displayedConditions = displayedConditions.filter((condition) => condition.type !== 'Ready');
      displayedConditions.push(readyCondition);
    }

    statusObject = {
      displayedConditions,
      incompatibleNamespaces,
    };
    return { ...currentPlan, PlanStatus: statusObject };
  }
  return null;
});

const getMigMeta = (state) => state.auth.migMeta;

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
      const isPlanLocked = !!lockedPlans.some(
        (lockedPlan) => lockedPlan === plan.MigPlan.metadata.name
      );
      const latestMigration = plan.Migrations.length ? plan.Migrations[0] : null;
      const latestAnalytic = plan.Analytics?.length ? plan.Analytics[0] : null;
      const latestType = latestMigration?.spec?.stage ? 'Stage' : 'Migration';

      const hasSucceededStage = !!plan.Migrations.filter((m) => {
        if (m.status?.conditions && m.spec.stage) {
          return (
            m.status.conditions.some((c) => c.type === 'Succeeded') &&
            !m.status.conditions.some((c) => c.type === 'Canceled')
          );
        }
      }).length;

      const hasSucceededMigration = !!plan.Migrations.filter((m) => {
        if (m.status?.conditions && !m.spec.stage) {
          return (
            m.status.conditions.some((c) => c.type === 'Succeeded') &&
            !m.status?.conditions?.some((c) => c.type === 'Canceled')
          );
        }
      }).length;

      const hasSucceededRollback = !!plan.Migrations.filter((m) => {
        if (m.status?.conditions && m.spec.rollback) {
          return (
            m.status.conditions.some((c) => c.type === 'Succeeded') &&
            !m.status?.conditions?.some((c) => c.type === 'Canceled')
          );
        }
      }).length;

      const hasAttemptedMigration = !!plan.Migrations.some((m) => !m.spec.stage);

      const finalMigrationComplete = !!plan.Migrations.filter((m) => {
        if (m.status?.conditions) {
          return m.spec.stage === false && hasSucceededMigration;
        }
      }).length;

      const hasRunningMigrations = !!plan.Migrations.filter((m) => {
        if (m.status?.conditions) {
          return m.status.conditions.some((c) => c.type === 'Running');
        }
      }).length;

      const statusObject = {
        hasSucceededMigration,
        hasSucceededStage,
        hasSucceededRollback,
        hasAttemptedMigration,
        finalMigrationComplete,
        hasRunningMigrations,
        latestType,
        isPlanLocked,
        ...filterPlanConditions(plan.MigPlan?.status?.conditions || []),
        ...filterLatestMigrationConditions(latestMigration?.status?.conditions || []),
        ...filterLatestAnalyticConditions(latestAnalytic?.status?.conditions || []),
        analyticPercentComplete: latestAnalytic?.status?.analytics?.percentComplete || null,
        latestAnalytic: latestAnalytic || null,
      };
      return { ...plan, PlanStatus: statusObject };
    });

    return plansWithStatus;
  }
);

const getCounts = createSelector([planSelector], (plans: any[]) => {
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
    if (!plan.MigPlan.status?.conditions) {
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
      start: 'In progress',
      end: 'In progress',
      moved: 0,
      copied: 0,
      isFailed: false,
      isSucceeded: false,
      isCanceled: false,
      isCanceling: false,
      stepName: 'Not started',
      migrationState: null,
      warnings: [],
      errors: [],
      errorCondition: null,
      warnCondition: null,
    };
    const zone = dayjs.tz.guess();

    if (migration.status?.conditions) {
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
        status.start = dayjs
          .tz(migration.status.startTimestamp, zone)
          .format(`DD MMM YYYY, h:mm:ss z`);
      }
      const endTime = migration.status.conditions
        .filter(
          (c) => c.type === 'Succeeded' || c.type === 'SucceededWithWarnings' || c.type === 'Failed'
        )
        .map((c) => c.lastTransitionTime)
        .toString();
      status.end = endTime
        ? dayjs.tz(endTime, zone).format(`DD MMM YYYY, h:mm:ss z`)
        : 'In progress';

      if (migration.status.conditions.length) {
        // For canceled migrations, show 0% progress and `Canceled` step
        if (canceledCondition) {
          status.isCanceled = true;
          status.stepName = 'Canceled';
          return status;
        }

        // For critical migrations, show red 100% progress
        const criticalCondition = migration.status.conditions.find((c) => {
          return c.category === 'Critical';
        });
        if (criticalCondition) {
          const errorMessages = migration?.status?.conditions
            ?.filter((c) => c.type === 'failed' || c.category === 'Critical')
            .map((c, idx) => c.message || c.reason);
          status.errors = status.errors.concat(errorMessages);
          status.isFailed = true;
          status.stepName = criticalCondition.message;
          status.errorCondition = criticalCondition.message;
          status.end = criticalCondition.lastTransitionTime;
          status.migrationState = 'error';
          return status;
        }

        // For failed migrations, show red 100% progress
        const failedCondition = migration.status.conditions.find((c) => {
          return c.type === 'Failed';
        });
        if (failedCondition) {
          const errorMessages = migration?.status?.conditions
            ?.filter((c) => c.type === 'failed' || c.category === 'Critical')
            .map((c, idx) => c.message || c.reason);
          const migrationErrors = migration?.status?.errors;
          status.errors = status.errors.concat(errorMessages, migrationErrors);
          status.isFailed = true;
          status.stepName = failedCondition.reason;
          status.errorCondition = failedCondition.message;
          status.end = failedCondition.lastTransitionTime;
          status.migrationState = 'error';
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
            status.isCanceling = true;
          }
          return status;
        }
        // For running migrations, calculate percent progress
        const planNotReadyCondition = migration.status.conditions.find((c) => {
          return c.type === 'PlanNotReady';
        });
        if (planNotReadyCondition) {
          status.isFailed = true;
          status.stepName = planNotReadyCondition.message;
          status.end = '--';
          status.migrationState = 'error';
          return status;
        }

        // For successful migrations with active warning, show warning 100% progress
        const warnCondition = migration.status.conditions.find((c) => {
          return c.category === 'Warn';
        });

        if (warnCondition) {
          const warningMessages = migration?.status?.conditions
            ?.filter((c) => c.category === 'Warn')
            .map((c, idx) => c.message);
          status.isSucceeded = true;
          status.stepName = 'Completed with warnings';
          status.migrationState = 'warn';
          status.warnings = status.warnings.concat(warningMessages);
          status.warnCondition = warnCondition?.message;
          return status;
        }

        // For successful migrations, show green 100% progress
        if (succeededCondition) {
          status.isSucceeded = true;
          status.stepName = 'Completed';
          status.migrationState = 'success';
          return status;
        }
      }
    }
    return status;
  };
  const plansWithMigrationStatus = plans.map((plan) => {
    const migrationsWithStatus = plan.Migrations.map((migration) => {
      const tableStatus = getMigrationStatus(plan, migration);
      if (migration?.status?.pipeline) {
        migration.status.pipeline = migration?.status?.pipeline?.map((step: IStep) => {
          const currentStep = findCurrentStep(migration?.status?.pipeline || []);
          if (step === currentStep) {
            const isError = tableStatus.isFailed || tableStatus.migrationState === 'error';
            const isWarning = tableStatus.warnings.length || tableStatus.migrationState === 'warn';
            const newStep = {
              ...step,
              isError: isError,
              isWarning: isWarning,
            };
            return newStep;
          } else {
            return step;
          }
        });
      }
      return { ...migration, tableStatus };
    });
    return { ...plan, Migrations: migrationsWithStatus };
  });
  return plansWithMigrationStatus;
});

export default {
  getCurrentPlanWithStatus,
  getPlansWithStatus,
  getMigMeta,
  getCounts,
  getFilteredNamespaces,
  getHooks,
};
