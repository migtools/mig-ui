import { createActions } from 'reduxsauce';

export const CERT_ERROR_OCCURRED = 'CERT_ERROR_OCCURRED';

const { Types, Creators } = createActions({
  loginSuccess: ['user'],
  loginFailure: [],
  setOauthMeta: ['oauthMeta'],
  certErrorOccurred: ['failedUrl'],
});

export { Types, Creators };
