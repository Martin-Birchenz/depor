export default function LoadingSpinner({
  message = "Cargando...",
  fullScreen = false,
  size = "normal",
}) {
  const sizeClass = {
    small: { width: "1.5rem", height: "1.5rem", borderWidth: "0.2em" },
    normal: { width: "3rem", height: "3rem", borderWidth: "0.25em" },
    large: { width: "4.5rem", height: "4.5rem", borderWidth: "0.35em" },
  }[size] || { width: "3rem", height: "3rem", borderWidth: "0.25em" };

  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div
        className="spinner-border text-dark"
        style={sizeClass}
        role="status"
        aria-hidden="true"
      ></div>
      {message && (
        <p className="mt-3 text-muted small fw-semibold text-center mb-0 tracking-wide">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
        style={{ zIndex: 1060, backdropFilter: "blur(2px)" }}
      >
        {content}
      </div>
    );
  }

  return content;
}
