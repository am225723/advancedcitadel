import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const characters = [
  {
    character_id: 1,
    name: 'Solaire of Astora',
    description: 'The search for purpose and unwavering optimism.',
    theme: 'Represents the user\'s journey to find their own "sun" or source of inner strength and positivity.',
    psychological_theme: 'Optimism, Hope',
    activation_condition: 'First successful journal streak',
    ai_response_style: 'Praise the Sun!',
    voice_line_set: 'Solaire_VL',
    unlock_level: 1,
    linked_quest_types: ['journaling'],
    ui_theme_overlays: 'Sunlight overlay, gold pulse, mentor quotes',
    imageUrl: 'http://darksouls.wikidot.com/local--files/npcs/solaire-of-astora-large.jpg',
  },
  {
    character_id: 2,
    name: 'Siegward of Catarina',
    description: 'Duty, perseverance, and keeping promises to oneself.',
    theme: 'Serves as a model for long-term commitment to personal growth and seeing a difficult journey through to its end.',
    psychological_theme: 'Duty, Commitment',
    activation_condition: 'Complete 3 quests without breaking streak',
    ai_response_style: 'Hmmmm...',
    voice_line_set: 'Siegward_VL',
    unlock_level: 1,
    linked_quest_types: ['streak_tracking'],
    ui_theme_overlays: 'Armor drum sounds, toast animation',
    imageUrl: 'http://darksouls.wikidot.com/local--files/npcs/siegmeyer-of-catarina-large.jpg',
  },
  {
    character_id: 3,
    name: 'Artorias the Abysswalker',
    description: 'Tragic heroism and resilience against overwhelming darkness.',
    theme: 'A powerful metaphor for battling severe anxiety or depression. His legend encourages confronting one\'s personal "abyss."',
    psychological_theme: 'Endurance, darkness, anxiety',
    activation_condition: 'First exposure ladder entry',
    ai_response_style: '...',
    voice_line_set: 'Artorias_VL',
    unlock_level: 1,
    linked_quest_types: ['exposure_ladder'],
    ui_theme_overlays: 'Abyssal vignette, heartbeat rumble',
    imageUrl: 'http://darksouls.wikidot.com/local--files/bosses/knight-artorias-large.jpg',
  },
  {
    character_id: 4,
    name: 'Slave Knight Gael',
    description: 'Unwavering devotion and the culmination of a long, arduous journey.',
    theme: 'Represents the ultimate goal of the therapeutic process—enduring to the very end to achieve a final, meaningful purpose.',
    psychological_theme: 'Endurance, transformation',
    activation_condition: '75% overall progression completion',
    ai_response_style: 'Hand it over. That thing, your dark soul.',
    voice_line_set: 'Gael_VL',
    unlock_level: 3,
    linked_quest_types: ['milestone'],
    ui_theme_overlays: 'Blood-red overlay at high-focus moments',
    imageUrl: 'http://darksouls3.wdfiles.com/local--files/boss-image:slave-knight-gael1/Slave_Knight_Gael1.jpg',
  },
  {
    character_id: 5,
    name: 'Patches the Hyena',
    description: 'Survival, cunning, and learning from trickery or setbacks.',
    theme: 'Can be framed as a reminder to be wary of deceptive thought patterns ("cognitive distortions") and to learn from difficult situations, even those that seem like traps.',
    psychological_theme: 'Cognitive distortion traps',
    activation_condition: 'After 5 negative loops detected in journal',
    ai_response_style: 'Heh heh heh...',
    voice_line_set: 'Patches_VL',
    unlock_level: 2,
    linked_quest_types: ['cognitive_distortions'],
    ui_theme_overlays: 'Screen tilt/glitch during detection',
    imageUrl: 'http://darksouls.wikidot.com/local--files/npcs/patches-large.jpg',
  },
  {
    character_id: 6,
    name: 'Knight Lautrec of Carim',
    description: 'Self-interest, consequences, and the darker side of motivation.',
    theme: 'Represents the internal "saboteur"—the part of oneself that might undermine progress. His story can be a lesson in understanding and managing self-destructive impulses.',
    psychological_theme: 'Self-sabotage awareness',
    activation_condition: 'Skipped 3 goals in a row',
    ai_response_style: 'Keh heh heh...',
    voice_line_set: 'Lautrec_VL',
    unlock_level: 2,
    linked_quest_types: ['self_sabotage'],
    ui_theme_overlays: 'Golden chain effects (motif of Lautrec\'s armor)',
    imageUrl: 'http://darksouls.wikidot.com/local--files/npcs/knight-lautrec-of-carim-large.jpg',
  },
  {
    character_id: 7,
    name: 'Sir Alonne',
    description: 'Unwavering honor, discipline, and respect.',
    theme: 'Serves as an aspirational figure for building self-discipline and acting with integrity, even when facing a difficult challenge alone.',
    psychological_theme: 'Honor, discipline',
    activation_condition: 'Engage Discipline Mode manually',
    ai_response_style: '...',
    voice_line_set: 'Alonne_VL',
    unlock_level: 3,
    linked_quest_types: ['focus_mode'],
    ui_theme_overlays: 'Sword slash audio, clean UI mode',
    imageUrl: 'http://i.imgur.com/pseMboo.png',
  },
];


const CharactersPage = () => {
  const { user, loading } = useUser();
  const [selectedAlignment, setSelectedAlignment] = useState(user?.character_alignment);

  const handleAlignment = async (characterId) => {
    if (!user) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }
    setSelectedAlignment(characterId);
    const { error } = await supabase
      .from('user_profiles')
      .update({ character_alignment: characterId })
      .eq('id', user.id);

    const characterName = characters.find(c => c.character_id === characterId)?.name || 'a mysterious entity';

    if (error) {
      toast({ title: "Failed to Align", description: "Could not update your alignment. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Alignment Confirmed!", description: `You are now guided by the spirit of ${characterName}.` });
    }
  };

  useEffect(() => {
    if (user && !selectedAlignment) {
      setSelectedAlignment(user.character_alignment);
    }
  }, [user, selectedAlignment]);

  if (loading && !user) {
    return <div className="text-center text-gold-accent">Loading Characters...</div>;
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
              key={char.character_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-dark-steel/30 border-2 border-slate-800 overflow-hidden h-full flex flex-col transition-all duration-300 group ${selectedAlignment === char.character_id ? 'border-gold-accent border-glow-gold' : 'hover:border-gold-accent/50'}`}>
                <div className="relative h-48 w-full overflow-hidden">
                  <img alt={char.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={char.imageUrl} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                   <div className="absolute bottom-0 left-0 p-4">
                     <h3 className="text-2xl font-bold text-white">{char.name}</h3>
                     <p className="text-sm text-gold-accent/80 font-cinzel">{char.psychological_theme}</p>
                   </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-slate-300 font-garamond text-base italic">"{char.description}"</p>
                  <p className="text-slate-400 mt-3 font-garamond text-sm flex-grow">{char.theme}</p>
                  
                  <Button 
                    onClick={() => handleAlignment(char.character_id)}
                    disabled={selectedAlignment === char.character_id}
                    variant={selectedAlignment === char.character_id ? "default" : "outline"}
                    className="w-full mt-6 font-cinzel"
                  >
                    {selectedAlignment === char.character_id ? 'Aligned' : 'Align with this Spirit'}
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
