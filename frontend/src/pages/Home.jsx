import { useEffect, useState } from "react";
import AppRail from "@/components/layout/AppRail";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import WelcomeDashboard from "@/components/chat/WelcomeDashboard";

import { useNavigate } from "react-router-dom";
import { userApi, profileApi, messageApi } from "../lib/api";

export default function Home() {
  const [seed, setSeed] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false); 
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await userApi.contactList();


        if (response && Array.isArray(response.contacts)) {
          setSeed(response.contacts);
        } else {
          setSeed([]);
        }
      } catch (error) {
        console.log("Error retreiving contacts : ", error);
      }
    };

    fetchContacts();
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    const fetchData = async () => {
      try {
        const user = await profileApi.getProfile();
        const currentUserId = user.data?._id || user._id;

        const messageResponse = await messageApi.getMessage(currentUserId, activeId);
        if (messageResponse && Array.isArray(messageResponse.response)) {
          const mapped = messageResponse.response.map((m) => ({
            id: m._id,
            from: m.sender === currentUserId ? "me" : "them",
            text: m.content,
            time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
            read: m.status === "Seen"
          }));

          setMessages((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(mapped)) {
              return mapped;
            }
            return prev;
          });
        }

    
        const contactsResponse = await userApi.contactList();
        if (contactsResponse && Array.isArray(contactsResponse.contacts)) {
          setSeed(contactsResponse.contacts);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 3000); 

    return () => clearInterval(interval);
  }, [activeId]);


  const active = seed.find((c) => (c.id || c._id) === activeId);

  const select = (id) => {
    setActiveId(id);
    setMobileShowChat(true);
  };

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
            messages={messages}
            onBack={() => setMobileShowChat(false)}
          />
        ) : (
          <WelcomeDashboard onNewChat={() => navigate("/discover")} />
        )}
      </div>
    </div>
  );
}