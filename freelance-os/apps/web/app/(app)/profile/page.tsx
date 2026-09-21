"use client";

import { ProfileNav } from "@/components/profile/profile-nav";
import { PersonalInfoForm } from "@/components/profile/personal-info-form";

export default function ProfilePage() {
  return (
    <div className="w-full">
      <ProfileNav activeTab="personal" />
      <PersonalInfoForm />
    </div>
  );
}
