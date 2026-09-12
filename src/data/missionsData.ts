export interface Mission {
  number: string;
  codeName: string;
  title: string;
  description: string;
  status: string;
  isBonus?: boolean;
  tagline?: string;
  highlightLabel?: string;
  themeColor: "pink" | "orange" | "cyan" | "purple";
}

export const missions: Mission[] = [
  {
    number: "01",
    codeName: "THE BUILD",
    title: "Bot Assembly & Endurance",
    description:
      "Teams assemble their robots and complete the designated endurance task.",
    status: "MISSION 01",
    themeColor: "pink",
  },
  {
    number: "02",
    codeName: "RAMPAGE",
    title: "Rampage",
    description:
      "Teams navigate their bots through a challenging course featuring ramps and obstacles.",
    status: "MISSION 02",
    themeColor: "orange",
  },
  {
    number: "03",
    codeName: "OBSTACLE RUN",
    title: "Obstacle Avoidance Race",
    description:
      "Teams compete by navigating the course while avoiding obstacles.",
    status: "MISSION 03",
    themeColor: "cyan",
  },
  {
    number: "BONUS",
    codeName: "ROBOSOCCER",
    title: "Robosoccer Bonus Match",
    description:
      "Teams eliminated in Round 1 or Round 2 get another opportunity to compete for separate prizes and recognition.",
    status: "BONUS ROUND",
    isBonus: true,
    highlightLabel: "SECOND CHANCE",
    tagline: "ELIMINATED? THE GAME ISN'T OVER.",
    themeColor: "purple",
  },
];
