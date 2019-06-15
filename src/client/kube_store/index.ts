import _ from 'lodash';
import { NamespacedResource, ClusterResource, KubeResource } from '../resources';

export default class KubeStore {
  private static instance: KubeStore;
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

  public static get Instance() {
    return this.instance || (this.instance = new this());
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
    const gvk = `${resource.gvk().group}/${resource.gvk().version}/${resource.gvk().kindPlural}`;
    if (resource instanceof NamespacedResource) {
      const namespacedResource = resource as NamespacedResource;
      // return this.db.namespace[namespacedResource.namespace][gvk][name];
      return this.db.namespace[namespacedResource.namespace][gvk][name];
    } else {
      return this.db.cluster[gvk][name];
    }
  }

  public listResource(resource: KubeResource): object {
    const gvk = `${resource.gvk().group}/${resource.gvk().version}/${resource.gvk().kindPlural}`;
    let resources;
    if (resource instanceof NamespacedResource) {
      const namespacedResource = resource as NamespacedResource;
      if (!(namespacedResource.namespace in this.db.namespace)) {
        return [];
      }
      if (!(gvk in this.db.namespace[namespacedResource.namespace])) {
        return this.db.namespace[namespacedResource.namespace][gvk];
      }
      resources = this.db.namespace[namespacedResource.namespace][gvk];
    } else {
      this.db.cluster = { '/v1/namespaces': {} };
      resources = this.db.cluster[gvk];
    }
    return Object.keys(resources).map(k => resources[k]);
  }
}
