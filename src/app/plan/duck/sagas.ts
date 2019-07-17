import { race, call, delay, put, take } from 'redux-saga/effects';

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

function* watchPVPolling() {
  while (true) {
    const data = yield take(Creators.startPVPolling().type);
    yield race([call(checkPVs, data), take('STOP_PV_POLLING')]);
  }
}

export default {
  // watchStatusPolling,
  watchPVPolling,
};
