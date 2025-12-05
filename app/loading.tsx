export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-lg">Učitavanje...</p>
      </div>
    </div>
  );
}

