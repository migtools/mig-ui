import { ALERT_CLEAR, ALERT_ERROR, ALERT_SUCCESS } from './actions';

export const INITIAL_STATE = {};

// export const success = (state = INITIAL_STATE, action) => {
//   return {
//     ...state,
//     alertMessage: action.message,
//   };
// };

// const failure = (state = INITIAL_STATE, action) => {
//   return { ...state, alertMessage: action.message };
// };
// const clear = (state = INITIAL_STATE, action) => {
//   return {};
// };

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
