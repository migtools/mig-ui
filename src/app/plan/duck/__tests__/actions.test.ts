import { PlanActions, PlanActionTypes } from '../actions';
import { CurrentPlanState } from '../reducers';

const testPlan = {
  apiVersion: 'apiversion',
  kind: 'kind',
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
};

describe('addPlanFailure()', function () {
  it('should contain the right action type', function () {
    const error = '';
    const action = PlanActions.addPlanFailure(error);

    expect(action.type).toEqual(PlanActionTypes.ADD_PLAN_FAILURE);
  });

  it('should contain error', function () {
    const error = 'test';
    const action = PlanActions.addPlanFailure(error);

    expect(action.error).toEqual(error);
  });
});

describe('addPlanRequest()', function () {
  it('should contain the right action type', function () {
    const testPlan = '';
    const action = PlanActions.addPlanRequest(testPlan);

    expect(action.type).toEqual(PlanActionTypes.ADD_PLAN_REQUEST);
  });

  it('should contain migPlan', function () {
    const action = PlanActions.addPlanRequest(testPlan);

    expect(action.migPlan).toEqual(testPlan);
  });
});

describe('addPlanSuccess()', function () {
  it('should contain the right action type', function () {
    const action = PlanActions.addPlanSuccess(testPlan);

    expect(action.type).toEqual(PlanActionTypes.ADD_PLAN_SUCCESS);
  });

  it('should contain newPlan', function () {
    const action = PlanActions.addPlanSuccess(testPlan);

    expect(action.newPlan).toEqual(testPlan);
  });
});

describe('getPVResourcesFailure()', function () {
  it('should contain the right action type', function () {
    const action = PlanActions.getPVResourcesFailure('');

    expect(action.type).toEqual(PlanActionTypes.GET_PV_RESOURCES_FAILURE);
  });

  it('should contain error', function () {
    const error = 'test';
    const action = PlanActions.getPVResourcesFailure(error);

    expect(action.error).toEqual(error);
  });
});

describe('getPVResourcesRequest()', function () {
  it('should contain the right action type', function () {
    const pvList = {};
    const clusterName = '';

    const action = PlanActions.getPVResourcesRequest(pvList, clusterName);

    expect(action.type).toEqual(PlanActionTypes.GET_PV_RESOURCES_REQUEST);
  });

  it('should contain pvList and clusterName', function () {
    const pvList = {};
    const clusterName = 'cluster';

    const action = PlanActions.getPVResourcesRequest(pvList, clusterName);

    expect(action.pvList).toEqual(pvList);
    expect(action.clusterName).toEqual(clusterName);
  });
});

describe('getPVResourcesSuccess()', function () {
  it('should contain the right action type', function () {
    const test = {};
    const action = PlanActions.getPVResourcesSuccess(test);

    expect(action.type).toEqual(PlanActionTypes.GET_PV_RESOURCES_SUCCESS);
  });

  it('should contain currentPlanStatus', function () {
    const test = {};
    const action = PlanActions.getPVResourcesSuccess(test);

    expect(action.pvResources).toEqual(test);
  });
});

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
    const testPlans = [];
    const action = PlanActions.updatePlans(testPlans);

    expect(action.type).toEqual(PlanActionTypes.UPDATE_PLANS);
  });

  it('should contain updated plans', function () {
    const testPlans = [testPlan];

    const action = PlanActions.updatePlans(testPlans);

    expect(action.updatedPlans.length).toEqual(1);
    expect(action.updatedPlans[0]).toEqual(testPlans[0]);
  });
});

describe('removePlanSuccess()', function () {
  it('should contain the right action type', function () {
    const id = '';
    const action = PlanActions.removePlanSuccess(id);

    expect(action.type).toEqual(PlanActionTypes.REMOVE_PLAN_SUCCESS);
  });

  it('should contain id', function () {
    const id = 'test';
    const action = PlanActions.removePlanSuccess(id);

    expect(action.id).toEqual(id);
  });
});
