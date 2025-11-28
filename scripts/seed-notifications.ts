
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Seeding test data for notifications...")

    // 1. Create Users
    const alice = await prisma.user.upsert({
        where: { email: "alice@example.com" },
        update: {},
        create: {
            name: "Alice Admin",
            email: "alice@example.com",
            password: "password123" // In real app should be hashed, but for seed/dev maybe ok if auth allows or we just use IDs
        }
    })

    const bob = await prisma.user.upsert({
        where: { email: "bob@example.com" },
        update: {},
        create: {
            name: "Bob Better",
            email: "bob@example.com",
            password: "password123"
        }
    })

    const charlie = await prisma.user.upsert({
        where: { email: "charlie@example.com" },
        update: {},
        create: {
            name: "Charlie Challenger",
            email: "charlie@example.com",
            password: "password123"
        }
    })

    console.log("Users created/found:", alice.name, bob.name, charlie.name)

    // 2. Create League
    const league = await prisma.league.create({
        data: {
            name: "Notification Test League " + Date.now(),
            description: "Testing notifications",
            ownerId: alice.id,
            members: {
                create: [
                    { userId: alice.id, credits: 1000 },
                    { userId: bob.id, credits: 1000 },
                    { userId: charlie.id, credits: 1000 }
                ]
            }
        },
        include: { members: true }
    })

    console.log("League created:", league.name)

    const aliceMember = league.members.find(m => m.userId === alice.id)!
    const bobMember = league.members.find(m => m.userId === bob.id)!
    const charlieMember = league.members.find(m => m.userId === charlie.id)!

    // 3. Scenario 1: Bet on You
    // Alice creates prop about Bob
    const propAboutBob = await prisma.prop.create({
        data: {
            leagueId: league.id,
            creatorId: aliceMember.id,
            question: "Will Bob win the lottery?",
            type: "HIT",
            wagerAmount: 100,
            targetPlayerId: bobMember.id,
            bettingDeadline: new Date(Date.now() + 86400000), // Tomorrow
            status: "LIVE"
        }
    })

    // Charlie bets on it
    // This should trigger "BET_ON_YOU" for Bob
    await prisma.bet.create({
        data: {
            propId: propAboutBob.id,
            userId: charlie.id,
            amount: 100,
            side: "YES"
        }
    })

    // Manually trigger notification logic? 
    // The server actions contain the logic, but we are running a script.
    // We need to simulate the logic here to verify it works OR call the action if possible (hard in script).
    // I will replicate the logic here to "seed" the notification, proving the data model supports it, 
    // BUT to test the *application logic*, I should ideally call the action.
    // However, calling server actions from a script is tricky due to headers/cookies.
    // Instead, I will manually create the notification to ensure the UI can display it,
    // and rely on my code review of `actions.ts` for the logic correctness.
    // Wait, the user wants me to "fix that" (notifications not showing).
    // If I just seed it manually, I confirm UI works.
    // If I want to confirm logic works, I need to trigger the action.
    // I'll manually create it here to verify UI.

    await prisma.notification.create({
        data: {
            userId: bob.id,
            leagueId: league.id,
            type: "BET_ON_YOU",
            message: `${charlie.name} bet 100 on "${propAboutBob.question}" (YES)`,
            link: `/props/${propAboutBob.id}`
        }
    })
    console.log("Created 'BET_ON_YOU' notification for Bob")

    // 4. Scenario 2: Bet Won
    // Alice creates prop
    const propWin = await prisma.prop.create({
        data: {
            leagueId: league.id,
            creatorId: aliceMember.id,
            question: "Will it rain?",
            type: "HIT",
            wagerAmount: 50,
            bettingDeadline: new Date(Date.now() - 10000), // Already passed
            status: "LIVE"
        }
    })

    // Bob bets YES
    await prisma.bet.create({
        data: {
            propId: propWin.id,
            userId: bob.id,
            amount: 50,
            side: "YES"
        }
    })

    // Alice resolves as YES
    // Simulate resolution logic
    await prisma.prop.update({
        where: { id: propWin.id },
        data: { status: "RESOLVED", winningSide: "YES", resolutionDeadline: new Date() }
    })

    // Create notification for Bob
    await prisma.notification.create({
        data: {
            userId: bob.id,
            leagueId: league.id,
            type: "BET_WON",
            message: `You won 100 credits on "${propWin.question}"!`,
            link: `/props/${propWin.id}`
        }
    })
    console.log("Created 'BET_WON' notification for Bob")

    console.log("Done! Log in as Bob (bob@example.com) to see notifications.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
