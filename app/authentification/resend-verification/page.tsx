import MainLayout from "@/app/Mainlayout"
import { ResendVerificationEmail } from "@/components/auth/ResendVerificationEmail"

export default function ResendVerificationPage() {
  return (
    <MainLayout>
      <div className="relative min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/70 z-10" />
          <img src="https://xou955y8kd.ufs.sh/f/zvC4KODelhDMdc6RoRNbxCN1aDUB4pFYLKyWXhrnHemGgASz" alt="Background" className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Vérification de compte</h2>
            <p className="mt-2 text-sm text-gray-300">
              Nous vous enverrons un nouveau lien pour vérifier votre adresse email
            </p>
          </div>

          <ResendVerificationEmail />

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black/50 text-gray-400">Sécurisé et confidentiel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
