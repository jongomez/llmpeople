import { Platform } from 'react-native'

export const getBaseUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/game'
    }
    return 'http://localhost:3000/game'
  }

  // TODO: Prod urls please.
  return 'www.google.com'
}
