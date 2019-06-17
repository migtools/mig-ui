// import { Creators } from './actions';
import { race, call, delay, put, take, takeEvery, all, select } from 'redux-saga/effects';
// import planOperations from './operations';
// import { ClientFactory } from '../../../client/client_factory';
// import { IClusterClient } from '../../../client/client';
// import { MigResource, MigResourceKind } from '../../../client/resources';

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

      // let planList = yield client.list(resource);
      // planList = yield planList.data.items;
      // const refs = yield Promise.all(
      //   planOperations.fetchMigMigrationsRefs(client, state.migMeta, planList)
      // );
      // const groupedPlans = yield planOperations.groupPlans(planList, refs);
      // yield put({ type: 'MIG_PLAN_POLL_SUCCESS', groupedPlans });
    } catch (e) {
      console.log('error polling', e);
    }
    yield delay(5000);
  }
}
function* watchPollingTasks() {
  while (true) {
    const action = yield take(startPolling().type);
    yield race([call(poll, action), take(stopPolling().type)]);
  }
}

export default {
  watchPollingTasks,
};
