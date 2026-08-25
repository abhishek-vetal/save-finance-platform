import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Hero from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import {
  statsData,
  featuresData,
  howItWorksData,
  testimonialsData,
} from "@/data/landing";
import checkUser from "@/lib/checkUser";
export const dynamic = "force-dynamic";

export default async function Home() {
  await checkUser();

  return (
    <>
      <Hero />

      {/* Stats */}
      <section className="container mx-auto mt-20 py-20 bg-muted/40 dark:bg-muted/20">
        <div className="grid grid-cols-2 gap-10 px-4 md:grid-cols-4 md:px-6">
          {statsData.map((stat, index) => (
            <div key={index} className="text-center">

              <h2 className="text-3xl font-bold gradient mx-auto">
                {stat.value}
              </h2>

              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto mt-24">
        <div className="px-4 md:px-6">
          <h2 className="text-center text-3xl font-bold text-foreground">
            Everything you need to manage your finances
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature, index) => (
              <Card
                key={index}
                className="bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="text-primary">{feature.icon}</div>

                  <h2 className="text-xl font-bold">{feature.title}</h2>

                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto mt-24 py-20 rounded-4xl bg-muted/40 dark:bg-muted/20">
        <div className="px-4 md:px-6">
          <h2 className="text-center text-3xl font-bold">How it Works</h2>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {howItWorksData.map((data, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-5 p-6 text-center transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="text-primary">{data.icon}</div>

                <h2 className="text-xl font-bold">{data.title}</h2>

                <p className="text-muted-foreground">{data.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto mt-24">
        <div className="px-4 md:px-6">
          <h2 className="text-center text-3xl font-bold">What Our Users Say</h2>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonialsData.map((data, index) => (
              <Card
                key={index}
                className="bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <CardContent className="px-6 py-8">
                  <div className="flex items-center gap-5">
                    <Image
                      src={data.image}
                      alt="user profile image"
                      width={42}
                      height={42}
                      className="rounded-full"
                    />

                    <div>
                      <h2 className="text-lg font-bold">{data.name}</h2>

                      <p className="text-xs text-muted-foreground">
                        {data.role}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-muted-foreground leading-relaxed">
                    {data.quote}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto mt-24">
        <div className="py-14 px-6 md:px-12 md:py-20 bg-linear-to-r from-neutral-900 via-neutral-700 to-neutral-900 dark:from-neutral-950 dark:via-neutral-800 dark:to-neutral-950 shadow-xl shadow-neutral-500/10 dark:shadow-none">
          <div className="flex flex-col items-center text-center text-white">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
              Ready To Take Control Of Your Finances?
            </h2>

            <p className="mt-4 max-w-2xl text-sm md:text-base text-white/90 leading-relaxed">
              Join thousands of users who are already managing their finances
              smarter with Save
            </p>

            <Link href="/dashboard">
              <Button className="mt-7 px-8 py-6 rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
