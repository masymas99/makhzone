import Navbar from '@/Shared/Navbar'

export default function Layout({ children }) {
    return (
        <div>
            <Navbar />
            <main>
                {children}
            </main>
        </div>
    )
}
