import { Types } from "./actions";
import { createReducer } from "reduxsauce";
export const INITIAL_STATE = {
  isFetching: false,
  clusterList: [
    {
      apiVersion: "migrations.openshift.io/v1beta1",
      kind: "MigrationCluster",
      metadata: {
        creationTimestamp: "2019-03-13T20:27:51Z",
        generation: 1,
        labels: {
          "controller-tools.k8s.io": "1.0",
          "migrations.openshift.io/migration-group": "example"
        },
        name: "my-new-cluster",
        namespace: "mig",
        resourceVersion: "30097",
        selfLink:
          "/apis/migrations.openshift.io/v1beta1/namespaces/mig/migrationclusters/my-new-cluster",
        uid: "797864fb-45ce-11e9-9286-0e070849dc4e"
      },
      spec: {
        clusterAuthSecretRef: {
          name: "my-new-cluster-migrationcluster-auth",
          namespace: "openshift-config"
        },
        clusterUrl: "https://ocp4.example.com:8443"
      }
    },
    {
      apiVersion: "migrations.openshift.io/v1beta1",
      kind: "MigrationCluster",
      metadata: {
        creationTimestamp: "2019-03-13T20:27:51Z",
        generation: 1,
        labels: {
          "controller-tools.k8s.io": "1.0",
          "migrations.openshift.io/migration-group": "example"
        },
        name: "my-old-cluster",
        namespace: "mig",
        resourceVersion: "30096",
        selfLink:
          "/apis/migrations.openshift.io/v1beta1/namespaces/mig/migrationclusters/my-old-cluster",
        uid: "7974889a-45ce-11e9-9286-0e070849dc4e"
      },
      spec: {
        clusterAuthSecretRef: {
          name: "my-old-cluster-migrationcluster-auth",
          namespace: "openshift-config"
        },
        clusterUrl: "https://ocp3.example.com:8443"
      }
    }
  ],
  clusterSearchText: ""
};

export const clusterFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, clusterList: action.clusterList };
};

export const addClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: [...state.clusterList, action.newCluster]
  };
};
export const removeClusterSuccess = (state = INITIAL_STATE, action) => {
  return { ...state };
};

export const HANDLERS = {
  [Types.CLUSTER_FETCH_SUCCESS]: clusterFetchSuccess,
  [Types.ADD_CLUSTER_SUCCESS]: addClusterSuccess,
  [Types.REMOVE_CLUSTER_SUCCESS]: removeClusterSuccess
};

export default createReducer(INITIAL_STATE, HANDLERS);
