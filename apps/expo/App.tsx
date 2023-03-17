import { Provider } from 'app/provider'
import 'expo-dev-client'
import { useFonts } from 'expo-font'
import React from 'react'
import WebView from 'react-native-webview'
import { getBaseUrl } from './lib/helpers'

export default function App() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  if (!loaded) {
    return null
  }

  return (
    <Provider>
      {/* <NativeNavigation /> */}
      {/* TODO: Get this react native webview thingy on the NativeNavigation package thingy. */}
      <WebView source={{ uri: getBaseUrl() }} />
    </Provider>
  )
}
