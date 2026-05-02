export default function HomeLoading() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <div className="h-7 w-48 bg-muted rounded-none animate-pulse" />
        <div className="h-4 w-36 bg-muted rounded-none animate-pulse mt-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border p-5 shadow-sm space-y-3"
          >
            <div className="h-4 w-24 bg-muted rounded-none animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded-none animate-pulse" />
            <div className="h-3 w-20 bg-muted rounded-none animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
