import { PlanActions, PlanActionTypes } from '../actions';
import { CurrentPlanState } from '../reducers';

describe('updateCurrentPlanStatus()', function () {
  it('should contain the right action type', function () {
    const testPlanStatus = {
      state: CurrentPlanState.Pending,
      errorMessage: '',
      warnMessage: '',
    };

    const action = PlanActions.updateCurrentPlanStatus(testPlanStatus);
    expect(action.type).toEqual(PlanActionTypes.UPDATE_CURRENT_PLAN_STATUS);
  });

  it('should contain currentPlanStatus', function () {
    const testPlanStatus = {
      state: CurrentPlanState.Pending,
      errorMessage: 'error message error',
      warnMessage: 'warn message',
    };

    const action = PlanActions.updateCurrentPlanStatus(testPlanStatus);
    expect(action.currentPlanStatus).toEqual(testPlanStatus);
  });
});

describe('updatePlans()', function () {
  it('should contain the right action type', function () {
    const plan = [];
    const action = PlanActions.updatePlans(plan);
    expect(action.type).toEqual(PlanActionTypes.UPDATE_PLANS);
  });

  it('should contain updated plans', function () {
    const plan = [
      {
        apiVersion: 'apiversion',
        kind: 'kind1',
        metadata: {
          name: 'name',
          namespace: 'namespace',
        },
        spec: {
          srcMigClusterRef: {
            name: 'name1',
            namespace: 'namespace1',
          },
          destMigClusterRef: {
            name: 'name2',
            namespace: 'namespace2',
          },
          migStorageRef: {
            name: 'name3',
            namespace: 'namespace3',
          },
        },
      },
    ];

    const action = PlanActions.updatePlans(plan);
    expect(action.updatedPlans.length).toEqual(1);
    expect(action.updatedPlans[0]).toEqual(plan[0]);
  });
});
