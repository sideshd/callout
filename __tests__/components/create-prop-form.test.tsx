import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreatePropForm } from '@/components/forms/create-prop-form'
import { createProp } from '@/app/actions'

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
        { id: '1', user: { name: 'Alice' }, userId: 'user-1' },
        { id: '2', user: { name: 'Bob' }, userId: 'user-2' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders correctly with default Binary mode', () => {
        render(<CreatePropForm leagueId="league-1" members={mockMembers as any} currentUserId="user-1" />)

        expect(screen.getByLabelText(/Question \/ Prop/i)).toBeInTheDocument()
        expect(screen.getByText('Yes / No')).toBeInTheDocument()
        expect(screen.getByText('Multiple Choice')).toBeInTheDocument()

        // Should NOT show Outcomes input in Binary mode
        expect(screen.queryByText(/Outcomes/i)).not.toBeInTheDocument()

        expect(screen.getByLabelText(/Target Player/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Create Prop/i })).toBeInTheDocument()
    })

    it('toggles to Multiple Choice and shows outcomes', () => {
        render(<CreatePropForm leagueId="league-1" members={mockMembers as any} currentUserId="user-1" />)

        const multipleChoiceBtn = screen.getByText('Multiple Choice')
        fireEvent.click(multipleChoiceBtn)

        expect(screen.getByText(/Outcomes/i)).toBeVisible()
        const inputs = screen.getAllByPlaceholderText(/Option/i)
        expect(inputs).toHaveLength(2) // Defaults to 2 options
    })

    it('adds and removes options in Multiple Choice mode', () => {
        render(<CreatePropForm leagueId="league-1" members={mockMembers as any} currentUserId="user-1" />)

        fireEvent.click(screen.getByText('Multiple Choice'))

        const addBtn = screen.getByText('Add Option')
        fireEvent.click(addBtn)

        let inputs = screen.getAllByPlaceholderText(/Option/i)
        expect(inputs).toHaveLength(3)

        fireEvent.change(inputs[2], { target: { value: 'Option 3' } })
        expect(inputs[2]).toHaveValue('Option 3')
    })
})
