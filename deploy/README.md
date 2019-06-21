# Mig UI Deployment

The `mig-ui/deploy` directory contains the node server required for a production
deployment of the UI, as well as the ansible role and scripts that will deploy
a CAM UI to a cluster.

## Dependencies

Ansible and the `openshift` python module are required to be installed prior
to running the deploy script, which uses ansible and the openshift extensions.

## Deploy Instructions

There are 3 main steps to configuring your environment to use the CAM UI:

* Deployment - Deploys the UI into a cluster and configures the cluster to
allow for login via the UI.
* CORS Configuration - The cluster must be configured to accept requests from
the UI directly, otherwise the browser will reject required requests as a
security measure.
* Certificate Configuration - Only necessary if your cluster is using self-signed
certificates. Your browser must be configured to accept the certificates that it
does not support under default circumstances.

### (1) Deployment

Users may deploy the CAM UI by running the deploy script. First, log into your
desired OCP4 cluster using the cli tools. Then run the following script, ensuring
that you provide the host cluster's API server address as an environment variable.

`HOSTAPI=<api_server_address> ./deploy.sh`

Example:

`HOSTAPI='https://api.myocp4cluster.com:6443' ./deploy.sh`

NOTE: The `HOSTAPI` env var is required until it's possible for us to discover
this as part of the install process.

### (2) CORS Configuration

By now you should have the UI and it's various components installed in your
cluster.

As of OCP 4.1, CORS support remains an unsupported configuration option that
must be manually configured in the OCP4 cluster to allow the CAM UI's requests
to succeed. [See the doc describing OAuth and CORS for more information](../docs/oauth_cors.md).

To configure your OCP4 cluster to accept your UI's requests, first retrieve your
UI's route by running the following command, (namespace here by default is `mig`):

`oc get routes -n <namespace>`

You should see a result similar to the following:

```
# oc get routes -n mig
NAME      HOST/PORT                                  PATH      SERVICES   PORT        TERMINATION   WILDCARD
mig-ui    mig-ui-mig.apps.examplecluster.com             mig-ui     port-9000   edge          None
```

The UI can be loaded in a browser at `https://mig-ui-mig.apps.examplecluster.com`. We need to tell
both the kubernetes API server, and the OAuth server that this is an acceptable address
to receive requests from.

First, configure the Kube API server by running the following:

`oc edit kubeapiserver.operator -o yaml`

Under the `spec` section, find the `unsupportedConfigOverrides` field and set to:

```
unsupportedConfigOverrides:
  corsAllowedOrigins:
  - '//<your_ui_route>'
```

Example:

```
unsupportedConfigOverrides:
  corsAllowedOrigins:
  - '//mig-ui-mig.apps.examplecluster.com
```

Similarly, we need to configure the same value in the OAuth server. Edit the
configuration with the following and set the same value:

`oc edit authentication.operator -o yaml`

```
spec:
  unsupportedConfigOverrides:
    corsAllowedOrigins:
    - '//<your_ui_route>'
```

Example:

```
spec:
  unsupportedConfigOverrides:
    corsAllowedOrigins:
    - '//mig-ui-mig.apps.examplecluster.com
```

### (3)Cert configuration

**TODO**: Currently you need to go into your network requests and accept various
certs to make this function. Need to provide a recommended solution for this.

## Node Server

The node server found at `main.js` is the UI's server that's used during a
production deployment of the UI into the cluster. Its primary responsibility
is to read the data mounted into the pod from the installation's `ConfigMap`
and delivering these dynamic values to the JS by encoding and injecting them
into the HTML file that loads the JS bundle. The react app is then able to
retrieve these values on the client-side, and build its clients accordingly.
