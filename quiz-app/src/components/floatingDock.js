"use client";

import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { ChartNoAxesColumn, History, LibraryBig, LogOut } from "lucide-react";
import { isUserLoggedIn } from "@/app/globalVariables";

export default function FloatingDockMenu() {

    const links = [
        {
          title: "Quiz",
          icon: (
            <LibraryBig></LibraryBig>
          ),
          href: "/",
        },
    
        {
          title: "History",
          icon: (
            <History />
          ),
          href: "/historyStats",
        },
     
        {
          title: "Statistics",
          icon: (
            <ChartNoAxesColumn />
          ),
          href: "/stats",
        },

          {
          title: "Logout",
          icon: (
            <LogOut />
          ),
          href: "/logout",
        },

      ];
      return (
        <div className="flex items-center justify-center mt-20 mb-10">
          <FloatingDock
            items={links}
          />
        </div>
      );

}
