"use client";
import { useEffect, useState } from "react";
import Sec from "@/components/home/Sec";
import Image from "next/image";
import useApi from "@/utils/useApi";
import { Icons } from "@/components/icons/Index";

interface EventCategory {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  status: boolean;
  createdAt: string;
}

export default function HomePage() {
  const images = [
    "/images/home/hero-bg.png",
    "/images/home/hero/01.jpg",
    "/images/home/hero/02.jpg",
    "/images/home/hero/03.jpg",
    "/images/home/hero/04.jpg",
    "/images/home/hero/05.jpg",
    "/images/home/hero/06.jpg",
    "/images/home/hero/07.jpg",
    "/images/home/hero/08.jpg",
    "/images/home/hero/09.jpg",
    "/images/home/hero/10.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(
    Math.floor(Math.random() * images.length)
  );
  const [categories, setCategories] = useState<EventCategory[]>([]);

  const { data, loading: apiLoading, error: apiError, fetchApi } = useApi({
    url: "/api/users/events/category",
    type: "manual",
    method: "GET",
    requiresAuth: false,
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchApi();
  }, []);

  // Update categories when data is received
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setCategories(data);
    }
  }, [data]);

  // Hero image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);

  // Set page title
  useEffect(() => {
    document.title = "My Waldo | Home";
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate total sections: 1 (hero) + categories.length
  const totalSections = 1 + categories.length;

  // Track scroll position to determine current section
  useEffect(() => {
    if (!isMounted || totalSections <= 1) return;

    const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      let activeSection = 1;

      sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          activeSection = index + 1;
        }
      });

      setCurrentSection(activeSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted, categories.length]);

  return (
    <>
      <section className="hero-section relative h-screen flex items-center justify-center overflow-hidden">
        <div className="scroll-down-arrow absolute bottom-3 flex-col left-0 right-0 flex justify-center items-center z-10">
          <span className="text-[var(--primary-theme)] text-[25px]">
            {currentSection}/{totalSections}
          </span>
          <button className="scroll-down-arrow-icon animate-bounce duration-300 ease-in-out">
            <Icons.arrowDown className="text-[var(--primary-theme)] text-2xl" />
          </button>
        </div>
        {/* Background Images Layer */}
        {isMounted && images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            style={{
              backgroundImage: `url(${img})`,

            }}
          />
        ))}

        {/* Content Layer */}
        <div className="text-center text-white">
          <div className="container">
            <div className="hero-content relative z-10 max-w-[960px] mx-auto mb-[25px] 2xl:mb-[100px]">
              <h1 className="hd-lg text-center">Thornton Studios</h1>
              <span className="block text-end text-[28px] max-w-[370px] ml-auto font-[var(--font-primary-font)]">
                Serving the Naval Academy for over 45 years

              </span>
            </div>
            {/* <span className="">
            </span> */}
            <div className="hero-bottom-content group inline-block">
              {/* <button className="">
                <Image src="/images/nabsd-logo.svg" alt="" width={200} height={200} />
              </button> */}

              <span className="
      absolute left-[-760px] mt-2
      px-3 py-1 text-sm text-white bg-black rounded
      opacity-0 group-hover:opacity-100
      transition-opacity duration-300
      pointer-events-none
      whitespace-nowrap text-left
    ">
                NABSD is the Naval Academy Business Service Division of
                the Naval Academy and approves all vendors. Since 1980 <br />
                Thornton Studios has been photographing Plebe Sum-
                mer, and is only approved Vendor to Plebe Summer.
              </span>
            </div>
          </div>
        </div>

        {/* Overlay for dark effect (optional) */}
        <div className="absolute inset-0 z-[5]" ></div>
      </section>
      {/* Event Categories Sections */}
      {categories.length > 0 ? (
        <section className="bg-white py-[30px]">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category, index) => (
                <Sec
                  key={category.id}
                  title={category.name}
                  sectionClass="border-2 border-white/100"
                  href={`/products/${category.slug}`}
                  backgroundImage={category.imageUrl}

                />

              ))}
            </div>
          </div>
        </section>
      ) : apiLoading ? (
        <div className="container py-8 text-center">Loading categories...</div>
      ) : apiError ? (
        <div className="container py-8 text-center text-red-500">Error loading categories: {apiError}

        </div>
      ) : null
      }
    </>
  )
}
