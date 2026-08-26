export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4 sm:p-6 selection:bg-primary/20">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[130px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}
