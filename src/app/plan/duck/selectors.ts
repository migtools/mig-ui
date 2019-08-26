import { createSelector } from 'reselect';
import moment from 'moment';

const planSelector = state => state.plan.migPlanList.map(p => p);

const getCurrentPlan = state => state.plan.currentPlan;

const getMigMeta = state => state.migMeta;


const getPlansWithPlanStatus = createSelector(
  [planSelector],
  plans => {

    const plansWithStatus = plans.map(plan => {
      let hasReadyCondition = null;
      let hasPlanError = null;
      let hasPrevMigrations = null;
      let hasRunningMigrations = null;
      let finalMigrationComplete = null;
      let hasAttemptedMigration = null;
      let hasSucceededMigration = null;
      let hasSucceededStage = null;
      let hasClosedCondition = null;
      const hasMigrationError = null;
      let latestType = null;
      let latestIsFailed = false;
      if (!plan.MigPlan.status || !plan.MigPlan.status.conditions) {
        const emptyStatusObject = {
          hasSucceededStage,
          hasPrevMigrations,
          hasClosedCondition,
          hasReadyCondition,
          hasNotReadyCondition: hasPlanError,
          hasRunningMigrations,
          hasSucceededMigration,
          finalMigrationComplete,
          hasFailedCondition: hasMigrationError,
          latestType,
        };
        return { ...plan, PlanStatus: emptyStatusObject };
      }
      hasClosedCondition = !!plan.MigPlan.status.conditions.filter(c => c.type === 'Closed').length;
      hasReadyCondition = !!plan.MigPlan.status.conditions.filter(c => c.type === 'Ready').length;
      hasPlanError = !!plan.MigPlan.status.conditions.filter(c => c.category === 'Critical')
        .length;

      if (plan.Migrations.length) {
        const latest = plan.Migrations[0];

        hasPrevMigrations = !!plan.Migrations.length;
        latestType = latest.spec.stage ? 'Stage' : 'Migration';

        if (latest.status && latest.status.conditions) {
          latestIsFailed = !!(latest.status.conditions.some(c => c.type === 'Failed'));
        }

        hasSucceededStage = !!plan.Migrations.filter(m => {
          if (m.status && m.spec.stage) {
            return m.status.conditions.some(c => c.type === 'Succeeded');
          }
        }).length;

        hasSucceededMigration = !!plan.Migrations.filter(m => {
          if (m.status && !m.spec.stage) {
            return m.status.conditions.some(c => c.type === 'Succeeded');
          }
        }).length;

        hasAttemptedMigration = !!plan.Migrations.some(m => !m.spec.stage);

        finalMigrationComplete = !!plan.Migrations.filter(m => {
          if (m.status) {
            return m.spec.stage === false && hasSucceededMigration;
          }
        }).length;

        hasRunningMigrations = !!plan.Migrations.filter(m => {
          if (m.status) {
            return m.status.conditions.some(c => c.type === 'Running');
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
        latestType,
      };

      return { ...plan, PlanStatus: statusObject };
    });

    return plansWithStatus;
  }
);

const getCounts = createSelector(
  [planSelector],
  plans => {
    const counts = {
      notStarted: [],
      inProgress: [],
      completed: [],
    };

    plans.filter((plan = []) => {
      let hasErrorCondition = null;
      let hasRunningMigrations = null;
      let hasSucceededMigration = null;
      if (!plan.MigPlan.status || !plan.MigPlan.status.conditions) {
        counts.notStarted.push(plan);
        return;
      }
      hasErrorCondition = !!plan.MigPlan.status.conditions.some(c => c.category === 'Critical');

      if (plan.Migrations.length) {
        hasRunningMigrations = !!plan.Migrations.filter(m => {
          if (m.status) {
            return m.status.conditions.some(c => c.type === 'Running');
          }
        }).length;

        hasSucceededMigration = !!plan.Migrations.filter(m => {
          if (m.status) {
            return m.status.conditions.some(c => c.type === 'Succeeded');
          }
        }).length;

        if (hasRunningMigrations) {
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
  }
);

<<<<<<< HEAD
=======
const getPlanDiffSelector = createSelector(
  [planSelector, currentPlanSelector],
  (plans, currentPlan) => {
    if (currentPlan) {
      const foundPlan = plans.find(p => p.MigPlan.metadata.name === currentPlan.MigPlan.metadata.name);
      //remove controller update fields
      if (foundPlan) {
        const { metadata } = foundPlan.MigPlan;
        if (metadata.annotations || metadata.generation || metadata.resourceVersion) {
          delete metadata.annotations;
          delete metadata.generation;
          delete metadata.resourceVersion;
        }
        if (foundPlan.MigPlan.status && foundPlan.MigPlan.status.conditions) {
          for (let i = 0; foundPlan.MigPlan.status.conditions.length > i; i++) {
            delete foundPlan.MigPlan.status.conditions[i].lastTransitionTime;
          }
        }
        if (JSON.stringify(currentPlan.MigPlan) === JSON.stringify(foundPlan.MigPlan)) {
          return currentPlan;
        } else if
          (JSON.stringify(currentPlan.MigPlan) !== JSON.stringify(foundPlan.MigPlan)) {
          return foundPlan;
        }
      } else {
        return null;
      }

    }
  }
);

const getCurrentPlan = createSelector(
  [getPlanDiffSelector],
  plan => plan);

const getPlansWithStatus = createSelector(
  [getPlansWithPlanStatus],
  plans => {
    const getMigrationStatus = migration => {
      const status = {
        progress: null,
        start: 'TBD',
        end: 'TBD',
        moved: 0,
        copied: 0,
        stepName: 'Not started',
        isFailed: false,
        isSucceeded: false,
      };

      if (migration.status) {
        if (migration.status.startTimestamp) {
          status.start = moment(migration.status.startTimestamp).format('LLL');
        }
        let endTime;
        endTime = migration.status.conditions
          .filter(c => c.type === 'Succeeded' || c.type === 'Failed')
          .map(c => c.lastTransitionTime)
          .toString();
        status.end = endTime ? moment(endTime).format('LLL') : 'TBD';

        if (migration.status.conditions.length) {
          // For successful migrations, show green 100% progress
          const succeededCondition = migration.status.conditions.find(c => {
            return c.type === 'Succeeded';
          });
          if (succeededCondition) {
            status.progress = 100;
            status.isSucceeded = true;
            status.stepName = 'Completed';
            return status;
          }

          // For failed migrations, show red 100% progress
          const failedCondition = migration.status.conditions.find(c => {
            return c.type === 'Failed';
          });
          if (failedCondition) {
            status.progress = 100;
            status.isFailed = true;
            status.stepName = failedCondition.reason;
            return status;
          }

          // For running migrations, calculate percent progress
          const runningCondition = migration.status.conditions.find(c => {
            return c.type === 'Running';
          });
          if (runningCondition) {
            status.stepName = runningCondition.reason;
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
          const planNotReadyCondition = migration.status.conditions.find(c => {
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
    const plansWithMigrationStatus = plans.map(plan => {
      const migrationsWithStatus = plan.Migrations.map(migration => {
        const tableStatus = getMigrationStatus(migration);
        return { ...migration, tableStatus };
      });
      return { ...plan, Migrations: migrationsWithStatus };

    });
    return plansWithMigrationStatus;
  });

>>>>>>> lint-fix
export default {
  getCurrentPlan,
  getPlansWithStatus,
  getMigMeta,
  getCounts,
};
