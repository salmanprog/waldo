import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.userRole.upsert({
    where: { slug: "admin" },
    update: {},
    create: {
      title: "Administrator",
      slug: "admin",
      description: "Full system access",
      type: "ADMIN",
      isSuperAdmin: true,
      status: true,
    },
  });

  const userRole = await prisma.userRole.upsert({
    where: { slug: "user" },
    update: {},
    create: {
      title: "User",
      slug: "user",
      description: "Regular user access",
      type: "USER",
      isSuperAdmin: false,
      status: true,
    },
  });

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@thornton.com" },
    update: {},
    create: {
      name: "Super Admin",
      username: "superadmin",
      slug: "super-admin",
      email: "admin@thornton.com",
      password: hashedPassword,
      userGroupId: adminRole.id,
      userType: "ADMIN",
      gender: "MALE",
      profileType: "PUBLIC",
      status: true,
      isEmailVerify: true,
    },
  });

  const eventCategories = [
    {
      name: "Sea Trials / Herndon",
      slug: "sea-trials-herndon",
      description: "All sea related events",
      imageUrl: "/uploads/category/sec-02.png",
    },
    {
      name: "Graduations / Commissioning",
      slug: "graduations-commissioning",
      description: "Graduations celebration events",
      imageUrl: "/uploads/category/sec-03.png",
    },
    {
      name: "Plebe Summer",
      slug: "plebe-summer",
      description: "During Plebe Summer we will take over 250,000 photographs each platoon at least 15 times. The photographs are organized into galleries, identified by date, platoon and evolution (event). There are two methods for finding photographs of your son/daughter. They are Manual search and Waldo Finder.",
      imageUrl: "/uploads/category/sec-04.png",
    },
    {
      name: "Studio Collection",
      slug: "studio-collection",
      description: "Studio Collection",
      imageUrl: "/uploads/category/sec-05.png",
    },
    {
      name: "USNA Lucky Bag",
      slug: "usna-lucky-bag",
      description: "USNA Lucky Bag",
      imageUrl: "/uploads/category/sec-03.png",
    },
  ];

  for (const cat of eventCategories) {
    await prisma.eventCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const eventCategoriesEvents = [
    {
      categoryId: 1,
      title: "PhotoGraphs of Herndon Monument Climb",
      slug: "photo-graphs-of-herndon-monument-climb",
      description: "You are purchasing access to the photographs we will take of the Herndon Monument Climb and Sea Trials. Purchase includes unlimited downloads of your midshipman for personal use. We are not able to photograph every midshipman during Herndon, but we are during Sea Trials. During Sea Trials we photograph each company as they complete one of the events —the Mud Crawl.",
      imageUrl: "",
      price: 29.95,
      status: true,
    },
    {
      categoryId: 2,
      title: "PhotoGraphs of Graduations / Commissioning",
      slug: "photo-graphs-of-graduations-commissioning",
      description: "You are purchasing access to the photographs we take during  Graduation/Commissioning. May 22, 2026. With four cameras and locations on the field to the left and right of the stage, we take over 20,000 photographs. We photograph every graduate during the processional, shaking hands and leaving the stage. And, using 'burst'  photography we take multiple photographs. No need to provide your grads name and company. We photograph every graduate. The photographs are grouped in galleries that are identified by company. Just open up the gallery and find your son/daughter. Unlimited downloads. Use 'Grad Finder, ' our proprietary Facial Recognition program, to find your son/daughter quickly. 'Grad Finder' is free and is not perfect so you will need still to search the galleries. But, it is fun. Most of the ceremony is photographed, from the Jumbotron image to the faculty processional, Graduates in their seats, Oaths of Office, Navy Blue and Gold, Speeches, Cap Toss, etc. Just find and download the photographs of your son/daughter to create your own Commissioning Week Coffee Table Book on Shutterfly, etc.",
      imageUrl: "",
      price: 59.95,
      status: true,
    },
    {
      categoryId: 3,
      title: "Manual Seach",
      slug: "manual-search",
      description: "With Manual Search the website defaults to your midshipman's platoon, with option to view other platoon galleries. When you find photographs of your son/daughter, you manually download them (up to 250) to you computer/mobile device. You will have the option to download more.",
      imageUrl: "",
      price: 269.95,
      status: true,
    },
    {
      categoryId: 3,
      title: "Manual Seach with Waldo Finder and Waldo News",
      slug: "manual-search-with-waldo-finder-and-waldo-news",
      description: "With Manual Search and Waldo Finder, you can set up Waldo Finder to Automatically find photographs of your son/daughter as they are posted. When Waldo Finder find your midshipman,you will be sent a text and/or email notification. You will also give access to Manual Search for those photographs that Waldo Finder did not find.",
      imageUrl: "",
      price: 349.95,
      status: true,
    },
  ];
  for (const event of eventCategoriesEvents) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    });
  }

  const eventCategoriesFaqs = [
    {
      eventCategoryId: 1,
      question: "Will there be photographs of my son/daughter?",
      slug: "will-there-be-photographs-of-my-sondaughter",
      answer: "Do not know for sure. At the Herndon Monument Climb, we are only able to photograph Plebes who are actually climbing the monument. At Sea Trials, probably as we photograph every company at one of the 36 evelutions we photograph is the Mud Crawl. It is the best evolution and unlike any Plebes Summer evolution.",
      status: true,
    },
    {
      eventCategoryId: 1,
      question: "How will the sea Trials photographs be organized?",
      slug: "how-will-the-sea-trials-photographs-be-organized",
      answer: "By Companies",
      status: true,
    },
    {
      eventCategoryId: 1,
      question: "How many photographs will be there be of my son/daughter?",
      slug: "how-many-photographs-will-there-be-of-my-sondaughter",
      answer: "We do not know. If your son/daughter is on zero block or excused from Sea Trials, not at all. If injured, heshe will be on the sidelines and we will photograph him/her.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "How many photographs will there be of my son/daughter?",
      slug: "how-many-photographs-will-there-be-of-my-sondaughter-1",
      answer: "Probably 5-10, but we can not make any guarantee.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "Do I have to sign up prior to Graduation Day?",
      slug: "do-i-have-to-sign-up-prior-to-graduation-day-2",
      answer: "No you do not, but after May 15 there is a price increase and photographs are available for thirty days only.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "Will there be photographs of my son/daughter other than during the processional, hand shake, and leaving stage?",
      slug: "will-there-be-photographs-of-my-sondaughter-other-than",
      answer: "We do not know as these are all candids. We do photographs the graduate sin their sets during various parts of the ceremony.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "How accurate is the Grad Finder?",
      slug: "how-accurate-is-the-grad-finder",
      answer: "It is a Facial Recognition Program so there are no guarantees, and no refunds if it does not work. Its effectiveness will depend in part on the photographs you upload for the Facial Recognition program to do its job.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "How large are the files?",
      slug: "how-large-are-the-files-2",
      answer: "Large enough to make a good quality 8x10 photograph, and certainly great for Social media.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "Can the files be cropped?",
      slug: "can-the-files-be-cropped-2",
      answer: "Yes. We leave extra room when we take each photo for cropping purposes?",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "Will the TOP 100 be photographed?",
      slug: "will-the-top-100-be-photographed-2",
      answer: "Yes. Unfortunately the position of the dignitary who shakes the Top 100’s hand is partially blocked. Also, the view from the left side is the best angle for the TOP 100.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "Are refunds available?",
      slug: "are-refunds-available-2",
      answer: "Sorry, they are not.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "Can we download photographs of the other parts of the ceremony?",
      slug: "can-we-download-photographs-of-the-other-parts-of-the-ceremony",
      answer: "Yes. That way you do not have to be too worried about good photographs from the nose-bleed sections of the stadium. We have the best angle and are close with our long lenses.",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "What is Plebe Summer?",
      slug: "what-is-plebe-summer",
      answer: "Plebe Summer is the intensive 7-week training period for incoming Naval Academy midshipmen, marking the beginning of their journey at USNA.",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "How long have you been photographing Plebe Summer?",
      slug: "how-long-have-you-been-photographing-plebe-summer-3",
      answer: "Since 1980, Thornton Studios has been the only approved vendor to photograph Plebe Summer, serving the Naval Academy for over 45 years.",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "When can I view and purchase Plebe Summer photos?",
      slug: "when-can-i-view-and-purchase-plebe-3",
      answer: "Photos are typically available after the completion of Plebe Summer. Check back regularly or contact us for specific availability dates.",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "Are you an approved NABSD vendor?",
      slug: "are-you-an-approved-nabsd-vendor-3",
      answer: "Yes, Thornton Studios is approved by the Naval Academy Business Service Division (NABSD) and is the only approved vendor for Plebe Summer photography.",
      status: true,
    },
    {
      eventCategoryId: 4,
      question: "What is included in the Studio Collection?",
      slug: "what-is-included-in-the-studio-collection-4",
      answer: "Our Studio Collection features professional portraits, formal photos, and studio-quality images of midshipmen in various uniforms and settings.",
      status: true,
    },
    {
      eventCategoryId: 4,
      question: "Can I schedule a studio session?",
      slug: "can-i-schedule-a-studio-session-4",
      answer: "Yes, studio sessions can be scheduled. Please contact us for availability and booking information.",
      status: true,
    },
    {
      eventCategoryId: 4,
      question: "What formats are available for studio photos?",
      slug: "what-formats-are-available-for-studio-photos-4",
      answer: "We offer digital downloads, prints in various sizes, and custom framing options for all studio collection photos.",
      status: true,
    }
  ];
  for (const faq of eventCategoriesFaqs) {
    await (prisma as any).eventCategoryFaq.upsert({
      where: { slug: faq.slug },
      update: {},
      create: faq,
    });
  }

  const blogs = [
    {
      title: "Plebe Summer 2025",
      slug: "plebe-summer-2025",
      description: "Plebe Summer 2025 was a great success. We had a lot of fun and the midshipmen were great. We took over 250,000 photographs each platoon at least 15 times. The photographs are organized into galleries, identified by date, platoon and evolution (event). There are two methods for finding photographs of your son/daughter. They are Manual search and Waldo Finder. Waldo Finder is a proprietary facial recognition technology that we use to automatically find photographs of your son/daughter. It is not perfect so you will need still to search the galleries. But, it is fun. Most of the ceremony is photographed, from the Jumbotron image to the faculty processional, Graduates in their seats, Oaths of Office, Navy Blue and Gold, Speeches, Cap Toss, etc. Just find and download the photographs of your son/daughter to create your own Plebe Summer Coffee Table Book on Shutterfly, etc.",
      seoTitle: "Plebe Summer 2025",
      seoDescription: "Plebe Summer 2025 was a great success.",
      imageUrl: "/uploads/blog/05.jpg",
      status: true,
    },
    {
      title: "Sports and Training Access",
      slug: "sports-and-training-access",
      description: "Sports and Training Access is a new feature that allows you to access all the photographs of the sports and training events. You can download the photographs of your son/daughter to create your own Sports and Training Coffee Table Book on Shutterfly, etc. We are not able to photograph every midshipman during Sports and Training, but we are during Sea Trials. During Sports and Training we photograph each company as they complete one of the events —the Mud Crawl.",
      seoTitle: "Sports and Training Access",
      seoDescription: "Sports and Training Access",
      imageUrl: "/uploads/blog/06.jpg",
      status: true,
    },
    {
      title: "Graduations / Commissioning 2025",
      slug: "graduations-commissioning-2025",
      description: "Graduations / Commissioning 2025 was a great success. We had a lot of fun and the midshipmen were great. We took over 250,000 photographs each platoon at least 15 times. The photographs are organized into galleries, identified by date, platoon and evolution (event). There are two methods for finding photographs of your son/daughter. They are Manual search and Waldo Finder. Waldo Finder is a proprietary facial recognition technology that we use to automatically find photographs of your son/daughter. It is not perfect so you will need still to search the galleries. But, it is fun. Most of the ceremony is photographed, from the Jumbotron image to the faculty processional, Graduates in their seats, Oaths of Office, Navy Blue and Gold, Speeches, Cap Toss, etc. Just find and download the photographs of your son/daughter to create your own Plebe Summer Coffee Table Book on Shutterfly, etc.",
      seoTitle: "Graduations / Commissioning 2025",
      seoDescription: "Graduations / Commissioning 2025 was a great success.",
      imageUrl: "/uploads/blog/07.jpg",
      status: true,
    },
    {
      title: "Studio Collection 2025",
      slug: "studio-collection-2025",
      description: "Studio Collection 2025 was a great success. We had a lot of fun and the midshipmen were great. We took over 250,000 photographs each platoon at least 15 times. The photographs are organized into galleries, identified by date, platoon and evolution (event). There are two methods for finding photographs of your son/daughter. They are Manual search and Waldo Finder. Waldo Finder is a proprietary facial recognition technology that we use to automatically find photographs of your son/daughter. It is not perfect so you will need still to search the galleries. But, it is fun. Most of the ceremony is photographed, from the Jumbotron image to the faculty processional, Graduates in their seats, Oaths of Office, Navy Blue and Gold, Speeches, Cap Toss, etc. Just find and download the photographs of your son/daughter to create your own Plebe Summer Coffee Table Book on Shutterfly, etc.",
      seoTitle: "Studio Collection 2025",
      seoDescription: "Studio Collection 2025 was a great success.",
      imageUrl: "/uploads/blog/03.jpg",
      status: true,
    },
  ];
  for (const blog of blogs) {
    await (prisma as any).blog.upsert({
      where: { slug: blog.slug },
      update: {},
      create: blog,
    });
  }
  console.log("✅ Seed completed successfully");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
