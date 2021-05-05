import { put } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import { certErrorOccurred } from '../../auth/duck/slice';

export function* handleCertError(failedUrl) {
  yield put(certErrorOccurred(failedUrl));
  yield put(push('/cert-error'));
}
