# Alephium desktop wallet

The official Alephium desktop wallet.

![Wallet preview](https://user-images.githubusercontent.com/1579899/161780937-94cdf21b-6895-407b-83ab-94103d359bce.png)

## Development

Install depedencies with:

```shell
npm install
```

To launch it as an electron app, run:

```shell
npm run start:electron
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

## Adding new translation

1. Copy `locales/fr-FR/translation.json` into `locales/[xx-YY]/translation.json` and add your translations.
2. Import new translation file and add it to the resources in `src/i18n.ts`

   ```ts
   import en from '../locales/en-US/translation.json'
   import fr from '../locales/fr-FR/translation.json'

   i18next.use(initReactI18next).init({
     resources: {
       'en-US': { translation: en },
       'fr-FR': { translation: fr }
     }
   })
   ```

3. Add new language option in `src/modals/SettingsModal/GeneralSettingsSection.tsx`

   ```ts
   const languageOptions = [
     { label: 'English', value: 'en-US' as Language },
     { label: 'Français', value: 'fr-FR' as Language }
   ]
   ```

4. Import `dayjs` translation file in `src/App.tsx`

   ```ts
   import 'dayjs/locale/fr'
   ```

## Credits

The implementation is inspired by Coinbarn's wallet codebase.
