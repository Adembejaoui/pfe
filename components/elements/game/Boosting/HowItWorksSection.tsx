"use client"
import { motion } from "framer-motion";
import Image from "next/image";

const steps = [
  {
    id: 1,
    title: "Select Your Boost",
    description:
      "Choose the type of boost you need, whether it’s for climbing ranks, accumulating wins, or nailing those placement matches. Each service is crafted to support your unique in-game aspirations.",
  },
  {
    id: 2,
    title: "Complete Your Secure Payment",
    description:
      "Safely process your payment through our secure gateway. With a variety of trusted payment options, your transaction is safe and easy.",
  },
  {
    id: 3,
    title: "Tailor Your Boost",
    description:
      "After your payment, customize your boost. Select from recent, favorite, or featured VIP and Loyalty boosters to align with your specific in-game preferences.",
  },
  {
    id: 4,
    title: "Track Your Progress",
    description:
      "Monitor your boost’s development via our dashboard. Choose to communicate with your booster, arrange sessions, and favor your top booster for future orders.",
  },
  {
    id: 5,
    title: "Experience the Results and Aftercare Support",
    description:
      "As your boost service concludes, revel in the upgraded gaming experience and achieve your goals. Our commitment extends beyond the boost with aftercare support.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="w-full bg-[#0e0e1a] py-16 px-6 text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side visual */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
        <div className="flex justify-center">
          <Image
            src="https://xou955y8kd.ufs.sh/f/zvC4KODelhDMq37g8C2mHi1W6bKMAVd0mLSI2twusBaEFjlT"
            alt="How it works"
            width={300}
            height={300}
            className="object-contain"
          />
        </div>
        </motion.div>
        {/* Steps content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
        <div>
          <h2 className="text-4xl font-bold text-white mb-8">How it works?</h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
                  {step.id}
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    <span className="text-purple-400">{step.title}</span>
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </motion.div>
      </div>
    </section>
  );
}
