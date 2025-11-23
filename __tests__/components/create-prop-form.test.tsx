import { render, screen } from '@testing-library/react'
import { CreatePropForm } from '@/components/forms/create-prop-form'

// Mock useFormStatus
jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    useFormStatus: () => ({ pending: false }),
}))

// Mock actions
jest.mock('@/app/actions', () => ({
    createProp: jest.fn(),
}))

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        refresh: jest.fn(),
    }),
}))

describe('CreatePropForm', () => {
    const mockMembers = [
        { id: '1', user: { name: 'Alice' } },
        { id: '2', user: { name: 'Bob' } },
    ]

    it('renders correctly', () => {
        render(<CreatePropForm leagueId="league-1" members={mockMembers as any} />)

        expect(screen.getByLabelText(/Question/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Type/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Wager Amount/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Target Player/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Betting Deadline/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Post Prop/i })).toBeInTheDocument()
    })

    it('displays wager amount input with default value', () => {
        render(<CreatePropForm leagueId="league-1" members={mockMembers as any} />)

        const wagerInput = screen.getByLabelText(/Wager Amount/i) as HTMLInputElement
        expect(wagerInput).toBeInTheDocument()
        expect(wagerInput.value).toBe('10')
    })
})
