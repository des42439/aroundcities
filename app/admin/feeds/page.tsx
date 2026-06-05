import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const sections = [
  {
    href: "/admin/feeds/new",
    title: "New Feed",
    description: "Capture photos, title, and description.",
  },
  {
    href: "/admin/feeds/drafts",
    title: "Drafted Feeds",
    description: "Refine drafts before publishing.",
  },
  {
    href: "/admin/feeds/published",
    title: "Published Feeds",
    description: "Update or archive live posts.",
  },
];

export default async function AdminFeedsPage() {
  await requireAdmin();

  return (
    <AdminShell title="Feeds">
      <div className="space-y-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="block rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
          >
            <h2 className="text-xl font-semibold">
              {section.title}
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
