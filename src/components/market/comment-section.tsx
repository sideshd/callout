"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { createComment } from "@/app/actions"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"

interface Comment {
    id: string
    content: string
    createdAt: Date | string
    user: {
        id: string
        name: string | null
    }
}

interface CommentSectionProps {
    propId: string
    initialComments: Comment[]
    currentUserId: string
    currentUserName: string | null
}

export function CommentSection({ propId, initialComments, currentUserId, currentUserName }: CommentSectionProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [optimisticComments, setOptimisticComments] = useState<Comment[]>([])
    const [inputValue, setInputValue] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    const allComments = [...initialComments, ...optimisticComments]

    useEffect(() => {
        // Auto-scroll to bottom when new comments appear
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [allComments.length])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!inputValue.trim()) return

        const content = inputValue.trim()
        setInputValue("")

        // Optimistic: add comment immediately
        const tempComment: Comment = {
            id: `temp-${Date.now()}`,
            content,
            createdAt: new Date(),
            user: {
                id: currentUserId,
                name: currentUserName,
            }
        }
        setOptimisticComments(prev => [...prev, tempComment])

        const formData = new FormData()
        formData.set("propId", propId)
        formData.set("content", content)

        startTransition(async () => {
            await createComment(formData)
            // Clear optimistic comments after server confirms
            setOptimisticComments([])
            router.refresh()
        })
    }

    return (
        <div className="glass rounded-2xl p-5 border border-white/10 card-shadow">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                    <div className="text-sm font-black">Comments</div>
                    <div className="text-xs text-[var(--muted)]">Argue your case. Drop receipts.</div>
                </div>
                <div className="text-xs text-[var(--muted)]">{allComments.length} comment{allComments.length !== 1 ? 's' : ''}</div>
            </div>

            {/* Comment list */}
            <div
                ref={scrollRef}
                className="space-y-2 max-h-[300px] overflow-y-auto rounded-xl bg-black/25 border border-white/10 p-3 mb-4"
            >
                {allComments.length === 0 ? (
                    <div className="text-sm text-[var(--muted)] p-3">No comments yet. Be the first!</div>
                ) : (
                    allComments.map((comment) => {
                        const isTemp = comment.id.startsWith('temp-')
                        const isOwn = comment.user.id === currentUserId
                        return (
                            <div
                                key={comment.id}
                                className={`p-3 rounded-xl transition-all ${isTemp ? 'opacity-60' : ''
                                    } ${isOwn
                                        ? 'bg-[var(--apple-blue)]/15 border border-[var(--apple-blue)]/25'
                                        : 'bg-white/5 border border-white/10'
                                    }`}
                            >
                                <div className="text-xs text-[var(--muted)]">
                                    {comment.user.name || 'Anonymous'} • {
                                        isTemp ? 'just now' : formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                                    }
                                </div>
                                <div className="mt-1 font-semibold">{comment.content}</div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Comment form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Write a comment…"
                    className="input-apple flex-1"
                    disabled={isPending}
                />
                <button
                    type="submit"
                    disabled={isPending || !inputValue.trim()}
                    className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
            </form>
        </div>
    )
}
