import { takeEvery, takeLatest, select, retry, race, call, delay, put, take } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { updateMigPlanFromValues } from '../../../client/resources/conversions';
import PlanOperations from './operations';
import {
  AlertActions,
  PollingActions
} from '../../common/duck/actions';
import { PlanActions, PlanActionTypes } from './actions';


function* checkPVs(action) {
  const params = { ...action.params };
  let pvsFound = false;
  let tries = 0;
  const TicksUntilTimeout = 20;

  while (!pvsFound) {
    if (tries < TicksUntilTimeout) {
      tries += 1;
      const plansRes = yield call(params.asyncFetch);
      const pollingStatus = params.callback(plansRes);
      switch (pollingStatus) {
        case 'SUCCESS':
          pvsFound = true;
          yield put({ type: PlanActionTypes.STOP_PV_POLLING });
          break;
        case 'FAILURE':
          pvsFound = true;
          PlanActions.stopPVPolling();
          yield put({ type: PlanActionTypes.STOP_PV_POLLING });
          break;
        default:
          break;
      }
      yield delay(params.delay);
    } else {
      // PV discovery timed out, alert and stop polling
      pvsFound = true; // No PVs timed out
      PlanActions.stopPVPolling();
      yield put(AlertActions.alertErrorTimeout('Timed out during PV discovery'));
      yield put({ type: PlanActionTypes.PV_FETCH_SUCCESS, });
      yield put({ type: PlanActionTypes.STOP_PV_POLLING });
      break;
    }
  }
}

function* getPlanSaga(planName) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    return yield client.get(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      planName
    );
  } catch (err) {
    throw err;
  }
}
function* putPlanSaga(getPlanRes, planValues) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    const updatedMigPlan = updateMigPlanFromValues(getPlanRes.data, planValues);
    const putPlanResponse = yield client.put(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      getPlanRes.data.metadata.name,
      updatedMigPlan
    );
    yield put({ type: PlanActionTypes.UPDATE_PLAN, updatedPlan: putPlanResponse.data });
  } catch (err) {
    throw err;
  }
}

function* planUpdateRetry(action) {
  try {
    const SECOND = 1000;
    const getPlanResponse = yield call(getPlanSaga, action.planValues.planName);
    yield retry(3, 10 * SECOND, putPlanSaga, getPlanResponse, action.planValues);
  } catch (error) {
    yield put(AlertActions.alertErrorTimeout('Failed to update plan'));
  }
}

function* watchPVPolling() {
  while (true) {
    const data = yield take(PlanActionTypes.START_PV_POLLING);
    yield race([call(checkPVs, data), take(PlanActionTypes.STOP_PV_POLLING)]);
  }
}

function* watchPlanUpdate() {
  yield takeEvery(PlanActionTypes.PLAN_UPDATE_REQUEST, planUpdateRetry);
}


function* checkClosedStatus(action) {
  let planClosed = false;
  let tries = 0;
  const TicksUntilTimeout = 20;
  while (!planClosed) {
    if (tries < TicksUntilTimeout) {
      tries += 1;
      const getPlanResponse = yield call(getPlanSaga, action.planName);
      const MigPlan = getPlanResponse.data;

      if (MigPlan.status && MigPlan.status.conditions) {
        const hasClosedCondition = !!MigPlan.status.conditions.some(c => c.type === 'Closed');
        if (hasClosedCondition) {
          yield put(PlanActions.planCloseSuccess());
          yield put(PlanActions.stopClosedStatusPolling());
        }
      }
    } else {
      planClosed = true;
      yield put(PlanActions.planCloseFailure('Failed to close plan'));
      yield put(AlertActions.alertErrorTimeout('Timed out during plan close'));
      yield put(PlanActions.stopClosedStatusPolling());
      break;
    }

    const PollingInterval = 5000;
    yield delay(PollingInterval);
  }
}

function* planCloseSaga(action) {
  try {
    const updatedValues = {
      planName: action.planName,
      planClosed: true,
      persistentVolumes: []
    };
    yield put(PlanActions.planUpdateRequest(updatedValues));
    yield put(PlanActions.startClosedStatusPolling(updatedValues.planName));
  }
  catch (err) {
    yield put(PlanActions.planCloseFailure(err));
    yield put(AlertActions.alertErrorTimeout('Plan close request failed'));

  }
}

function* planCloseAndDeleteSaga(action) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    yield put(PlanActions.planCloseRequest(action.planName));
    yield take(PlanActionTypes.PLAN_CLOSE_SUCCESS);
    yield client.delete(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      action.planName,
    );
    yield put(PlanActions.planCloseAndDeleteSuccess(action.planName));
    yield put(AlertActions.alertSuccessTimeout(`Successfully removed plan "${action.planName}"!`));
  } catch (err) {
    yield put(PlanActions.planCloseAndDeleteFailure(err));
    yield put(AlertActions.alertErrorTimeout('Plan delete request failed'));
  }
}

function* watchPlanCloseAndDelete() {
  yield takeLatest(PlanActionTypes.PLAN_CLOSE_AND_DELETE_REQUEST, planCloseAndDeleteSaga);
}
function* watchPlanClose() {
  yield takeLatest(PlanActionTypes.PLAN_CLOSE_REQUEST, planCloseSaga);
}
function* watchClosedStatus() {
  while (true) {
    const data = yield take(PlanActionTypes.CLOSED_STATUS_POLL_START);
    yield race([call(checkClosedStatus, data), take(PlanActionTypes.CLOSED_STATUS_POLL_STOP)]);
  }
}


export default {
  watchPlanUpdate,
  watchPVPolling,
  watchPlanCloseAndDelete,
  watchPlanClose,
  watchClosedStatus
};
