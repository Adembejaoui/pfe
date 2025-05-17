"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function SmurfPromoCard() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between rounded-xl border border-[#1f2937] bg-[#0e1629] p-6 lg:p-10 text-white shadow-md">
      {/* LEFT SIDE */}
      <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
      <div className="max-w-xl space-y-4">
        
        <p className="text-sm uppercase text-purple-500  tracking-wide">LoL Handleveled Smurfs</p>
        <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">
          Buy A Smurf Account Now <br />
          And Get Free <span className=" text-purple-400">Lifetime Warranty</span>
        </h2>
        <p className="text-gray-400">
          Get yourself a top-quality LoL hand-leveled smurf account today! With our free lifetime
          warranty and 24/7 support, you can’t go wrong.
        </p>
        <Button className="mt-2  bg-purple-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-md">
          View Packages →
        </Button>
      </div></motion.div>
      <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
      {/* RIGHT SIDE - SINGLE LARGE IMAGE */}
      <div className="mt-10 lg:mt-0 lg:ml-10">
        <Image
          src="https://xou955y8kd.ufs.sh/f/zvC4KODelhDMNQkxI9YWtbe218rsMhdjKVOT3npRvcBYfqFL"
          width={300}
          height={300}
          alt="Promo Visual"
          className="rounded-lg object-contain"
        />
      </div>
      </motion.div>
    </div>
  );
}
