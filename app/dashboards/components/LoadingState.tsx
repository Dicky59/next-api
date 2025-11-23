export default function LoadingState() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-24 shadow-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
        <div className="text-sm text-gray-600">Loading API keys...</div>
      </div>
    </div>
  );
}

