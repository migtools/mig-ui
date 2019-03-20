# mig-ui

[![Build Status](https://travis-ci.org/fusor/mig-ui.svg?branch=master)](https://travis-ci.org/fusor/mig-ui)

## Quick-start

Copy `config/config.dev.json.example` to `config/config.dev.json` where you can
configure your local development settings.

### UI development server

```bash
npm install yarn -g # ensure you have yarn on your machine globally
git clone https://github.com/fusor/mig-ui # clone the project
cd mig-ui # navigate into the project directory
yarn # install  dependencies
yarn build # build the project
yarn start # start the UI development server
```

### JSON Mock Server

To add credentials to the mock json server, modify the contents of ./server/users.json
To add mock data, modify the contents of ./server/db.json

```
yarn start:mock-server # start the mock json server
```

### Remote dev mode

If you would like to run the console locally, but communicate with real clusters
on the backend, you must first configure the remote cluster acting as the UI's
host. To do this, update the `clusterUrl` in `config/config.dev.json`.
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

