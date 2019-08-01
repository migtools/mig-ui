import { createSelector } from 'reselect';

const planSelector = state => state.plan.migPlanList.map(p => p);

const getMigMeta = state => state.migMeta;

const getPlansWithStatus = createSelector(
  [planSelector],
  plans => {
    const plansWithStatus = plans.map(plan => {
      let hasReadyCondition = null;
      let hasPlanError = null;
      let hasMigrationError = null;
      let hasPrevMigrations = null;
      let hasRunningMigrations = null;
      let finalMigrationComplete = null;
      let hasSucceededMigration = null;
      let hasSucceededStage = null;
      let hasClosedCondition = null;
      let latestType = null;
      if (plan.MigPlan.status) {
        hasClosedCondition = plan.MigPlan.spec.closed;
        hasReadyCondition = !!plan.MigPlan.status.conditions.filter(c => c.type === 'Ready').length;
        hasPlanError = !!plan.MigPlan.status.conditions.filter(c => c.category === 'Critical')
          .length;

        if (plan.Migrations.length) {
          hasPrevMigrations = !!plan.Migrations.length;
          latestType = plan.Migrations[0].spec.stage ? 'Stage' : 'Migration';

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

          hasMigrationError = !!plan.Migrations.filter(m => {
            if (m.status) {
              return m.status.conditions.some(c => c.type === 'Failed');
            }
          }).length;

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

      //remove controller update fields
      const { metadata } = plan.MigPlan;
      if (metadata.annotations || metadata.generation || metadata.resourceVersion) {
        delete metadata.annotations;
        delete metadata.generation;
        delete metadata.resourceVersion;
      }
      if (plan.MigPlan.status) {
        for (let i = 0; plan.MigPlan.status.conditions.length > i; i++) {
          delete plan.MigPlan.status.conditions[i].lastTransitionTime;
        }
      }
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

    plans.filter(plan => {
      let hasErrorCondition = null;
      let hasRunningMigrations = null;
      let hasSucceededMigration = null;

      if (plan.MigPlan.status) {
        hasErrorCondition = !!plan.MigPlan.status.conditions.filter(c => c.category === 'Critical')
          .length;

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
      } else {
        counts.notStarted.push(plan);
      }
    });
    return counts;
  }
);

export default {
  getPlansWithStatus,
  getMigMeta,
  getCounts,
};
