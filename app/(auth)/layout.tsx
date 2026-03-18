export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">AgentMatch</h1>
        <p className="text-sm text-gray-500 mt-1">The Search Engine for AI Agents</p>
      </div>
      {children}
    </div>
  )
}
