import { takeEvery, takeLatest, select, retry, race, call, delay, put, take } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { updateMigPlanFromValues } from '../../../client/resources/conversions';

import {
  alertErrorTimeout,
  alertSuccessTimeout,
} from '../../common/duck/actions';
import { RequestActions, RequestActionTypes } from './actions/request_actions';
import { ChangeActions, ChangeActionTypes } from './actions/change_actions';
import { FetchActions, FetchActionTypes} from './actions/fetch_actions';

const TicksUntilTimeout = 20;

function* checkPVs(action) {
  const params = { ...action.params };
  let pvsFound = false;
  let tries = 0;

  while (!pvsFound) {
    if (tries < TicksUntilTimeout) {
      tries += 1;
      const plansRes = yield call(params.asyncFetch);
      const pollingStatus = params.callback(plansRes);
      switch (pollingStatus) {
        case 'SUCCESS':
          pvsFound = true;
          yield put({ type: RequestActionTypes.STOP_PV_POLLING });
          break;
        case 'FAILURE':
          pvsFound = true;
          RequestActions.stopPVPolling();
          yield put({ type: RequestActionTypes.STOP_PV_POLLING });
          break;
        default:
          break;
      }
      yield delay(params.delay);
    } else {
      // PV discovery timed out, alert and stop polling
      pvsFound = true; // No PVs timed out
      RequestActions.stopPVPolling();
      yield put(alertErrorTimeout('Timed out during PV discovery'));
      yield put({ type: FetchActionTypes.PV_FETCH_SUCCESS, });
      yield put({ type: RequestActionTypes.STOP_PV_POLLING });
      break;
    }
  }
}

function* getPlanSaga(planValues) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    return yield client.get(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      planValues.planName
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
    yield put({ type: ChangeActionTypes.UPDATE_PLAN, updatedPlan: putPlanResponse.data });
  } catch (err) {
    throw err;
  }
}

function* planUpdateRetry(action) {
  try {
    const SECOND = 1000;
    const getPlanResponse = yield call(getPlanSaga, action.planValues);
    yield retry(3, 10 * SECOND, putPlanSaga, getPlanResponse, action.planValues);
  } catch (error) {
    yield put(alertErrorTimeout('Failed to update plan'));
  }
}

function* watchPVPolling() {
  while (true) {
    const data = yield take(RequestActionTypes.START_PV_POLLING);
    yield race([call(checkPVs, data), take(RequestActionTypes.STOP_PV_POLLING)]);
  }
}

function* watchPlanUpdate() {
  yield takeEvery(RequestActionTypes.PLAN_UPDATE_REQUEST, planUpdateRetry);
}

function* planDeleteSaga(action) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try{
    yield client.delete(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      action.planName,
    );
    yield put(ChangeActions.planDeleteSuccess(action.planName));
    yield put(alertSuccessTimeout(`Successfully removed plan "${action.planName}"!`));
  } catch(err) {
    console.error(err);
    yield put(alertErrorTimeout('Plan delete request failed'));
  }
}

function* watchPlanDelete() {
  yield takeLatest(RequestActionTypes.PLAN_DELETE_REQUEST, planDeleteSaga);
}

export default {
  watchPlanUpdate,
  watchPVPolling,
  watchPlanDelete,
};
