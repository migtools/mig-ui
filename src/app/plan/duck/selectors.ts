import { createSelector } from 'reselect';

const planSelector = state => state.plan.migPlanList.map(p => p);

const getMigMeta = state => state.migMeta;

const getAllPlans = createSelector(
  [planSelector],
  plans => {
    return plans;
  }
);

export default {
  getAllPlans,
  getMigMeta,
};
