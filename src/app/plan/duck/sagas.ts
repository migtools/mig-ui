import { race, call, delay, put, take } from 'redux-saga/effects';

import { Creators } from './actions';

function* checkPVs(action) {
  const params = { ...action.params };
  let pvsFound = false;
  let tries = 0;

  while (!pvsFound) {
    if (tries < 12) {
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
