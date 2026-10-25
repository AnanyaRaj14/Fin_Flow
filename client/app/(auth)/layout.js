export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4 sm:p-6 selection:bg-foreground/10">
      {/* Subtle, quiet ambient depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-foreground/[0.03] via-transparent to-transparent" />

      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}
