import AppDataProvider from "./AppDataProvider"
import AppSidebar from "./components/AppSidebar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppDataProvider>
      <div className="min-h-screen bg-app-bg text-text md:flex">
        <AppSidebar />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>
    </AppDataProvider>
  )
}
