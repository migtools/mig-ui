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
    // counts.notStarted = plans.filter(p => p.MigPlan);
    return counts;
  }
);

export default {
  getAllPlans,
  getMigMeta,
  getCounts,
};
