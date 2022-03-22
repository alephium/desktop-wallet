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

## Credits

The implementation is inspired by Coinbarn's wallet codebase.
