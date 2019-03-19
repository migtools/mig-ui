const INIT_MIG_META = 'INIT_MIG_META';
const INITIAL_STATE = {};

export const initMigMeta = payload => {
  return {
    type: INIT_MIG_META,
    payload,
  }
}

export const migMetaReducer = (state = INITIAL_STATE, action) => {
  return action.type == INIT_MIG_META ? action.payload : state;
}
