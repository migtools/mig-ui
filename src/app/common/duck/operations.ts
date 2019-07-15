import { alertSuccess, alertError, alertProgress, alertClear } from './actions';
import { getMigrationStatus, getPlanStatus } from '../../plan/duck/utils';
import { getClusterStatus, getClusterUpdatedStatus } from '../../cluster/duck/utils';
import { Creators as PlanCreators } from '../../plan/duck/actions';
import { Creators as ClusterCreators } from '../../cluster/duck/actions';
import clusterOperations from '../../cluster/duck/operations';

const updateClusterSuccess = ClusterCreators.updateClusterSuccess;
const updateClusterFailure = ClusterCreators.updateClusterFailure;
const addClusterSuccess = ClusterCreators.addClusterSuccess;
const addClusterFailure = ClusterCreators.addClusterFailure;
const migrationSuccess = PlanCreators.migrationSuccess;
const stagingSuccess = PlanCreators.stagingSuccess;
const migrationFailure = PlanCreators.migrationFailure;
const stagingFailure = PlanCreators.stagingFailure;

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
      const matchingPlan = pollingResponse.updatedPlans
        .filter(p => p.MigPlan.metadata.name === newObjectRes.data.spec.migPlanRef.name)
        .pop();

      const migStatus = matchingPlan ? getMigrationStatus(matchingPlan, newObjectRes) : null;
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
      const matchingPlan = pollingResponse.updatedPlans
        .filter(p => p.MigPlan.metadata.name === newObjectRes.data.spec.migPlanRef.name)
        .pop();
      const migStatus = matchingPlan ? getMigrationStatus(matchingPlan, newObjectRes) : null;
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
      const matchingPlan = pollingResponse.updatedPlans
        .filter(p => p.MigPlan.metadata.name === newObjectRes.data.metadata.name)
        .pop();

      const planStatus = matchingPlan ? getPlanStatus(matchingPlan) : null;
      if (planStatus.success) {
        return 'SUCCESS';
      } else if (planStatus.error) {
        return 'FAILURE';
      }
      break;
    }
    case 'CLUSTER': {
      const matchingCluster = pollingResponse.updatedClusters
        .filter(c => c.MigCluster.metadata.name === newObjectRes.MigCluster.metadata.name)
        .pop();
      const clusterStatus = matchingCluster ? getClusterStatus(matchingCluster) : null;
      if (clusterStatus.success) {
        dispatch(addClusterSuccess(matchingCluster));
        dispatch(alertSuccessTimeout('Successfully added cluster'));
        return 'SUCCESS';
      } else if (clusterStatus.error) {
        dispatch(addClusterFailure());
        dispatch(alertErrorTimeout('Failed to add cluster'));
        dispatch(clusterOperations.removeCluster(newObjectRes.MigCluster.metadata.name));
        return 'FAILURE';
      }
      break;
    }
    case 'UPDATE_CLUSTER': {
      const matchingCluster = pollingResponse.updatedClusters
        .filter(c => c.MigCluster.metadata.name === newObjectRes.MigCluster.metadata.name)
        .pop();
      const clusterStatus = matchingCluster
        ? getClusterUpdatedStatus(matchingCluster, newObjectRes.MigCluster)
        : null;
      if (clusterStatus.success) {
        dispatch(updateClusterSuccess(matchingCluster));
        dispatch(alertSuccessTimeout('Successfully updated cluster'));
        return 'SUCCESS';
      } else if (clusterStatus.error) {
        dispatch(updateClusterFailure());
        dispatch(alertErrorTimeout('Failed to update cluster'));
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
