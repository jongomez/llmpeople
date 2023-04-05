export async function fetchAudio(message: string): Promise<HTMLAudioElement | null> {
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
    return new Audio(audioUrl);
  } catch (error) {
    console.error("Error fetching audio:", error);
  }

  return null;
}
