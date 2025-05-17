"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (session?.user) {
      router.replace("/dashboard/home"); // ✅ Use `replace` to avoid history entry
    }
  }, [session, router]);

  if (session?.user) return null; 

  return (
    <Tabs defaultValue="Signin" className="w-[400px]">
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
