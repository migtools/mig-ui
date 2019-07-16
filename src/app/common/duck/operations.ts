import { alertSuccess, alertError, alertProgress, alertClear } from './actions';
import planUtils from '../../plan/duck/utils';
import { Creators as PlanCreators } from '../../plan/duck/actions';

const migrationSuccess = PlanCreators.migrationSuccess;
const stagingSuccess = PlanCreators.stagingSuccess;
const migrationFailure = PlanCreators.migrationFailure;
const stagingFailure = PlanCreators.stagingFailure;
const updatePlanResults = PlanCreators.updatePlanResults;
const updatePlan = PlanCreators.updatePlan;

const alertErrorTimeout = (message: string) => {
  return async (dispatch, getState) => {
    try {
      dispatch(alertError(message));
      setTimeout(() => {
        dispatch(alertClear());
      }, 5000);
    } catch (err) {
      dispatch(alertClear());
    }
  };
};
const alertSuccessTimeout = (message: string) => {
  return async (dispatch, getState) => {
    try {
      dispatch(alertSuccess(message));
      setTimeout(() => {
        dispatch(alertClear());
      }, 5000);
    } catch (err) {
      dispatch(alertClear());
    }
  };
};
const alertProgressTimeout = (message: string) => {
  return async (dispatch, getState) => {
    try {
      dispatch(alertProgress(message));
      setTimeout(() => {
        dispatch(alertClear());
      }, 5000);
    } catch (err) {
      dispatch(alertClear());
    }
  };
};
function getStatusCondition(pollingResponse, type, newObjectRes, dispatch) {
  switch (type) {
    case 'STAGE': {
      const matchingPlan = pollingResponse.updatedPlans.find(
        p => p.MigPlan.metadata.name === newObjectRes.data.spec.migPlanRef.name
      );

      const migStatus = matchingPlan
        ? planUtils.getMigrationStatus(matchingPlan, newObjectRes)
        : null;
      if (migStatus.success) {
        dispatch(stagingSuccess(newObjectRes.data.spec.migPlanRef.name));
        dispatch(alertSuccessTimeout('Staging Successful'));
        return 'SUCCESS';
      } else if (migStatus.error) {
        dispatch(stagingFailure());
        dispatch(alertErrorTimeout('Staging Failed'));
        return 'FAILURE';
      }
      break;
    }

    case 'MIGRATION': {
      const matchingPlan = pollingResponse.updatedPlans.find(
        p => p.MigPlan.metadata.name === newObjectRes.data.spec.migPlanRef.name
      );
      const migStatus = matchingPlan
        ? planUtils.getMigrationStatus(matchingPlan, newObjectRes)
        : null;
      if (migStatus.success) {
        dispatch(migrationSuccess(newObjectRes.data.spec.migPlanRef.name));
        dispatch(alertSuccessTimeout('Migration Successful'));
        return 'SUCCESS';
      } else if (migStatus.error) {
        dispatch(migrationFailure());
        dispatch(alertErrorTimeout('Migration Failed'));
        return 'FAILURE';
      }
      break;
    }
    case 'PLAN': {
      const matchingPlan = pollingResponse.updatedPlans.find(
        p => p.MigPlan.metadata.name === newObjectRes.data.metadata.name
      );

      const planStatus = matchingPlan ? planUtils.getPlanStatus(matchingPlan) : null;
      if (planStatus.success) {
        dispatch(updatePlanResults('Success'));
        dispatch(updatePlan(matchingPlan.MigPlan));

        return 'SUCCESS';
      } else if (planStatus.error) {
        dispatch(updatePlanResults('Failure'));
        dispatch(updatePlan(matchingPlan.MigPlan));
        return 'FAILURE';
      }
      break;
    }
  }
}

export default {
  getStatusCondition,
  alertSuccessTimeout,
  alertErrorTimeout,
  alertProgressTimeout,
  alertClear,
};
