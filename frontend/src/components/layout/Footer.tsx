export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-6 mt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">JP Theme Tracker v2.0.0</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="/about" className="hover:text-gray-300 transition-colors">
              About
            </a>
            <a href="/settings" className="hover:text-gray-300 transition-colors">
              Settings
            </a>
          </div>
          <p className="text-gray-600 text-xs">
            Data: Yahoo Finance | For reference only
          </p>
        </div>
      </div>
    </footer>
  );
}
