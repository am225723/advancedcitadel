// src/lib/meditationConfig.js
// Character-voiced meditation scripts aligned with therapeutic themes

export const MEDITATIONS = {
  solaire_sun: {
    id: 'solaire_sun',
    guideId: 'solaire',
    title: 'Finding Your Sun',
    subtitle: 'A Meditation on Self-Compassion and Inner Light',
    theme: 'Loving-kindness and identifying personal strengths',
    therapeuticFocus: 'Positive Psychology, Self-Compassion, Behavioral Activation',
    duration: 480, // 8 minutes in seconds
    unlockLevel: 1,
    xpReward: 25,
    moodBuffDuration: 14400, // 4 hours in seconds
    moodBuffType: 'confidence',
    recommendedFor: ['anxiety', 'hopelessness', 'low self-worth', 'despair'],
    script: `
Welcome, friend. I am Solaire of Astora, and I am here to walk with you on this journey inward.

Find a comfortable position... whether sitting or lying down. Allow your eyes to gently close... or soften your gaze toward the ground.

[pause]

Take a deep breath in... and slowly release it. Let the weight of the day begin to settle.

[pause]

You have been through many battles, haven't you? Some visible to others... many fought in silence, within the fortress of your own mind. I see you, warrior. And I want you to know... you are not alone in this.

[pause]

Now... bring your attention to your breath. Notice the rise and fall of your chest... the coolness of air entering your nose... the warmth as it leaves.

[pause]

With each breath, imagine a warm, golden light beginning to glow softly in your chest. This is your sun... your inner light. It has always been there, even when clouds obscured it.

[pause]

Breathe in... and let that light grow a little brighter. Breathe out... and let it radiate outward, warming your body from within.

[pause]

Now, I want you to think of one small thing you did today that took courage. Perhaps you got out of bed when it felt impossible. Perhaps you reached out to someone. Perhaps you simply endured.

[pause]

Whatever it was... no matter how small it seems... acknowledge it now. Say to yourself, silently or aloud: "I did that. And it mattered."

[pause]

Let that golden light in your chest pulse gently with each acknowledgment of your strength. You are stronger than you know.

[pause]

If harsh thoughts arise... if you hear a voice telling you that you are not enough... simply notice it. Do not battle it. Instead, imagine my voice, steady and warm, saying: "That is not the truth. You are here. You are trying. That is enough."

[pause]

Now, bring to mind someone or something you care about. It could be a person, a pet, a place, or even a small moment of beauty you witnessed.

[pause]

Feel the warmth in your chest as you think of them. Notice how your sun glows brighter when you connect with what matters to you.

[pause]

This light... this warmth... is your purpose. It is why you continue forward, even through the dark. Your sun is not outside of you, waiting to be found. It is already within you... glowing steadily, even in your hardest moments.

[pause]

Take three deep breaths now. With each exhale, let the golden light expand further... filling your arms, your legs, your entire body.

[long pause]

You are radiant, my friend. Not because you are perfect... but because you are here, seeking your own light. That is the mark of true courage.

[pause]

As we come to the end of this meditation, know that you can return to this inner sun whenever you need it. It is yours. Always.

[pause]

Gently wiggle your fingers and toes. When you are ready... open your eyes.

[pause]

Praise the sun, friend. And praise yourself... for you are worthy of your own compassion.
    `.trim(),
  },

  siegward_respite: {
    id: 'siegward_respite',
    guideId: 'siegward',
    title: 'A Moment\'s Respite',
    subtitle: 'A Meditation on Rest and Savoring Peace',
    theme: 'Mindfulness and the importance of rest',
    therapeuticFocus: 'Mindfulness, Self-Compassion, Present-Moment Awareness',
    duration: 420, // 7 minutes in seconds
    unlockLevel: 1,
    xpReward: 25,
    moodBuffDuration: 14400,
    moodBuffType: 'calm',
    recommendedFor: ['stress', 'overwhelm', 'burnout', 'restlessness', 'racing thoughts'],
    script: `
Hmm... mmm... ah, there you are. It's me, Siegward of Catarina. Settle in, friend. You've earned a rest.

[pause]

Find yourself a comfortable seat... or lie down if you prefer. Let your body relax, as if you've just removed a heavy suit of armor after a long day.

[pause]

Take a slow breath in through your nose... and out through your mouth. Again... in... and out.

[pause]

You know, in my many travels, I've learned that rest is not a luxury. It is a necessity. Even the mightiest knights must pause... must catch their breath... must sit by the fire and simply be.

[pause]

So let us do that now, together. Let us simply... be.

[pause]

Bring your attention to your body. Notice where you feel tension. Is it in your shoulders? Your jaw? Your stomach? Simply observe it... no need to fix it just yet.

[pause]

Now, imagine that with each breath out, you're releasing just a little bit of that tension. Like steam escaping from a pot of Siegbrau... slow and steady.

[pause]

Breathe in... peace. Breathe out... tension.

[pause]

Breathe in... rest. Breathe out... worry.

[pause]

You do not have to solve every problem right now. You do not have to be "productive" in this moment. You are allowed to just... exist. To rest. To be still.

[pause]

Now, I want you to notice three things you can hear. Perhaps it's the hum of the room... distant sounds outside... or even the rhythm of your own breath. Just notice them... without judgment.

[pause]

Good. Now, notice three things you can feel. The surface beneath you... the air on your skin... the weight of your body.

[pause]

This is the present moment. Not yesterday with its regrets... not tomorrow with its worries. Just... now. And in this moment, you are safe.

[pause]

If your mind wanders to your to-do list, gently bring it back. Imagine me, sitting beside you with a warm mug of Siegbrau, saying: "That can wait, friend. For now... we rest."

[pause]

Think of one small, pleasant thing you experienced today. Perhaps the warmth of a drink... a kind word... a moment of sunlight. It doesn't have to be grand.

[pause]

Let yourself savor that memory now... like taking a slow sip of something warm and comforting. Notice the small joys. They are always there... waiting to be noticed.

[pause]

Take three more deep breaths. With each one, feel yourself sinking a little deeper into this moment... into this rest.

[long pause]

Remember, my friend: taking a break is not giving up. It is preparing to continue. Even the finest blade must be sheathed and cared for.

[pause]

You are doing well. Better than you think.

[pause]

When you're ready... gently open your eyes. Carry this sense of calm with you. And remember... you are always allowed to rest.

[pause]

Hmm... mmm... until we meet again, friend.
    `.trim(),
  },

  artorias_abyss: {
    id: 'artorias_abyss',
    guideId: 'artorias',
    title: 'Facing the Abyss',
    subtitle: 'A Meditation on Accepting Difficult Emotions',
    theme: 'Acknowledging darkness without being consumed',
    therapeuticFocus: 'Radical Acceptance, Emotion Regulation, Trauma-Informed Care',
    duration: 540, // 9 minutes in seconds
    unlockLevel: 2,
    xpReward: 30,
    moodBuffDuration: 14400,
    moodBuffType: 'resilience',
    recommendedFor: ['depression', 'trauma', 'grief', 'anger', 'fear', 'emotional numbness'],
    script: `
I am Artorias... knight of Gwyn, walker of the Abyss. I know the darkness well. And I am here to walk beside you as you face your own.

[pause]

Settle into a position that feels stable. Ground your feet on the floor, or feel the support beneath you. You are anchored. You are safe.

[pause]

Close your eyes, if you feel comfortable doing so. Breathe in... and out.

[pause]

There is a darkness within you. You know it well. Perhaps it is grief... or rage... or a fear so deep it has no name. You have been trying to keep it at bay, haven't you?

[pause]

Today, we will not run from it. We will not fight it. We will simply... acknowledge it.

[pause]

Take a deep breath. And as you exhale, allow yourself to feel whatever emotion is present. Do not push it away. Do not judge it. Simply let it exist.

[pause]

If it is sadness, let it rise like a dark tide. If it is anger, let it smolder like embers. If it is fear, let it whisper at the edges. You do not have to act on it. You only have to witness it.

[pause]

I have stood at the edge of the Abyss. I have felt its pull. And I learned this truth: the darkness cannot consume you if you do not resist it. When you stop fighting... it loses its power to control you.

[pause]

Imagine this emotion as a shadow standing before you. It is formidable, yes. But it is not you. You are the one observing it. You are separate from it.

[pause]

Say to the shadow: "I see you. I acknowledge you. But you do not define me."

[pause]

Breathe in deeply... and as you exhale, imagine the shadow softening just slightly. Not disappearing... but becoming less solid. Less threatening.

[pause]

You are allowed to feel pain. You are allowed to carry scars. They are proof that you have survived battles others cannot see. They are marks of your strength, not your weakness.

[pause]

Now, bring your attention to your body. Notice where you feel this emotion physically. Is it a tightness in your chest? A heaviness in your stomach? A tension in your throat?

[pause]

Place a hand there, if you wish. And breathe into that space. Imagine your breath as a gentle light, not trying to erase the darkness... but holding it with compassion.

[pause]

You do not have to be okay. You do not have to "fix" this. You only have to endure. And you are already doing that.

[pause]

If tears come, let them fall. If rage stirs, let it move through you like a storm. Emotions are not permanent. They rise, they peak, and they pass... like waves.

[pause]

Take five slow breaths now. With each exhale, imagine releasing just a little bit of the weight. Not all of it... just what you can bear to let go of in this moment.

[long pause]

You have faced the Abyss today. And you have not been consumed. That is a victory, warrior. Do not underestimate it.

[pause]

The darkness may return. It often does. But you now know this: you can stand in its presence and not be destroyed. You are stronger than the void.

[pause]

Gently bring your awareness back to the room. Feel the ground beneath you. Wiggle your fingers and toes.

[pause]

When you open your eyes, know this: you have walked with Artorias today. And like me, you will continue to rise... again and again.

[pause]

Until we meet again, Abysswalker.
    `.trim(),
  },

  alonne_honor: {
    id: 'alonne_honor',
    guideId: 'alonne',
    title: 'The Honorable Path',
    subtitle: 'A Meditation on Values and Self-Discipline',
    theme: 'Aligning actions with personal values',
    therapeuticFocus: 'Values-Based Action, Self-Discipline, Integrity',
    duration: 450, // 7.5 minutes in seconds
    unlockLevel: 2,
    xpReward: 30,
    moodBuffDuration: 14400,
    moodBuffType: 'focus',
    recommendedFor: ['lack of direction', 'guilt', 'shame', 'procrastination', 'self-betrayal'],
    script: `
I am Sir Alonne, knight of honor and discipline. I greet you, warrior. Today, we sharpen not your blade... but your resolve.

[pause]

Sit with dignity. Spine straight but not rigid. Hands resting comfortably. Eyes closed or cast downward.

[pause]

Breathe in through your nose, slowly and deliberately. Hold for a moment. Then exhale completely. Do this three times.

[long pause]

Discipline is not cruelty. It is not self-punishment. True discipline is the practice of aligning your actions with your deepest values... of becoming who you wish to be.

[pause]

Now, I ask you: What do you value most? Not what others expect of you... but what matters to you in your soul. Is it kindness? Courage? Creativity? Loyalty?

[pause]

Choose one value that resonates deeply right now. Hold it in your mind like a blade held at the ready.

[pause]

Ask yourself: In my recent actions... have I honored this value? Or have I strayed from the path?

[pause]

If you have strayed, do not meet this realization with shame. A warrior who admits their misstep is stronger than one who pretends perfection. Acknowledge it clearly.

[pause]

Now, imagine your future self... the version of you who lives in full alignment with this value. How do they walk? How do they speak? What choices do they make when faced with difficulty?

[pause]

That version of you is not a fantasy. It is a possibility. And every small choice you make is a step toward or away from them.

[pause]

Think of one small action you can take today... just one... that would honor your chosen value. It need not be grand. Perhaps it is speaking truthfully when you would normally stay silent. Perhaps it is resting when you would normally push through pain.

[pause]

Visualize yourself taking that action. See it clearly. Feel the integrity of it in your chest.

[pause]

Now, breathe in strength. Breathe out doubt.

[pause]

Breathe in clarity. Breathe out distraction.

[pause]

You are not perfect. No one is. But you can be intentional. You can choose honor, one moment at a time.

[pause]

If you have made mistakes... if you have hurt yourself or others through your actions... this is your opportunity to choose differently. Not through self-flagellation... but through recommitment.

[pause]

Place a hand over your heart. Feel it beating steadily. That heartbeat is a reminder: you are still here. You still have the chance to live with integrity.

[pause]

Repeat after me, silently or aloud: "I choose to honor my values. I choose to act with intention. I choose the path of discipline... not as punishment, but as reverence for who I am becoming."

[pause]

Take three final breaths. With each one, feel your resolve solidifying... like steel tempered in flame.

[long pause]

Remember, warrior: the honorable path is not the easy one. But it is the one that leads to true peace.

[pause]

Gently return to the present. Open your eyes when you are ready.

[pause]

Walk forward with purpose, my friend. You carry the blade of your own integrity. Wield it well.
    `.trim(),
  },

  patches_traps: {
    id: 'patches_traps',
    guideId: 'patches',
    title: 'Spotting the Traps',
    subtitle: 'A Meditation on Cognitive Distortions',
    theme: 'Identifying and disengaging from mental traps',
    therapeuticFocus: 'Cognitive Distortion Identification, Cognitive Defusion, Mindfulness',
    duration: 390, // 6.5 minutes in seconds
    unlockLevel: 3,
    xpReward: 30,
    moodBuffDuration: 14400,
    moodBuffType: 'clarity',
    recommendedFor: ['catastrophizing', 'black-and-white thinking', 'mind reading', 'rumination'],
    script: `
Well, well, well... look who's here. Patches, at your service. Now don't give me that look. I know what you're thinking. "Can I trust this one?" Smart question.

[pause]

But here's the thing, friend. I know traps. I've set 'em, I've spotted 'em, and I've fallen into plenty myself. And today? I'm gonna teach you how to see the ones you're setting for yourself.

[pause]

Get comfortable. Close your eyes if you'd like, but keep your wits about you. Deep breath in... and out.

[pause]

Your mind is a clever thing, isn't it? Too clever, sometimes. It likes to tell you stories. And not all of them are true.

[pause]

Let's do a little exercise. Think of a worry you've been carrying lately. Something that's been gnawing at you. Got it?

[pause]

Now... I want you to notice the story your mind is telling you about this worry. Is it saying things like, "This will never get better"? Or, "Everyone thinks I'm a failure"? Or maybe, "If this one thing goes wrong, everything is ruined"?

[pause]

Listen to that story. Really listen. Now ask yourself: Is this a fact... or is this a trap?

[pause]

See, your brain loves to exaggerate. It loves to jump to conclusions. It's trying to protect you, sure, but sometimes it's like a guard dog barking at shadows. Loud... but not always accurate.

[pause]

Let's name some of these traps, shall we? There's the "All-or-Nothing Trap." That's when your mind says, "If I'm not perfect, I'm a complete failure." Ever heard that one?

[pause]

Then there's the "Mind-Reading Trap." That's when you assume you know what everyone else is thinking about you. Spoiler: you don't. No one does.

[pause]

And my personal favorite... the "Catastrophe Trap." That's when your mind takes one bad thing and spins it into a full-blown disaster. "I made one mistake, so now I'll lose my job, my home, and everyone will abandon me." Sound familiar?

[pause]

Now, I'm not saying your worries aren't real. They are. But the story your mind is telling you about them? That's often a trap.

[pause]

So here's what we're gonna do. Take that worry you've been holding. And I want you to imagine it written on a sign... a big, obvious trap sign. You see it now?

[pause]

Good. Now step back from it. You don't have to walk into it. You can just... observe it. "Ah, there's my mind, setting another trap. Clever bugger."

[pause]

Take a breath. And say this, in your own words: "I see this thought. But I don't have to believe it."

[pause]

Your thoughts are not facts. They're just... thoughts. They come, they go, like clouds drifting by. You don't have to grab onto every one.

[pause]

Now, think of one small piece of evidence that contradicts the trap. Just one. If your mind says, "I always fail," find one time you didn't. If it says, "No one cares," find one person who does.

[pause]

It doesn't have to be perfect. It just has to be real.

[pause]

Take three slow breaths. With each exhale, imagine stepping a little further back from the trap. Creating distance. Creating space.

[long pause]

You're smarter than your traps, friend. You just need to remember to look for 'em.

[pause]

Alright, that's enough wisdom from old Patches for today. Gently open your eyes. And remember... when your mind tries to trick you, you've got the skills to spot it.

[pause]

Now go on. And try not to fall into any pits today, eh?
    `.trim(),
  },
};

// Helper function to get meditation by ID
export const getMeditation = (meditationId) => {
  return MEDITATIONS[meditationId] || null;
};

// Helper function to get all meditations for a specific guide
export const getMeditationsByGuide = (guideId) => {
  return Object.values(MEDITATIONS).filter(med => med.guideId === guideId);
};

// Helper function to get meditations unlocked at a specific level
export const getUnlockedMeditations = (userLevel) => {
  return Object.values(MEDITATIONS).filter(med => med.unlockLevel <= userLevel);
};

// Helper function to get recommended meditations based on emotions
export const getRecommendedMeditations = (emotions = []) => {
  if (!emotions || emotions.length === 0) return [];
  
  return Object.values(MEDITATIONS).filter(med => {
    return emotions.some(emotion => 
      med.recommendedFor.some(rec => 
        rec.toLowerCase().includes(emotion.toLowerCase()) || 
        emotion.toLowerCase().includes(rec.toLowerCase())
      )
    );
  });
};

// Export all meditation IDs for easy reference
export const MEDITATION_IDS = Object.keys(MEDITATIONS);
