export default function Loading({ height = "100vh" }) {
  return (
    <div
      style={{ height }}
      className="flex items-center justify-center h-screen"
    >
      <div className="size-10 rounded-full border-3 border-purple-500 border-t-transparent animate-spin"></div>
    </div>
  );
}
