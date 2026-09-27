export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-orange-100 border-t-orange-600 animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-stone-500 animate-pulse">Loading...</p>
    </div>
  );
}
