import { takeLatest, select} from 'redux-saga/effects';
import { PlanActions, PlanActionTypes } from '../actions';
import * as sagas from '../sagas';
import { IClusterClient } from '../../../../client/client';
import { ClientFactory } from '../../../../client/client_factory';
import { MigResource, MigResourceKind } from '../../../../client/resources';

function * putClosedMock(action) {
  const state = yield select();
  const { migMeta } = state;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  setTimeout(() => {
    const mockClosedStatus = {
      status: {
        conditions: [{
          lastTransitionTime: new Date().toUTCString(),
          type: 'Closed',
        }]
      }
    };
    return client.patch(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      action.planName,
      mockClosedStatus);
  }, 2000);
}

function* watchClosedStatus() {
  try {
    yield takeLatest(PlanActionTypes.CLOSED_STATUS_POLL_START, putClosedMock);
    yield sagas.default.watchClosedStatus();
  } catch (err) {
    alert('An error appeared during mocked plan closure ' + err.toString());
  }
}

export default {
  watchPlanUpdate: sagas.default.watchPlanUpdate,
  watchPVPolling: sagas.default.watchPVPolling,
  watchPlanCloseAndDelete: sagas.default.watchPlanCloseAndDelete,
  watchPlanClose: sagas.default.watchPlanClose,
  watchClosedStatus
};
