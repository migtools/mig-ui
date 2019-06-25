import { push } from 'connected-react-router';
import { Creators } from '../../auth/duck/actions';

export const isSelfSignedCertError = (err) => {
  const e = err.toJSON();
  // HACK: Doing our best to determine whether or not the
  // error was produced due to a self signed cert error.
  // It's an extremely barren object.
  return !e.code && e.message === 'Network Error';
};

export const handleSelfSignedCertError = (failedUrl: string, dispatch: any) => {
  dispatch(Creators.certErrorOccurred(failedUrl));
  dispatch(push('/cert-error'));
};
