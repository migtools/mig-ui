import { createSelector } from 'reselect';

const planSelector = (state) =>
    state.plan.migPlanList.map(p => p);

const searchTermSelector = state => state.plan.searchTerm;

const getAllPlans = createSelector(
    [planSelector],
    (plans) => {
        return plans;
    },
);

const getVisiblePlans = createSelector(
    [planSelector, searchTermSelector],
    (plans, searchTerm) => {
      return plans.filter(plan => {
        return plan.planName.match(new RegExp(searchTerm, 'i'));
      });
    },
);
export default {
    getAllPlans,
    getVisiblePlans,
};
