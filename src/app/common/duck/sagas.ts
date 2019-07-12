import { race, call, delay, take, put } from 'redux-saga/effects';

import {
  startDataListPolling,
  stopDataListPolling,
  startStatusPolling,
  stopStatusPolling,
} from './actions';

function* poll(action) {
  const params = { ...action.params };

  const stats = {
    inProgress: false,
    fetching: false,
    nextPollEta: null,
    retries: null,
    lastResponseStatus: null,
  };

  while (true) {
    stats.inProgress = true;
    try {
      // Make the API call
      stats.fetching = true;
      params.onStatsChange(stats);
      const response = yield call(params.asyncFetch);
      // API call was successful
      stats.fetching = false;
      stats.nextPollEta = params.delay;
      const shouldContinue = params.callback(response, stats);

      if (shouldContinue) {
        stats.retries = 0;
        stats.lastResponseStatus = 'success';
        params.onStatsChange(stats);
      } else {
        params.onStatsChange(stats);
        throw new Error('Error while fetching data.');
      }
    } catch (e) {
      throw new Error(e);
    }
    yield delay(params.delay);
  }
}
function* watchDataListPolling() {
  while (true) {
    const action = yield take(startDataListPolling().type);
    yield race([call(poll, action), take(stopDataListPolling().type)]);
  }
}

function* checkStatus(action) {
  const params = { ...action.params };
  while (true) {
    const generatorRes = yield call(params.asyncFetch);
    const pollingStatus = params.callback(
      generatorRes,
      params.type,
      params.statusItem,
      params.dispatch
    );

    switch (pollingStatus) {
      case 'SUCCESS':
        yield put({ type: 'STOP_STATUS_POLLING' });
        break;
      case 'FAILURE':
        stopStatusPolling();

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
    const data = yield take(startStatusPolling().type);
    yield race([call(checkStatus, data), take('STOP_STATUS_POLLING')]);
  }
}

export default {
  watchDataListPolling,
  watchStatusPolling,
};
