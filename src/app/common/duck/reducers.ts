import {
  ALERT_CLEAR,
  ALERT_ERROR,
  ALERT_SUCCESS,
  UPDATE_POLLING_STATS,
} from './actions';

export const INITIAL_STATE = {
  pollingStats: {},
};

export default createReducer(
  { successText: null, errorText: null },
  {
    [ALERT_SUCCESS]: (state, action) => {
      const text = action.text.trim();
      return { ...state, successText: text };
    },
    [ALERT_ERROR]: (state, action) => {
      const text = action.text.trim();
      return { ...state, errorText: text };
    },
    [ALERT_CLEAR]: (state, action) => {
      return { ...state, successText: null, errorText: null };
    },
    [UPDATE_POLLING_STATS]: (state, action) => {
      return { ...state, pollingStats: action.stats };
    },
  }
);

function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    } else {
      return state;
    }
  };
}
