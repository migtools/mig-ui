import { all } from 'redux-saga/effects';
import planSagas from './app/plan/duck/sagas';

export default function* rootSaga() {
  yield all([planSagas.watchPollingTasks()]);
}
