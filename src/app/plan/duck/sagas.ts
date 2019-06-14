import { Creators } from './actions';
import { race, call, delay, put, take, takeEvery, all, select } from 'redux-saga/effects';
import planSelectors from './selectors';
import planOperations from './operations';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { commonOperations } from '../../common/duck';

const startPolling = Creators.startPolling;
const stopPolling = Creators.stopPolling;

function* helloSaga() {
  console.log('Hello Sagas!');
}

// function* fetchPlansSaga() {
//   // dispatch(migPlanFetchRequest());
//   yield put({ type: 'MIG_PLAN_FETCH_POLLING_REQUEST' });
//   //   const { migMeta } = getState();
//   const migMeta = yield select(planSelectors.getMigMeta);
//   const state = yield select();
//   const client: IClusterClient = ClientFactory.hostCluster(state);

//   const resource = new MigResource(MigResourceKind.MigPlan, migMeta.namespace);
//   try {
//     //   const res = await client.list(resource);
//     let planList = yield client.list(resource);
//     planList = yield planList.data.items;
//     //   const refs = await Promise.all(fetchMigMigrationsRefs(client, migMeta, migPlans));
//     const refs = yield Promise.all(
//       planOperations.fetchMigMigrationsRefs(client, migMeta, planList)
//     );
//     const groupedPlans = planOperations.groupPlans(planList, refs);
//     //   dispatch(migPlanFetchSuccess(groupedPlans));
//     yield put({ type: 'MIG_PLAN_FETCH_SUCCESS', groupedPlans });
//   } catch (err) {
//     yield put({ type: 'MIG_PLAN_FETCH_FAILURE', err });
//   }
// }

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
    yield put({ type: 'MIG_PLAN_FETCH_POLLING_REQUEST' });
    const response = yield call(planOperations.fetchPlans);
    // const pollingStatus = pollingAction.payload.response.status;
    console.log('pollingAction', response);
    // const pollingStatus = pollingAction;
    // switch (pollingStatus) {
    //   case POLLING_STATUS.SUCCEEDED:
    //     jobSucceeded = true;
    //     yield put({ type: 'HANDLE_POLLING_SUCCESS' });
    //     break;
    //   case POLLING_STATUS.FAILED:
    //     jobSucceeded = true;
    //     yield put({ type: 'HANDLE_POLLING_FAILURE' });
    //     break;
    //   default:
    //     break;
    // }
    // delay the next polling request in 1 second
    yield delay(1000);
  }
}
function* watchPollingTasks() {
  while (true) {
    const action = yield take(startPolling().type);
    yield race([call(poll, action), take(stopPolling().type)]);
  }
}

export default {
  helloSaga,
  watchPollingTasks,
};
