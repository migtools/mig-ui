import { select, put, takeEvery, delay, call, race, take } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import { IReduxState } from '../../../reducers';
import { DebugTreeDiscoveryResource } from '../../../client/resources/discovery';
import { AlertActions } from '../../common/duck/actions';
import { IDiscoveryResource } from '../../../client/resources/common';
import {
  debugObjectFetchFailure,
  debugObjectFetchRequest,
  debugObjectFetchSuccess,
  startDebugPolling,
  stopDebugPolling,
  treeFetchFailure,
  treeFetchRequest,
  treeFetchSuccess,
} from './slice';
import { IDebugTreeNode } from './types';
import { PlanActionTypes } from '../../plan/duck';

function* fetchDebugObject(action) {
  const state: IReduxState = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);

  try {
    const res = yield discoveryClient.getRaw(action.rawPath);
    yield put(debugObjectFetchSuccess(res.data));
  } catch (err) {
    yield put(debugObjectFetchFailure(err.message));
    yield put(AlertActions.alertErrorTimeout(`Failed to fetch debug tree: ${err.message}`));
  }
}

function* fetchDebugTree(action) {
  const planName: string = action.payload;
  const state: IReduxState = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const debugTreeResource: IDiscoveryResource = new DebugTreeDiscoveryResource(planName);

  try {
    const res = yield discoveryClient.get(debugTreeResource);

    const links = [];
    const eachRecursive = (obj) => {
      for (const k in obj) {
        if (typeof obj[k] == 'object' && obj[k] !== null) {
          eachRecursive(obj[k]);
        } else {
          if (k === 'objectLink') {
            links.push(obj[k]);
          }
          console.log('not object then what is it', obj[k]);
        }
      }
    };
    eachRecursive(res.data);
    console.log('what are links', links);

    // const fetchDebugRefs = (links): Array<Promise<any>> => {
    const refs: Array<Promise<any>> = [];

    links.forEach((link) => {
      // const res = yield discoveryClient.getRaw(action.rawPath);
      refs.push(discoveryClient.getRaw(link));
      // return refs;
    });

    // };

    const debugRefs = yield Promise.all(refs);
    console.log('debugRefs', debugRefs);

    //loop through the tree and call all individual resources
    yield put(treeFetchSuccess(res.data, debugRefs));
  } catch (err) {
    yield put(treeFetchFailure(err.message));
    yield put(AlertActions.alertErrorTimeout(`Failed to fetch debug tree: ${err.message}`));
  }
}
function* debugPoll(action) {
  const planName = action.payload;
  while (true) {
    try {
      yield put(treeFetchRequest(planName));
      yield delay(5000);
    } catch {
      yield put(stopDebugPolling);
    }
  }
}

function* watchDebugPolling() {
  while (true) {
    const data = yield take(startDebugPolling.type);
    yield race([call(debugPoll, data), take(stopDebugPolling.type)]);
  }
}
function* watchDebugTreeFetchRequest() {
  yield takeEvery(treeFetchRequest.type, fetchDebugTree);
}

function* watchDebugObjectFetchRequest() {
  yield takeEvery(debugObjectFetchRequest.type, fetchDebugObject);
}

export default {
  watchDebugTreeFetchRequest,
  watchDebugObjectFetchRequest,
  watchDebugPolling,
};
