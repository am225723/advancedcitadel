import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/customSupabaseClient';

const AIPersona = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  const knightImage = "https://horizons-cdn.hostinger.com/bd26f60d-1cf1-4b75-9b1d-3616687e3cf7/24d4c7c61e522dfbaa9a58075bb87d15.png";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsLoading(true);
      const initialMessage = {
        role: 'assistant',
        content: `Greetings, ${user?.display_name || 'Ashen One'}. Your resolve shines brightly. How stands the fortress of your mind today? What trials or triumphs shall we speak of?`,
      };
      setTimeout(() => {
        setMessages([initialMessage]);
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, user, messages.length]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('perplexity-persona-chat', {
        body: {
          userContext: {
            level: user?.level,
            xp: user?.xp,
            displayName: user?.display_name,
            completedExercises: user?.completed_exercises,
          },
          messageHistory: [...messages, userMessage],
        },
      });

      if (error) throw error;
      
      // Remove citation numbers like [3][1] from AI responses
      const cleanedResponse = data.response ? data.response.replace(/\[\d+\]/g, '') : data.response;
      const assistantMessage = { role: 'assistant', content: cleanedResponse };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Error calling edge function:", error);
      toast({
        variant: "destructive",
        title: "The Knight is Silent",
        description: "Your message could not reach the ether. Please try again.",
      });
      const errorMessage = { role: 'assistant', content: "Hark, Undead. I am unable to channel my guidance at this moment. Rest at the bonfire and try again presently." };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-4 sm:right-8 w-[calc(100vw-2rem)] sm:w-96 h-[60vh] sm:h-[70vh] max-h-[600px] bg-dark-steel/80 backdrop-blur-xl border border-gold-accent/30 rounded-lg shadow-2xl shadow-black/50 z-50 flex flex-col"
          >
            <header className="flex items-center justify-between p-3 border-b border-slate-700 bg-black/20">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-gold-accent" />
                <h3 className="font-cinzel font-bold text-gradient-gold">Council with the Knight</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && <img src={knightImage} alt="Knight" className="w-10 h-10 rounded-full border-2 border-gold-accent/50 mt-1 flex-shrink-0" />}
                    <div className={`max-w-[80%] p-3 rounded-lg font-garamond text-base ${msg.role === 'user' ? 'bg-gold-accent/20 text-slate-200' : 'bg-slate-700/50 text-slate-300'}`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                 <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-center gap-3 my-4">
                    <img src={knightImage} alt="Knight" className="w-10 h-10 rounded-full border-2 border-gold-accent/50" />
                    <div className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                    </div>
                 </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 flex items-center gap-2 bg-black/20">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Speak your mind..."
                className="flex-grow bg-slate-800/50 border-slate-700 focus:border-gold-accent resize-none h-12"
                rows={1}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:right-8 z-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-dark-steel border-2 border-gold-accent/50 shadow-lg hover:shadow-gold-accent/20 transition-shadow duration-300"
      >
        <img src={knightImage} alt="AI Knight Persona" className="w-full h-full object-contain p-1" />
        <AnimatePresence>
        {!isOpen && (
            <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-blood-red rounded-full border-2 border-dark-steel animate-pulse"
            />
        )}
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default AIPersona;