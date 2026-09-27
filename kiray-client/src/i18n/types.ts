export type Locale = 'en' | 'am';

export interface TranslationSchema {
  common: {
    home: string;
    browseProperties: string;
    howItWorks: string;
    safetyTips: string;
    signIn: string;
    signUp: string;
    logout: string;
    loading: string;
    zeroCommission: string;
    viewAll: string;
    beds: string;
    baths: string;
    sqm: string;
    perMonth: string;
    currency: string;
    language: string;
    english: string;
    amharic: string;
  };
  navbar: {
    ownerDashboard: string;
    renteeHub: string;
    adminConsole: string;
    savedListings: string;
    listYourProperty: string;
    roleRentee: string;
    roleLandlord: string;
    roleAdmin: string;
  };
  hero: {
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    browseBtn: string;
    listPropertyBtn: string;
    featuredTag: string;
    featuredDefaultTitle: string;
    featuredDefaultLocation: string;
  };
  trustRibbon: {
    mapTitle: string;
    mapDesc: string;
    ownersTitle: string;
    ownersDesc: string;
    reviewsTitle: string;
    reviewsDesc: string;
    safetyTitle: string;
    safetyDesc: string;
  };
  howItWorks: {
    badge: string;
    title: string;
    rentersSubtitle: string;
    ownersSubtitle: string;
    forRentersTab: string;
    forOwnersTab: string;
    renters: {
      step1Title: string;
      step1Desc: string;
      step2Title: string;
      step2Desc: string;
      step3Title: string;
      step3Desc: string;
    };
    owners: {
      step1Title: string;
      step1Desc: string;
      step2Title: string;
      step2Desc: string;
      step3Title: string;
      step3Desc: string;
    };
  };
  comparison: {
    badge: string;
    title: string;
    subtitle: string;
    colFeature: string;
    colKiray: string;
    colDelala: string;
    row1Title: string;
    row1Kiray: string;
    row1Delala: string;
    row2Title: string;
    row2Kiray: string;
    row2Delala: string;
    row3Title: string;
    row3Kiray: string;
    row3Delala: string;
    row4Title: string;
    row4Kiray: string;
    row4Delala: string;
    row5Title: string;
    row5Kiray: string;
    row5Delala: string;
  };
  featuredListings: {
    badge: string;
    curatedCount: string;
    title: string;
    subtitle: string;
  };
  mapSection: {
    badge: string;
    title: string;
    subtitle: string;
  };
  testimonials: {
    badge: string;
    title: string;
    testimonial1Text: string;
    testimonial1Author: string;
    testimonial1Role: string;
    testimonial2Text: string;
    testimonial2Author: string;
    testimonial2Role: string;
  };
  faqs: {
    badge: string;
    title: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
  };
  ctaBanner: {
    title: string;
    subtitle: string;
    browseBtn: string;
    createAccountBtn: string;
    footerMotto: string;
  };
}
