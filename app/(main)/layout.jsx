import Header from "@/components/header";
import { getYear } from "date-fns";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="grow pt-24 md:pt-28">{children}</main>

      <footer>
        <div className="mt-16 bg-muted/40 py-10 text-center text-sm text-muted-foreground backdrop-blur-sm">
          <p>&copy; {getYear(new Date())} Save. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
