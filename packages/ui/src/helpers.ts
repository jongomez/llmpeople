export async function fetchAudio(
  message: string,
  audiRef: React.MutableRefObject<HTMLAudioElement | null>
) {
  try {
    const response = await fetch("/api/audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);

    // Pause if previous audio was playing. And then play the new audio.
    audiRef.current?.pause();
    audiRef.current = new Audio(audioUrl);
    audiRef.current.play();
  } catch (error) {
    console.error("Error fetching audio:", error);
  }
}
