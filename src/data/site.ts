export const site = {
  name: "Sulaiman Abdulla Shariff",
  shortName: "Sulaiman Shariff",
  role: "Software engineer",
  location: "Bangalore, India",
  // Kept deliberately plain. The work does the selling.
  tagline:
    "I build systems that run in production: AI agents, serverless backends, and one brain-computer interface.",
  availability: "Available for internships and freelance work",
  email: "sulaiman05221@gmail.com",
  phone: "+91 87923 45338",
  socials: {
    github: "https://github.com/sulaiman-shariff",
    linkedin: "https://www.linkedin.com/in/sulaiman-abdulla-shariff/",
  },
  nav: [
    { href: "/work", label: "Work" },
    { href: "/about", label: "About" },
    { href: "/resume", label: "Résumé" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export type Site = typeof site;
