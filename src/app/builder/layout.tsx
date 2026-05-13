import type { ReactNode } from "react";

/** Wraps /builder and /builder/* so creator-only theme tokens apply here and nowhere else. */
export default function BuilderLayout({ children }: { children: ReactNode }) {
  return <div className="fusion-builder-scope min-h-screen">{children}</div>;
}
