/**
 * Normalize user-pasted watch/share URLs into embeddable targets.
 */

export type ParsedHostedVideo =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string; sourceUrl: string }
  | { kind: "file"; url: string }
  | { kind: "invalid"; message: string };

const YOUTUBE_ID = /^[\w-]{11}$/;

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeEmbedSrc(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
}

export function vimeoEmbedSrc(videoId: string): string {
  return `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?autoplay=1`;
}

function extractYoutubeId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed, "https://www.youtube.com");
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0]?.slice(0, 64) ?? "";
      return YOUTUBE_ID.test(id) ? id : null;
    }

    if (!host.includes("youtube.com")) return null;

    if (u.pathname.startsWith("/watch")) {
      const v = u.searchParams.get("v");
      if (v && YOUTUBE_ID.test(v)) return v;
    }
    if (u.pathname.startsWith("/embed/")) {
      const id = u.pathname.replace("/embed/", "").split(/[/?]/)[0] ?? "";
      if (YOUTUBE_ID.test(id)) return id;
    }
    if (u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.replace("/shorts/", "").split(/[/?]/)[0] ?? "";
      if (YOUTUBE_ID.test(id)) return id;
    }
    if (u.pathname.startsWith("/live/")) {
      const id = u.pathname.replace("/live/", "").split(/[/?]/)[0] ?? "";
      if (YOUTUBE_ID.test(id)) return id;
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

function extractVimeoId(trimmed: string): { id: string; sourceUrl: string } | null {
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "player.vimeo.com" && u.pathname.includes("/video/")) {
      const id = u.pathname.split("/video/")[1]?.split(/[/?]/)[0] ?? "";
      if (/^\d{6,}$/.test(id)) return { id, sourceUrl: `https://vimeo.com/${id}` };
      return null;
    }

    if (!host.endsWith("vimeo.com")) return null;

    const ids = u.pathname.match(/\d{6,}/g);
    const id = ids?.[ids.length - 1];
    if (!id) return null;

    /** oEmbed expects canonical `https://vimeo.com/{id}` (works for share URLs with extra path segments). */
    return { id, sourceUrl: `https://vimeo.com/${id}` };
  } catch {
    return null;
  }
}

function looksLikeDirectVideoUrl(trimmed: string): boolean {
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return /\.(mp4|webm|ogg)(\?|#|$)/i.test(u.pathname + u.search) || /\.(mp4|webm|ogg)(\?|#|$)/i.test(trimmed);
  } catch {
    return false;
  }
}

/** Parse pasted video URL — YouTube watch/embed/shorts, Vimeo, or HTTPS direct media file. */
export function parseVideoUrl(raw: string): ParsedHostedVideo {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "invalid", message: "Paste a video link." };

  const yt = extractYoutubeId(trimmed);
  if (yt) return { kind: "youtube", id: yt };

  const vm = extractVimeoId(trimmed);
  if (vm) return { kind: "vimeo", id: vm.id, sourceUrl: vm.sourceUrl };

  try {
    const u = new URL(trimmed);
    if (looksLikeDirectVideoUrl(trimmed)) return { kind: "file", url: u.href };
  } catch {
    return { kind: "invalid", message: "That does not look like a valid HTTPS link." };
  }

  return { kind: "invalid", message: "Use a YouTube, Vimeo, or direct .mp4 / .webm URL." };
}
