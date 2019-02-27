# mig-ui

[![Build Status](https://travis-ci.org/fusor/mig-ui.svg?branch=master)](https://travis-ci.org/fusor/mig-ui)

## Quick-start

```bash
npm install yarn -g # ensure you have yarn on your machine globally
git clone https://github.com/fusor/mig-ui # clone the project
cd mig-ui # navigate into the project directory
yarn # install  dependencies
yarn build # build the project
yarn start # start the development server
```

## Development Scripts

Install development/build dependencies
`yarn`

Start the development server
`yarn start`

Run a full build
`yarn build`

Run the test suite
`yarn test`

Run the linter
`yarn lint`

Launch a tool to inspect the bundle size
`yarn bundle-profile:analyze`

## Configurations

- [Webpack Config](./config/webpack.config.js)
- [Jest Config](./config/jest.config.js)

## Code Quality Tools

- For accessibility compliance, we use [react-axe](https://github.com/dequelabs/react-axe)
- To keep our bundle size in check, we use [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- To keep our code formatting in check, we use [prettier](https://github.com/prettier/prettier)
- To keep our code logic and test coverage in check, we use [jest](https://github.com/facebook/jest)
