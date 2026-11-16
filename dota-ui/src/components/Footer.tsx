export default function Footer() {
  return (
    <footer className="border-t border-[#2c303b] bg-[#0b0c10] py-6 mt-12">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        
        <div className="text-center md:text-left">
          <p>Data provided by <a href="https://www.opendota.com/" target="_blank" rel="noreferrer" className="text-[#e3b04b] hover:underline">OpenDota</a>.</p>
          <p className="mt-1">This is an unofficial, fan-created project. Dota 2 and all related assets are the intellectual property of Valve Corporation.</p>
          <p className="mt-1">This project is not affiliated with, authorized, endorsed, or sponsored by Valve.</p>
        </div>

        <div className="flex items-center gap-2 font-mono uppercase tracking-wider shrink-0">
          <span>Built with</span>
          <span className="text-white bg-[#15171e] px-2 py-1 border border-[#2c303b] rounded-sm">React</span>
          <span className="text-white bg-[#15171e] px-2 py-1 border border-[#2c303b] rounded-sm">.NET 10</span>
          <span className="text-white bg-[#15171e] px-2 py-1 border border-[#2c303b] rounded-sm">Tailwind</span>
        </div>

      </div>
    </footer>
  )
}