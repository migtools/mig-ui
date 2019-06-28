import { race, call, delay, put, take } from 'redux-saga/effects';

import { Creators } from './actions';

function* checkJobStatus(action) {
  const params = { ...action.params };
  let jobSucceeded = false;
  while (!jobSucceeded) {
    const plansRes = yield call(params.asyncFetch);
    const pollingStatus = params.callback(plansRes);

    switch (pollingStatus) {
      case 'SUCCESS':
        jobSucceeded = true;
        yield put({ type: 'STOP_STATUS_POLLING' });
        break;
      case 'FAILURE':
        jobSucceeded = true;
        Creators.stopStatusPolling();
        yield put({ type: 'STOP_STATUS_POLLING' });
        break;
      default:
        break;
    }
    yield delay(params.delay);
  }
}
function* watchStatusPolling() {
  while (true) {
    const data = yield take(Creators.startStatusPolling().type);
    yield race([call(checkJobStatus, data), take('STOP_STATUS_POLLING')]);
  }
}

export default {
  watchStatusPolling,
};
