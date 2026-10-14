// this is the layout for the (main)

import Header from "@/components/header";
import Footer from "@/components/footer";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="grow pt-24 md:pt-28">{children}</main>

      <Footer />
    </div>
  );
}
