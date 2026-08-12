export default function FindLoading() {
  return (
    <div className="find-theme min-h-[100dvh] bg-[#f7f9ff] px-4 py-8">
      <div className="mx-auto flex min-h-[70dvh] w-full max-w-6xl items-center justify-center">
        <div className="w-full max-w-4xl animate-pulse rounded-[28px] border border-[#dce5fb] bg-white p-6 shadow-[0_16px_40px_rgba(20,42,99,0.08)] sm:p-8">
          <div className="h-4 w-28 rounded-full bg-[#e8eef9]" />
          <div className="mt-4 h-8 w-3/5 rounded-2xl bg-[#e8eef9]" />
          <div className="mt-3 h-4 w-4/5 rounded-full bg-[#eef3fb]" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="h-40 rounded-[20px] bg-[#f2f6fd]" />
            <div className="h-40 rounded-[20px] bg-[#f2f6fd]" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="h-12 rounded-[14px] bg-[#eef3fb]" />
            <div className="h-12 rounded-[14px] bg-[#eef3fb]" />
            <div className="h-12 rounded-[14px] bg-[#eef3fb]" />
          </div>
        </div>
      </div>
    </div>
  );
}
