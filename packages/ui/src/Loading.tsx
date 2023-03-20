import { Spinner, YStack } from 'tamagui'

type SpinnerProps = {
  isLoading: boolean
}

export const Loading = ({ isLoading }: SpinnerProps) => {
  if (!isLoading) {
    return null
  }

  return (
    <YStack p="$3" space="$4" jc="center" fullscreen>
      <Spinner size="large" color="$blue10" />
    </YStack>
  )
}
