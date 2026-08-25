export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* 2 decorative circles one on left and one on right */}
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-cyan-500/10 dark:bg-pink-500/10 blur-3xl" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
