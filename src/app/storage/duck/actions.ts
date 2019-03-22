import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  alertSuccess: ['success'],
  alertError: ['alertMessage'],
  alertClear: [],
});

export { Creators, Types };
