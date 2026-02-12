import Link from "next/link";

const links = [
  {
    group: "Community",
    items: [
      {
        title: "Twitter / X",
        href: "https://x.com/liquidmesh_fi",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ],
  },
  {
    group: "Resources",
    items: [
      {
        title: "Docs",
        href: "https://docs.liquidmeshfi.xyz",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      {
        title: "FAQ",
        href: "#faqs",
      },
    ],
  },
  {
    group: "Company",
    items: [
      {
        title: "Terms of Use",
        href: "https://liquidmesh-somnia-ai.vercel.app/terms",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      {
        title: "Privacy Policy",
        href: "https://liquidmesh-somnia-ai.vercel.app/privacy",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ],
  },
];

export default function FooterSection() {
  return (
    <footer className="bg-background pt-16 pb-0 sm:pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Glass divider line, no rounded overlay */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-white/10 backdrop-blur-md" />
          <div className="relative mx-auto max-w-7xl px-6 py-16">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
              {/* Left side - Logo and copyright */}
              <div className="space-y-6 lg:max-w-sm">
                <Link href="/" aria-label="go home" className="block size-fit">
                  <div className="flex items-center gap-2">
                    <img
                      src="/icon.png"
                      alt="LiquidMesh"
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-xl font-bold">LiquidMesh</span>
                  </div>
                </Link>

                <p className="text-muted-foreground text-base">
                  © {new Date().getFullYear()} LiquidMesh. All rights reserved.
                </p>
              </div>

              {/* Right side - Navigation links */}
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12 lg:pl-8">
                {links.map((link) => (
                  <div key={link.group} className="space-y-4">
                    <span className="block font-medium text-lg">
                      {link.group}
                    </span>

                    <div className="flex flex-wrap gap-4 sm:flex-col">
                      {link.items.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          target={item.target || undefined}
                          rel={item.rel || undefined}
                          className="text-muted-foreground hover:text-primary block duration-150"
                        >
                          <span>{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Powered by section */}
            <div className="mt-16 flex items-center justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  POWERED BY
                </span>
                <img
                  src="/protocols/somnia.png"
                  alt="Somnia"
                  className="h-6 w-auto"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
}
