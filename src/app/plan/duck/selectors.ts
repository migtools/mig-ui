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
import { ICondition, IMigration, IPlan, IStep } from './types';
import { findCurrentStep, getPlanInfo, migSpecToAction } from '../../home/pages/PlansPage/helpers';
import { IMigHook } from '../../home/pages/HooksPage/types';
import { DefaultRootState } from '../../../configureStore';

const planSelector = (state: DefaultRootState) => state.plan.migPlanList.map((p) => p);

const getCurrentPlan = (state: DefaultRootState) => state.plan.currentPlan;

const getCurrentPlanWithStatus = createSelector([getCurrentPlan], (currentPlan) => {
  if (currentPlan && currentPlan.status?.conditions) {
    let statusObject: any = {};
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
      incompatibleNamespaces = currentPlan.status.incompatibleNamespaces.map((namespace: any) => {
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

const getMigMeta = (state: DefaultRootState) => state.auth.migMeta;

const lockedPlansSelector = (state: DefaultRootState) => state.plan.lockedPlanList;

const sourceClusterNamespacesSelector = (state: DefaultRootState) =>
  state.plan.sourceClusterNamespaces.map((ns, index) => {
    return { ...ns, id: index };
  });

const hooksSelector = (state: DefaultRootState) => state.plan.allHooks.map((h) => h);

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
    const plansWithStatus = plans.map((plan): IPlan => {
      const isPlanLocked = lockedPlans.some(
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

      const { migrationType } = getPlanInfo(plan);

      const latestMigration = planMigrations.length ? planMigrations[0] : null;
      const latestAction = migSpecToAction(migrationType, latestMigration?.spec); // 'stage' | 'cutover' | 'rollback'

      const latestAnalytic = plan.Analytics?.length ? plan.Analytics[0] : null;

      const hasSucceededStage = !!planMigrations.filter((m) => {
        const action = migSpecToAction(migrationType, m.spec);
        if (m.status?.conditions && action === 'stage') {
          return (
            m.status.conditions.some((c) => c.type === 'Succeeded') &&
            !m.status.conditions.some((c) => c.type === 'Canceled')
          );
        }
      }).length;

      const hasSucceededCutover = !!planMigrations.filter((m) => {
        const action = migSpecToAction(migrationType, m.spec);
        if (m.status?.conditions && action === 'cutover') {
          return (
            m.status.conditions.some((c) => c.type === 'Succeeded') &&
            !m.status?.conditions?.some((c) => c.type === 'Canceled')
          );
        }
      }).length;

      const hasSucceededRollback = !!planMigrations.filter((m) => {
        const action = migSpecToAction(migrationType, m.spec);
        if (m.status?.conditions && action === 'rollback') {
          return (
            m.status.conditions.some((c) => c.type === 'Succeeded') &&
            !m.status?.conditions?.some((c) => c.type === 'Canceled') &&
            latestAction === 'rollback'
          );
        }
      }).length;

      const hasAttemptedMigration = !!planMigrations.some(
        (m) => migSpecToAction(migrationType, m.spec) === 'cutover'
      );

      const hasRunningMigrations = !!planMigrations.filter((m) => {
        if (m.status?.conditions) {
          return m.status.conditions.some((c) => c.type === 'Running');
        }
      }).length;

      const hasCopyPVs = plan.MigPlan.spec.persistentVolumes?.some(
        (pv) => pv.selection.action === 'copy'
      );

      const statusObject = {
        hasSucceededCutover,
        hasSucceededStage,
        hasSucceededRollback,
        hasAttemptedMigration,
        hasRunningMigrations,
        latestAction,
        isPlanLocked,
        ...filterPlanConditions(plan.MigPlan?.status?.conditions || []),
        ...filterLatestMigrationConditions(latestMigration?.status?.conditions || []),
        ...filterLatestAnalyticConditions(latestAnalytic?.status?.conditions || []),
        analyticPercentComplete: latestAnalytic?.status?.analytics?.percentComplete || null,
        latestAnalytic: latestAnalytic || null,
        hasCopyPVs,
      };
      return { ...plan, PlanStatus: statusObject };
    });

    return plansWithStatus;
  }
);

const getPlansWithStatus = createSelector([getPlansWithPlanStatus], (plans): IPlan[] => {
  const getMigrationStatus = (plan: IPlan, migration: IMigration) => {
    const { MigPlan } = plan;
    const { migrationType } = getPlanInfo(plan);
    const migrationAction = migSpecToAction(migrationType, migration?.spec);
    const status: any = {
      start: 'In progress',
      end: 'In progress',
      moved: 0,
      copied: 0,
      isPaused: false,
      isFailed: false,
      isSucceeded: false,
      isSucceededWithWarnings: false,
      isCanceled: false,
      isCanceling: false,
      isPostponed: false,
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
    const succeededWithWarnings = migration.status?.conditions?.find((c) => {
      return c.type === 'SucceededWithWarnings';
    });

    const dvmBlockedCondition = migration.status?.conditions?.find((c) => {
      return c.type === 'DirectVolumeMigrationBlocked';
    });

    const postponedCondition = migration.status?.conditions?.find((c) => {
      return c.type === 'Postponed';
    });

    // derive number of volumes copied / moved for migration table
    if (MigPlan?.spec?.persistentVolumes && !!succeededCondition) {
      status.copied = MigPlan.spec.persistentVolumes.filter(
        (p: any) => p.selection.action === 'copy'
      ).length;
      if (migrationAction !== 'stage') {
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
      if (postponedCondition) {
        status.start = 'Postponed ';
        status.isPostponed = true;
      }
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
        ?.filter((c: ICondition) => c.category === 'Warn')
        .map((c: ICondition, idx: number) => c.message);
      if (succeededCondition) status.isSucceeded = true;
      status.migrationState = 'paused';
      status.warnings = status.warnings.concat(warningMessages);
      status.warnCondition = warnCondition?.message;
      status.isPaused = true;
      return status;
    }

    if (warnCondition) {
      const warningMessages = migration?.status?.conditions
        ?.filter((c: ICondition) => c.category === 'Warn')
        .map((c, idx) => c.message);
      if (succeededCondition) status.isSucceeded = true;
      status.warnings = status.warnings.concat(warningMessages);
      status.warnCondition = warnCondition?.message;
      if (succeededWithWarnings) {
        status.isSucceededWithWarnings = true;
        status.migrationState = 'success';
      } else {
        status.migrationState = 'warn';
      }
      return status;
    }

    if (succeededWithWarnings) {
      status.isSucceededWithWarnings = true;
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
  const plansWithMigrationStatus = plans.map((plan): IPlan => {
    const migrationsWithStatus = plan.Migrations.map((migration: IMigration) => {
      const tableStatus = getMigrationStatus(plan, migration);
      if (migration?.status?.pipeline) {
        migration.status.pipeline = migration?.status?.pipeline?.map((step: IStep) => {
          const currentStep = findCurrentStep(migration?.status?.pipeline || []);
          if (step === currentStep) {
            const isError = tableStatus.isFailed || tableStatus.migrationState === 'error';
            const isWarning =
              tableStatus.warnings.length > 0 || tableStatus.migrationState === 'warn';
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
  getFilteredNamespaces,
  getHooksWithStatus,
};
