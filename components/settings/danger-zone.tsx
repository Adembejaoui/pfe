"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DangerZone() {
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  const handleDeleteAccount = () => {
    if (confirmText !== "supprimer mon compte") {
      toast.error("Veuillez saisir le texte de confirmation correctement.")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Compte supprimé avec succès. Vous allez être déconnecté.")
      setIsLoading(false)
      setIsDialogOpen(false)

      // Redirect to home page after a delay
      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-3">
        <div className="mt-0.5">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-red-500">Supprimer le compte</h4>
          <p className="text-sm text-gray-400 mt-1">
            Une fois que vous supprimez votre compte, il n'y a pas de retour en arrière. Veuillez être certain.
          </p>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50"
          >
            Supprimer le compte
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500">Êtes-vous absolument sûr?</DialogTitle>
            <DialogDescription className="text-gray-400">
              Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte et toutes les données
              associées.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-300 mb-4">
              Veuillez saisir <span className="font-semibold">supprimer mon compte</span> pour confirmer:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="supprimer mon compte"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="bg-transparent hover:bg-gray-800 text-gray-300"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading || confirmText !== "supprimer mon compte"}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
