//Suspense allows React to show a fallback UI while some child content is waiting.
import { Suspense } from "react";
import { BarLoader } from "react-spinners";

export default async function DashboardLayout({ children }) {
  return (
    <div className="container mx-auto px-4 md:px-6">
      {/* Dashboard heading */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl gradient">
          Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Track your finances, accounts and spending insights
        </p>
      </div>

      {/* Suspense lets React display a fallback while a child is suspended. */}
      <Suspense
        fallback={
          <div className="mt-6 overflow-hidden rounded-full">
            <BarLoader color="#8b5cf6" width={"100%"} />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
