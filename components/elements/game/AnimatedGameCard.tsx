import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Props {
  image: string;
  title: string;
  rating: number;
  platforms: any[];
  href: string;
}

export default function AnimatedGameCard({ image, title, rating, platforms, href }: Props) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="cursor-pointer bg-[#1a1a2e] rounded-xl overflow-hidden shadow hover:shadow-cyan-500/20 transition"
      onClick={() => router.push(href)}
    >
      <img src={image} alt={title} className="w-full h-40 object-cover" />
      <div className="p-3">
        <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-400 mb-2">⭐ {rating}</p>
        <div className="flex gap-2">
          {platforms.slice(0, 4).map((p) => (
            <img
              key={p.platform.id}
              src={`/platforms/${p.platform.slug}.svg`}
              alt={p.platform.name}
              className="w-5 h-5"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
