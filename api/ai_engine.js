export async function generateText({ prompt, systemInstruction: rawSystemInstruction, maxTokens = 1500, temperature = 0.7 }) {
  let systemInstruction = rawSystemInstruction;
  const providers = [
    // 1. Google Gemini (Key-based)
    {
      name: 'Google Gemini (Key-based)',
      enabled: () => !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
      call: async () => {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens }
        };
        if (systemInstruction) {
          body.systemInstruction = { parts: [{ text: systemInstruction }] };
        }
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!response.ok) {
          throw new Error(`Gemini responded with status ${response.status}`);
        }
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('No text returned from Gemini');
        return text;
      }
    },
    // 2. OVHcloud Llama 3.3 70B (Anonymous Free)
    {
      name: 'OVHcloud Llama 3.3 70B (Anonymous Free)',
      enabled: () => true,
      call: async () => {
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'Meta-Llama-3_3-70B-Instruct',
            messages,
            temperature,
            max_tokens: maxTokens
          })
        });
        if (!response.ok) {
          throw new Error(`OVHcloud Llama 3.3 responded with status ${response.status}`);
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('No text returned from OVHcloud Llama 3.3');
        return text;
      }
    },
    // 3. OVHcloud Mistral 7B (Anonymous Free)
    {
      name: 'OVHcloud Mistral 7B (Anonymous Free)',
      enabled: () => true,
      call: async () => {
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'Mistral-7B-Instruct-v0.3',
            messages,
            temperature,
            max_tokens: maxTokens
          })
        });
        if (!response.ok) {
          throw new Error(`OVHcloud Mistral 7B responded with status ${response.status}`);
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('No text returned from OVHcloud Mistral 7B');
        return text;
      }
    },
    // 4. OVHcloud Mistral Nemo (Anonymous Free)
    {
      name: 'OVHcloud Mistral Nemo (Anonymous Free)',
      enabled: () => true,
      call: async () => {
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'Mistral-Nemo-Instruct-2407',
            messages,
            temperature,
            max_tokens: maxTokens
          })
        });
        if (!response.ok) {
          throw new Error(`OVHcloud Mistral Nemo responded with status ${response.status}`);
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('No text returned from OVHcloud Mistral Nemo');
        return text;
      }
    },
    // 5. OVHcloud Qwen3.6 27B (Anonymous Free)
    {
      name: 'OVHcloud Qwen3.6 27B (Anonymous Free)',
      enabled: () => true,
      call: async () => {
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'Qwen3.6-27B',
            messages,
            temperature,
            max_tokens: maxTokens
          })
        });
        if (!response.ok) {
          throw new Error(`OVHcloud Qwen3.6 responded with status ${response.status}`);
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('No text returned from OVHcloud Qwen3.6 27B');
        return text;
      }
    },
    // 6. OVHcloud Qwen3 32B (Anonymous Free)
    {
      name: 'OVHcloud Qwen3 32B (Anonymous Free)',
      enabled: () => true,
      call: async () => {
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'Qwen3-32B',
            messages,
            temperature,
            max_tokens: maxTokens
          })
        });
        if (!response.ok) {
          throw new Error(`OVHcloud Qwen3 32B responded with status ${response.status}`);
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('No text returned from OVHcloud Qwen3 32B');
        return text;
      }
    },
    // 7. Groq (key-based)
    {
      name: 'Groq Llama 3.3 (Key-based)',
      enabled: () => !!process.env.GROQ_API_KEY,
      call: async () => {
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature,
            max_tokens: maxTokens
          })
        });
        if (!response.ok) {
          throw new Error(`Groq responded with status ${response.status}`);
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('No text returned from Groq');
        return text;
      }
    },
    // 8. Mistral AI (key-based)
    {
      name: 'Mistral AI Nemo (Key-based)',
      enabled: () => !!process.env.MISTRAL_API_KEY,
      call: async () => {
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
          },
          body: JSON.stringify({
            model: 'open-mistral-nemo',
            messages,
            temperature,
            max_tokens: maxTokens
          })
        });
        if (!response.ok) {
          throw new Error(`Mistral AI responded with status ${response.status}`);
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('No text returned from Mistral AI');
        return text;
      }
    },
    // 9. OpenRouter (key-based free tier)
    {
      name: 'OpenRouter Llama 3.3 Free (Key-based)',
      enabled: () => !!process.env.OPENROUTER_API_KEY,
      call: async () => {
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages,
            temperature,
            max_tokens: maxTokens
          })
        });
        if (!response.ok) {
          throw new Error(`OpenRouter responded with status ${response.status}`);
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('No text returned from OpenRouter');
        return text;
      }
    }
  ];

  const activeProviders = providers.filter(p => p.enabled());

  if (activeProviders.length === 0) {
    throw new Error('No enabled AI providers are available.');
  }

  const shuffledProviders = [...activeProviders].sort(() => Math.random() - 0.5);

  for (const provider of shuffledProviders) {
    try {
      console.log(`[ai_engine] Attempting generation via: ${provider.name}`);
      // Dynamically inject the specific provider/model identity
      systemInstruction = rawSystemInstruction
        ? `${rawSystemInstruction}\n\nCRITICAL IDENTITY NOTE: You are the "${provider.name}" AI model. When answering, adopt this identity and speak from this specific persona. Do not refer to yourself as a generic "Copilot" or "Assistant" unless specified. Be proud to be ${provider.name}.`
        : `CRITICAL IDENTITY NOTE: You are the "${provider.name}" AI model. Adopt this identity in your response. Do not refer to yourself as a generic "Copilot".`;

      const text = await provider.call();
      if (text) {
        console.log(`[ai_engine] Success via: ${provider.name}`);
        return {
          text: text,
          providerName: provider.name
        };
      }
    } catch (err) {
      console.log(`[ai_engine] Provider ${provider.name} status: unavailable`);
    }
  }

  throw new Error('All enabled AI providers failed to generate text.');
}
