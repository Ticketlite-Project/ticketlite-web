import './App.css'
import { InfoCard } from './components/info-card/InfoCard'
import { Info } from 'lucide-react'

function App() {
    return (
        <section id="spacer">
            <InfoCard
                title="Welcome"
                description="This is a simple info card component."
                icon={<Info />}
            />
        </section>
    )
}

export default App
