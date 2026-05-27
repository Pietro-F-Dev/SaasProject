function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E5E7EB] dark:bg-[#374151] ${className ?? ''}`} />
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <SkeletonBox className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <SkeletonBox className="w-28 h-3" />
            <SkeletonBox className="w-16 h-3 rounded-full" />
          </div>
        </div>
        <SkeletonBox className="w-6 h-6 rounded" />
      </div>
      <div className="space-y-2">
        <SkeletonBox className="w-full h-3" />
        <SkeletonBox className="w-3/4 h-3" />
      </div>
      <SkeletonBox className="w-full h-1.5 rounded-full" />
      <div className="flex justify-between pt-1 border-t border-[#F3F4F6] dark:border-[#374151]">
        <SkeletonBox className="w-24 h-3" />
        <SkeletonBox className="w-20 h-3" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5">
      <SkeletonBox className="w-10 h-10 rounded-lg mb-3" />
      <SkeletonBox className="w-10 h-7 mb-1" />
      <SkeletonBox className="w-24 h-3" />
    </div>
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-lg p-3 border border-[#E5E7EB] dark:border-[#374151] flex flex-col gap-2">
      <SkeletonBox className="w-full h-3" />
      <SkeletonBox className="w-2/3 h-3" />
      <div className="flex gap-2 mt-1">
        <SkeletonBox className="w-14 h-4 rounded-full" />
        <SkeletonBox className="w-5 h-5 rounded-full" />
      </div>
    </div>
  )
}
