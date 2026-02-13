
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
            password: "password123"
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

    // 3. Scenario 1: Prop about You
    // Alice creates prop about Bob
    const propAboutBob = await prisma.prop.create({
        data: {
            leagueId: league.id,
            creatorId: aliceMember.id,
            question: "Will Bob win the lottery?",
            marketType: "MULTIPLE_CHOICE",
            targetPlayerId: bobMember.id,
            bettingDeadline: new Date(Date.now() + 86400000), // Tomorrow
            status: "LIVE",
            choices: {
                create: [
                    { text: "Yes", probability: 0.5 },
                    { text: "No", probability: 0.5 }
                ]
            }
        },
        include: { choices: true }
    })

    // Charlie bets on "Yes"
    const yesChoice = propAboutBob.choices.find(c => c.text === "Yes")!

    await prisma.bet.create({
        data: {
            propId: propAboutBob.id,
            userId: charlie.id,
            amount: 100,
            choiceId: yesChoice.id
        }
    })

    // Create notification manually to verify UI
    await prisma.notification.create({
        data: {
            userId: bob.id,
            leagueId: league.id,
            type: "PROP_ON_YOU",
            message: `${alice.name} created a market about you: "${propAboutBob.question}"`,
            link: `/props/${propAboutBob.id}`
        }
    })
    console.log("Created 'PROP_ON_YOU' notification for Bob")

    // 4. Scenario 2: Bet Won
    // Alice creates prop
    const propWin = await prisma.prop.create({
        data: {
            leagueId: league.id,
            creatorId: aliceMember.id,
            question: "Will it rain?",
            marketType: "MULTIPLE_CHOICE",
            bettingDeadline: new Date(Date.now() - 10000), // Already passed
            status: "RESOLVED",
            choices: {
                create: [
                    { text: "Yes", probability: 0.8 },
                    { text: "No", probability: 0.2 }
                ]
            }
        },
        include: { choices: true }
    })

    const winChoice = propWin.choices.find(c => c.text === "Yes")!

    // Bob bets YES (simulating past bet)
    await prisma.bet.create({
        data: {
            propId: propWin.id,
            userId: bob.id,
            amount: 50,
            choiceId: winChoice.id
        }
    })

    // Set winning choice
    await prisma.prop.update({
        where: { id: propWin.id },
        data: {
            winningChoiceId: winChoice.id,
            resolutionDeadline: new Date()
        }
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
