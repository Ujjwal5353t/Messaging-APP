import { useState } from "react";
import AppRail from "@/components/layout/AppRail";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import WelcomeDashboard from "@/components/chat/WelcomeDashboard";
import { conversations as seed, messagesByConversation } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [activeId, setActiveId] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const navigate = useNavigate();

  const active = seed.find((c) => c.id === activeId);

  const select = (id) => { setActiveId(id); setMobileShowChat(true); };

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden">
      <AppRail />

      {/* Conversation list — hidden on mobile when chat open */}
      <div className={mobileShowChat ? "hidden md:flex" : "flex flex-1 md:flex-initial"}>
        <ConversationList
          conversations={seed}
          activeId={activeId}
          onSelect={select}
          onNewChat={() => navigate("/discover")}
        />
      </div>

      {/* Main area */}
      <div className={`flex-1 min-w-0 ${!mobileShowChat ? "hidden md:flex" : "flex"}`}>
        {active ? (
          <ChatWindow
            conversation={active}
            messages={messagesByConversation[active.id] || []}
            onBack={() => setMobileShowChat(false)}
          />
        ) : (
          <WelcomeDashboard onNewChat={() => navigate("/discover")} />
        )}
      </div>
    </div>
  );
}
