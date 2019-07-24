import { takeEvery, select, retry, race, call, delay, put, take } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { updateMigPlanFromValues } from '../../../client/resources/conversions';

import { Creators } from './actions';
import { alertErrorTimeout } from '../../common/duck/actions';

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
          yield put({ type: Creators.stopPVPolling().type });
          break;
        case 'FAILURE':
          pvsFound = true;
          Creators.stopPVPolling();
          yield put({ type: Creators.stopPVPolling().type });
          break;
        default:
          break;
      }
      yield delay(params.delay);
    } else {
      // PV discovery timed out, alert and stop polling
      pvsFound = true; // No PVs timed out
      Creators.stopPVPolling();
      yield put(alertErrorTimeout('Timed out during PV discovery'));
      yield put(Creators.pvFetchSuccess());
      yield put({ type: Creators.stopPVPolling().type });
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
    yield put({ type: Creators.updatePlan().type, updatedPlan: putPlanResponse.data });
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
    const data = yield take(Creators.startPVPolling().type);
    yield race([call(checkPVs, data), take(Creators.stopPVPolling().type)]);
  }
}
function* watchPlanUpdate() {
  yield takeEvery(Creators.planUpdateRequest().type, planUpdateRetry);
}

export default {
  watchPlanUpdate,
  watchPVPolling,
};
