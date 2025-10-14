import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, Shield, Star, Skull } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const characters = [
  {
    name: 'Solaire of Astora',
    game: 'Dark Souls',
    description: 'The search for purpose and unwavering optimism.',
    stats: { Strength: 7, Resolve: 9, Tragedy: 6 },
    theme: 'Represents the user\'s journey to find their own "sun" or source of inner strength and positivity.',
    imageName: 'knight-in-sunlight'
  },
  {
    name: 'Siegward of Catarina',
    game: 'Dark Souls 3',
    description: 'Duty, perseverance, and keeping promises to oneself.',
    stats: { Strength: 8, Resolve: 7, Tragedy: 7 },
    theme: 'Serves as a model for long-term commitment to personal growth and seeing a difficult journey through to its end.',
    imageName: 'onion-knight-sitting'
  },
  {
    name: 'Artorias the Abysswalker',
    game: 'Dark Souls',
    description: 'Tragic heroism and resilience against overwhelming darkness.',
    stats: { Strength: 10, Resolve: 8, Tragedy: 10 },
    theme: 'A powerful metaphor for battling severe anxiety or depression. His legend encourages confronting one\'s personal "abyss."',
    imageName: 'wolf-knight-in-darkness'
  },
  {
    name: 'Slave Knight Gael',
    game: 'Dark Souls 3',
    description: 'Unwavering devotion and the culmination of a long, arduous journey.',
    stats: { Strength: 9, Resolve: 10, Tragedy: 9 },
    theme: 'Represents the ultimate goal of the therapeutic process—enduring to the very end to achieve a final, meaningful purpose.',
    imageName: 'red-hooded-knight-in-wasteland'
  },
  {
    name: 'Patches the Hyena',
    game: 'Dark Souls Series',
    description: 'Survival, cunning, and learning from trickery or setbacks.',
    stats: { Strength: 5, Resolve: 4, Tragedy: 4 },
    theme: 'A reminder to be wary of deceptive thought patterns ("cognitive distortions") and to learn from difficult situations.',
    imageName: 'crouching-figure-in-cave'
  },
  {
    name: 'Knight Lautrec of Carim',
    game: 'Dark Souls',
    description: 'Self-interest, consequences, and the darker side of motivation.',
    stats: { Strength: 7, Resolve: 5, Tragedy: 8 },
    theme: 'Represents the internal "saboteur"—the part of oneself that might undermine progress. A lesson in managing self-destructive impulses.',
    imageName: 'golden-armored-knight'
  },
  {
    name: 'Sir Alonne',
    game: 'Dark Souls 2',
    description: 'Unwavering honor, discipline, and respect.',
    stats: { Strength: 9, Resolve: 9, Tragedy: 7 },
    theme: 'An aspirational figure for building self-discipline and acting with integrity, even when facing a difficult challenge alone.',
    imageName: 'samurai-knight-in-throne-room'
  },
];


const CharactersPage = () => {
  const { user, loading } = useUser();
  const [selectedAlignment, setSelectedAlignment] = useState(user?.character_alignment);

  const handleAlignment = async (characterName) => {
    if (!user) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }
    setSelectedAlignment(characterName);
    const { error } = await supabase
      .from('user_profiles')
      .update({ character_alignment: characterName })
      .eq('id', user.id);

    if (error) {
      toast({ title: "Failed to Align", description: "Could not update your alignment. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Alignment Confirmed!", description: `You are now guided by the spirit of ${characterName}.` });
    }
  };

  if (loading && !user) {
    return <div className="text-center text-gold-accent">Loading Characters...</div>;
  }
  
  if(!selectedAlignment && user) {
    setSelectedAlignment(user.character_alignment);
  }

  return (
    <>
      <Helmet>
        <title>Hall of Characters - The Citadel</title>
        <meta name="description" content="Learn from the legends of fallen kingdoms and choose your guide." />
      </Helmet>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <Users className="w-12 h-12 text-gold-accent" />
            <h1 className="text-4xl font-bold text-gradient-gold">Hall of Characters</h1>
          </div>
          <p className="text-xl text-slate-400 font-garamond">Draw strength from those who walked the path before you.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {characters.map((char, index) => (
            <motion.div
              key={char.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-dark-steel/30 border-2 border-slate-800 overflow-hidden h-full flex flex-col transition-all duration-300 group ${selectedAlignment === char.name ? 'border-gold-accent border-glow-gold' : 'hover:border-gold-accent/50'}`}>
                <div className="relative h-48 w-full overflow-hidden">
                  <img alt={char.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                   <div className="absolute bottom-0 left-0 p-4">
                     <h3 className="text-2xl font-bold text-white">{char.name}</h3>
                     <p className="text-sm text-gold-accent/80 font-cinzel">{char.game}</p>
                   </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-slate-300 font-garamond text-base italic">"{char.description}"</p>
                  <p className="text-slate-400 mt-3 font-garamond text-sm flex-grow">{char.theme}</p>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center"><span className="flex items-center"><Shield className="w-4 h-4 mr-2 text-red-500"/>Strength</span> <span className="font-bold">{char.stats.Strength}/10</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center"><Star className="w-4 h-4 mr-2 text-yellow-500"/>Resolve</span> <span className="font-bold">{char.stats.Resolve}/10</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center"><Skull className="w-4 h-4 mr-2 text-slate-500"/>Tragedy</span> <span className="font-bold">{char.stats.Tragedy}/10</span></div>
                  </div>

                  <Button 
                    onClick={() => handleAlignment(char.name)}
                    disabled={selectedAlignment === char.name}
                    variant={selectedAlignment === char.name ? "default" : "outline"}
                    className="w-full mt-6 font-cinzel"
                  >
                    {selectedAlignment === char.name ? 'Aligned' : 'Align with this Spirit'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CharactersPage;