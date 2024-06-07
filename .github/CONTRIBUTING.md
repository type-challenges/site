# Type-Challenges-Site Contributing Guide

Hi! I'm really excited that you are interested in contributing to js-sdsl. Before submitting your contribution, please make sure to take a moment and read through the following guidelines:

- [Code of Conduct](https://github.com/type-challenges/site/blob/main/CODE_OF_CONDUCT.md)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)

## Issue Reporting Guidelines

- Always use issue-template to create new issues.

## Pull Request Guidelines

- The `main` branch is just a snapshot of the latest stable release. All development should be done in dedicated branches. **Do not submit PRs against the `main` branch.**

- Checkout a topic branch from the relevant branch, e.g. `dev`, and merge back against that branch.

- Work in the `src` folder and **DO NOT** check in `dist` in the commits.

- It's OK to have multiple small commits as you work on the PR - GitHub will automatically squash it before merging.

- Make sure it works fine in local environment. (see [development setup](#development-setup))

- If adding a new feature:
  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing bug:
  - If you are resolving a special issue, add `(fix #xxxx[,#xxxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `update entities encoding/decoding (fix #3899)`.
  - Provide a detailed description of the bug in the PR. Live demo preferred.
  - Add appropriate test coverage if applicable.

## Development Setup

You will need [Node.js](http://nodejs.org) **version 16+** and [yarn](https://yarnpkg.com/).

After cloning the repo, run:

```bash
$ yarn setup
```

### Committing Changes

Please follow the commit specification. See [`.commitlintrc.json`](https://github.com/type-challenges/site/blob/main/.commitlintrc.json) get help.

### Commonly used NPM scripts

```bash
# run project in development mode
$ yarn dev
# build all dist files
$ yarn build
```

There are some other scripts available in the `scripts` section of the `package.json` file.

## Project Structure

- **`assets`**: contains static files of the site
- **`config`**: contains configuration files
- **`src`**: contains the source code
- **`tools`**: contains the built-in config and plugin files

All our source files are written in typescript, please make sure your submissions have strict type deduction and follow eslint specifications.

## Credits

Thank you to all the people who have already contributed to `type-challenges`!

[![contributors](https://contrib.rocks/image?repo=type-challenges/site)](https://github.com/type-challenges/site/graphs/contributors)
