import { Creators } from './actions';
import { race, call, delay, put, take, takeEvery, all, select } from 'redux-saga/effects';
import planOperations from './operations';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';

const startPolling = Creators.startPolling;
const stopPolling = Creators.stopPolling;

function* poll(action) {
  const stats = {
    inProgress: false,
    fetching: false,
    nextPollEta: null,
    retries: null,
    lastResponseStatus: null,
  };
  const state = yield select();
  const client: IClusterClient = ClientFactory.hostCluster(state);

  const resource = new MigResource(MigResourceKind.MigPlan, state.migMeta.namespace);

  while (true) {
    stats.inProgress = true;
    try {
      let planList = yield client.list(resource);
      planList = yield planList.data.items;
      const refs = yield Promise.all(
        planOperations.fetchMigMigrationsRefs(client, state.migMeta, planList)
      );
      const groupedPlans = yield planOperations.groupPlans(planList, refs);
      yield put({ type: 'MIG_PLAN_POLL_SUCCESS', groupedPlans });
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
