import { takeEvery, select, retry, race, call, delay, put, take } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient, ClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { updateMigPlanFromValues } from '../../../client/resources/conversions';

import { Creators } from './actions';
import { alertError } from '../../common/duck/actions';

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
          yield put({ type: 'STOP_PV_POLING' });
          break;
        case 'FAILURE':
          pvsFound = true;
          Creators.stopPVPolling();
          yield put({ type: 'STOP_PV_POLLING' });
          break;
        default:
          break;
      }
      yield delay(params.delay);
    } else {
      // PV discovery timed out, alert and stop polling
      pvsFound = true; // No PVs timed out
      Creators.stopPVPolling();
      yield put(alertError('Timed out during PV discovery'));
      yield put(Creators.pvFetchSuccess());
      yield put({ type: 'STOP_PV_POLLING' });
      break;
    }
  }
}

function* planUpdateGenerator(planValues) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    const latestPlanRes = yield client.get(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      planValues.planName
    );

    const latestPlan = latestPlanRes.data;
    const updatedMigPlan = updateMigPlanFromValues(latestPlan, planValues);
    return yield client.put(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      latestPlan.metadata.name,
      updatedMigPlan
    );
  } catch (err) {
    return { err };
  }
}

function* planUpdateRetry(action) {
  try {
    const SECOND = 1000;
    const response = yield retry(3, 10 * SECOND, planUpdateGenerator, action.planValues);

    yield put({ type: 'UPDATE_PLAN', updatedPlan: response.data });
  } catch (error) {
    yield put({ type: 'REQUEST_FAIL', payload: { error } });
  }
}

function* watchPVPolling() {
  while (true) {
    const data = yield take(Creators.startPVPolling().type);
    yield race([call(checkPVs, data), take('STOP_PV_POLLING')]);
  }
}
function* watchPlanUpdate() {
  yield takeEvery('PLAN_UPDATE_REQUEST', planUpdateRetry);
}

export default {
  watchPlanUpdate,
  watchPVPolling,
};
