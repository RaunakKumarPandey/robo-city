export interface Mission {
  number: string;
  codeName: string;
  title: string;
  description: string;
  difficulty: "NORMAL" | "HARD" | "EXPERT" | "RAMPAGE";
  status: string;
  isBonus?: boolean;
  tagline?: string;
  highlightLabel?: string;
  themeColor: "pink" | "orange" | "cyan" | "purple";
  specs: string[];
}

export const missions: Mission[] = [
  {
    number: "01",
    codeName: "THE BUILD",
    title: "Bot Assembly & Endurance",
    description:
      "Syndicates assemble their machines on the workshop bench and complete the mandatory endurance and clearance challenge.",
    difficulty: "NORMAL",
    status: "MISSION 01",
    themeColor: "pink",
    specs: ["Weight Check: Under Spec", "Power Check: 12V Max", "Endurance Lap: 120s"],
  },
  {
    number: "02",
    codeName: "RAMPAGE",
    title: "Ramp & High-Speed Arena",
    description:
      "Navigate extreme elevation inclines, jumps, and speed chicanes while maintaining control under high acceleration.",
    difficulty: "HARD",
    status: "MISSION 02",
    themeColor: "orange",
    specs: ["35° Incline Ramps", "High-G Cornering", "Knockout Bracket"],
  },
  {
    number: "03",
    codeName: "THE RUN",
    title: "Precision Obstacle Course",
    description:
      "Pilot through dynamic moving barriers, narrow corridors, and deceptive surface textures with zero contact penalties.",
    difficulty: "EXPERT",
    status: "MISSION 03",
    themeColor: "cyan",
    specs: ["Dynamic Slalom", "Zero-Collision Window", "Time Trial Clock"],
  },
  {
    number: "04",
    codeName: "ROBO SOCCER",
    title: "Robotic Football Battleground",
    description:
      "Eliminated in Round 1 or 2? Enter the underground Robosoccer arena to score goals, claim bounties, and win distinction awards.",
    difficulty: "RAMPAGE",
    status: "BONUS ROUND",
    isBonus: true,
    highlightLabel: "SECOND CHANCE",
    tagline: "ELIMINATED? THE HEIST IS NOT OVER.",
    themeColor: "purple",
    specs: ["1v1 / 2v2 Football Arena", "Ball Control & Strike", "Separate Prize Bounty"],
  },
];
