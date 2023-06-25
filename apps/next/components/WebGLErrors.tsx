export interface WebGLNotSupportedProps {}

// XXX: Not currently used.
export function WebGLMajorPerformanceCaveat({}: WebGLNotSupportedProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <h1 style={styles.textHeader}>WebGL performance is not great :(</h1>
      <p style={styles.textParagraph}>
        This may mean your device does not have hardware acceleration enabled.
      </p>
      {/* <h1 style={styles.textHeader}>Good luck {"\uD83D\uDCAA"}</h1> */}
    </div>
  );
}

export function WebGLNotSupported({}: WebGLNotSupportedProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <h1 style={styles.textHeader}>WebGL not supported :(</h1>
      <p style={styles.textParagraph}>WebGL is necessary to play this game.</p>
      <h1 style={styles.textHeader}>How can I fix this?</h1>
      <p style={styles.textParagraph}>It&apos;s hard to pinpoint an exact cause and fix.</p>
      <p style={styles.textParagraph}>
        My suggestion would be to search online for &quot;How to enable webgl in &quot; followed by
        the device and/or browser you&apos;re using.
      </p>
      <p style={{ textAlign: "center" }}>
        For example: &quot;How to enable webgl in iphone safari&quot;
      </p>
      {/* <h1 style={styles.textHeader}>Good luck {"\uD83D\uDCAA"}</h1> */}
    </div>
  );
}

const styles = {
  textHeader: {
    color: "black",
    fontWeight: "bold",
    fontSize: 25,
  },
  textParagraph: {
    color: "black",
    textAlign: "center" as const,
    marginBottom: 4,
  },
};
