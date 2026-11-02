import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Not found" };

// Dynamic so framework scripts carry the per-request CSP nonce (a static
// prerender cannot include a fresh nonce, which would block hydration
// scripts). Note: unmatched URLs are handled by this ROOT boundary only;
// nested not-found files do not apply to them.
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="container-content py-24 text-center" lang="en">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-secondary">This page does not exist.</p>
      <p className="mt-1 text-secondary" lang="ar" dir="rtl">هذه الصفحة غير موجودة.</p>
      <p className="mt-4 flex items-center justify-center gap-4">
        <Link href="/en" className="inline-block min-h-[44px] py-2 text-mint hover:underline">← VeTwo home</Link>
        <Link href="/ar" lang="ar" className="inline-block min-h-[44px] py-2 text-mint hover:underline">VeTwo الرئيسية ←</Link>
      </p>
    </div>
  );
}
