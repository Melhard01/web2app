import Image from "next/image";
import Link from "next/link";

const PRODUCT_LINKS = [
  ["For Founders", "https://epiminded.vercel.app/founders"],
  ["For Community Builders", "https://epiminded.vercel.app/community-builders"],
  ["For Organisations", "https://epiminded.vercel.app/enterprise"],
] as const;

const LEGAL_LINKS = [
  ["Terms", "https://epiminded.vercel.app/legal/terms"],
  ["Privacy", "https://epiminded.vercel.app/legal/privacy"],
  ["Cookies", "https://epiminded.vercel.app/legal/cookies"],
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-[#222222] bg-[#040404]">
      <div className="mx-auto w-full max-w-[1180px] px-6 pb-6 pt-14 sm:pt-16">
        <div className="grid items-start gap-10 md:grid-cols-[1.45fr_0.8fr_0.8fr] md:gap-14">
          <div>
            <Image
              src="/footer-logo.png"
              alt="EpiMinded"
              width={260}
              height={90}
              className="-mt-32 mb-4 h-auto w-[340px]"
            />
            <p className="-mt-36 ml-16 max-w-[320px] text-[15px] leading-relaxed text-[#b7b7b7]">
              Epineon&apos;s initiative to steward organization for their resilience
            </p>
            <div className="mt-2 ml-14 flex items-center gap-0">
              <Link
                href="https://www.instagram.com/epiminded.ai/"
                aria-label="EpiMinded on Instagram"
                className="block h-11 w-11 overflow-hidden rounded-xl"
              >
                <Image
                  src="/footer-instagram.png"
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 object-cover"
                />
              </Link>
              <Link
                href="https://www.linkedin.com/company/epineonn/posts/?feedView=all"
                aria-label="EpiMinded on LinkedIn"
                className="block h-11 w-11 overflow-hidden rounded-xl"
              >
                <Image
                  src="/footer-linkedin.png"
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 object-cover"
                />
              </Link>
            </div>
          </div>

          <div>
            <h2 className="mb-8 font-serif text-[18px] text-[#e2e2e2]">Product</h2>
            <nav className="flex flex-col gap-4 text-[15px] text-[#b7b7b7]">
              {PRODUCT_LINKS.map(([label, href]) => (
                <Link key={label} href={href} className="transition hover:text-gold">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="mb-8 font-serif text-[18px] text-[#e2e2e2]">Legal</h2>
            <nav className="flex flex-col gap-4 text-[15px] text-[#b7b7b7]">
              {LEGAL_LINKS.map(([label, href]) => (
                <Link key={label} href={href} className="transition hover:text-gold">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-14 border-t border-[#222222] pt-7 text-center text-[14px] text-[#9b9b9b]">
          © 2026 Epineon · EpiMinded. Casablanca · Built for decision-makers worldwide.
        </div>
      </div>
    </footer>
  );
}
