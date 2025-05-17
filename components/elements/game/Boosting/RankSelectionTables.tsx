import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

export default function RankSelectionTables() {
  return (
    <section className="w-full py-12 px-4 bg-[#0e0e1a] text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 z-">
        {/* Current Rank */}
        <div className="relative p-6 rounded-3xl shadow-lg overflow-hidden">
          <Image
            src="https://xou955y8kd.ufs.sh/f/zvC4KODelhDMTqKS6vVwvUtXoRDMysmfqnpaI27AGgj5cbHu"
            alt="Background Frame"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover opacity-50 z-10 rounded-3xl"
          />
          <h3 className="text-xl font-bold mb-4 text-center">Rang Actuel</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="w-full">
              <label className="text-sm font-semibold mb-1 block">Division</label>
              <Select>
                <SelectTrigger className="w-full bg-slate-900/80 border border-slate-600">
                  <SelectValue placeholder="Silver I" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">I</SelectItem>
                  <SelectItem value="II">II</SelectItem>
                  <SelectItem value="III">III</SelectItem>
                  <SelectItem value="IV">IV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <label className="text-sm font-semibold mb-1 block">Mode</label>
              <Select>
                <SelectTrigger className="w-full bg-slate-900/80 border border-slate-600">
                  <SelectValue placeholder="Solo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solo">Solo</SelectItem>
                  <SelectItem value="Duo">Duo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <label className="text-sm font-semibold mb-1 block">Région</label>
              <Select>
                <SelectTrigger className="w-full bg-slate-900/80 border border-slate-600">
                  <SelectValue placeholder="EUW" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUW">EUW</SelectItem>
                  <SelectItem value="NA">NA</SelectItem>
                  <SelectItem value="EUNE">EUNE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <label className="text-sm font-semibold mb-1 block">LP Actuel</label>
              <Select>
                <SelectTrigger className="w-full bg-slate-900/80 border border-slate-600">
                  <SelectValue placeholder="0-20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-20">0-20</SelectItem>
                  <SelectItem value="20-40">20-40</SelectItem>
                  <SelectItem value="40-60">40-60</SelectItem>
                  <SelectItem value="60-80">60-80</SelectItem>
                  <SelectItem value="80-100">80-100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Desired Rank */}
        <div className="relative p-6 rounded-3xl shadow-lg overflow-hidden">
          <Image
            src="https://xou955y8kd.ufs.sh/f/zvC4KODelhDMTqKS6vVwvUtXoRDMysmfqnpaI27AGgj5cbHu"
            alt="Background Frame"
            fill
            className="object-cover opacity-20 -z-10 rounded-3xl"
          />
          <h3 className="text-xl font-bold mb-4 text-center">Rang Désiré</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="w-full">
              <label className="text-sm font-semibold mb-1 block">Division</label>
              <Select>
                <SelectTrigger className="w-full bg-yellow-900/80 border border-yellow-500">
                  <SelectValue placeholder="Gold IV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">I</SelectItem>
                  <SelectItem value="II">II</SelectItem>
                  <SelectItem value="III">III</SelectItem>
                  <SelectItem value="IV">IV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-white font-semibold">Master/Challenger Boosters</p>
              <p className="text-lg text-white font-bold">PRÊT EN 5 MINUTES</p>
              <p className="text-xs text-white mt-1">Temps Moyen de Réalisation</p>
              <p className="text-md text-white font-semibold">6 HEURES</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}