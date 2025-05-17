/**
 * v0 by Vercel.
 * @see https://v0.dev/t/sFZWbcwVOPS
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { MountainIcon, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function Component() {
  return (
    <section className=" py-8 md:py-12 bg-[#030303]  text-white/80">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 sm:grid-cols-2 md:grid-cols-4 md:px-6 lg:max-w-7xl">
        <div className="flex flex-col items-start gap-4">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <ShieldCheck className="h-6 w-6" />
            <span className="text-lg font-semibold">Legends Boost</span>
          </Link>
          <p className="text-white/90">
          Thank you for choosing Us . 
           </p>
        </div>
        <div className="grid gap-2">
          <h4 className="text-sm font-semibold">Quick Links</h4>
          <Link href="#" className="text-sm hover:underline" prefetch={false}>
            Home
          </Link>
          <Link href="#" className="text-sm hover:underline" prefetch={false}>
            About
          </Link>
          <Link href="#" className="text-sm hover:underline" prefetch={false}>
            Products
          </Link>
          <Link href="#" className="text-sm hover:underline" prefetch={false}>
            Contact
          </Link>
        </div>
        <div className="grid gap-2">
          <h4 className="text-sm font-semibold">Resources</h4>
          <Link href="#" className="text-sm hover:underline" prefetch={false}>
            Documentation
          </Link>
          <Link href="#" className="text-sm hover:underline" prefetch={false}>
            Blog
          </Link>
          <Link href="#" className="text-sm hover:underline" prefetch={false}>
            Support
          </Link>
          <Link href="#" className="text-sm hover:underline" prefetch={false}>
            FAQs
          </Link>
        </div>
        <div className="grid gap-2">
          <h4 className="text-sm font-semibold">Legal</h4>
          <Link href="#" className="text-sm hover:underline" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-sm hover:underline" prefetch={false}>
            Privacy Policy
          </Link>
          <Link href="#" className="text-sm hover:underline" prefetch={false}>
            Cookie Policy
          </Link>
        </div>
      </div>
      <div className="mt-4 border-t pt-4 text-center text-xs md:mt-8 md:pt-4">
      <p className="text-white/90">&copy; {new Date().getFullYear()} Bejaoui adem & Lamine aziz. All rights reserved.</p>

      </div>
    </section>
  )
}