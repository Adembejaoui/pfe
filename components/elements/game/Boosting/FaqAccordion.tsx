"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type FaqItem = {
  question: string;
  answer: string;
};

const faqData: FaqItem[] = [
  {
    question: "What is League Of Legends Boosting?",
    answer:
      "League Of Legends Boosting is a professional service where a LoL Booster plays on your account or DUO queue with you to improve your rank, division, MMR or Elo.",
  },
  {
    question: "What is Coaching in League Of Legends?",
    answer:
      "LoL coaching involves a professional player helping you improve through analysis and guided practice.",
  },
  {
    question: "What accounts do you offer?",
    answer:
      "We offer unranked smurf accounts, ranked accounts, and accounts with rare skins or champions.",
  },
  {
    question: "Can I see the champions and skins before buying LoL accounts?",
    answer:
      "Yes, we provide screenshots or lists of champions and skins available on each account.",
  },
  {
    question: "What is the warranty on smurf accounts?",
    answer:
      "We offer a lifetime warranty against bans or recovery for smurf accounts under certain terms.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#0e1629] py-10 px-4">
      <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
      <div className="w-full mx-auto bg-[#1a1f33] p-6 md:p-10 rounded-xl shadow-md">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-white text-center">
          Frequently Asked Questions
        </h1>
        {faqData.map((item, index) => (
          <div
            key={index}
            className="border-b border-gray-700 py-4 cursor-pointer text-white"
          >
            <div
              onClick={() => toggle(index)}
              className="flex items-center justify-between"
            >
              <h3 className="text-base font-medium">{item.question}</h3>
              <ChevronDown
                className={cn(
                  "transition-transform duration-200",
                  openIndex === index && "rotate-180"
                )}
                size={20}
              />
            </div>
            {openIndex === index && (
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
      </motion.div>
    </section>
  );
}
