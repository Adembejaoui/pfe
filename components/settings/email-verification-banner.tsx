"use client"

import { AlertCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmailVerificationBannerProps {
  email: string
  onResendClick: () => void
  className?: string
}

export default function EmailVerificationBanner({ email, onResendClick, className }: EmailVerificationBannerProps) {
  return (
    <div className={cn("bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 flex items-start gap-3", className)}>
      <div className="bg-amber-900/30 rounded-full p-2 mt-0.5">
        <AlertCircle className="h-5 w-5 text-amber-500" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-amber-500">Email non vérifié</h3>
        <p className="text-sm text-gray-300 mt-1">
          Votre adresse email ({email}) n'a pas encore été vérifiée. Veuillez vérifier votre boîte de réception et
          cliquer sur le lien de vérification.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button size="sm" onClick={onResendClick} className="bg-amber-700 hover:bg-amber-600 text-white">
            <Mail className="h-4 w-4 mr-2" />
            Renvoyer l'email de vérification
          </Button>
        </div>
      </div>
    </div>
  )
}
