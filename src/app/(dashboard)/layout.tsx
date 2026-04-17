import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full relative">
      <Sidebar user={session.user} />
      <main className="flex-1 relative min-h-screen flex flex-col w-full overflow-x-hidden">
        <Header />
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
