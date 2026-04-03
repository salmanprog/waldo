import InnerBanner from "@/components/common/InnerBanner";
import Image from "next/image";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
    const page = await prisma.pages.findFirst({
        where: { slug: "about-us", deletedAt: null, status: true },
        select: { title: true, seoTitle: true, seoDescription: true },
    });
    const title = page?.seoTitle || page?.title || "About Us";
    return {
        title: `My Waldo | ${title}`,
        description: page?.seoDescription || "Learn more about My Waldo",
    };
}

export default async function AboutPage() {
    const page = await prisma.pages.findFirst({
        where: { slug: "about-us", deletedAt: null, status: true },
    });

    const bannerTitle = page?.title || "About Us";
    const aboutImageSrc = page?.imageUrl?.trim() || "/images/home/hero/01.jpg";

    return (
        <>
            <InnerBanner bannerClass="products-banner" title={bannerTitle} />
            <section className="about-sec sec-gap">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 justify-between items-center gap-10">
                        <div className="flex flex-col gap-5 order-2 md:order-1">
                            {page?.description ? (
                                <div
                                    className="blog-detail-description prose prose-lg max-w-none dark:prose-invert font-roboto"
                                    dangerouslySetInnerHTML={{ __html: page.description }}
                                />
                            ) : null}
                        </div>
                        <div className="text-end w-full order-1 md:order-2">
                            <Image src={aboutImageSrc} alt={bannerTitle} className="w-full" width={500} height={500} />
                        </div>
                    </div>
                </div>
            </section>
        </>

    )
}
