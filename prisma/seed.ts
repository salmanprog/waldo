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
      is_available: true,
      available_text: "All sea related events",
    },
    {
      name: "Graduations / Commissioning",
      slug: "graduations-commissioning",
      description: "Graduations celebration events",
      imageUrl: "/uploads/category/sec-03.png",
      is_available: true,
      available_text: "Graduations celebration events",
    },
    {
      name: "Plebe Summer",
      slug: "plebe-summer",
      description: "With four photographers, we will take over 300,000 photographs during Plebe Summer. The average number of photographs per Plebe is about 250. These photographs are posted on our website. Once you find your son/daughter, you can download the image for personal use, especially for Social Media.\n\nThere are two types of evolutions, or events. The first type are the evolutions that we can identify the specific platoon. It is easy to find your Plebe in these evolutions. The second type are the evolutions where multiple platoons participate. These galleries take more time to view. With your purchase of access, you can view both types of galleries.\n\nThere are two ways you can search for the photographs of your son/daughter. The first way is manually. You would open a specific gallery, scroll through the images to find your son/daughter, and download the image. The second way is to use our Facial Recognition program, FACE SEARCH. As FACE SEARCH is not 100% accurate, you will need to view the galleries manually to find all the photographs of your Plebe.\n\nTo memorialize your son/daughter's Plebe Summer at the U.S. Naval Academy, you could also order a Coffee Table Book of the best photographs of your son/daughter. You select the photographs and we create the book for you.",
      imageUrl: "/uploads/category/sec-04.png",
      is_available: true,
      available_text: "During Plebe Summer we will take over 250,000 photographs each platoon at least 15 times. The photographs are organized into galleries, identified by date, platoon and evolution (event). There are two methods for finding photographs of your son/daughter. They are Manual search and Waldo Finder.",
    },
    {
      name: "Studio Collection",
      slug: "studio-collection",
      description: "Studio Collection",
      imageUrl: "/uploads/category/sec-05.png",
      is_available: false,
      available_text: "Not Available January 2027",
    },
    {
      name: "USNA Lucky Bag",
      slug: "usna-lucky-bag",
      description: "USNA Lucky Bag",
      imageUrl: "/uploads/category/sec-03.png",
      is_available: false,
      available_text: "Not Available January 2027",
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
      description: "You are purchasing photo access to three events at the end of the Plebe Year: War Games, Sea/Trials, and Herndon. You have unlimited downloads from each event as well as any general photographs. Though you will not find photographs of your Plebe in each event, these photographs are a record of the significant events that culminate a long Plebe Year.",
      imageUrl: "",
      price: 29.95,
      status: true,
    },
    {
      categoryId: 2,
      title: "PhotoGraphs of Graduations / Commissioning",
      slug: "photo-graphs-of-graduations-commissioning",
      description: "You are purchasing photo access to the Graduation/Commissioning ceremonies for the Class of 2026. You have unlimited downloads of your graduate as well as the general photographs of the ceremony. With four photographers, there should be multiple photographs of every Grad during processional, handshake, and leaving stage. Perhaps even during the ceremony. Facial Recognition is available but only if you upload photographs for it prior to graduation.",
      imageUrl: "",
      price: 49.95,
      status: true,
    },
    {
      categoryId: 3,
      title: "Manual Seach",
      slug: "manual-search",
      description: "With this Manual Search product, you are purchasing access to the galleries to manually search. This works well financially, provided your time is not limited. Purchase includes 200 downloads with the option to purchase more downloads if you wish.",
      imageUrl: "",
      price: 269.95,
      status: true,
    },
    {
      categoryId: 3,
      title: "Manual Seach and Facial Recognition",
      slug: "manual-search-and-facial-recognition",
      description: "This product uses FACE SEARCH (Facial Recognition) to find the photographs. When a photograph of your Plebe is found, an email notification, with link to download the image, is sent to you. With FACE SEARCH, you also have access to MANUAL SEARCH and will need to manually search the galleries to find the photographs FACE SEARCH did not find. Purchasing FACE SEARCH without MANUAL SEARCH is not available. With your purchase of Product 2, you will also receive Waldo News. The Waldo News includes a great deal of information, from what the platoons did during that day and slang, acronyms, anecdotes, a highlighted evolution, and more.",
      imageUrl: "",
      price: 359.95,
      status: true,
    },
    {
      categoryId: 3,
      title: "Coffee Table Book",
      slug: "coffee-table-book",
      description: "The Coffee Table Book, can not be purchased without purchasing Product 1 or 2 above. As you find photographs of your son/daughter on our website, you would save them in your Coffee Table Book gallery. At the end of the summer, you email me to let me know that I can begin to work on your book.",
      imageUrl: "",
      price: 699.96,
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
      question: "How will the photographs be organized?",
      slug: "how-will-the-photographs-be-organized",
      answer: "There will be six galleries, as follows: War Games; Sea Trials Company 1-5, Sea Trials Company 6-10, Sea Trials Company 11-15, Sea Trials Company 16-20, Sea Trials Company 21-25, Sea Trials Company 26-30, and Sea Trials Company 31-36; and Herndon.",
      status: true,
    },
    {
      eventCategoryId: 1,
      question: "Will there be Facial Recognition?",
      slug: "will-there-be-facial-recognition",
      answer: "Sorry, no.",
      status: true,
    },
    {
      eventCategoryId: 1,
      question: "How many photographs will there be of my midshipman?",
      slug: "how-many-photographs-will-there-be-of-my-midshipman",
      answer: "We can not guarantee the number of photographs. At Sea Trials your Plebe should be photographed if he/she participated in the event.",
      status: true,
    },
    {
      eventCategoryId: 1,
      question: "When will the photographs be posted?",
      slug: "when-will-the-photographs-be-posted",
      answer: "Probably a day or two after Herndon.",
      status: true,
    },
    {
      eventCategoryId: 1,
      question: "Do we have to reregister on your site?",
      slug: "do-we-have-to-reregister-on-your-site",
      answer: "Yes, as we have now a CUSTOM WEBSITE.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "What parts of the Graduation will you photograph?",
      slug: "what-parts-of-the-graduation-will-you-photograph",
      answer: "All of them.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "Can you guarantee that you will photograph my Graduate?",
      slug: "can-you-guarantee-that-you-will-photograph-my-graduate",
      answer: "Yes during: the Processional, Receiving the Handshake, Leaving the Stage. We can not guarantee that we will photograph your Grad during: ceremony, the Oaths of Office, singing of Navy Blue and Gold, the graduates in their seats, the stands with parents. And the Cap Toss.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "How many photographers will you have?",
      slug: "how-many-photographers-will-you-have",
      answer: "Four, strategically located on the field and next to the stage on an elevated platform.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "Do you photograph every Grad?",
      slug: "do-you-photograph-every-grad",
      answer: "Yes",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "Do you use \"burst photography\"?",
      slug: "do-you-use-burst-photography",
      answer: "Yes, we do. We normally take, with \"burst photography\", 4-5 photographs per second. This helps capture the right moment.",
      status: true,
    },
    {
      eventCategoryId: 2,
      question: "Do you use Facial Recognition?",
      slug: "do-you-use-facial-recognition",
      answer: "Yes, we do. However, for it to work, you need to upload photographs of your graduate before the Graduation ceremony. Once we post the photographs, the Facial Recognition will not work? Please note that this is the first year we have used Facial Recognition. We can not guarantee its accuracy. There is no charge for it and no refunds. You still need to manually search the galleries.",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "How many times during the summer will you photograph my Plebe's platoon?",
      slug: "how-many-times-during-the-summer-will-you-photograph-my-plebes-platoon",
      answer: "Roughly 12 times.",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "Do you photograph every Plebe during an evolution?",
      slug: "do-you-photograph-every-plebe-during-an-evolution",
      answer: "We photograph all the Plebes that are participating in the evolution. The ones that are not participating we also photograph as long as it does not invade their privacy.",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "Can you photograph my Plebe's platoon more, and can you focus on my Plebe?",
      slug: "can-you-photograph-my-plebes-platoon-more-and-focus-on-my-plebe",
      answer: "No we, can not. The Academy strictly prohibits us from doing so.",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "How many photographs are in a gallery?",
      slug: "how-many-photographs-are-in-a-gallery",
      answer: "Anywhere from 30 to 2,000. It depends on the evolution",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "How long will the photographs be available on your website?",
      slug: "how-long-will-the-photographs-be-available-on-your-website",
      answer: "Until Feb 28, 2027. Then they are archived for one more month. After that they are deleted from the website.",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "How large are the files?",
      slug: "how-large-are-the-files-3",
      answer: "They are large enough to make an 8x10 print even with cropping.",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "Are the photographs edited?",
      slug: "are-the-photographs-edited",
      answer: "They are not.",
      status: true,
    },
    {
      eventCategoryId: 3,
      question: "How many times a week will there be photograph of my Plebe's platoon?",
      slug: "how-many-times-a-week-will-there-be-photograph-of-my-plebes-platoon",
      answer: "We simple DO NOT KNOW. What we photograph every day depends totally on the Plebe Summer schedule and what platoons are completing what evolutions on any specific day. We might not photograph your Plebe's platoon for one whole week, and then the next week photograph the platoon 4-5 times. The best way to understand this is to understand how the evolutions are scheduled. Take for example the HIGH ROPES course. Two platoons complete the evolution each day. There are 36 platoons so it takes 18 business days for all platoons to cycle through all the platoons. If your Plebe's platoon is the last platoon to complete the course, he/she might not complete it until the end of July. This \"cycling\" applies to all evolutions.",
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

  const blogCategories = [
    {
      title: "Plebe Summer 2025",
      slug: "plebe-summer-2025",
      description: "Plebe Summer is the intensive 7-week training period for incoming Naval Academy midshipmen, marking the beginning of their journey at USNA.",
      imageUrl: "/uploads/blog/05.jpg",
    },
  ];
  for (const category of blogCategories) {
    await (prisma as any).blogCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  const blogs = [
    {
      title: "Plebe Summer 2025",
      slug: "plebe-summer-2025",
      description: "Plebe Summer 2025 was a great success. We had a lot of fun and the midshipmen were great. We took over 250,000 photographs each platoon at least 15 times. The photographs are organized into galleries, identified by date, platoon and evolution (event). There are two methods for finding photographs of your son/daughter. They are Manual search and Waldo Finder. Waldo Finder is a proprietary facial recognition technology that we use to automatically find photographs of your son/daughter. It is not perfect so you will need still to search the galleries. But, it is fun. Most of the ceremony is photographed, from the Jumbotron image to the faculty processional, Graduates in their seats, Oaths of Office, Navy Blue and Gold, Speeches, Cap Toss, etc. Just find and download the photographs of your son/daughter to create your own Plebe Summer Coffee Table Book on Shutterfly, etc.",
      blogCategoryId: 1,
      seoTitle: "Plebe Summer 2025",
      seoDescription: "Plebe Summer 2025 was a great success.",
      imageUrl: "/uploads/blog/05.jpg",
      status: true,
    },
    {
      title: "Sports and Training Access",
      slug: "sports-and-training-access",
      description: "Sports and Training Access is a new feature that allows you to access all the photographs of the sports and training events. You can download the photographs of your son/daughter to create your own Sports and Training Coffee Table Book on Shutterfly, etc. We are not able to photograph every midshipman during Sports and Training, but we are during Sea Trials. During Sports and Training we photograph each company as they complete one of the events —the Mud Crawl.",
      blogCategoryId: 1,
      seoTitle: "Sports and Training Access",
      seoDescription: "Sports and Training Access",
      imageUrl: "/uploads/blog/06.jpg",
      status: true,
    },
    {
      title: "Graduations / Commissioning 2025",
      slug: "graduations-commissioning-2025",
      description: "Graduations / Commissioning 2025 was a great success. We had a lot of fun and the midshipmen were great. We took over 250,000 photographs each platoon at least 15 times. The photographs are organized into galleries, identified by date, platoon and evolution (event). There are two methods for finding photographs of your son/daughter. They are Manual search and Waldo Finder. Waldo Finder is a proprietary facial recognition technology that we use to automatically find photographs of your son/daughter. It is not perfect so you will need still to search the galleries. But, it is fun. Most of the ceremony is photographed, from the Jumbotron image to the faculty processional, Graduates in their seats, Oaths of Office, Navy Blue and Gold, Speeches, Cap Toss, etc. Just find and download the photographs of your son/daughter to create your own Plebe Summer Coffee Table Book on Shutterfly, etc.",
      blogCategoryId: 1,
      seoTitle: "Graduations / Commissioning 2025",
      seoDescription: "Graduations / Commissioning 2025 was a great success.",
      imageUrl: "/uploads/blog/07.jpg",
      status: true,
    },
    {
      title: "Studio Collection 2025",
      slug: "studio-collection-2025",
      description: "Studio Collection 2025 was a great success. We had a lot of fun and the midshipmen were great. We took over 250,000 photographs each platoon at least 15 times. The photographs are organized into galleries, identified by date, platoon and evolution (event). There are two methods for finding photographs of your son/daughter. They are Manual search and Waldo Finder. Waldo Finder is a proprietary facial recognition technology that we use to automatically find photographs of your son/daughter. It is not perfect so you will need still to search the galleries. But, it is fun. Most of the ceremony is photographed, from the Jumbotron image to the faculty processional, Graduates in their seats, Oaths of Office, Navy Blue and Gold, Speeches, Cap Toss, etc. Just find and download the photographs of your son/daughter to create your own Plebe Summer Coffee Table Book on Shutterfly, etc.",
      blogCategoryId: 1,
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
  const companies = [
    {
      name: "A",
      slug: "a",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "B",
      slug: "b",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "C",
      slug: "c",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "D",
      slug: "d",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "E",
      slug: "e",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "F",
      slug: "f",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "G",
      slug: "g",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "H",
      slug: "h",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "I",
      slug: "i",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "K",
      slug: "k",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "L",
      slug: "l",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "M",
      slug: "m",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "N",
      slug: "n",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "O",
      slug: "o",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "P",
      slug: "p",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "Q",
      slug: "q",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "R",
      slug: "r",
      description: "",
      imageUrl: "",
      status: true,
    },
    {
      name: "S",
      slug: "s",
      description: "",
      imageUrl: "",
      status: true,
    },
  ];
  for (const company of companies) {
    await (prisma as any).company.upsert({
      where: { slug: company.slug },
      update: {},
      create: company,
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
