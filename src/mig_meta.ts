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
const INITIAL_STATE: IMigMeta = {};

export const initMigMeta = (payload: IMigMeta) => {
  return {
    type: INIT_MIG_META,
    payload,
  };
};

export const migMetaReducer = (state = INITIAL_STATE, action) => {
  return action.type === INIT_MIG_META ? action.payload : state;
};
