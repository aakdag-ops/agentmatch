import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-bold text-gray-900 mb-2">AgentMatch</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Find the right AI agent for your business in minutes, not weeks.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Discover
            </p>
            <ul className="space-y-2">
              <li><Link href="/search" className="text-sm text-gray-600 hover:text-gray-900">Browse agents</Link></li>
              <li><Link href="/search?pricing=free" className="text-sm text-gray-600 hover:text-gray-900">Free agents</Link></li>
              <li><Link href="/submit" className="text-sm text-gray-600 hover:text-gray-900">Submit an agent</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Company
            </p>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">About</Link></li>
              <li><Link href="/editorial-policy" className="text-sm text-gray-600 hover:text-gray-900">Editorial policy</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Legal
            </p>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">Privacy policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">Terms of service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} AgentMatch. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Scores are independent. We are never paid to rank agents higher.
          </p>
        </div>
      </div>
    </footer>
  )
}
