# mig-ui

[![Build Status](https://travis-ci.org/konveyor/mig-ui.svg?branch=master)](https://travis-ci.org/konveyor/mig-ui)

## Quick-start

Copy `config/config.dev.json.example` to `config/config.dev.json` where you can
configure your local development settings.

`cp config/config.dev.json.example config/config.dev.json`

Also ensure you have yarn installed by following recommended install instructions:

https://yarnpkg.com/en/docs/install#centos-stable

### UI development server

```bash
git clone https://github.com/konveyor/mig-ui # clone the project
cd mig-ui # navigate into the project directory
yarn # install  dependencies
yarn build # build the project
yarn start # start the UI development server
```

`yarn start` will run the UI's development server in "local" dev mode. The purpose of
this mode is to mock out any external dependencies like Login and the cluster api's
server so the UI can be hacked on as easily as possible.

### Remote dev mode

If you would like to run the console locally, but communicate with real clusters
on the backend, you must first configure the remote cluster acting as the UI's
host. To do this, update the `clusterApi` in `config/config.dev.json`.
The UI will use this cluster for oauth login and effectively run as if it were
served from that cluster.

Additionally, the remote scripts expect the OpenShift client tool `oc` to be in
your PATH (available as "client tools" [here](https://github.com/openshift/origin/releases)).
You should also have logged into the cluster you expect to use using `oc login`.

To start the remote cluster backed dev server, run:

```
yarn start:remote # start the UI development server, backed by remote cluster
```

## Contributing

Install development/build dependencies
`yarn`

Start the development server
`yarn start`

Run a full build
`yarn build`

Consistent styles are enforced by travis and will gate PR merges. To check your code prior
to submission, run:
`yarn lint`
