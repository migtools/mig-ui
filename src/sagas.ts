import { all } from 'redux-saga/effects';
import { helloSaga, watchIncrementAsync } from './app/plan/duck/sagas';

export default function* rootSaga() {
  yield all([helloSaga(), watchIncrementAsync()]);
}
