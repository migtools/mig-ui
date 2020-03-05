import { AlertActionTypes } from './actions';

export const INITIAL_STATE = {};

function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    } else {
      return state;
    }
  };
}

export default createReducer(
  { successText: null, errorText: null, progressText: null, errorModalObject: null },
  {
    [AlertActionTypes.ALERT_PROGRESS]: (state, action) => {
      const text = action.text.trim();
      return { ...state, progressText: text };
    },
    [AlertActionTypes.ALERT_SUCCESS]: (state, action) => {
      const text = action.text.trim();
      return { ...state, successText: text };
    },
    [AlertActionTypes.ALERT_ERROR]: (state, action) => {
      const text = action.text.trim();
      return { ...state, errorText: text };
    },
    [AlertActionTypes.ALERT_ERROR_MODAL]: (state, action) => {
      return { ...state, errorModalObject: action.errorModalObject, };
    },
    [AlertActionTypes.ERROR_MODAL_CLEAR]: (state, action) => {
      return { ...state, errorModalText: null };
    },
    [AlertActionTypes.ALERT_CLEAR]: (state, action) => {
      return { ...state, successText: null, errorText: null, progressText: null };
    },
  }
);

