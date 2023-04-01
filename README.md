# Tamagui + Solito + Next + Expo Monorepo

```sh
npm create tamagui
```

## 🔦 About

This monorepo is a starter for an Expo + Next.js + Tamagui + Solito app.

Many thanks to [@FernandoTheRojo](https://twitter.com/fernandotherojo) for the Solito starter monorepo which this was forked from. Check out his [talk about using expo + next together at Next.js Conf 2021](https://www.youtube.com/watch?v=0lnbdRweJtA).

## 📦 Included packages

- [Tamagui](https://tamagui.dev) 🪄
- [solito](https://solito.dev) for cross-platform navigation
- Expo SDK
- Next.js
- React Navigation

## 🗂 Folder layout

The main apps are:

- `expo` (native)
- `next` (web)

- `packages` shared packages across apps
  - `ui` includes your custom UI kit that will be optimized by Tamagui
  - `app` you'll be importing most files from `app/`
    - `features` (don't use a `screens` folder. organize by feature.)
    - `provider` (all the providers that wrap the app, and some no-ops for Web.)
    - `navigation` Next.js has a `pages/` folder. React Native doesn't. This folder contains navigation-related code for RN. You may use it for any navigation code, such as custom links.

You can add other folders inside of `packages/` if you know what you're doing and have a good reason to.

## 🏁 Start the app

- Install dependencies: `yarn`

- Next.js local dev: `yarn web`

To run with optimizer on in dev mode (just for testing, it's faster to leave it off): `yarn web:extract`. To build for production `yarn:prod`.

To see debug output to verify the compiler, add `// debug` as a comment to the top of any file.

- Expo local dev: `yarn native`

## Developing

We've added `packages/ui` to show an example of [building your own design system](https://tamagui.dev/docs/guides/design-systems).

## UI Kit

Note we're following the [design systems guide](https://tamagui.dev/docs/guides/design-systems) and creating our own package for components.

See `packages/ui` named `@my/ui` for how this works.

## 🆕 Add new dependencies

### Pure JS dependencies

If you're installing a JavaScript-only dependency that will be used across platforms, install it in `packages/app`:

```sh
cd packages/app
yarn add date-fns
cd ../..
yarn
```

### Native dependencies

If you're installing a library with any native code, you must install it in `expo`:

```sh
cd apps/expo
yarn add react-native-reanimated
cd ..
yarn
```

You can also install the native library inside of `packages/app` if you want to get autoimport for that package inside of the `app` folder. However, you need to be careful and install the _exact_ same version in both packages. If the versions mismatch at all, you'll potentially get terrible bugs. This is a classic monorepo issue. I use `lerna-update-wizard` to help with this (you don't need to use Lerna to use that lib).

You may potentially want to have the native module transpiled for the next app. If you get error messages with `Cannot use import statement outside a module`, you may need to use `transpilePackages` in your `next.config.js` and add the module to the array there.

### Deploying to Vercel

- Root: `./apps/next`
- Install command to be `yarn set version berry && yarn install`
- Build command: leave default setting
- Output dir: leave default setting

# VSCode extensions

- GitLens
- Prettier
- ESLint

# npm

Install nvm

https://github.com/nvm-sh/nvm#installing-and-updating

and then install node version 18.14.2

nvm install 18.14.2

If an npm update is available, do it. But keep the node version at 18.14.2

Install yarn

npm install --global yarn

And then run

yarn

Run the web dev app

yarn web

# Android

(TODO: Update this please)

Type npx expo, it should ask you to install the expo CLI globally. Say yes.

Follow the instructions in:

https://docs.expo.dev/workflow/android-studio-emulator

the .bashrc file (or .zshrc file) should be updated with the following (instead of what they say in that page)

export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools

After creating a device, run it. If expo go is already installed on the emulator, we can just run it and enter the URL provided by

yarn dev

If expo go is not installed, we can install expo go and start the app with

yarn native

and selecting Android.

# env vars

- See TAMAGUI_TARGET for an example

# Jest

Run individual test files with:

npx jest path/to/testFile.test.ts --watch

e.g. go into the apps/next folder, and run:

npx jest **tests**/messagesAPI.test.ts --watch
