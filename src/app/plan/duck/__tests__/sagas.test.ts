// import { mocked } from 'ts-jest/utils';
import { takeLatest } from 'redux-saga/effects';
import { runSaga } from 'redux-saga';
import { PlanActions, PlanActionTypes } from '../actions';
import planSagas, { namespaceFetchRequest } from '../sagas';
import { DiscoveryClient } from '../../../../client/discoveryClient';
import { initialStore } from '../../../../__mocks__/store';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([]);
const store = mockStore(initialStore);

export async function recordSaga(saga, initialAction) {
  const dispatched = [];

  await runSaga(
    {
      dispatch: (action) => dispatched.push(action),
      getState: () => initialStore,
    },
    saga,
    initialAction
  ).toPromise;

  return dispatched;
}

// const MockedDiscoveryClient = mocked(DiscoveryClient);
const MockedDiscoveryClient = DiscoveryClient as jest.Mock<DiscoveryClient>;
const payload = '';
const response = {
  data: payload,
  status: 200,
  statusText: 'OK',
  config: {},
  headers: {},
};

jest.mock('../../../../client/discoveryClient', () => {
  return {
    DiscoveryClient: jest.fn().mockImplementation(() => {
      return {
        get: () => Promise.resolve(response),
      };
    }),
  };
});

describe('watchNamespaceFetchRequest', () => {
  const genObject = planSagas.watchNamespaceFetchRequest();

  it('should wait for every watchNamespaceFetchRequest action and call namespaceFetchRequest', () => {
    expect(genObject.next().value).toEqual(
      takeLatest('NAMESPACE_FETCH_REQUEST', namespaceFetchRequest)
    );
  });

  it('should be done on next iteration', () => {
    expect(genObject.next().done).toBeTruthy();
  });
});

describe('namespaceFetchRequest', () => {
  beforeEach(() => {
    // MockedDiscoveryClient.mockClear();
  });

  it('should call API and dispatch success Fetch action', async () => {
    const payload = '[{"resources":[{"name":"test","podCount":4,"pvcCount":0,"serviceCount":4}]}]';
    const response = {
      data: payload,
      status: 200,
      statusText: 'OK',
      config: {},
      headers: {},
    };

    jest.mock('../../../../client/discoveryClient', () => {
      return {
        DiscoveryClient: jest.fn().mockImplementationOnce(() => {
          return {
            get: () => Promise.resolve(response),
          };
        }),
      };
    });

    const namespaces = JSON.parse(payload);

    const dispatched = await recordSaga(namespaceFetchRequest, {
      clusterName: 'ocp311',
      type: 'NAMESPACE_FETCH_REQUEST',
    });
    expect(dispatched).toContainEqual(PlanActions.namespaceFetchSuccess(namespaces.resources));
    expect(MockedDiscoveryClient).toHaveBeenCalledTimes(1);
  });

  it('should call API and dispatch fail Fetch action', async () => {
    jest.mock('../../../../client/discoveryClient', () => {
      return {
        DiscoveryClient: jest.fn().mockImplementationOnce(() => {
          return {
            get: () => Promise.reject(new Error('not found')),
          };
        }),
      };
    });

    const dispatched = await recordSaga(namespaceFetchRequest, {
      clusterName: 'ocp311',
      type: 'NAMESPACE_FETCH_REQUEST',
    });

    expect(dispatched).toContainEqual(PlanActions.namespaceFetchFailure('not found'));
    expect(MockedDiscoveryClient).toHaveBeenCalledTimes(1);
  });
});
