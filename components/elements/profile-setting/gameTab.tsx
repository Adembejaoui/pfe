import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function GameTab() {
  const [summoner, setSummoner] = useState("");
  const [region, setRegion] = useState("EUW");
  const [rank, setRank] = useState("Silver");
  const [role, setRole] = useState("Jungle");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm text-cyan-200">Summoner Name</Label>
          <Input value={summoner} onChange={(e) => setSummoner(e.target.value)} className="bg-[#1f1f2e] border-none" />
        </div>
        <div>
          <Label className="text-sm text-cyan-200">Region</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="bg-[#1f1f2e] border-none text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1f1f2e] text-white">
              {["EUW", "NA", "EUNE", "LAN", "KR"].map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm text-cyan-200">Current Rank</Label>
          <Select value={rank} onValueChange={setRank}>
            <SelectTrigger className="bg-[#1f1f2e] border-none text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1f1f2e] text-white">
              {["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Challenger"].map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm text-cyan-200">Favorite Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="bg-[#1f1f2e] border-none text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1f1f2e] text-white">
              {["Top", "Jungle", "Mid", "ADC", "Support"].map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-between items-center pt-4">
        <p className="text-sm text-green-400">Connected to Riot Games</p>
        <Button variant="outline" className="border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black">Connect Account</Button>
      </div>
    </div>
  );
}
