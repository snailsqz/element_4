export default function ResultSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      {/* ปุ่มย้อนกลับ */}
      <div className="h-6 w-24 bg-slate-200 rounded mb-6"></div>

      {/* Header Card (กล่องใหญ่ด้านบน) */}
      <div className="relative p-8 rounded-2xl border-2 border-slate-100 bg-slate-50 mb-6 flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
        <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
        <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
        <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
      </div>

      <div className="mb-8 w-full h-[400px] bg-slate-100 rounded-xl border border-slate-200"></div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Column 1 */}
        <div className="space-y-6">
          <div className="h-40 bg-slate-100 rounded-2xl border border-slate-200"></div>
          <div className="h-60 bg-slate-100 rounded-2xl border border-slate-200"></div>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          <div className="h-32 bg-slate-100 rounded-2xl border border-slate-200"></div>
          <div className="h-48 bg-slate-100 rounded-2xl border border-slate-200"></div>
        </div>
      </div>

      {/* Footer Card */}
      <div className="mt-6 h-32 bg-slate-100 rounded-2xl border border-slate-200"></div>
    </div>
  );
}
