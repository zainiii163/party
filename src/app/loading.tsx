import { Skeleton } from "@/components/ui/field";

export default function Loading() {
  return (
    <main className="relative min-h-screen px-5 pt-32">
      <div className="section-shell space-y-8">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <Skeleton className="mx-auto h-4 w-40" />
          <Skeleton className="mx-auto h-14 w-full" />
          <Skeleton className="mx-auto h-5 w-3/4" />
        </div>
        <Skeleton className="mx-auto h-44 max-w-md rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    </main>
  );
}
