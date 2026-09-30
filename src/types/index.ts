export interface NavItem {
  name: string;
  href: string;
}

export interface CityLocation {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  iconName: "building" | "flag" | "trophy" | "bot" | "wrench" | "vault" | "users";
  status?: string;
  statusType?: "live" | "open" | "soon" | "prize" | "closed";
  themeColor: "pink" | "orange" | "cyan" | "purple";
}
