import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function GeneralTab() {
  const [username, setUsername] = useState("adem");
  const [email, setEmail] = useState("adembejaoui59@gmail.com");
  const [enable2FA, setEnable2FA] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm text-cyan-200">Username</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} className="bg-[#1f1f2e] border-none" />
        </div>
        <div>
          <Label className="text-sm text-cyan-200">Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#1f1f2e] border-none" />
        </div>
        <div>
          <Label className="text-sm text-cyan-200">New Password</Label>
          <Input type="password" placeholder="••••••••" className="bg-[#1f1f2e] border-none" />
        </div>
        <div>
          <Label className="text-sm text-cyan-200">Profile Picture</Label>
          <Input type="file" className="bg-[#1f1f2e] border-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center justify-between bg-[#1f1f2e] px-4 py-2 rounded-lg">
          <span className="text-sm">Enable 2FA</span>
          <Switch checked={enable2FA} onCheckedChange={() => setEnable2FA(!enable2FA)} />
        </div>
        <div className="flex items-center justify-between bg-[#1f1f2e] px-4 py-2 rounded-lg">
          <span className="text-sm">Email Notifications</span>
          <Switch checked={notifications} onCheckedChange={() => setNotifications(!notifications)} />
        </div>
        <div className="flex justify-end">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black w-full">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
