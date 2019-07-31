
interface IMigPlan {
  MigPlan: object;
  MigMigrations: object[];
}

const migPlanFetchRequest = () => ({
  type: FetchActionTypes.MIG_PLAN_FETCH_REQUEST,
});

const migPlanFetchSuccess = (migPlanList: IMigPlan[]) => ({
  type: FetchActionTypes.MIG_PLAN_FETCH_SUCCESS,
  migPlanList,
});

const migPlanFetchFailure = () => ({
  type: FetchActionTypes.MIG_PLAN_FETCH_FAILURE,
});

const pvFetchRequest = () => ({
  type: FetchActionTypes.PV_FETCH_REQUEST,
});

const pvFetchFailure = () => ({
  type: FetchActionTypes.PV_FETCH_FAILURE,
});

const pvFetchSuccess = () => ({
  type: FetchActionTypes.PV_FETCH_SUCCESS,
});

const sourceClusterNamespacesFetchSuccess = (sourceClusterNamespaces: any[]) => ({
  type: FetchActionTypes.SOURCE_CLUSTER_NAMESPACES_FETCH_SUCCESS,
  sourceClusterNamespaces,
});

const namespaceFetchRequest = () => ({
  type: FetchActionTypes.NAMESPACE_FETCH_REQUEST,
});

const namespaceFetchSuccess = (sourceClusterNamespaces: any[]) => ({
  type: FetchActionTypes.NAMESPACE_FETCH_SUCCESS,
  sourceClusterNamespaces,
});

const namespaceFetchFailure = (err) => ({
  type: FetchActionTypes.NAMESPACE_FETCH_FAILURE,
  err,
});

export const FetchActionTypes = {
  MIG_PLAN_FETCH_REQUEST: 'MIG_PLAN_FETCH_REQUEST',
  MIG_PLAN_FETCH_SUCCESS: 'MIG_PLAN_FETCH_SUCCESS',
  MIG_PLAN_FETCH_FAILURE: 'MIG_PLAN_FETCH_FAILURE',
  NAMESPACE_FETCH_REQUEST: 'NAMESPACE_FETCH_REQUEST',
  NAMESPACE_FETCH_SUCCESS: 'NAMESPACE_FETCH_SUCCESS',
  NAMESPACE_FETCH_FAILURE: 'NAMESPACE_FETCH_FAILURE',
  PV_FETCH_REQUEST: 'PV_FETCH_REQUEST',
  PV_FETCH_FAILURE: 'PV_FETCH_FAILURE',
  PV_FETCH_SUCCESS: 'PV_FETCH_SUCCESS',
  SOURCE_CLUSTER_NAMESPACES_FETCH_SUCCESS: 'SOURCE_CLUSTER_NAMESPACES_FETCH_SUCCESS',
};

export const FetchActions = {
  migPlanFetchRequest,
  migPlanFetchSuccess,
  migPlanFetchFailure,
  pvFetchRequest,
  pvFetchFailure,
  pvFetchSuccess,
  sourceClusterNamespacesFetchSuccess,
  namespaceFetchRequest,
  namespaceFetchSuccess,
  namespaceFetchFailure,
};
