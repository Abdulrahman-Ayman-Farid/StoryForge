import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 flex items-center justify-center px-6">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 flex items-center justify-center mx-auto">
              <Image
                src="/images/syntera-logo.svg"
                alt="Syntera"
                width={64}
                height={64}
                className="transition-transform duration-300 hover:scale-110"
              />
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <p className="text-xl text-slate-700 font-medium">
                AI agent is designing your website...
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 border-4 border-solid border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
