import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SecurityTab() {
  return (
    <div className="space-y-6">
      <Card className="bg-[#1f1f2e] text-white">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-lg font-semibold text-red-400">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-400">Add an extra layer of security to your account by enabling two-factor authentication.</p>
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black w-fit">Enable</Button>
        </CardContent>
      </Card>

      <Card className="bg-[#1f1f2e] text-white">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-lg font-semibold text-red-400">Delete Account</h3>
          <p className="text-sm text-gray-400">This is irreversible. We will permanently remove your account, you will lose all the store credit and loyalty coins you have.</p>
          <Button className="bg-red-600 hover:bg-red-500 text-white w-fit">Delete Account</Button>
        </CardContent>
      </Card>

      <Card className="bg-[#1f1f2e] text-white">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-lg font-semibold text-cyan-400">Login Sessions</h3>
          <div className="flex gap-4">
            <Button variant="outline" className="text-xs">Show IPs</Button>
            <Button variant="outline" className="text-xs">Logout All Devices</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
