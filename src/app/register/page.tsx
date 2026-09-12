import { Metadata } from "next";
import RegisterForm from "@/components/registration/RegisterForm";

export const metadata: Metadata = {
  title: "Build Your Crew // Registration Desk | RoboVerse'26",
  description: "Register your 3-5 member robotics squad for RoboVerse'26 at IEEE Student Branch, MMMUT Gorakhpur. Free registration open now.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#07070F] pt-20 pb-20">
      <RegisterForm />
    </div>
  );
}
