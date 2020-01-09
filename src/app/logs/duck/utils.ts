import { AuthActions } from '../../auth/duck/actions';
import { put } from 'redux-saga/effects';
import { push } from 'connected-react-router';

export function* handleCertError(failedUrl) {
  yield put(AuthActions.certErrorOccurred(failedUrl));
  yield put(push('/cert-error'));
}
