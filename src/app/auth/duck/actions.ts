import { createActions } from 'reduxsauce';

const { Types, Creators }  = createActions({
  loginSuccess: ['user'],
  loginFailure: [],
  setOauthMeta: ['oauthMeta'],
});

export { Types, Creators };
