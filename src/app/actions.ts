"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"
import { PropType } from "@prisma/client"

export async function createLeague(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const startingCredits = parseInt(formData.get("startingCredits") as string) || 1000
    const mode = (formData.get("mode") as string) || "POOL"

    if (!name) return { error: "Name is required" }

    let league;
    try {
        league = await prisma.league.create({
            data: {
                name,
                description,
                startingCredits,
                mode: mode as "POOL" | "RANK",
                ownerId: session.user.id,
                members: {
                    create: {
                        userId: session.user.id,
                        credits: startingCredits // Owner gets starting credits too
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
    const typeInput = formData.get("type") as string
    const targetPlayerId = formData.get("targetPlayerId") as string

    // Handle both POOL mode (wagerAmount) and RANK mode (minBet)
    const wagerAmountStr = formData.get("wagerAmount") as string
    const minBetStr = formData.get("minBet") as string
    const wagerAmount = parseInt(wagerAmountStr || minBetStr || "0") || 0

    const oddsStr = formData.get("odds") as string
    const odds = oddsStr ? parseFloat(oddsStr) : null
    const bettingDeadlineStr = formData.get("bettingDeadline") as string

    if (!leagueId || !question || !typeInput || !bettingDeadlineStr) {
        return { error: "Missing required fields" }
    }

    const type = PropType[typeInput as keyof typeof PropType]

    try {
        // Verify membership
        const membership = await prisma.leagueMember.findUnique({
            where: {
                leagueId_userId: {
                    leagueId,
                    userId: session.user.id
                }
            }
        })

        if (!membership) return { error: "Not a member of this league" }

        await prisma.prop.create({
            data: {
                leagueId,
                creatorId: membership.id,
                question,
                type,
                wagerAmount,
                odds: odds,
                targetPlayerId: targetPlayerId || null,
                bettingDeadline: new Date(bettingDeadlineStr),
                status: "LIVE"
            }
        })
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
    const side = formData.get("side") as string
    const amountStr = formData.get("amount") as string
    const amount = amountStr ? parseInt(amountStr) : 0

    if (!propId || !side) return { error: "Missing required fields" }

    try {
        const prop = await prisma.prop.findUnique({
            where: { id: propId },
            include: { league: true }
        })

        if (!prop) return { error: "Prop not found" }
        if (prop.status !== "LIVE") return { error: "Prop is not live" }
        if (new Date() > prop.bettingDeadline) return { error: "Betting closed" }

        // Check credits
        const membership = await prisma.leagueMember.findUnique({
            where: {
                leagueId_userId: {
                    leagueId: prop.leagueId,
                    userId: session.user.id
                }
            }
        })

        if (!membership) return { error: "Not a member" }

        // Determine wager amount
        let wagerAmount = prop.wagerAmount
        if (prop.league.mode === "RANK") {
            if (!amount || amount < prop.wagerAmount) {
                return { error: `Minimum bet is ${prop.wagerAmount}` }
            }
            wagerAmount = amount
        }

        if (membership.credits < wagerAmount) return { error: "Insufficient credits" }

        // Transaction: Deduct credits, create bet
        await prisma.$transaction([
            prisma.leagueMember.update({
                where: { id: membership.id },
                data: { credits: { decrement: wagerAmount } }
            }),
            prisma.bet.create({
                data: {
                    propId,
                    userId: session.user.id,
                    amount: wagerAmount,
                    side
                }
            })
        ])

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
    const winningSide = formData.get("winningSide") as string

    if (!propId || !winningSide) return { error: "Missing required fields" }

    try {
        const prop = await prisma.prop.findUnique({
            where: { id: propId },
            include: {
                league: true,
                bets: true
            }
        })

        if (!prop) return { error: "Prop not found" }

        // Check permission (League Owner or Prop Creator?)
        // User said: "League Admin ... Resolve props". Admin = League Owner usually.
        // But maybe creator too? "Admin still decides the result".
        // I'll allow League Owner.
        if (prop.league.ownerId !== session.user.id) {
            return { error: "Only league admin can resolve props" }
        }

        if (prop.status === "RESOLVED" || prop.status === "CANCELED") {
            return { error: "Prop already finalized" }
        }

        // Calculate payouts
        const winningBets = prop.bets.filter(b => b.side === winningSide)
        const losingBets = prop.bets.filter(b => b.side !== winningSide)

        const W_total = winningBets.reduce((sum: number, b: any) => sum + b.amount, 0)
        const L_total = losingBets.reduce((sum: number, b: any) => sum + b.amount, 0)


        const updates = []

        // Update prop status
        updates.push(prisma.prop.update({
            where: { id: propId },
            data: {
                status: "RESOLVED",
                winningSide,
                resolutionDeadline: new Date()
            }
        }))

        // Distribute winnings
        if (W_total > 0) {
            for (const bet of winningBets) {
                let payout = 0

                if (prop.league.mode === "RANK") {
                    // Fixed odds payout
                    // If odds are 3 (3:1), payout is bet * 3
                    // The user said: "if odds are 3:1 and I bet 100, then I win back 300"
                    // This implies the payout is bet * odds.
                    // Usually 3:1 means profit is 3x, total return is 4x.
                    // But user example: "win back 300" on 100 bet with 3:1 odds.
                    // This means the multiplier IS the odds value stored.
                    // Stored odds: 2, 3, 4 etc.
                    // So payout = bet.amount * (prop.odds || 2)
                    const multiplier = prop.odds || 2
                    payout = Math.floor(bet.amount * multiplier)
                } else {
                    // Pool payout
                    payout = Math.floor(bet.amount + (bet.amount / W_total) * L_total)
                }

                // Find member to update
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
                        data: { credits: { increment: payout } }
                    }))
                }
            }
        } else {
            // No winners
            if (prop.league.mode === "RANK") {
                // In RANK mode, if you lose, you lose. House wins (nobody gets credits).
                // So we do nothing for losers.
                // But wait, if NOBODY won, does that mean everyone lost? Yes.
                // So no refunds in RANK mode unless cancelled.
            } else {
                // In POOL mode:
                // If nobody bet the winning side → treat as CANCELED and refund everyone.
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
                // Update status to CANCELED instead of RESOLVED
                updates[0] = prisma.prop.update({
                    where: { id: propId },
                    data: {
                        status: "CANCELED",
                        resolutionDeadline: new Date()
                    }
                })
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
    if (!session?.user) return { error: "Not authenticated" }

    const leagueId = formData.get("leagueId") as string
    if (!leagueId) return { error: "League ID required" }

    try {
        const membership = await prisma.leagueMember.findUnique({
            where: {
                leagueId_userId: {
                    leagueId,
                    userId: session.user.id
                }
            }
        })

        if (!membership) return { error: "Not a member" }

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
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to leave league" }
    }
}

export async function deleteLeague(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Not authenticated" }

    const leagueId = formData.get("leagueId") as string
    if (!leagueId) return { error: "League ID required" }

    try {
        const league = await prisma.league.findUnique({
            where: { id: leagueId }
        })

        if (!league) return { error: "League not found" }
        if (league.ownerId !== session.user.id) return { error: "Not authorized" }

        await prisma.league.delete({ where: { id: leagueId } })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to delete league" }
    }
}
