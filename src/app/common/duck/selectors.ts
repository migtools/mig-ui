import { createSelector } from 'reselect';
import { DefaultRootState } from '../../../configureStore';

const getAuth = (state: DefaultRootState) => state.auth;

export default {
  getAuth,
};
