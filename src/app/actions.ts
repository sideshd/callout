"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"
// removed PropType

export async function createLeague(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const startingCredits = parseInt(formData.get("startingCredits") as string) || 1000
    if (!name) return { error: "Name is required" }

    let league;
    try {
        league = await prisma.league.create({
            data: {
                name,
                description,
                startingCredits,
                ownerId: session.user.id,
                members: {
                    create: {
                        userId: session.user.id,
                        credits: startingCredits
                    }
                }
            }
        })
    } catch (error) {
        console.error(error)
        return { error: "Failed to create league" }
    }

    revalidatePath("/dashboard")
    redirect(`/leagues/${league.id}`)
}

export async function joinLeague(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Not authenticated" }

    const inviteCode = formData.get("inviteCode") as string

    if (!inviteCode) return { error: "Invite code is required" }

    let league;
    try {
        league = await prisma.league.findUnique({
            where: { inviteCode }
        })

        if (!league) return { error: "League not found" }

        // Check if already a member
        const existingMember = await prisma.leagueMember.findUnique({
            where: {
                leagueId_userId: {
                    leagueId: league.id,
                    userId: session.user.id
                }
            }
        })

        if (existingMember) return { error: "Already a member" }

        await prisma.leagueMember.create({
            data: {
                leagueId: league.id,
                userId: session.user.id,
                credits: league.startingCredits
            }
        })

        // Create activity
        if (league.showActivityFeed) {
            await prisma.activity.create({
                data: {
                    leagueId: league.id,
                    userId: session.user.id,
                    type: "JOIN",
                    content: "joined the league"
                }
            })
        }
    } catch (error) {
        console.error(error)
        return { error: "Failed to join league" }
    }

    revalidatePath("/dashboard")
    redirect(`/leagues/${league.id}`)
}

export async function createProp(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Not authenticated" }

    const leagueId = formData.get("leagueId") as string
    const question = formData.get("question") as string
    const marketType = (formData.get("marketType") as "BINARY" | "MULTIPLE_CHOICE") || "BINARY"
    const targetPlayerId = formData.get("targetPlayerId") as string
    const bettingDeadlineStr = formData.get("bettingDeadline") as string | null

    if (!leagueId || !question) {
        return { error: "Missing required fields" }
    }

    let choices: string[] = []

    if (marketType === "BINARY") {
        choices = ["Yes", "No"]
    } else {
        // [NEW] Choices parsed from multiple input fields
        const rawChoices = formData.getAll("choices")
        choices = rawChoices.map(c => c.toString().trim()).filter(c => c.length > 0)
    }

    if (choices.length < 2) {
        return { error: "At least 2 choices are required" }
    }

    if (targetPlayerId === session.user.id) {
        return { error: "You cannot create a prop about yourself" }
    }

    try {
        const membership = await prisma.leagueMember.findUnique({
            where: {
                leagueId_userId: {
                    leagueId,
                    userId: session.user.id
                }
            },
            include: { league: true }
        })

        if (!membership) return { error: "Not a member of this league" }
        if (!membership.league.allowPropCreation && membership.league.ownerId !== session.user.id) {
            return { error: "Prop creation is disabled for members" }
        }

        // Initial probability = 1 / N
        const initialProb = 1.0 / choices.length

        const prop = await prisma.prop.create({
            data: {
                leagueId,
                creatorId: membership.id,
                question,
                marketType,
                liquidity: 0,
                targetPlayerId: targetPlayerId || null,
                bettingDeadline: bettingDeadlineStr ? new Date(bettingDeadlineStr) : null,
                status: "LIVE",
                choices: {
                    create: choices.map(text => ({
                        text,
                        probability: initialProb,
                        poolAmount: 0
                    }))
                }
            }
        })

        if (membership.league.showActivityFeed) {
            await prisma.activity.create({
                data: {
                    leagueId,
                    userId: session.user.id,
                    type: "CREATE_PROP",
                    content: `created a new prop: "${question}"`
                }
            })
        }

        if (targetPlayerId) {
            const targetMember = await prisma.leagueMember.findUnique({
                where: { id: targetPlayerId },
                include: { user: true }
            })

            if (targetMember && targetMember.userId !== session.user.id) {
                try {
                    await prisma.notification.create({
                        data: {
                            userId: targetMember.userId,
                            leagueId,
                            type: "PROP_ON_YOU",
                            message: `${session.user.name} created a prop about you: "${question}"`,
                            link: `/props/${prop.id}`
                        }
                    })
                } catch (error) {
                    console.error("Failed to create notification:", error)
                }
            }
        }
    } catch (error) {
        console.error(error)
        return { error: "Failed to create prop" }
    }

    revalidatePath(`/leagues/${leagueId}`)
    redirect(`/leagues/${leagueId}`)
}

export async function placeBet(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Not authenticated" }

    const propId = formData.get("propId") as string
    const choiceId = formData.get("choiceId") as string
    const amountStr = formData.get("amount") as string
    const amount = amountStr ? parseInt(amountStr) : 0

    if (!propId || !choiceId || amount <= 0) return { error: "Invalid bet amount" }

    try {
        const prop = await prisma.prop.findUnique({
            where: { id: propId },
            include: {
                league: true,
                choices: true
            }
        })

        if (!prop) return { error: "Prop not found" }
        if (prop.status !== "LIVE") return { error: "Prop is not live" }
        if (prop.bettingDeadline && new Date() > prop.bettingDeadline) return { error: "Betting closed" }

        const membership = await prisma.leagueMember.findUnique({
            where: {
                leagueId_userId: {
                    leagueId: prop.leagueId,
                    userId: session.user.id
                }
            }
        })

        if (!membership) return { error: "Not a member" }
        if (membership.credits < amount) return { error: "Insufficient credits" }

        // Parimutuel logic: update pools and probabilities
        const newLiquidity = prop.liquidity + amount

        const targetChoice = prop.choices.find(c => c.id === choiceId)
        if (!targetChoice) return { error: "Invalid choice" }

        await prisma.$transaction(async (tx) => {
            // Deduct credits
            await tx.leagueMember.update({
                where: { id: membership.id },
                data: { credits: { decrement: amount } }
            })

            // Create Bet
            await tx.bet.create({
                data: {
                    propId,
                    userId: session.user.id,
                    choiceId,
                    amount
                }
            })

            // Update pools
            await tx.choice.update({
                where: { id: choiceId },
                data: { poolAmount: { increment: amount } }
            })

            await tx.prop.update({
                where: { id: propId },
                data: { liquidity: { increment: amount } }
            })

            // Recalculate probabilities
            // simple model: prob = pool / total
            // If total is 0? Handled by newLiquidity check (it's at least amount)

            for (const choice of prop.choices) {
                const isTarget = choice.id === choiceId
                const currentPool = choice.poolAmount + (isTarget ? amount : 0)
                let newProb = 0
                if (newLiquidity > 0) {
                    newProb = currentPool / newLiquidity
                } else {
                    newProb = 1.0 / prop.choices.length
                }

                await tx.choice.update({
                    where: { id: choice.id },
                    data: { probability: newProb }
                })
            }
        })

        if (prop.league.showActivityFeed) {
            await prisma.activity.create({
                data: {
                    leagueId: prop.leagueId,
                    userId: session.user.id,
                    type: "BET",
                    content: `bet ${amount} credits on "${targetChoice.text}"`
                }
            })
        }

        revalidatePath(`/props/${propId}`)
    } catch (error) {
        console.error(error)
        return { error: "Failed to place bet" }
    }
}

export async function resolveProp(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Not authenticated" }

    const propId = formData.get("propId") as string
    const winningChoiceId = formData.get("winningChoiceId") as string

    if (!propId || !winningChoiceId) return { error: "Missing required fields" }

    try {
        const prop = await prisma.prop.findUnique({
            where: { id: propId },
            include: {
                league: true,
                bets: true,
                choices: true
            }
        })

        if (!prop) return { error: "Prop not found" }
        if (prop.league.ownerId !== session.user.id) {
            return { error: "Only league admin can resolve props" }
        }
        if (prop.status === "RESOLVED" || prop.status === "CANCELED") {
            return { error: "Prop already finalized" }
        }

        const winningChoice = prop.choices.find(c => c.id === winningChoiceId)
        if (!winningChoice) return { error: "Invalid winning choice" }

        const winningBets = prop.bets.filter(b => b.choiceId === winningChoiceId)
        // Losing bets are bets on other choices

        const totalPool = prop.liquidity
        const winningPool = winningChoice.poolAmount

        // Parimutuel Payout Logic
        // IF winningPool > 0: Payout = bet.amount * (totalPool / winningPool)
        // IF winningPool == 0: Refund everyone (house takes nothing)

        const updates = []

        updates.push(prisma.prop.update({
            where: { id: propId },
            data: {
                status: "RESOLVED",
                winningChoiceId,
                resolutionDeadline: new Date()
            }
        }))

        if (winningPool > 0) {
            for (const bet of winningBets) {
                // Calculate share of total pool
                const shareOfWin = bet.amount / winningPool
                const payout = Math.floor(shareOfWin * totalPool)

                // Find member
                const member = await prisma.leagueMember.findUnique({
                    where: { leagueId_userId: { leagueId: prop.leagueId, userId: bet.userId } }
                })

                if (member) {
                    updates.push(prisma.leagueMember.update({
                        where: { id: member.id },
                        data: { credits: { increment: payout } }
                    }))

                    updates.push(prisma.notification.create({
                        data: {
                            userId: bet.userId,
                            leagueId: prop.leagueId,
                            type: "BET_WON",
                            message: `You won ${payout} credits on "${prop.question}"!`,
                            link: `/props/${propId}`
                        }
                    }))
                }
            }
        } else {
            // No winners -> Refund everyone
            for (const bet of prop.bets) {
                const member = await prisma.leagueMember.findUnique({
                    where: { leagueId_userId: { leagueId: prop.leagueId, userId: bet.userId } }
                })
                if (member) {
                    updates.push(prisma.leagueMember.update({
                        where: { id: member.id },
                        data: { credits: { increment: bet.amount } }
                    }))
                }
            }
            // Add notification for refund?
        }

        if (prop.league.showActivityFeed) {
            await prisma.activity.create({
                data: {
                    leagueId: prop.leagueId,
                    userId: session.user.id,
                    type: "WIN",
                    content: `resolved "${prop.question}" (Winner: ${winningChoice.text})`
                }
            })
        }

        // Notify target player
        if (prop.targetPlayerId) {
            const targetMember = await prisma.leagueMember.findUnique({
                where: { id: prop.targetPlayerId },
                include: { user: true }
            })
            if (targetMember) {
                updates.push(prisma.notification.create({
                    data: {
                        userId: targetMember.userId,
                        leagueId: prop.leagueId,
                        type: "SYSTEM",
                        message: `The prop "${prop.question}" about you was resolved: ${winningChoice.text}`,
                        link: `/props/${propId}`
                    }
                }))
            }
        }

        await prisma.$transaction(updates)
        revalidatePath(`/props/${propId}`)
        revalidatePath(`/leagues/${prop.leagueId}`)

    } catch (error) {
        console.error(error)
        return { error: "Failed to resolve prop" }
    }
}

export async function cancelProp(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Not authenticated" }

    const propId = formData.get("propId") as string

    try {
        const prop = await prisma.prop.findUnique({
            where: { id: propId },
            include: { league: true, bets: true }
        })

        if (!prop) return { error: "Prop not found" }
        if (prop.league.ownerId !== session.user.id) {
            return { error: "Only league admin can cancel props" }
        }

        const updates = []

        updates.push(prisma.prop.update({
            where: { id: propId },
            data: { status: "CANCELED", resolutionDeadline: new Date() }
        }))

        // Refund all bets
        for (const bet of prop.bets) {
            const member = await prisma.leagueMember.findUnique({
                where: {
                    leagueId_userId: {
                        leagueId: prop.leagueId,
                        userId: bet.userId
                    }
                }
            })
            if (member) {
                updates.push(prisma.leagueMember.update({
                    where: { id: member.id },
                    data: { credits: { increment: bet.amount } }
                }))
            }
        }

        await prisma.$transaction(updates)
        revalidatePath(`/props/${propId}`)
        revalidatePath(`/leagues/${prop.leagueId}`)
    } catch (error) {
        console.error(error)
        return { error: "Failed to cancel prop" }
    }
}

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "Missing required fields" };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "User already exists" };
        }

        const hashedPassword = await hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Failed to create account" };
    }
}

export async function leaveLeague(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return

    const leagueId = formData.get("leagueId") as string
    if (!leagueId) return

    try {
        const membership = await prisma.leagueMember.findUnique({
            where: {
                leagueId_userId: {
                    leagueId,
                    userId: session.user.id
                }
            }
        })

        if (!membership) return

        // Check if last member
        const memberCount = await prisma.leagueMember.count({
            where: { leagueId }
        })

        if (memberCount === 1) {
            // Delete league if last member
            await prisma.league.delete({ where: { id: leagueId } })
        } else {
            // Just leave
            await prisma.leagueMember.delete({ where: { id: membership.id } })
        }

        revalidatePath("/dashboard")
    } catch (error) {
        console.error(error)
    }
}

export async function deleteLeague(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return

    const leagueId = formData.get("leagueId") as string
    if (!leagueId) return

    try {
        const league = await prisma.league.findUnique({
            where: { id: leagueId }
        })

        if (!league) return
        if (league.ownerId !== session.user.id) return

        await prisma.league.delete({ where: { id: leagueId } })

        revalidatePath("/dashboard")
    } catch (error) {
        console.error(error)
    }
}

export async function createComment(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return

    const propId = formData.get("propId") as string
    const content = formData.get("content") as string

    if (!propId || !content) {
        // return { error: "Missing required fields" }
        return
    }

    try {
        const prop = await prisma.prop.findUnique({
            where: { id: propId },
            include: { league: true }
        })

        if (!prop) return

        // Verify membership
        const membership = await prisma.leagueMember.findUnique({
            where: {
                leagueId_userId: {
                    leagueId: prop.leagueId,
                    userId: session.user.id
                }
            }
        })

        if (!membership) return

        await prisma.comment.create({
            data: {
                propId,
                userId: session.user.id,
                content
            }
        })

        // Create activity
        if (prop.league.showActivityFeed) {
            await prisma.activity.create({
                data: {
                    leagueId: prop.leagueId,
                    userId: session.user.id,
                    type: "COMMENT",
                    content: `commented on "${prop.question}"`
                }
            })
        }

        revalidatePath(`/props/${propId}`)
    } catch (error) {
        console.error(error)
        // return { error: "Failed to create comment" }
    }
}

export async function updateLeagueSettings(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return

    const leagueId = formData.get("leagueId") as string
    const allowPropCreation = formData.get("allowPropCreation") === "true"
    const showActivityFeed = formData.get("showActivityFeed") === "true"

    if (!leagueId) return

    try {
        const league = await prisma.league.findUnique({
            where: { id: leagueId }
        })

        if (!league) return
        if (league.ownerId !== session.user.id) return

        await prisma.league.update({
            where: { id: leagueId },
            data: {
                allowPropCreation,
                showActivityFeed
            }
        })

        revalidatePath(`/leagues/${leagueId}`)
    } catch (error) {
        console.error(error)
        // return { error: "Failed to update settings" }
    }
}

export async function adminAction(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return

    const leagueId = formData.get("leagueId") as string
    const targetUserId = formData.get("targetUserId") as string
    const action = formData.get("action") as string

    if (!leagueId || !targetUserId || !action) return

    try {
        const league = await prisma.league.findUnique({
            where: { id: leagueId }
        })

        if (!league) return
        if (league.ownerId !== session.user.id) return

        if (action === "KICK") {
            if (targetUserId === league.ownerId) return

            await prisma.leagueMember.delete({
                where: {
                    leagueId_userId: {
                        leagueId,
                        userId: targetUserId
                    }
                }
            })
        }

        revalidatePath(`/leagues/${leagueId}`)
    } catch (error) {
        console.error(error)
        // return { error: "Failed to perform admin action" }
    }
}

export async function updateMemberCredits(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return

    const leagueId = formData.get("leagueId") as string
    const targetUserId = formData.get("targetUserId") as string
    const creditsStr = formData.get("credits") as string
    const credits = parseInt(creditsStr)

    if (!leagueId || !targetUserId || isNaN(credits)) return

    try {
        const league = await prisma.league.findUnique({
            where: { id: leagueId }
        })

        if (!league) return
        if (league.ownerId !== session.user.id) return

        await prisma.leagueMember.update({
            where: {
                leagueId_userId: {
                    leagueId,
                    userId: targetUserId
                }
            },
            data: { credits }
        })

        revalidatePath(`/leagues/${leagueId}`)
    } catch (error) {
        console.error(error)
    }
}

export async function markNotificationRead(notificationId: string, leagueId?: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return

    try {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        })

        if (!notification || notification.userId !== session.user.id) return

        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        })

        if (leagueId) {
            revalidatePath(`/leagues/${leagueId}`)
        }
    } catch (error) {
        console.error(error)
    }
}

export async function markAllNotificationsRead(leagueId?: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return

    try {
        const whereClause: any = {
            userId: session.user.id,
            read: false
        }

        if (leagueId) {
            whereClause.leagueId = leagueId
        }

        await prisma.notification.updateMany({
            where: whereClause,
            data: { read: true }
        })

        if (leagueId) {
            revalidatePath(`/leagues/${leagueId}`)
        }
    } catch (error) {
        console.error(error)
    }
}
