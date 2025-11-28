
import { updateMemberCredits, adminAction, updateLeagueSettings } from '@/app/actions'
import { prisma } from '@/lib/db'

// Mock Prisma
jest.mock('@/lib/db', () => ({
    prisma: {
        league: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        leagueMember: {
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}))

// Mock NextAuth
jest.mock('next-auth', () => ({
    getServerSession: jest.fn(() => Promise.resolve({ user: { id: 'owner-id' } })),
}))

// Mock Next.js navigation/cache
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}))

describe('Admin Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('updateMemberCredits', () => {
        it('updates member credits successfully', async () => {
            const formData = new FormData()
            formData.append('leagueId', 'league-1')
            formData.append('targetUserId', 'user-2')
            formData.append('credits', '500')

                // Mock league owner check
                ; (prisma.league.findUnique as jest.Mock).mockResolvedValue({
                    id: 'league-1',
                    ownerId: 'owner-id'
                })

            await updateMemberCredits(formData)

            expect(prisma.leagueMember.update).toHaveBeenCalledWith({
                where: {
                    leagueId_userId: {
                        leagueId: 'league-1',
                        userId: 'user-2'
                    }
                },
                data: { credits: 500 }
            })
        })

        it('fails if not owner', async () => {
            const formData = new FormData()
            formData.append('leagueId', 'league-1')
            formData.append('targetUserId', 'user-2')
            formData.append('credits', '500')

                // Mock league with different owner
                ; (prisma.league.findUnique as jest.Mock).mockResolvedValue({
                    id: 'league-1',
                    ownerId: 'other-id'
                })

            await updateMemberCredits(formData)

            expect(prisma.leagueMember.update).not.toHaveBeenCalled()
        })
    })

    describe('adminAction (KICK)', () => {
        it('kicks a member successfully', async () => {
            const formData = new FormData()
            formData.append('leagueId', 'league-1')
            formData.append('targetUserId', 'user-2')
            formData.append('action', 'KICK')

                ; (prisma.league.findUnique as jest.Mock).mockResolvedValue({
                    id: 'league-1',
                    ownerId: 'owner-id'
                })

            await adminAction(formData)

            expect(prisma.leagueMember.delete).toHaveBeenCalledWith({
                where: {
                    leagueId_userId: {
                        leagueId: 'league-1',
                        userId: 'user-2'
                    }
                }
            })
        })

        it('prevents kicking the owner', async () => {
            const formData = new FormData()
            formData.append('leagueId', 'league-1')
            formData.append('targetUserId', 'owner-id')
            formData.append('action', 'KICK')

                ; (prisma.league.findUnique as jest.Mock).mockResolvedValue({
                    id: 'league-1',
                    ownerId: 'owner-id'
                })

            await adminAction(formData)

            expect(prisma.leagueMember.delete).not.toHaveBeenCalled()
        })
    })

    describe('updateLeagueSettings', () => {
        it('updates settings successfully', async () => {
            const formData = new FormData()
            formData.append('leagueId', 'league-1')
            formData.append('allowPropCreation', 'false')
            formData.append('showActivityFeed', 'false')

                ; (prisma.league.findUnique as jest.Mock).mockResolvedValue({
                    id: 'league-1',
                    ownerId: 'owner-id'
                })

            await updateLeagueSettings(formData)

            expect(prisma.league.update).toHaveBeenCalledWith({
                where: { id: 'league-1' },
                data: {
                    allowPropCreation: false,
                    showActivityFeed: false
                }
            })
        })
    })
})
