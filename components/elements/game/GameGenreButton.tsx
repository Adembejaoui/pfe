import SpecialButton from "@/components/ui/SpecialButton";


interface GameGenreButtonProps {
  image: string;
  name: string;
  active: boolean;
  onClick: () => void;
}

export default function GameGenreButton({ image, name, active, onClick }: GameGenreButtonProps) {
  return (
    <SpecialButton
      onClick={onClick}
      text={name}
      className={`w-full h-20 bg-cover bg-center rounded-lg relative overflow-hidden ${
        active ? "ring-2 ring-cyan-400" : ""
      }`}
      style={{ backgroundImage: `url(${image})` }}
    />
  );
}
