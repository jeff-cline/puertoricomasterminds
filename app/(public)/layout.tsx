// app/(public)/layout.tsx
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { HelpModal } from "@/components/public/help-modal";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <HelpModal />
    </>
  );
}
