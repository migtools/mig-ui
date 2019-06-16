import _ from 'lodash';
import { NamespacedResource, ClusterResource, KubeResource,
  CoreNamespacedResource, CoreClusterResource, } from '../resources';

import mocked_data from './mocked_data';

const localStorageMockedDataKey = 'CAM_MOCKED_DATA';

export default class KubeStore {
  private static instance: KubeStore;
  private clusterName: string;

  public db: any = {
    namespace: {},
    cluster: {},
  };


  // public db: any =
  //   {
  //     namespace: {
  //       mig: {
  //         "/v1/secrets": {
  //           s1: {
  //             apiVersion: "v1",
  //             data: {
  //               "aws-access-key-id": "ZmRzYQ==",
  //               "aws-secret-access-key-id": "ZmRhcw=="
  //             },
  //             kind: "Secret",
  //             metadata: {
  //               name: "s1",
  //               namespace: "mig"
  //             },
  //             type: "Opaque"
  //           },
  //           c1: {
  //             apiVersion: "v1",
  //             data: {
  //               saToken: "ZmRhcw=="
  //             },
  //             kind: "Secret",
  //             metadata: {
  //               name: "c1",
  //               namespace: "mig"
  //             },
  //             type: "Opaque"
  //           },
  //           c2: {
  //             apiVersion: "v1",
  //             data: {
  //               saToken: "ZmRzYQ=="
  //             },
  //             kind: "Secret",
  //             metadata: {
  //               name: "c2",
  //               namespace: "mig"
  //             },
  //             type: "Opaque"
  //           }
  //         },
  //         "migration.openshift.io/v1alpha1/migstorages": {
  //           s1: {
  //             apiVersion: "migration.openshift.io/v1alpha1",
  //             kind: "MigStorage",
  //             metadata: {
  //               name: "s1",
  //               namespace: "mig"
  //             },
  //             spec: {
  //               backupStorageProvider: "aws",
  //               volumeSnapshotProvider: "aws",
  //               backupStorageConfig: {
  //                 awsBucketName: "TestingName",
  //                 awsRegion: "USA",
  //                 credsSecretRef: {
  //                   name: "s1",
  //                   namespace: "mig"
  //                 }
  //               },
  //               volumeSnapshotConfig: {
  //                 awsRegion: " ",
  //                 credsSecretRef: {
  //                   name: "s1",
  //                   namespace: "mig"
  //                 }
  //               }
  //             }
  //           }
  //         },
  //         "clusterregistry.k8s.io/v1alpha1/clusters": {
  //           c1: {
  //             apiVersion: "clusterregistry.k8s.io/v1alpha1",
  //             kind: "Cluster",
  //             metadata: {
  //               name: "c1",
  //               namespace: "mig"
  //             },
  //             spec: {
  //               kubernetesApiEndpoints: {
  //                 serverEndpoints: [
  //                   {
  //                     clientCIDR: "0.0.0.0",
  //                     serverAddress: "localhost:9000"
  //                   }
  //                 ]
  //               }
  //             }
  //           },
  //           c2: {
  //             apiVersion: "clusterregistry.k8s.io/v1alpha1",
  //             kind: "Cluster",
  //             metadata: {
  //               name: "c2",
  //               namespace: "mig"
  //             },
  //             spec: {
  //               kubernetesApiEndpoints: {
  //                 serverEndpoints: [
  //                   {
  //                     clientCIDR: "0.0.0.0",
  //                     serverAddress: "localhost:9000"
  //                   }
  //                 ]
  //               }
  //             }
  //           }
  //         },
  //         "migration.openshift.io/v1alpha1/migclusters": {
  //           c1: {
  //             apiVersion: "migration.openshift.io/v1alpha1",
  //             kind: "MigCluster",
  //             metadata: {
  //               name: "c1",
  //               namespace: "mig"
  //             },
  //             spec: {
  //               isHostCluster: false,
  //               clusterRef: {
  //                 name: "c1",
  //                 namespace: "mig"
  //               },
  //               serviceAccountSecretRef: {
  //                 name: "c1",
  //                 namespace: "mig"
  //               }
  //             }
  //           },
  //           c2: {
  //             apiVersion: "migration.openshift.io/v1alpha1",
  //             kind: "MigCluster",
  //             metadata: {
  //               name: "c2",
  //               namespace: "mig"
  //             },
  //             spec: {
  //               isHostCluster: false,
  //               clusterRef: {
  //                 name: "c2",
  //                 namespace: "mig"
  //               },
  //               serviceAccountSecretRef: {
  //                 name: "c2",
  //                 namespace: "mig"
  //               }
  //             }
  //           }
  //         },
  //         "migration.openshift.io/v1alpha1/migplans": {
  //           plan1: {
  //             apiVersion: "migration.openshift.io/v1alpha1",
  //             kind: "MigPlan",
  //             metadata: {
  //               name: "plan1",
  //               namespace: "mig"
  //             },
  //             spec: {
  //               srcMigClusterRef: {
  //                 name: "c1",
  //                 namespace: "mig"
  //               },
  //               destMigClusterRef: {
  //                 name: "c2",
  //                 namespace: "mig"
  //               },
  //               migStorageRef: {
  //                 name: "s1",
  //                 namespace: "mig"
  //               },
  //               migAssetCollectionRef: {
  //                 name: "temp asset name",
  //                 namespace: "mig"
  //               }
  //             }
  //           }
  //         }
  //       }
  //     },
  //     cluster: {
  //       "/v1/namespaces": {}
  //     }
  //   }

  public constructor(clusterName) {
    this.clusterName = clusterName;
    this.ensureDataLoaded();
  }

  private data() {
    // Returns the chunk of data relevant for mocking data from this k8s cluster
    // All subsequent calls will use this data to lookup their responses
    const d = JSON.parse(localStorage.getItem(localStorageMockedDataKey));
    if (! ('clusters' in d)) {
      alert('Unable to find expected mocked data for "clusters"');
      return {};
    }
    if (! (this.clusterName in d['clusters'])) {
      alert('Unable to find expected mocked data for clusterName "' + this.clusterName + '"');
      return {};
    }
    return d['clusters'][this.clusterName];
  }

  private ensureDataLoaded() {
    let localData = JSON.parse(localStorage.getItem(localStorageMockedDataKey));
    if ((!localData) || (!localData.TIME_STAMP) || (localData.TIME_STAMP < mocked_data.TIME_STAMP)) {
      localStorage.setItem(localStorageMockedDataKey, JSON.stringify(mocked_data));
    }
    localData = JSON.parse(localStorage.getItem(localStorageMockedDataKey));
  }

  public static Instance() {
    return this.instance || (this.instance = new this(''));
  }

  public setResource(resource: KubeResource, name: string, newObject: object): object {
    const gvk = `${resource.gvk().group}/${resource.gvk().version}/${resource.gvk().kindPlural}`;
    let toMerge;
    if (resource instanceof NamespacedResource) {
      const namespacedResource = resource as NamespacedResource;
      toMerge = {
        namespace: {
          [namespacedResource.namespace]: {
            [gvk]: {
              [name]: newObject,
            },
          },
        },
      };
    } else {
      toMerge = {
        cluster: {
          [gvk]: {
            [name]: newObject,
          },
        },
      };
    }

    _.merge(this.db, toMerge);
    return newObject;
  }

  public getResource(resource: KubeResource, name: string): object {
    let result: object = {};
    let key = '';
    if (resource instanceof NamespacedResource) {
      const namespacedResource = resource as NamespacedResource;
      if (resource instanceof CoreNamespacedResource) {
        // Core Namespaced
        key = `api/${resource.gvk().version}/namespaces/${namespacedResource.namespace}/${resource.gvk().kindPlural}`;
        if (this.data()[key]) {
          result = this.data()[key][name];
        }
      } else {
        // Extension Namespaced
        key = `apis/${resource.gvk().group}/${resource.gvk().version}` +
          `/namespaces/${namespacedResource.namespace}/${resource.gvk().kindPlural}`;
        if (this.data()[key]) {
          result = this.data()[key][name];
        }
      }
    } else {
      if (resource instanceof CoreClusterResource) {
        // Core ClusterResource
        key = `api/${resource.gvk().version}/namespaces/${resource.gvk().kindPlural}`;
        if (this.data()[key]) {
          result = this.data()[key][name];
        }
      } else {
        // Extension ClusterResource
        key = `apis/${resource.gvk().group}/${resource.gvk().version}/${resource.gvk().kindPlural}`;
        if (this.data()[key]) {
          result = this.data()[key][name];
        }
      }
    }
    return result;
  }

  public listResource(resource: KubeResource): object {
    // 2 Main Types of Resources
    //   - NamespacedResource
    //   - ClusterResource
    //  Next 2 distinctions,  'Core' or Extension.
    //   Core - are the main types built in k8s
    //     If it's an instance of CoreNamespacedResource or CoreClusterResource
    //   Extensions are everything else.

    let result: object = {};
    let key = '';
    if (resource instanceof NamespacedResource) {
      const namespacedResource = resource as NamespacedResource;
      if (resource instanceof CoreNamespacedResource) {
      // Core Namespaced
      key = `api/${resource.gvk().version}/namespaces/${namespacedResource.namespace}/${resource.gvk().kindPlural}`;
      result = this.data()[key];
      } else {
      // Extension Namespaced
      key = `apis/${resource.gvk().group}/${resource.gvk().version}` +
      `/namespaces/${namespacedResource.namespace}/${resource.gvk().kindPlural}`;
      result = this.data()[key];
      }
    } else {
      if (resource instanceof CoreClusterResource) {
        // Core ClusterResource
        key = `api/${resource.gvk().version}/namespaces/${resource.gvk().kindPlural}`;
        result = this.data()[key];
      } else {
        // Extension ClusterResource
        key = `apis/${resource.gvk().group}/${resource.gvk().version}/${resource.gvk().kindPlural}`;
        result = this.data()[key];
      }
    }
    if (result) {
      return Object.keys(result).map(k => result[k]);
    } else {
      return [];
    }
  }
}
