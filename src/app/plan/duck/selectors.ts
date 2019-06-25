import { createSelector } from 'reselect';

const planSelector = state => state.plan.migPlanList.map(p => p);

const getMigMeta = state => state.migMeta;

const getAllPlans = createSelector(
  [planSelector],
  plans => {
    return plans;
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
      let hasReadyCondition = null;
      let hasErrorCondition = null;
      let hasRunningMigrations = null;
      let hasSucceededMigration = null;
      let hasClosedCondition = null;

      if (plan.MigPlan.status) {
        // hasClosedCondition = plan.MigPlan.spec.closed;
        // hasReadyCondition = !!plan.MigPlan.status.conditions.filter(c => c.type === 'Ready').length;
        hasErrorCondition = !!plan.MigPlan.status.conditions.filter(c => c.category === 'Critical')
          .length;

        if (hasErrorCondition) {
          counts.completed.push(plan);
        }
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
  getAllPlans,
  getMigMeta,
  getCounts,
};
