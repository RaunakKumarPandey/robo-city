/**
 * Official Qualified Teams & Leaders list from the Screening Schedule PDF (Quiz & Kit buyers).
 * Only teams matching this list will be "qualified" by default. All other teams will be "not_qualified".
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
 * Standardize string for normalized comparison
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

  // Ignore probe / diagnostic test teams
  if (cleanTeam.includes("diagnostic") || cleanTeam.includes("probe") || cleanTeam.includes("test")) {
    return false;
  }

  for (const entry of QUALIFIED_TEAMS_PDF) {
    const entryTeam = cleanStr(entry.teamName);
    const entryLead = cleanStr(entry.leaderName);

    // 1. Exact Match on Team Name
    if (cleanTeam && entryTeam && cleanTeam === entryTeam) {
      return true;
    }

    // 2. Exact Match on Leader/Captain Name
    if (cleanCap && entryLead && cleanCap === entryLead) {
      return true;
    }

    // 3. Substring match with minimum length check to avoid accidental false positives
    if (cleanTeam && entryTeam && cleanTeam.length >= 5 && entryTeam.length >= 5) {
      if (cleanTeam.includes(entryTeam) || entryTeam.includes(cleanTeam)) {
        return true;
      }
    }

    if (cleanCap && entryLead && cleanCap.length >= 6 && entryLead.length >= 6) {
      if (cleanCap.includes(entryLead) || entryLead.includes(cleanCap)) {
        return true;
      }
    }

    // 4. Match against any crew member
    if (entryLead) {
      for (const cm of cleanMembers) {
        if (cm === entryLead || (cm.length >= 6 && cm.includes(entryLead))) {
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
