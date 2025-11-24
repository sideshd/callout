export function Logo({ className = "size-8" }: { className?: string }) {
    return (
        <div className={`${className} relative rounded-lg overflow-hidden`}>
            <img src="/favicon.ico" alt="Callout Logo" className="w-full h-full object-contain" />
        </div>
    )
}
