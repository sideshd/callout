
import { placeBet, resolveProp, markNotificationRead, createProp } from '@/app/actions'
import { prisma } from '@/lib/db'

// Mock Prisma
jest.mock('@/lib/db', () => ({
    prisma: {
        prop: {
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
        },
        leagueMember: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        bet: {
            create: jest.fn(),
        },
        notification: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        activity: {
            create: jest.fn(),
        },
        $transaction: jest.fn((args) => Promise.resolve(args)),
    },
}))

// Mock NextAuth
jest.mock('next-auth', () => ({
    getServerSession: jest.fn(() => Promise.resolve({ user: { id: 'user-1', name: 'User 1' } })),
}))

// Mock Next.js navigation/cache
jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}))

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}))

describe('Notification Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createProp (PROP_ON_YOU)', () => {
        it('creates notification when prop is created about another user', async () => {
            const formData = new FormData()
            formData.append('leagueId', 'league-1')
            formData.append('question', 'Is Bob cool?')
            formData.append('type', 'HIT')
            formData.append('wagerAmount', '10')
            formData.append('bettingDeadline', new Date().toISOString())
            formData.append('targetPlayerId', 'member-bob')

                // Mock membership check (first call) and target player check (second call)
                ; (prisma.leagueMember.findUnique as jest.Mock)
                    .mockResolvedValueOnce({ id: 'member-alice', league: { showActivityFeed: true } }) // Creator membership
                    .mockResolvedValueOnce({ id: 'member-bob', userId: 'user-bob' }) // Target player

                // Mock prop creation
                ; (prisma.prop.create as jest.Mock).mockResolvedValue({ id: 'prop-1' })

            await createProp(formData)

            expect(prisma.notification.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: 'user-bob',
                    type: 'PROP_ON_YOU',
                    message: expect.stringContaining('created a prop about you'),
                    leagueId: 'league-1'
                })
            })
        })
    })

    describe('placeBet', () => {
        it('does NOT create notification when betting on another user', async () => {
            const formData = new FormData()
            formData.append('propId', 'prop-1')
            formData.append('side', 'YES')
            formData.append('amount', '100')

                // Mock prop
                ; (prisma.prop.findUnique as jest.Mock).mockResolvedValue({
                    id: 'prop-1',
                    leagueId: 'league-1',
                    wagerAmount: 100,
                    status: 'LIVE',
                    bettingDeadline: new Date(Date.now() + 10000),
                    targetPlayerId: 'member-2',
                    league: { mode: 'POOL', showActivityFeed: true }
                })

                // Mock current user membership
                ; (prisma.leagueMember.findUnique as jest.Mock)
                    .mockResolvedValue({ id: 'member-1', credits: 1000 })

            await placeBet(formData)

            expect(prisma.notification.create).not.toHaveBeenCalled()
        })
    })

    describe('resolveProp (BET_WON)', () => {
        it('creates notification for winning bets', async () => {
            const formData = new FormData()
            formData.append('propId', 'prop-1')
            formData.append('winningSide', 'YES')

                // Mock prop with bets
                ; (prisma.prop.findUnique as jest.Mock).mockResolvedValue({
                    id: 'prop-1',
                    leagueId: 'league-1',
                    question: 'Test Prop',
                    status: 'LIVE',
                    league: { ownerId: 'user-1', mode: 'POOL', showActivityFeed: true },
                    bets: [
                        { userId: 'winner-1', amount: 100, side: 'YES' },
                        { userId: 'loser-1', amount: 100, side: 'NO' }
                    ]
                })

                // Mock finding member for payout
                ; (prisma.leagueMember.findUnique as jest.Mock).mockResolvedValue({ id: 'member-winner' })

            await resolveProp(formData)

            expect(prisma.notification.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: 'winner-1',
                    type: 'BET_WON',
                    leagueId: 'league-1'
                })
            })
        })
    })

    describe('markNotificationRead', () => {
        it('marks notification as read', async () => {
            ; (prisma.notification.findUnique as jest.Mock).mockResolvedValue({
                id: 'notif-1',
                userId: 'user-1'
            })

            await markNotificationRead('notif-1', 'league-1')

            expect(prisma.notification.update).toHaveBeenCalledWith({
                where: { id: 'notif-1' },
                data: { read: true }
            })
        })
        it('creates notification for target player when prop resolves', async () => {
            const formData = new FormData()
            formData.append('propId', 'prop-1')
            formData.append('winningSide', 'YES')

                // Mock prop with target player
                ; (prisma.prop.findUnique as jest.Mock).mockResolvedValue({
                    id: 'prop-1',
                    leagueId: 'league-1',
                    question: 'Is Bob cool?',
                    status: 'LIVE',
                    targetPlayerId: 'member-bob',
                    league: { ownerId: 'user-1', mode: 'POOL', showActivityFeed: true },
                    bets: []
                })

                // Mock finding target member
                ; (prisma.leagueMember.findUnique as jest.Mock).mockResolvedValue({
                    id: 'member-bob',
                    userId: 'user-bob'
                })

            await resolveProp(formData)

            expect(prisma.notification.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: 'user-bob',
                    message: expect.stringContaining('about you was resolved'),
                    leagueId: 'league-1'
                })
            })
        })
    })
})
