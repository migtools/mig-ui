# mig-ui

[![Build Status](https://travis-ci.org/fusor/mig-ui.svg?branch=master)](https://travis-ci.org/fusor/mig-ui)

## Quick-start

### UI development server

```bash
npm install yarn -g # ensure you have yarn on your machine globally
git clone https://github.com/fusor/mig-ui # clone the project
cd mig-ui # navigate into the project directory
yarn # install  dependencies
yarn build # build the project
yarn start # start the development server
```

### JSON Mock Server

To add credentials to the mock json server, modify the contents of ./server/users.json
To add mock data, modify the contents of ./server/db.json

```
yarn mock-server # start the mock json server
```

## Development Scripts

Install development/build dependencies
`yarn`

Start the development server
`yarn start`

Run a full build
`yarn build`
