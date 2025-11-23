"use client"

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(false)
    }, [pathname, searchParams])

    return (
        <>
            {isLoading && (
                <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4">
                        <Loader2 className="size-8 text-emerald-400 animate-spin" />
                        <p className="text-slate-300 text-sm">Loading...</p>
                    </div>
                </div>
            )}
            <div className="animate-fade-in">
                {children}
            </div>
        </>
    )
}
