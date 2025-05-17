"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const tabs = [
  {
    label: "Climb to the Top",
    content: `Is it your goal with League of Legends (LoL) to climb to the top as an elite player? If you're striving to propel your LoL gaming experience to new heights, let Eloboost24 help you achieve your goals. We are specialists in Elo Boosting who offer exceptional service.

Whether it's taking on the toughest ranks or simply enhancing your playing skills, our EB24 team will provide top-notch LoL Elo Boost services. Go ahead, embrace the power of Eloboost, and witness ideal improvements in your gaming journey.`,
  },
  {
    label: "Trusted Partner in LoL Boosting",
    content: "Our reputation speaks volumes. Trusted by thousands of players worldwide, we provide secure and efficient boosting you can rely on.",
  },
  {
    label: "Customized to Meet Your Unique Needs",
    content: "Whether you need a specific booster, champion preferences, or unique schedules — we tailor your experience every step of the way.",
  },
  {
    label: "A Legacy Boosting Excellence",
    content: "Years of experience make our boosters not only skilled but also professional in every detail of your order.",
  },
  {
    label: "Premier LoL Boosting Services",
    content: "From customer service to booster communication, our platform ensures a smooth, premium experience for every player.",
  },
];

export default function WhyUsSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="w-full bg-[#0e0e1a] text-white py-16 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Visual */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="https://xou955y8kd.ufs.sh/f/zvC4KODelhDMNPVzVYWtbe218rsMhdjKVOT3npRvcBYfqFLw"
            alt="Boosting Hero"
            width={300}
            height={300}
            className="object-contain"
          />
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-sm uppercase text-gray-400 mb-1">Why Legends Boost is</h3>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            the <span className="text-purple-500">Best Place</span> to Buy Boosting
          </h2>

          <div className="mb-4 space-y-2">
            <p className="text-sm text-yellow-400 font-semibold">
              ► {tabs[activeTab].label}
            </p>
            <p className="text-gray-300 text-sm whitespace-pre-line">
              {tabs[activeTab].content}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-1 rounded-full text-sm border ${
                  activeTab === index
                    ? "bg-purple-600 text-white border-transparent"
                    : "bg-[#1a1f33] text-gray-300 border-gray-600 hover:bg-purple-800 hover:text-white"
                } transition`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
