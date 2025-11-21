import React, { useState, useEffect, useRef } from 'react';
import ForestCanvas from './components/ForestCanvas';
import { PixelCard, PixelButton, TypewriterText } from './components/PixelUI';
import { AmbientSound } from './components/AmbientSound';
import { initializeChat, sendMessageToGemini } from './services/geminiService';
import { Message, ViewState, TimeOfDay } from './types';

// SVGs for icons
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-500">
    <path fillRule="evenodd" d="M11.484 2.17a.75.75 0 011.032 0 11.209 11.209 0 007.877 3.08.75.75 0 01.722.515 12.74 12.74 0 01.635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 01-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.223-2.73.635-3.985a.75.75 0 01.722-.516 11.208 11.208 0 007.877-3.08zM12 6.972a9.704 9.704 0 00-3.95 1.638.75.75 0 11-.88-1.22 11.21 11.21 0 015.33-2.008c.42.03.75.39.75.81v5.161c0 .42.33.78.75.81a11.21 11.21 0 015.33 2.008.75.75 0 11-.88 1.22A9.704 9.704 0 0014.5 13.722V6.972z" clipRule="evenodd" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const SpeakerIcon = ({ muted }: { muted: boolean }) => (
  muted ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  )
);

const TimeIcon = ({ time }: { time: TimeOfDay }) => {
    if (time === TimeOfDay.MORNING) return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-200">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    );
    if (time === TimeOfDay.DAY) return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    );
    if (time === TimeOfDay.EVENING) return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500">
             <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
    );
    // NIGHT
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
             <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
    );
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('intro');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(TimeOfDay.DAY);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate Time of Day
  useEffect(() => {
    const updateTime = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) setTimeOfDay(TimeOfDay.MORNING);
        else if (hour >= 11 && hour < 17) setTimeOfDay(TimeOfDay.DAY);
        else if (hour >= 17 && hour < 20) setTimeOfDay(TimeOfDay.EVENING);
        else setTimeOfDay(TimeOfDay.NIGHT);
    };
    updateTime();
    // Check every minute
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initializer
  useEffect(() => {
    if (viewState === 'game' && messages.length === 0) {
      const startConversation = async () => {
        setIsLoading(true);
        try {
            initializeChat();
            
            // Dynamic Initial Greeting based on time
            let greeting = "How is your day going in the Stone Village?";
            if (timeOfDay === TimeOfDay.MORNING) greeting = "The birds are loud this morning. How did you sleep in the Stone Village?";
            if (timeOfDay === TimeOfDay.EVENING) greeting = "The sun is going down. Are you resting now in the Stone Village?";
            if (timeOfDay === TimeOfDay.NIGHT) greeting = "The forest is dark and the moon is watching. Why are you awake in the Stone Village?";

            const initialGreeting: Message = {
                id: 'init',
                sender: 'awa',
                text: `Tiló! I am just resting here by the trees. ${greeting}`,
                timestamp: new Date()
            };
            setMessages([initialGreeting]);
        } catch (e) {
            console.error("Failed to init chat", e);
        } finally {
            setIsLoading(false);
        }
      };
      startConversation();
    }
  }, [viewState, messages.length, timeOfDay]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Inject time context for the AI, but user doesn't see it
      const contextPrompt = `[CONTEXT: It is currently ${timeOfDay} in the forest. React to the time if relevant (light, temperature, tiredness).] ${userMsg.text}`;
      const responseText = await sendMessageToGemini(contextPrompt);
      
      const awaMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'awa',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, awaMsg]);
    } catch (error) {
      console.error("Error getting response", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const enterTutorial = () => {
      setViewState('tutorial');
      setIsAudioEnabled(true);
  };

  const enterGame = () => {
      setViewState('game');
  };

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-emerald-950">
      {/* Procedural Background & Audio */}
      <ForestCanvas timeOfDay={timeOfDay} />
      <AmbientSound enabled={isAudioEnabled} volume={0.8} />

      {/* Audio Toggle */}
      {viewState !== 'intro' && (
        <div className="fixed top-4 right-4 z-50">
            <PixelButton 
                variant="secondary"
                className="!p-2 !rounded-full min-w-[40px]"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            >
                <SpeakerIcon muted={!isAudioEnabled} />
            </PixelButton>
        </div>
      )}

      {/* --- INTRO SCREEN --- */}
      {viewState === 'intro' && (
        <div className="z-10 w-full h-full flex items-center justify-center p-8">
          <div className="max-w-2xl w-full flex flex-col items-center text-center space-y-8 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-emerald-200 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
              AWÁ WHISPERS
            </h1>
            
            <PixelCard className="bg-emerald-900/90 text-lg md:text-xl border-emerald-700 text-emerald-100">
              <p className="mb-4">
                An alternative narrative. A conversation across worlds.
              </p>
              <p className="text-emerald-300/80 text-sm">
                Connect with a resident of the Amazon. Speak of your daily life, your "cold boxes" and "electric nets", and listen to the wisdom of the forest.
              </p>
            </PixelCard>

            <PixelButton 
              onClick={enterTutorial} 
              className="text-2xl px-12 py-6 animate-pulse"
            >
              ENTER THE FOREST
            </PixelButton>
            
            <p className="text-xs text-emerald-600 mt-8">
               Powered by Google Gemini
            </p>
          </div>
        </div>
      )}

      {/* --- TUTORIAL SCREEN --- */}
      {viewState === 'tutorial' && (
        <div className="z-10 w-full h-full flex items-center justify-center p-8 bg-emerald-950/50 backdrop-blur-sm">
            <div className="max-w-xl w-full flex flex-col space-y-6">
                <PixelCard className="bg-[#eecfa1] border-[#5d4037] text-[#3e2723]">
                    <h2 className="text-3xl font-bold mb-4 border-b-4 border-[#5d4037] pb-2">HOW TO SPEAK</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                        <p>
                            <span className="font-bold">Chat to a friend you've never met.</span> Bring your worries, your joys, and your confusion about your daily life.
                        </p>
                        <p>
                            <span className="font-bold">Be honest.</span> No need to pretend. The forest accepts you, even if you smell of the city.
                        </p>
                        <p>
                            <span className="font-bold">Listen.</span> You are talking to a spirit that has lived here since the beginning of history. Ask them: <span className="italic">What could life have been?</span>
                        </p>
                    </div>
                </PixelCard>
                
                <div className="flex justify-center pt-4">
                    <PixelButton onClick={enterGame} className="text-xl px-10 py-4 w-full md:w-auto">
                        BEGIN JOURNEY
                    </PixelButton>
                </div>
            </div>
        </div>
      )}

      {/* --- GAME SCREEN --- */}
      {viewState === 'game' && (
        <>
            {/* Header */}
            <div className="z-30 p-4 flex justify-between items-center bg-emerald-950/80 border-b-4 border-emerald-900 backdrop-blur-sm shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-800 border-2 border-emerald-600 flex items-center justify-center shrink-0">
                        <LeafIcon />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl leading-none text-emerald-100">AWÁ RESIDENT</h2>
                            <div className="relative group">
                                <button className="text-emerald-500 hover:text-emerald-300 transition-colors p-1">
                                    <InfoIcon />
                                </button>
                                {/* Hover Card */}
                                <div className="absolute left-0 top-full mt-2 w-72 p-4 bg-[#eecfa1] border-4 border-[#5d4037] text-[#3e2723] text-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 rounded-none">
                                    <h4 className="font-bold mb-2 uppercase border-b-2 border-[#5d4037] pb-1">The Awá People</h4>
                                    <p className="leading-snug">
                                        The Awá are an indigenous people of Brazil living in the Amazon rainforest. Often called the "Earth's most threatened tribe," they are nomadic hunter-gatherers known for their deep spiritual connection to the forest and for adopting orphaned animals as family members.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-emerald-400 uppercase tracking-wider block">Connected to the Earth</span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-6 mr-12">
                     <div className="text-right">
                        <p className="text-xs text-emerald-500">TIME</p>
                        <div className="flex justify-end mt-1">
                            <TimeIcon time={timeOfDay} />
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-emerald-500">STATUS</p>
                        <p className="text-sm text-emerald-200">LISTENING</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="z-10 flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`
                            relative p-4 md:p-6 text-lg border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]
                            ${msg.sender === 'user' 
                                ? 'bg-slate-200 border-slate-800 text-slate-900 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl' 
                                : 'bg-[#eecfa1] border-[#5d4037] text-[#3e2723] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'
                            }
                        `}>
                            {msg.sender === 'awa' ? (
                            <TypewriterText text={msg.text} speed={20} />
                            ) : (
                                msg.text
                            )}
                        </div>
                        <span className="text-xs text-emerald-400/60 mt-2 px-1">
                            {msg.sender === 'user' ? 'YOU' : 'AWÁ'} • {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start w-full animate-pulse">
                        <div className="bg-[#eecfa1] border-4 border-[#5d4037] p-4 text-[#3e2723]">
                            ... The forest is whispering ...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="z-20 p-4 bg-emerald-950/90 border-t-4 border-emerald-900">
                <div className="max-w-5xl mx-auto flex gap-4">
                <div className="flex-1 relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Speak to the forest..."
                        className="w-full h-14 md:h-16 bg-emerald-900/50 border-4 border-emerald-700 text-emerald-100 p-4 focus:outline-none focus:border-emerald-400 resize-none placeholder-emerald-700 text-xl shadow-inner"
                    />
                </div>
                <PixelButton 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    className={`h-14 md:h-16 flex items-center justify-center w-20 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <SendIcon />
                </PixelButton>
                </div>
                <div className="text-center mt-2 text-xs text-emerald-600">
                    Press Enter to send
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default App;