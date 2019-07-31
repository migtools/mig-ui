
const startPVPolling = (params) => ({
  type: RequestActionTypes.START_PV_POLLING,
  params,
});

const stopPVPolling = () => ({
  type: RequestActionTypes.STOP_PV_POLLING,
});

const planResultsRequest = () => ({
  type: RequestActionTypes.PLAN_RESULTS_REQUEST,
});

const planUpdateRequest = (planValues) => ({
  type: RequestActionTypes.PLAN_UPDATE_REQUEST,
  planValues,
});

const addPlanRequest = () => ({
  type: RequestActionTypes.ADD_PLAN_REQUEST,
});

const initStage = (planName: string) => ({
  type: RequestActionTypes.INIT_STAGE,
  planName,
});

const initMigration = (planName: string) => ({
  type: RequestActionTypes.INIT_MIGRATION,
  planName,
});

const planDeleteRequest = (planName: string) => ({
  type: RequestActionTypes.PLAN_DELETE_REQUEST,
  planName,
});

export const RequestActionTypes = {
  START_PV_POLLING: 'START_PV_POLLING',
  STOP_PV_POLLING: 'STOP_PV_POLLING',
  ADD_PLAN_REQUEST: 'ADD_PLAN_REQUEST',
  PLAN_UPDATE_REQUEST: 'PLAN_UPDATE_REQUEST',
  PLAN_RESULTS_REQUEST: 'PLAN_RESULTS_REQUEST',
  INIT_STAGE: 'INIT_STAGE',
  INIT_MIGRATION: 'INIT_MIGRATION',
  PLAN_DELETE_REQUEST: 'PLAN_DELETE_REQUEST',
};

export const RequestActions = {
  startPVPolling,
  stopPVPolling,
  planResultsRequest,
  planUpdateRequest,
  addPlanRequest,
  initStage,
  initMigration,
  planDeleteRequest,
};
