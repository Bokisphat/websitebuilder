import Image from "next/image";
import type { HomeTemplateItem } from "@/lib/homepage-templates";
import { TemplatePreviewBlock } from "./TemplatePreviewBlock";

export function HomeTemplatePreview({ item }: { item: HomeTemplateItem }) {
  if (item.thumbnail) {
    const isSvg = item.thumbnail.endsWith(".svg");
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-300/90 bg-zinc-100 shadow-inner">
        {isSvg ? (
          <img
            src={item.thumbnail}
            alt={`Preview of the ${item.name} site template`}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <Image
            src={item.thumbnail}
            alt={`Preview of the ${item.name} site template`}
            fill
            className="object-cover object-top"
            sizes="(min-width: 1024px) 28rem, (min-width: 640px) 45vw, 100vw"
            unoptimized
          />
        )}
      </div>
    );
  }

  return <TemplatePreviewBlock primary={item.previewPrimary} secondary={item.previewSecondary} />;
}
