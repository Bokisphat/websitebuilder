import Link from "next/link";
import { PropertyEnquiryForm } from "@/components/property/PropertyEnquiryForm";
import { PropertyImageGallery } from "@/components/property/PropertyImageGallery";
import { PropertyStickyCta } from "@/components/property/PropertyStickyCta";
import { getPropertyBySlug } from "../../lib/fusion-api";

export const dynamic = "force-dynamic";

type PropertyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-900 p-5">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Property Not Found</h1>
          <Link
            href="/"
            className="inline-block mt-4 rounded-xl bg-white text-black px-6 py-3 font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const gallery = property.imageUrls?.length ? property.imageUrls : property.image ? [property.image] : [];
  const hasSpecs = Boolean(property.bedrooms || property.bathrooms || property.garage);

  return (
    <main className="min-h-screen bg-black text-white pb-28">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Fusion Sites
          </Link>

          <div className="flex gap-6 text-sm text-gray-300">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        {gallery.length > 0 ? (
          <PropertyImageGallery images={gallery} />
        ) : (
          <div className="mb-10 flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500">
            No image available
          </div>
        )}

        <p className="text-sm text-gray-400 mb-3">{property.type}</p>
        <h1 className="text-3xl font-bold mb-3 md:text-4xl">{property.title}</h1>
        <p className="text-lg text-gray-300 mb-10">{property.location}</p>

        <div className="grid gap-4 md:grid-cols-3 mb-10">
          <SpecItem label="Price" value={property.price} />
          <SpecItem label="Estimated yield" value={property.yield} />
          <SpecItem label="Property type" value={property.type} />
        </div>

        {hasSpecs ? (
          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            {property.bedrooms ? <SpecItem label="Bedrooms" value={property.bedrooms} /> : null}
            {property.bathrooms ? <SpecItem label="Bathrooms" value={property.bathrooms} /> : null}
            {property.garage ? <SpecItem label="Garage / parking" value={property.garage} /> : null}
          </div>
        ) : null}

        {property.description.trim() ? (
          <div className="rounded-2xl bg-zinc-900 p-6 md:p-8 mb-12">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-300 leading-7 whitespace-pre-wrap">{property.description}</p>
          </div>
        ) : null}

        <div id="property-enquiry" className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10">
          <h2 className="text-2xl font-semibold mb-6">Enquire about this property</h2>
          <PropertyEnquiryForm projectId={property.projectId} />
        </div>

        <div className="mt-10">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition">
            ← Back to home
          </Link>
        </div>
      </section>

      <PropertyStickyCta />
    </main>
  );
}
