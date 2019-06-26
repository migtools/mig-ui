import { all } from 'redux-saga/effects';
import commonSagas from './app/common/duck/sagas';

export default function* rootSaga() {
  yield all([commonSagas.watchDataListPolling(), commonSagas.watchStatusPolling()]);
}
