"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SignUpForm } from "./SignUpForm";
import { LoginForm } from "./LoginForm";

export function Auth() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "Signin"
  useEffect(() => {
    if (session?.user !="ADMIN") {
      router.replace(`/dashboard/${session?.user.role}/orders/active`);
    }else{
      router.replace(`/admin`);
    }
  }, [session, router]);

  if (session?.user) return null; 

  return (
    <Tabs defaultValue={tab} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="Signin">Sign-in</TabsTrigger>
        <TabsTrigger value="Signup">Sign-up</TabsTrigger>
      </TabsList>
      <TabsContent value="Signin">
        <LoginForm />
      </TabsContent>
      <TabsContent value="Signup">
        <SignUpForm />
      </TabsContent>
    </Tabs>
  );
}
