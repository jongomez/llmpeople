interface LoadingProps {
  isLoading: boolean;
}
export const Loading = ({ isLoading }: LoadingProps) => {
  return (
    <div
      id="loadingAnimContainer"
      style={{
        display: isLoading ? "flex" : "none",
        width: "100%",
        height: "100%",
        flexDirection: "column",

        justifyContent: "center",
        alignItems: "center",

        position: "absolute",
        top: "0px",
        left: "0px",

        backgroundColor: "#2c3e50",
        zIndex: "1000000",
      }}
    >
      <div className="ball-pulse-sync">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};
