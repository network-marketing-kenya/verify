import { withSupabase } from '@supabase/server';
import { generateText } from './ai_engine.js';

export const config = { runtime: 'edge' };

const defaults = [
  "Alone we can do so little; together we can do so much.",
  "The strength of the team is each individual member. The strength of each member is the team.",
  "Network marketing is the only industry that allows ordinary people to achieve extraordinary wealth.",
  "Success in this industry is not in finding the right person, but in becoming the right person.",
  "Your downline is a reflection of your own leadership, commitment, and daily actions.",
  "Great things in business are never done by one person. They are done by a team of people.",
  "If you want to go fast, go alone. If you want to go far, go together.",
  "Your network is your net worth. Build genuine connections and success will follow.",
  "Consistency is the key. Small daily actions lead to monumental network growth.",
  "The best way to predict the future is to create it with an extraordinary team.",
  "Belief in yourself and your team is the ultimate fuel for success.",
  "Every leader was once a follower who refused to give up on their dreams.",
  "Opportunities don't happen. You create them as a unified network.",
  "True leaders don't create followers, they create more passionate leaders.",
  "Focus on helping others succeed, and your own success will naturally follow.",
  "Doubt kills more dreams than failure ever will. Believe in the system.",
  "Your speed as a leader determines the pace of your entire team.",
  "Action is the foundational key to all network marketing success.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "Work together, learn together, grow together, and win together.",
  "Champions play for the name on the front of the jersey, not the back.",
  "You don't build a business; you build people, and people build the business.",
  "An organization's success is the sum of every member's daily progress."
];

export default withSupabase({ auth: 'none' }, async (req, ctx) => {
  const prompt = "Generate a single, short, high-impact motivational quote (maximum 15 words) suitable for a member of a professional team-building and network marketing organization. Do not include quotes, authors, or any extra text. Just the single sentence of encouragement.";

  let quote = "";
  let source = "Cache Fallback";

  try {
    const result = await generateText({
      prompt,
      maxTokens: 60,
      temperature: 0.9
    });
    if (result && result.text) {
      let cleaned = result.text.trim();
      // Remove surrounding quotes
      cleaned = cleaned.replace(/^["'“'”]|["'“'”]$/g, '');
      if (cleaned) {
        quote = cleaned;
        source = result.providerName;
      }
    }
  } catch (err) {
    console.log(`[motivation] Multi-provider fallback generation failed:`, err.message || err);
  }

  // Final fallback to high-quality default list if everything fails
  if (!quote) {
    quote = defaults[Math.floor(Math.random() * defaults.length)];
  }

  return Response.json({ quote, source });
});
