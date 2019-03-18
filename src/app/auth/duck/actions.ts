import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  logout: [],
  login: ['username', 'password'],
  loginSuccess: ['user'],
  loginFailure: [],
});

export { Creators, Types };
