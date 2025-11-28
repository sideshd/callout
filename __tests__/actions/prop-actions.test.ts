import { createProp } from '@/app/actions'
import { prisma } from '@/lib/db'

// Mock Prisma
jest.mock('@/lib/db', () => ({
    prisma: {
        prop: {
            create: jest.fn(),
        },
        leagueMember: {
            findUnique: jest.fn(),
        },
    },
}))

// Mock NextAuth
jest.mock('next-auth', () => ({
    getServerSession: jest.fn(() => Promise.resolve({ user: { id: 'user-1' } })),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}))

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}))

describe('createProp Action', () => {
    it('creates a prop successfully', async () => {
        const formData = new FormData()
        formData.append('leagueId', 'league-1')
        formData.append('question', 'Will it rain?')
        formData.append('type', 'HIT')
        formData.append('wagerAmount', '10')
        formData.append('bettingDeadline', new Date().toISOString())

            // Mock membership check
            ; (prisma.leagueMember.findUnique as jest.Mock).mockResolvedValue({
                id: 'member-1',
                league: { showActivityFeed: true }
            })

            // Mock prop creation
            ; (prisma.prop.create as jest.Mock).mockResolvedValue({ id: 'prop-1' })

        await createProp(formData)

        // Verify prop was created with correct data
        expect(prisma.prop.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                question: 'Will it rain?',
                wagerAmount: 10,
                type: 'HIT',
            })
        }))
    })

    it('fails if not a member', async () => {
        const formData = new FormData()
        formData.append('leagueId', 'league-1')
        formData.append('question', 'Will it rain?')
        formData.append('type', 'HIT')
        formData.append('bettingDeadline', new Date().toISOString())

            // Mock membership check returning null
            ; (prisma.leagueMember.findUnique as jest.Mock).mockResolvedValue(null)

        const result = await createProp(formData)

        expect(result).toEqual({ error: 'Not a member of this league' })
    })
})
