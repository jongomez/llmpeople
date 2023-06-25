This is a monorepo for the [gpthangout project.](https://www.gpthangout.com/)

It was built with the [next+expo+solito starter template - check out their README.](https://github.com/tamagui/tamagui/tree/master/starters/next-expo-solito)

# HOW TO SET UP

1. **Install npm** - [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and node version 18.14.2 are recommended (this is the LTS version as of June 25 2023)

2. **Make sure npm is installed**. You can run `npm -v` to check if it's installed.

3. **Install yarn** - `npm install --global yarn`

4. **Install the dependencies** - Simply run `yarn` in the root folder of this project.

5. **Run the project** - Run `yarn web` in the root folder of this project.

# Android & IOS

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

- Env var work a little different than usual. See TAMAGUI_TARGET for an example

# Jest

Run individual test files with:

npx jest path/to/testFile.test.ts --watch

e.g. go into the apps/next folder, and run:

npx jest **tests**/messagesAPI.test.ts --watch

# OTHER

Reduce png image quality and size:

pngquant --quality 10-80 --speed 1 --output output_reduced0.png --force Image_0.png
