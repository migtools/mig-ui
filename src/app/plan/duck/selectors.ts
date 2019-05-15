import { createSelector } from 'reselect';

const planSelector = (state) =>
    state.plan.migPlanList.map(p => p);

const planStateSelector = (state) =>
    state.plan.planStateMap.map(p => p);

const searchTermSelector = state => state.plan.searchTerm;

const newPlanState = {
    migrations: [],
    persistentVolumes: [],
    status: {
        state: 'Not Started',
        progress: 0,
    },
};
const getAllPlans = createSelector(
    [planSelector],
    (plans) => {
        return plans.map(plan => ({ ...plan, planState: newPlanState }));
    });
// return plans.filter(plan=> plan.MigPlan.metadata.name === planState.plan)
// return plans.map(plan => 
//     {...plan, planState: newPlanState}
// )
const getFakePlans = createSelector(

    [planSelector],
    (plans) => {
        // return plans.forEach(item => { });
        return plans;
    },
);
const getNotStartedList = createSelector(
    [planSelector],
    (plans) => {
        plans.filter((item) => item.status.state === 'Not Started');
    },
)

const getStagedSuccessList = createSelector(
    [planSelector],
    (plans) => {
        plans.filter((item) => item.status.state === 'Staged Successfully');
    },
)
const getMigSuccessList = createSelector(
    [planSelector],
    (plans) => {
        plans.filter((item) => item.status.state === 'Migrated Successfully');
    },
)
const getStagingList = createSelector(
    [planSelector],
    (plans) => {
        plans.filter((item) => item.status.state === 'Staging');
    },
)


const getMigratingList = createSelector(
    [planSelector],
    (plans) => {
        plans.filter((item) => item.status.state === 'Migrating');
    },
)

function add(accumulator, a) {
    return accumulator + a;
}

// const getInProgressLength = createSelector(
//     [planSelector],
//     (plans) => {
//         plans.filter((item) => item.status.state === 'Not Started');
//         [migratingList.length, stagingList.length].reduce(add);
//     },
// )


// const getNotStartedLength = 0;

const getVisiblePlans = createSelector(
    [planSelector, searchTermSelector],
    (plans, searchTerm) => {
        return plans.filter(plan => {
            return plan.MigPlan.metadata.name.match(new RegExp(searchTerm, 'i'));
        });
    },
);
export default {
    getAllPlans,
    getVisiblePlans,
    getFakePlans,
    getNotStartedList,
    getStagedSuccessList,
    getMigSuccessList,
    getStagingList,
    getMigratingList,
};
