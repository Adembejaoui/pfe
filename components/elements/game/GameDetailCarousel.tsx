import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface GameDetailCarouselProps {
  images: { id: number; image: string }[];
}

export default function GameDetailCarousel({ images }: GameDetailCarouselProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-lg border border-gray-700">
      <div className="flex space-x-4 p-2">
        {images.map((img) => (
          <div key={img.id} className="min-w-[300px]">
            <img
              src={img.image}
              alt="screenshot"
              className="h-56 w-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
