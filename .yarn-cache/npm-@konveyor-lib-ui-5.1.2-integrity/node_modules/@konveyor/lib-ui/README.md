# @konveyor/lib-ui

Reusable React components, hooks, and TypeScript modules shared between Konveyor UI projects.

This library exists as a place to store and reuse abstractions that are useful for multiple Konveyor UI projects, and are either not available in PatternFly yet or not covered by PatternFly's scope.

The React components in this library are compositions and extensions of [patternfly-react](https://github.com/patternfly/patternfly-react) components, and we should avoid duplicating components that are available there.

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Documentation and examples (Storybook): http://konveyor-lib-ui.surge.sh/

## Usage

### Install from npm

In your app repo, install the library as a normal npm dependency:

```sh
yarn add @konveyor/lib-ui
# or:
npm install @konveyor/lib-ui
```

### Install peer dependencies

This package has React and PatternFly packages as peer dependencies, which are not included in the library bundle. That way, your app can also depend on them directly without bundling them twice.

When you install @konveyor/lib-ui, you should get a warning from your package manager telling you which versions to install. [Make sure you have compatible versions](https://github.com/konveyor/lib-ui/blob/main/package.json#L30) as dependencies in your app.

**Note: The `axios` peer dependency is only required if you are using `modules/kube-client`.**

### Optional: Install from local source

If you need to use an unpublished branch (such as when developing an app PR and a lib-ui PR at the same time), you can reference the dependency directly from your local disk by using `yarn link` or `npm link`.

First, clone the lib-ui repo somewhere, `cd` to that clone, install and build the package, and run `yarn link`.
Unfortunately, you then need to delete `node_modules` in the lib-ui directory so the app's builder doesn't pick it up.

```sh
git clone https://github.com/konveyor/lib-ui.git konveyor-lib-ui
cd konveyor-lib-ui
yarn install
yarn build
yarn link
rm -rf node_modules
```

Then, `cd` to the app you're developing, and run `yarn link @konveyor/lib-ui` to install the linked version instead of the npm version.

```sh
cd ../virt-ui
yarn link @konveyor/lib-ui
```

If you make a change in your local lib-ui clone, reinstall its dependencies, rebuild, and remove them. Your app should then pick up the changes.

```sh
cd ../konveyor-lib-ui
yarn install
yarn build
rm -rf node_modules
```

When you're done, in your app repo, unlink the package and force a reinstall of the npm version:

```sh
cd ../virt-ui
yarn unlink @konveyor/lib-ui
yarn install --force
```

Then in the lib-ui directory, run `yarn unlink` if you no longer want it available for linking.

### Use it!

In your JS/TS, Import named modules from the library, just like PatternFly:

```js
import { MyComponent, useSomeHook } from '@konveyor/lib-ui';
```

---

## Development

### Prerequisites

- [NodeJS](https://nodejs.org/en/) >= 10.x
- [Yarn "Classic"](https://classic.yarnpkg.com/lang/en/) (1.x)

### Quick-start

Clone and install dependencies:

```sh
git clone https://github.com/konveyor/lib-ui.git konveyor-lib-ui
cd konveyor-lib-ui
yarn install
```

Run the [Storybook](https://storybook.js.org/) dev server (examples and docs) at http://localhost:6006:

```sh
yarn storybook
```

### Scripts

To run the type-checker, linter and unit tests:

```sh
# Run all 3:
yarn ci
# Or run them individually:
yarn type-check
yarn lint [--fix]
yarn test [--watch]
```

[Prettier](https://prettier.io/) code formatting is enforced by ESLint. To run Prettier and format your code (do this before committing if you don't run Prettier in your editor):

```sh
yarn format
```

To run a production build using Rollup (outputs to `./dist`):

```sh
yarn build
```

To export the Storybook docs as a static site (outputs to `./storybook-static`):

```sh
yarn storybook:export
```

## Triggering an npm release

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) via GitHub Actions to automate its npm releases. When a commit is pushed to main, it is checked for specific key words in the commit message to decide whether a release needs to be made, and whether it will be a minor or major version bump. Your commit message will also be added and categorized in the release notes.

To assist in formatting commit messages correctly for this purpose, the repo is set up for use with [Commitizen](http://commitizen.github.io/cz-cli/), which provides a CLI for guided commit messages.

**To make a commit that should trigger a release**:

First, `git add` any changes you want to commit, then:

```sh
yarn commit
```

Follow the prompts based on the scope of your commit. **Note: This will generate a message for an individual commit, but since we use squash-and-merge, what matters is your PR title.** If your PR contains multiple commits, please make sure the PR title itself matches the expected format. [See our PR template for more details](https://github.com/konveyor/lib-ui/blob/main/.github/pull_request_template.md).

## File Structure

Components live in `src/components/MyComponent/` directories, which should each contain:

- `MyComponent.tsx` - component source and type interfaces (types can be their own file if they are verbose enough)
- `MyComponent.scss` - any custom styles not covered by PatternFly, we should avoid these when possible
- `MyComponent.stories.mdx` - define your [Storybook stories](https://storybook.js.org/docs/react/get-started/whats-a-story) (examples and docs) for your component. We are using the [MDX story format](https://storybook.js.org/docs/react/writing-docs/mdx). The `title` prop of your story's `<Meta>` defines where it appears in the Storybook nav.
- Optional: `MyComponent.stories.tsx` - if you need to use TypeScript in the body of your MDX stories, you'll need to define them in a TypeScript file and import them into your MDX file. See existing stories for examples.
- `MyComponent.test.tsx` - unit tests using [jest](https://jestjs.io/) and [react-testing-library](https://testing-library.com/docs/react-testing-library/intro)
- `index.ts` - define your exports for the component directory

When you add a new component, be sure to also export it at the top level (`src/index.ts`).

Hooks follow the same structure, but they live under `src/hooks/`.
