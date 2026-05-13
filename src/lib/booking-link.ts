/**
 * Sections use ctaHref === BOOKING_SENTINEL so one site-wide scheduling URL (Cal.com, Calendly,
 * Google Appointment Schedules, Microsoft Bookings, etc.) resolves at render time. Organisers sync
 * their calendar inside that product — we only store the outbound link.
 */
export const BOOKING_SENTINEL = "#booking";

export function resolveBookingCtaHref(href: string, bookingUrl: string | undefined): string {
  const u = bookingUrl?.trim();
  if (href !== BOOKING_SENTINEL) return href;
  if (u) return u;
  /** Fallback: session-interest section is the usual “book a strategy session” anchor when no external URL set. */
  return "#session-interest";
}

export function anchorPropsForExternalBooking(href: string): {
  target?: "_blank";
  rel?: string;
  title?: string;
} {
  if (/^https?:\/\//i.test(href)) {
    return { target: "_blank", rel: "noopener noreferrer" };
  }
  if (href === "#") {
    return {
      title: "Add your booking URL in site settings (Booking / calendar link) to publish this button.",
    };
  }
  return {};
}
