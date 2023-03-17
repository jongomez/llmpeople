import { Loading } from 'components/Loading'
import { WebGLNotSupported } from 'components/WebGLErrors'
import { initBabylon } from 'lib/babylonjs/init'
import React, { useEffect, useState } from 'react'

let didInit = false

interface CanvasThatDoesNotReRenderProps {
  setInitErrorMessage: (initErrorMessage: string) => void
  setIsLoading: (isLoading: boolean) => void
}

const CanvasThatDoesNotReRender = React.memo(function CanvasThatDoesNotReRender({
  setInitErrorMessage,
  setIsLoading,
}: CanvasThatDoesNotReRenderProps) {
  useEffect(() => {
    if (didInit) {
      // If we're here, then strict mode is on - reactStrictMode is true on the next.config.js
      console.warn('Warning - tried to initialize twice. Will skip 2nd initialization.')
      return
    }

    const errorMessage = initBabylon(setIsLoading)

    if (errorMessage) {
      setInitErrorMessage(errorMessage)
    }

    didInit = true
  }, [setInitErrorMessage, setIsLoading])

  return (
    <canvas
      id="renderCanvas"
      style={{
        height: '100%',
        width: '100%',
      }}
    />
  )
})

export default function Web() {
  const [initErrorMessage, setInitErrorMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  if (initErrorMessage.includes('WebGL not supported')) {
    return <WebGLNotSupported />
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <Loading isLoading={isLoading} />
      <CanvasThatDoesNotReRender
        setIsLoading={setIsLoading}
        setInitErrorMessage={setInitErrorMessage}
      />
    </div>
  )
}
