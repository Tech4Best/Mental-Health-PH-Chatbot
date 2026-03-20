import { DisclaimerBanner } from "./components/chat/DisclaimerBanner";
import { ChatContainer } from "./components/chat/ChatContainer";

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-950">
      <DisclaimerBanner />
      <ChatContainer />
    </div>
  );
}
