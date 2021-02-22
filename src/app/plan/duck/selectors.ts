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
import { IPlan, IPlanSpecHook, IStep } from './types';
import { findCurrentStep } from '../../home/pages/PlansPage/helpers';
import { IMigHook } from '../../home/pages/HooksPage/types';

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

const hooksSelector = (state) => state.plan.allHooks.map((h) => h);

const getHooksWithStatus = createSelector(
  [hooksSelector, planSelector],
  (hooks: IMigHook[], plans: IPlan[]) => {
    const hooksWithStatus = hooks.map((hook) => {
      const associatedPlans = plans
        .filter((p) => p.MigPlan.spec.hooks?.some((h) => h.reference.name === hook.metadata.name))
        .map((p) => p.MigPlan.metadata.name);
      const associatedPlanCount = associatedPlans.length;
      const statusObject = {
        associatedPlanCount,
        associatedPlans,
      };
      return { ...hook, HookStatus: statusObject };
    });
    return hooksWithStatus;
  }
);

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

      // Rollback acts as a "reset", so we should only consider migrations after rollback
      let planMigrations;
      if (plan.Migrations.length) {
        const latestRollbackIndex = plan.Migrations?.findIndex((m) => {
          return m.spec.rollback && m.status?.conditions?.some((c) => c.type === 'Succeeded');
        });
        if (latestRollbackIndex !== -1) {
          planMigrations = plan.Migrations.slice(0, latestRollbackIndex + 1);
        } else {
          planMigrations = plan.Migrations;
        }
      } else {
        planMigrations = plan.Migrations;
      }

      const latestMigration = planMigrations.length ? planMigrations[0] : null;
      const latestAnalytic = plan.Analytics?.length ? plan.Analytics[0] : null;
      // latestType will be one of: 'Rollback', 'Stage', 'Migration'
      const latestType = latestMigration?.spec?.rollback
        ? 'Rollback'
        : latestMigration?.spec?.stage
        ? 'Stage'
        : 'Migration';

      const hasSucceededStage = !!planMigrations.filter((m) => {
        if (m.status?.conditions && m.spec.stage) {
          return (
            m.status.conditions.some((c) => c.type === 'Succeeded') &&
            !m.status.conditions.some((c) => c.type === 'Canceled')
          );
        }
      }).length;

      const hasSucceededMigration = !!planMigrations.filter((m) => {
        if (m.status?.conditions && !m.spec.stage && !m.spec.rollback) {
          return (
            m.status.conditions.some((c) => c.type === 'Succeeded') &&
            !m.status?.conditions?.some((c) => c.type === 'Canceled')
          );
        }
      }).length;

      const hasSucceededMigrationWithWarnings = !!planMigrations.filter((m) => {
        if (m.status?.conditions && !m.spec.stage && !m.spec.rollback) {
          return m.status.conditions.some((c) => c.type === 'SucceededWithWarnings');
        }
      }).length;

      const hasSucceededStageWithWarnings = !!planMigrations.filter((m) => {
        if (m.status?.conditions && m.spec.stage && !m.spec.rollback) {
          return m.status.conditions.some((c) => c.type === 'SucceededWithWarnings');
        }
      }).length;

      const hasSucceededRollback = !!planMigrations.filter((m) => {
        if (m.status?.conditions && m.spec.rollback) {
          return (
            m.status.conditions.some((c) => c.type === 'Succeeded') &&
            !m.status?.conditions?.some((c) => c.type === 'Canceled') &&
            latestType === 'Rollback'
          );
        }
      }).length;

      const hasAttemptedMigration = !!planMigrations.some((m) => !m.spec.stage && !m.spec.rollback);

      const finalMigrationComplete = !!planMigrations.filter((m) => {
        if (m.status?.conditions) {
          return (
            m.spec.stage === false &&
            !!m.spec.rollback === false &&
            m.status.conditions.some((c) => c.type === 'Succeeded') &&
            !m.status?.conditions?.some((c) => c.type === 'Canceled')
          );
        }
      }).length;

      const hasRunningMigrations = !!planMigrations.filter((m) => {
        if (m.status?.conditions) {
          return m.status.conditions.some((c) => c.type === 'Running');
        }
      }).length;

      const statusObject = {
        hasSucceededMigration,
        hasSucceededMigrationWithWarnings,
        hasSucceededStageWithWarnings,
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
      isPaused: false,
      isFailed: false,
      isSucceeded: false,
      isSuccededWithWarnings: true,
      isCanceled: false,
      isCanceling: false,
      migrationState: null,
      warnings: [],
      errors: [],
      errorCondition: null,
      warnCondition: null,
    };
    const zone = dayjs.tz.guess();

    // determine start and end time of migration
    if (migration.status?.startTimestamp) {
      status.start = dayjs
        .tz(migration.status.startTimestamp, zone)
        .format(`DD MMM YYYY, h:mm:ss z`);
    }
    const endTime = migration.status?.conditions
      ?.filter(
        (c) => c.type === 'Succeeded' || c.type === 'SucceededWithWarnings' || c.type === 'Failed'
      )
      .map((c) => c.lastTransitionTime)
      .toString();
    status.end = endTime ? dayjs.tz(endTime, zone).format(`DD MMM YYYY, h:mm:ss z`) : 'In progress';

    // check if migration is already succeeded
    const succeededCondition = migration.status?.conditions?.find((c) => {
      return c.type === 'Succeeded';
    });
    // check if migration is already canceled
    const canceledCondition = migration.status?.conditions?.find((c) => {
      return c.type === 'Canceled';
    });
    // check if migration has a critical condition
    const criticalCondition = migration.status?.conditions?.find((c) => {
      return c.category === 'Critical';
    });
    // check if migration has a warning condition
    const warnCondition = migration.status?.conditions?.find((c) => {
      return c.category === 'Warn';
    });
    // check if migration is being canceled
    const cancelingCondition = migration.status?.conditions?.find((c) => {
      return c.type === 'Canceling';
    });
    // check if plan goes unready during migration
    const planNotReadyCondition = migration.status?.conditions?.find((c) => {
      return c.type === 'PlanNotReady';
    });
    // check if migration is already failed
    const failedCondition = migration.status?.conditions?.find((c) => {
      return c.type === 'Failed';
    });
    // check if migration is already failed
    const succededWithWarnings = migration.status?.conditions?.find((c) => {
      return c.type === 'SucceededWithWarnings';
    });

    const dvmBlockedCondition = migration.status?.conditions?.find((c) => {
      return c.type === 'DirectVolumeMigrationBlocked';
    });

    // derive number of volumes copied / moved for migration table
    if (MigPlan?.spec?.persistentVolumes && !!succeededCondition) {
      status.copied = MigPlan.spec.persistentVolumes.filter(
        (p) => p.selection.action === 'copy'
      ).length;
      if (!migration.spec.stage) {
        status.moved = MigPlan.spec.persistentVolumes.length - status.copied;
      }
    }

    if (canceledCondition) {
      status.isCanceled = true;
    }

    // critical condition implies that migration has failed
    if (criticalCondition) {
      const errorMessages = migration?.status?.conditions
        ?.filter((c) => c.type === 'failed' || c.category === 'Critical')
        .map((c, idx) => c.message || c.reason);
      status.errors = status.errors.concat(errorMessages);
      if (failedCondition) status.isFailed = true;
      status.errorCondition = criticalCondition.message;
      status.end = criticalCondition.lastTransitionTime;
      status.migrationState = 'error';
      return status;
    }

    if (failedCondition) {
      const errorMessages = migration?.status?.conditions
        ?.filter((c) => c.type === 'failed' || c.category === 'Critical')
        .map((c, idx) => c.message || c.reason);
      const migrationErrors = migration?.status?.errors;
      status.errors = status.errors.concat(errorMessages, migrationErrors);
      status.isFailed = true;
      status.errorCondition = failedCondition.message;
      status.end = failedCondition.lastTransitionTime;
      status.migrationState = 'error';
      return status;
    }

    if (cancelingCondition) {
      status.isCanceling = true;
    }

    // plan goes unready during migration makes a migration fail
    if (planNotReadyCondition) {
      status.isFailed = true;
      status.end = '--';
      status.migrationState = 'error';
      return status;
    }

    if (dvmBlockedCondition) {
      const warningMessages = migration?.status?.conditions
        ?.filter((c) => c.category === 'Warn')
        .map((c, idx) => c.message);
      if (succeededCondition) status.isSucceeded = true;
      status.migrationState = 'paused';
      status.warnings = status.warnings.concat(warningMessages);
      status.warnCondition = warnCondition?.message;
      status.isPaused = true;
      return status;
    }

    if (warnCondition) {
      const warningMessages = migration?.status?.conditions
        ?.filter((c) => c.category === 'Warn')
        .map((c, idx) => c.message);
      if (succeededCondition) status.isSucceeded = true;
      status.migrationState = 'warn';
      status.warnings = status.warnings.concat(warningMessages);
      status.warnCondition = warnCondition?.message;
      return status;
    }

    if (succededWithWarnings) {
      status.isSuccededWithWarnings = true;
      status.migrationState = 'success';
      return status;
    }

    if (succeededCondition) {
      status.isSucceeded = true;
      status.migrationState = 'success';
      return status;
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
  getHooksWithStatus,
};
