"use client";



import type { TextImageProps } from "@/components/sections/TextImage";

import type { SiteConfig } from "@/lib/site-model";

import { patchPageSectionProps } from "@/lib/patch-page-section";



type BuilderTextImageEditorProps = {

  site: SiteConfig;

  pageId: string;

  sectionId: string;

  onChange: (next: SiteConfig) => void;

  props: Record<string, unknown>;

  /** Opens the shared image library modal (same as clicking the preview). */

  onRequestPexels: () => void;

};



function readTextImageProps(props: Record<string, unknown>): TextImageProps {

  return {

    title: typeof props.title === "string" ? props.title : "",

    body: typeof props.body === "string" ? props.body : "",

    imageSide: props.imageSide === "left" || props.imageSide === "right" ? props.imageSide : "right",

    imageLabel: typeof props.imageLabel === "string" ? props.imageLabel : "Image",

    imageUrl: typeof props.imageUrl === "string" ? props.imageUrl : undefined,

    imageAlt: typeof props.imageAlt === "string" ? props.imageAlt : undefined,

    imageCredit: typeof props.imageCredit === "string" ? props.imageCredit : undefined,

  };

}



export function BuilderTextImageEditor({ site, pageId, sectionId, onChange, props: rawProps, onRequestPexels }: BuilderTextImageEditorProps) {

  const p = readTextImageProps(rawProps);



  const patch = (partial: Partial<TextImageProps>) => {

    onChange(patchPageSectionProps(site, pageId, sectionId, partial as Record<string, unknown>));

  };



  return (

    <div className="mt-2 space-y-3 rounded-lg border border-[var(--fusion-builder-accent)]/25 bg-zinc-50/95 p-3">

      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fusion-builder-accent)]">Text + image block</p>



      <label className="block">

        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Title</span>

        <input

          value={p.title}

          onChange={(e) => patch({ title: e.target.value })}

          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"

        />

      </label>

      <label className="block">

        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Body</span>

        <textarea

          value={p.body}

          onChange={(e) => patch({ body: e.target.value })}

          rows={3}

          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"

        />

      </label>

      <div className="grid grid-cols-2 gap-2">

        <label className="block">

          <span className="mb-1 block text-[10px] uppercase text-zinc-500">Image side</span>

          <select

            value={p.imageSide ?? "right"}

            onChange={(e) => patch({ imageSide: e.target.value as "left" | "right" })}

            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none"

          >

            <option value="right">Text left, image right</option>

            <option value="left">Image left, text right</option>

          </select>

        </label>

        <label className="block">

          <span className="mb-1 block text-[10px] uppercase text-zinc-500">Placeholder label</span>

          <input

            value={p.imageLabel ?? "Image"}

            onChange={(e) => patch({ imageLabel: e.target.value })}

            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none"

          />

        </label>

      </div>



      <div className="space-y-2 border-t border-zinc-200 pt-2">

        <p className="text-[10px] uppercase text-zinc-500">Image</p>

        {p.imageUrl ? (

          <div className="flex gap-2">

            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-zinc-300">

              <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />

            </div>

            <div className="min-w-0 flex-1 text-[11px] text-zinc-600">

              {p.imageCredit ? <p className="line-clamp-2">{p.imageCredit}</p> : null}

              <button

                type="button"

                onClick={() => patch({ imageUrl: undefined, imageAlt: undefined, imageCredit: undefined })}

                className="mt-1 font-medium text-[var(--fusion-builder-accent)] hover:text-[var(--fusion-builder-accent-hover)]"

              >

                Remove image

              </button>

            </div>

          </div>

        ) : (

          <p className="text-[11px] text-zinc-500">No image — placeholder shows the label above.</p>

        )}

        <div className="flex flex-wrap gap-2">

          <button

            type="button"

            onClick={onRequestPexels}

            className="rounded-lg bg-[var(--fusion-builder-accent)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--fusion-builder-accent-hover)]"

          >

            Choose image

          </button>

          {p.imageUrl ? (

            <button

              type="button"

              onClick={onRequestPexels}

              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-800 hover:bg-zinc-100"

            >

              Change image

            </button>

          ) : null}

        </div>

        <p className="text-[10px] text-zinc-600">Or click the image area in the live preview on the right.</p>

      </div>

    </div>

  );

}

