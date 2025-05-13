import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { ChartNoAxesColumn, History } from "lucide-react";

export default function FloatingDockMenu() {

    const links = [
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

      ];
      return (
        <div className="flex items-center justify-center h-[35rem] w-full">
          <FloatingDock
            items={links}
          />
        </div>
      );

}
