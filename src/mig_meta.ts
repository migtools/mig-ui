export interface IMigMeta {
  clusterApi?: string;
  namespace?: string;
  configNamespace?: string;
  oauth?: {
    clientId?: string;
    redirectUrl?: string;
    userScope?: string;
    clientSecret?: string;
  };
}

const INIT_MIG_META = 'INIT_MIG_META';
const SET_ACTIVE_NAMESPACE = 'SET_ACTIVE_NAMESPACE';
const INITIAL_STATE: IMigMeta = {};

export const initMigMeta = (migMeta: IMigMeta) => {
  return {
    type: INIT_MIG_META,
    migMeta,
  };
};

export const setActiveNamespace = (activeNamespace) => {
  return {
    type: SET_ACTIVE_NAMESPACE,
    activeNamespace,
  };
};

export const migMetaReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case INIT_MIG_META:
      return action.migMeta;

    case SET_ACTIVE_NAMESPACE:
      return { ...state, namespace: action.activeNamespace };

    default:
      return state;
  }
  // return action.type === INIT_MIG_META ? action.payload : state;
};
