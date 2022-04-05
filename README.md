# Alephium desktop wallet

The official Alephium desktop wallet.

## Install

```shell
npm install
```

## Packaging

### Web extension

```shell
npm run extension-pack
```

### Desktop app

The command below will detect your OS and build the corresponding package.

```shell
npm run electron-pack
```

To build for ARM64 Linux, run:

```shell
npm run electron-pack-linux:arm64
```

## Development

To launch the app as a web app, run:

```shell
npm start
```

To launch it as an electron app, run:

```shell
npm run electron-dev
```

## Test

```shell
npm test
```

## Release

To release a new version:

1. Create a commit that updates the package version in package.json and package-lock.json and a tag with:
   ```shell
   npm version patch # if you want to bump the patch version
   npm version minor # if you want to bump the minor version
   npm version major # if you want to bump the major version
   npm version prepatch --preid=rc # if you want to create a release candidate and bump the patch version
   npm version preminor --preid=rc # if you want to create a release candidate and bump the minor version
   npm version premajor --preid=rc # if you want to create a release candidate and bump the major version
   ```
2. Push the tag to GitHub and trigger the publish workflow that will publish it on NPM with:

   ```shell
   git push [remote] <tag>
   ```

3. Unless you are on `master`, create a new branch and push it to GitHub so that the tagged commit belongs to a branch of this repo with:
   ```shell
   git checkout -b <tag>
   git push
   ```
   Otherwise, just push to `master`.

## Credits

The implementation is inspired by Coinbarn's wallet codebase.
