# Alephium desktop wallet

The official Alephium desktop wallet.

![Wallet preview](https://user-images.githubusercontent.com/1579899/161780937-94cdf21b-6895-407b-83ab-94103d359bce.png)

## Development

Install depedencies with:

```shell
npm install
```

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

## Packaging

The command below will detect your OS and build the corresponding package:

```shell
npm run electron-pack
```

To build for ARM64 Linux, run:

```shell
npm run electron-pack-linux:arm64
```

## Release

To release a new version:

1. Checkout the master branch:
   ```shell
   git checkout master
   ```
2. Create a commit that updates the package version in package.json and package-lock.json and a tag with:
   ```shell
   npm version patch # if you want to bump the patch version
   npm version minor # if you want to bump the minor version
   npm version major # if you want to bump the major version
   npm version prepatch --preid=rc # if you want to create a release candidate and bump the patch version
   npm version preminor --preid=rc # if you want to create a release candidate and bump the minor version
   npm version premajor --preid=rc # if you want to create a release candidate and bump the major version
   ```
3. Push the new commit and new tag to GitHub to trigger the release workflow that will build the downloadable binaries:

   ```shell
   git push
   git push [remote] <tag>
   ```

## Credits

The implementation is inspired by Coinbarn's wallet codebase.
