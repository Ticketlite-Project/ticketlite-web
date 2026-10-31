import './App.css'
import { CustomAlert } from './components/Alert/custom-alert'
import {
    AlertTriangle,
    ArrowRight,
    Check,
    CheckCircle2,
    Plus,
    Trash2,
} from 'lucide-react'
import { CustomButton } from './components/Button/custom-button'

function App() {
    return (
        <section className="flex min-h-screen flex-col items-center justify-center gap-4">
            <CustomAlert
                type="primary"
                icon={<CheckCircle2 />}
                title="Success"
                largeIcon
                description="Your changes have been saved."
            />

            <CustomAlert
                type="primary"
                icon={<CheckCircle2 />}
                title="Payment confirmed"
                description="Your order #1234 has been processed."
                boldTitle
                largeIcon
                bordered={false}
            />

            <CustomAlert type="secondary" title="Heads up" />

            <CustomAlert
                type="danger"
                icon={<AlertTriangle />}
                className="border border-black"
                description="Something went wrong. Please try again."
            />

            <CustomAlert
                type="danger"
                icon={<AlertTriangle />}
                title="Email or Password is wrong"
                description="Check both and try again. After 5 tries, logging in pauses for 10 minutes."
                bordered={true}
                largeIcon
                boldTitle
            />

            <CustomButton variant="primary" fullWidth>
                Save
            </CustomButton>

            <CustomButton variant="primary" bordered rounded>
                Save
            </CustomButton>

            <CustomButton variant="secondary" icon={<Plus />} rounded bordered>
                Add item
            </CustomButton>

            <CustomButton variant="danger" icon={<Trash2 />}>
                Delete
            </CustomButton>

            <CustomButton variant="valid" bordered rounded icon={<Check />}>
                Approve
            </CustomButton>

            <CustomButton
                variant="already"
                rounded
                to="https://example.com"
                target="_blank"
                iconRight={<ArrowRight />}
            >
                Continue
            </CustomButton>

            <CustomButton variant="primary" loading>
                Saving…
            </CustomButton>

            <CustomButton
                variant="primary"
                fullWidth
                size="lg"
                rounded
                bordered
            >
                Checkout
            </CustomButton>

            <CustomButton variant="secondary" to="/dashboard" bordered>
                Go to dashboard
            </CustomButton>

            <form>
                <CustomButton variant="primary" type="submit">
                    Submit
                </CustomButton>
            </form>
        </section>
    )
}

export default App
