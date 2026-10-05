/**
 * Official Qualified Teams & Leaders list from the Screening Schedule PDF (Quiz & Kit buyers).
 * Teams matching this list default to "qualified", while other teams default to "not_qualified".
 * Admin can manually override any team's status in the Admin Console.
 */

export interface QualifiedEntry {
  teamName: string;
  leaderName: string;
}

export const QUALIFIED_TEAMS_PDF: QualifiedEntry[] = [
  // Page 1: 10:00am - 11:00am
  { teamName: "HackForgers.zip", leaderName: "Nitin Kumar" },
  { teamName: "JAVA", leaderName: "Naveen kasaudhan" },
  { teamName: "LosSantos_Customs", leaderName: "AYUSH KUMAR MISHRA" },
  { teamName: "LosSantos_Custom", leaderName: "AYUSH KUMAR MISHRA" },
  { teamName: "MECHNova", leaderName: "Yadav Nikhil Kumar" },
  { teamName: "Autobots", leaderName: "Harsh Sachan" },
  { teamName: "MechaForge", leaderName: "Krishna Maheshwari" },
  { teamName: "PartyBots", leaderName: "Snehil Tripathi" },
  { teamName: "Optimus", leaderName: "Harsh Agrawal" },
  { teamName: "Chromium Crackers", leaderName: "Aditya Dubey" },
  { teamName: "Chromium Crack", leaderName: "Aditya Dubey" },
  { teamName: "Team GENESIS", leaderName: "Harshita Singh" },
  { teamName: "ROBONOVAS", leaderName: "Amish Mishra" },
  { teamName: "ROBO SAPIENS", leaderName: "Shirish kashyap" },
  { teamName: "ROBONOVA", leaderName: "HARSH GAUTAM" },
  { teamName: "Quantum Wheels", leaderName: "Rudra Pratap Singh" },

  // Page 1: 11:00am - 12:00pm
  { teamName: "Overlords", leaderName: "Yash Chaurasia" },
  { teamName: "TurboTronics", leaderName: "Abhinesh Kumar" },
  { teamName: "Cyber Nova", leaderName: "Abhinav" },
  { teamName: "The Sovereigns", leaderName: "Anay Katiyar" },
  { teamName: "ViceX", leaderName: "Soham Sharma" },
  { teamName: "MechaNova", leaderName: "Mohd Aali Salman" },
  { teamName: "YantraX", leaderName: "Amit Verma" },
  { teamName: "Robo sapiens", leaderName: "Shreyash Trivedi" },
  { teamName: "Vector", leaderName: "Sachin Kumar" },
  { teamName: "YantraX", leaderName: "NISHA" },
  { teamName: "Tech Titans", leaderName: "Vikash" },
  { teamName: "GTA_SIKE", leaderName: "Epshita Somani" },
  { teamName: "KYNTRIS", leaderName: "Piyush Kumar" },
  { teamName: "arduino cartel", leaderName: "Aakash singh" },
  { teamName: "Arduino Cartel", leaderName: "Aakash singh" },
  { teamName: "ROBO SAPIENS", leaderName: "Ajit Kumar Yadav" },

  // Page 1: 12:00pm - 01:00pm
  { teamName: "TechBoltz", leaderName: "SHIVENDRA PRATAP SINGH" },
  { teamName: "Tech-Tiaras", leaderName: "Sah Swetakumari Bijay" },
  { teamName: "RoboVortex01", leaderName: "Abhishek Raj" },
  { teamName: "Robo bolts", leaderName: "Ashwani Singh" },
  { teamName: "Robo Bolts", leaderName: "Ashwani Singh" },
  { teamName: "Ai-vengers", leaderName: "Priyanshi sharma" },
  { teamName: "AI-vengers", leaderName: "Priyanshi sharma" },
  { teamName: "HITEL", leaderName: "Harshit Singh" },
  { teamName: "Team Genesis", leaderName: "Nikhil sahu" },
  { teamName: "OMNIC DRIFTERS", leaderName: "Kratika Singhal" },

  // Page 2: Top / 12-1pm
  { teamName: "AMOGH", leaderName: "Sarvagya Tiwari" },
  { teamName: "Vishwakarma", leaderName: "Ashutosh" },
  { teamName: "Code&wheels", leaderName: "Kuldeep kumar" },
  { teamName: "Code & wheels", leaderName: "Kuldeep kumar" },
  { teamName: "Robo Rebels", leaderName: "Krishna Kumar Dubey" },
  { teamName: "RoboCrux", leaderName: "UPLAKSH SHARMA" },
  { teamName: "RoboNex", leaderName: "Preetansh Tripathi" },
  { teamName: "Trailblazers", leaderName: "Divya" },

  // Page 2: 01:00pm - 02:00pm
  { teamName: "Iron Impulse", leaderName: "Deepak Katheria" },
  { teamName: "X Pandavas", leaderName: "Sahil kumar" },
  { teamName: "Prometheus Prime", leaderName: "Himanshu Singh" },
  { teamName: "Vice City Garage", leaderName: "Rohit Baliyan" },
  { teamName: "Ctrl Freaks", leaderName: "Tanisha Chauhan" },
  { teamName: "Robodrift", leaderName: "Piyush Kumar" },
  { teamName: "INDIAN PIRATES", leaderName: "HARSH DEEP SINGH YADAV" },
  { teamName: "Robonex", leaderName: "Anurag" },
  { teamName: "Vice City Visionaries", leaderName: "Raj Jaiswal" },
  { teamName: "Emerge X", leaderName: "Ashutosh Pandey" },
  { teamName: "CircuitX", leaderName: "Richa Choudhary" },
  { teamName: "AUTOMATION AURORS", leaderName: "Arpit Singh" },
  { teamName: "RoboReactors", leaderName: "Nitish Shukla" },
  { teamName: "CircuitX", leaderName: "SHRUTI" },
  { teamName: "Auto vortex", leaderName: "Piyush Kumar Singh" },

  // Page 2: 02:00pm - 03:00pm
  { teamName: "Udbhav", leaderName: "Udbhav Tiwari" },
  { teamName: "ASTRA", leaderName: "ANUJ SONKER" },
  { teamName: "ROBOCON", leaderName: "Pranav kumar" },
  { teamName: "MechMinds", leaderName: "Gaurav Kushvaha" },
  { teamName: "THE DODGEBOTS", leaderName: "Siddharth Singh" },
  { teamName: "MAVE-X", leaderName: "Ayush Singh" },
  { teamName: "KAIZEN", leaderName: "Aryan Singh" },
  { teamName: "MECHNOVA", leaderName: "Ayush Gautam" },
  { teamName: "LUCARIO", leaderName: "Abhigyan Pratap Singh" },
  { teamName: "Yantra-X", leaderName: "Siddharth Srivastav" },
  { teamName: "MECHAMINDS", leaderName: "Ayush" },
  { teamName: "FRANKLIN SYNDICATE", leaderName: "ANUJ KESHARWANI" },
  { teamName: "RoboForge", leaderName: "Yatharth Singh Divya" },
  { teamName: "NEXIS", leaderName: "VARNIT GUPTA" },
  { teamName: "Mechtron", leaderName: "Diwakar tripathi" },

  // Page 2: 03:00pm - 04:00pm
  { teamName: "ROBONEX", leaderName: "PRIYANSH TIWARI" },

  // Page 3: 03:00pm - 04:00pm
  { teamName: "TITANIUM ROVERSE", leaderName: "Alok Mathur" },
  { teamName: "TITANIUM ROVE", leaderName: "Alok Mathur" },
  { teamName: "ROBO PIRATES", leaderName: "Divyansh Gupta" },
  { teamName: "Robo Raptors", leaderName: "Asmit chaturvedi" },
  { teamName: "ABHEDYA", leaderName: "Shreyash" },
  { teamName: "Autonomous Titan", leaderName: "Ankit Bindal" },
  { teamName: "ROBO ASTRA", leaderName: "Nitin Kumar Pandey" },
  { teamName: "ORANGUTAN", leaderName: "Mayank Singh" },
  { teamName: "ROBOSARTHI", leaderName: "ADITYA GUPTA" },
  { teamName: "EMBER CIRCUITS", leaderName: "Swastik jain" },
  { teamName: "EMBER CIRCUI", leaderName: "Swastik jain" },
  { teamName: "AKAGN", leaderName: "Abhinav Patel" },
  { teamName: "Circuit Titans", leaderName: "Vibhor Bhatia" },
  { teamName: "Future warrior", leaderName: "Yash jha" },
  { teamName: "Team Robuzzz", leaderName: "Vaibhav Pandey" },
  { teamName: "RoboForge", leaderName: "Anuj Mishra" },

  // Page 3: 04:00pm - 05:00pm
  { teamName: "Robowarriors", leaderName: "ASHUTOSH GUPTA" },
  { teamName: "MAAK", leaderName: "Ayush Paswan" },
  { teamName: "DRoNA", leaderName: "Abhist Shukla" },
  { teamName: "Team Byte Force", leaderName: "Aryan Chakrawarti" },
  { teamName: "Unseen Arrivals", leaderName: "Jayan Poddar" },
  { teamName: "MEECH NOVA -II", leaderName: "ANUPAM KUMAR" },
  { teamName: "MECH NOVA -II", leaderName: "ANUPAM KUMAR" },
  { teamName: "geome quad", leaderName: "Ansh Raj Srivastava" },
  { teamName: "ROBOCRUISE", leaderName: "Saksham singh" },
  { teamName: "Infinity robotics", leaderName: "Prafull Rai" },
  { teamName: "PHEONIX", leaderName: "SIDDHANT SRIVASTAVA" },
  { teamName: "THE KAMIKAZE", leaderName: "Devesh Tripathi" },
];

/**
 * Standardize string for fuzzy/normalized comparison
 */
function cleanStr(s?: string | null): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Checks if a team or its captain/members match the official qualified screening PDF.
 */
export function isTeamPdfQualified(
  teamName?: string | null,
  captainName?: string | null,
  members?: { name?: string | null }[] | null
): boolean {
  const cleanTeam = cleanStr(teamName);
  const cleanCap = cleanStr(captainName);
  const cleanMembers = (members || []).map((m) => cleanStr(m.name)).filter(Boolean);

  if (!cleanTeam && !cleanCap && cleanMembers.length === 0) return false;

  for (const entry of QUALIFIED_TEAMS_PDF) {
    const entryTeam = cleanStr(entry.teamName);
    const entryLead = cleanStr(entry.leaderName);

    // 1. Exact or Substring match on Team Name
    if (cleanTeam && entryTeam) {
      if (cleanTeam === entryTeam) return true;
      if (cleanTeam.includes(entryTeam) || entryTeam.includes(cleanTeam)) {
        // Double check length so we don't false positive on tiny strings
        if (cleanTeam.length >= 4 && entryTeam.length >= 4) return true;
      }
    }

    // 2. Exact or Substring match on Leader Name
    if (cleanCap && entryLead) {
      if (cleanCap === entryLead) return true;
      if (cleanCap.includes(entryLead) || entryLead.includes(cleanCap)) {
        if (cleanCap.length >= 4 && entryLead.length >= 4) return true;
      }
    }

    // 3. Match against any crew member
    if (entryLead) {
      for (const cm of cleanMembers) {
        if (cm === entryLead || (cm.length >= 4 && cm.includes(entryLead))) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Returns "qualified" if in PDF list, else "not_qualified" as the default screening status.
 */
export function getDefaultScreeningStatus(
  teamName?: string | null,
  captainName?: string | null,
  members?: { name?: string | null }[] | null
): "qualified" | "not_qualified" {
  return isTeamPdfQualified(teamName, captainName, members) ? "qualified" : "not_qualified";
}
