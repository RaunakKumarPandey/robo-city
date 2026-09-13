export interface EventData {
  eventName: string;
  tagline: string;
  organizer: string;
  registration: string;
  registrationLink: string;
  teamSize: string;
  prizePool: string;
  duration: string;
  email: string;
  social: string;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  linkedin: string;
  facebook: string;
  quote: {
    text: string;
    author: string;
  };
}

export const eventData: EventData = {
  eventName: "RoboVerse'26",
  tagline: "BUILD YOUR CREW. BUILD YOUR BOT. OWN THE CITY.",
  organizer: "IEEE Student Branch, MMMUT Gorakhpur",
  registration: "Free",
  registrationLink: "https://forms.gle/ac4YoLdKzPRNNqq88",
  teamSize: "3–5 members",
  prizePool: "₹12,000",
  duration: "3 days",
  email: "ieee.stb.mmmut@gmail.com",
  social: "@ieeesb.mmmut",
  coordinatorName: "Raunak Pandey",
  coordinatorPhone: "+91 87894 32955",
  coordinatorEmail: "rk87894329@gmail.com",
  linkedin: "https://www.linkedin.com/company/ieee-stb-mmmut/",
  facebook: "https://www.facebook.com/share/1H5pQmRJE5/",
  quote: {
    text: "When gears mesh and algorithms fire, a pile of spare parts awakens to chase victory.",
    author: "Marcus Thorne",
  },
};

