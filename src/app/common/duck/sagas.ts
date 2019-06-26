import { race, call, delay, put, take, takeEvery, all, select } from 'redux-saga/effects';

import { startPolling, stopPolling } from './actions';

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
    const action = yield take(startPolling().type);
    yield race([call(poll, action), take(stopPolling().type)]);
  }
}

export default {
  watchDataListPolling,
};
