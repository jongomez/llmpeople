This is a monorepo for the [gpthangout project.](https://www.gpthangout.com/)

It was built with the [next+expo+solito starter template - check out their README.](https://github.com/tamagui/tamagui/tree/master/starters/next-expo-solito)

# HOW TO SET UP

An OpenAI API key is required. Check out the OPENAI_API_KEY env var in the .env file.

A Google Cloud API key is required. Check out the GOOGLE_API_KEY env var in the .env file.

1. **Install npm** - [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and node version 18.14.2 are recommended (this is the LTS version as of June 25 2023)

2. **Make sure npm is installed**. You can run `npm -v` to check if it's installed.

3. **Install yarn** - `npm install --global yarn`

4. **Install the dependencies** - Simply run `yarn` in the root folder of this project.

5. **Run the project** - Run `yarn web` in the root folder of this project.

# Android & iOS

In the apps/expo directory there's code to run this project on Android and iOS. It's currently not working, and I have no plans to fix it atm.

# Native & web env vars

- Setting up env vars for both native and web is a little different than usual. See TAMAGUI_TARGET for an example.

# Jest

Run individual test files with:

npx jest path/to/testFile.test.ts --watch

e.g. go into the apps/next folder, and run:

npx jest lib/babylonjs/\_\_tests\_\_/utils.test.ts --watch

# OTHER

Reduce png image quality and size:

pngquant --quality 10-80 --speed 1 --output output_reduced0.png --force Image_0.png
