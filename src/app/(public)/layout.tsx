import { SiteFooter } from "@/components/website/SiteFooter";
import { SiteHeader } from "@/components/website/SiteHeader";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
