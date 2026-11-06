import { ChurchDataStore } from './churchDataStore';

export interface BjcAiMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  interactionId?: string;
}

const STORAGE_KEY_GEMINI_KEY = 'bjc_gemini_api_key';
const STORAGE_KEY_CHAT_HISTORY = 'bjc_ai_chat_history_v1';

export const BJC_SYSTEM_INSTRUCTION = `You are "BJC AI", the dedicated spiritual companion, biblical assistant, and ministry guide for Beholding Jesus Church (BJC).

CORE CHURCH IDENTITY & CONTEXT:
- Church Name: Beholding Jesus Church (BJC)
- Motto: "Love God, Make Disciples • Make Christ-Like Disciples"
- Anchor Scripture: 2 Corinthians 3:18 ("And we all, with unveiled face, beholding the glory of the Lord, are being transformed into the same image from glory to glory.")
- Sunday Corporate Worship: Every Sunday 9:00 AM – 11:00 AM
- Church Location: 2nd Flr B1 L34 Holy Spirit St. Goodwill Homes 1 Brgy. Bagbag Novaliches Q.C.
- Official Church Ministries: Multi Media, Worship Team, and Usher
- Senior Pastor: Pastor John Eric Manjares
- App Owner & Finance Manager: John Miko Sarsalijo

YOUR MINISTRY CALLING & TONE:
1. Expository & Christ-Centered: Ground every answer in the Holy Bible. Provide precise book, chapter, and verse citations (e.g., John 1:14, Romans 8:38-39, Philippians 4:6-7, 2 Corinthians 3:18).
2. Pastoral & Gracious: Be warm, empathetic, encouraging, reverent, and uplifting. When worshippers share struggles, anxiety, grief, or doubt, offer compassion, biblical comfort, and a heartfelt prayer.
3. Church Discipleship: Encourage believers in personal daily devotion, scripture reading, praise, prayer, and active fellowship within the church body.
4. Clean Markdown Formatting: Structure your answers with clear headings, italicized scripture quotations, bullet points, and practical takeaways. Keep answers engaging and easy to digest on mobile and desktop.`;

export class BjcAiService {
  /**
   * Retrieves the configured API key from environment or local storage.
   */
  static getApiKey(): string {
    const fromEnv = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    if (fromEnv && fromEnv.trim().length > 5) {
      return fromEnv.trim();
    }
    const fromStorage = localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';
    return fromStorage.trim();
  }

  /**
   * Saves a user-provided API key in local storage.
   */
  static setApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI_KEY);
    }
    window.dispatchEvent(new Event('bjc_gemini_key_change'));
  }

  /**
   * Checks whether an API key is configured.
   */
  static hasApiKey(): boolean {
    return Boolean(this.getApiKey());
  }

  /**
   * Loads saved BJC AI conversation history from local storage.
   */
  static getHistory(): BjcAiMessage[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CHAT_HISTORY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load BJC AI history:', e);
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        content: `Shalom! Peace and grace to you in the name of Jesus Christ. 🙏\n\nI am **BJC AI**, your spiritual companion and Scripture guide from **Beholding Jesus Church**.\n\nHow may I minister to you today?\n- 📖 *Ask about any Scripture passage or biblical doctrine*\n- 🙏 *Ask for a prayer for comfort, strength, or family*\n- ✝️ *Learn about BJC's ministries, worship services, and vision*\n- 🕊️ *Seek practical Christian guidance for daily spiritual growth*`,
        timestamp: 'Just now'
      }
    ];
  }

  /**
   * Saves conversation history to local storage.
   */
  static saveHistory(messages: BjcAiMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CHAT_HISTORY, JSON.stringify(messages.slice(-50)));
    } catch (e) {
      console.warn('Failed to save BJC AI history:', e);
    }
  }

  /**
   * Clears conversation history.
   */
  static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY_CHAT_HISTORY);
  }

  /**
   * Sends a user message to Google Interactions API using native browser fetch.
   * High performance, full CORS compatibility, automatic fallback.
   */
  static async sendMessage(
    prompt: string,
    previousInteractionId?: string
  ): Promise<{ text: string; interactionId?: string }> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      // Local Spiritual Fallback Engine when API key is not yet configured
      return this.getLocalSpiritualFallback(prompt);
    }

    const currentUser = ChurchDataStore.getCurrentUser();
    const userContext = currentUser
      ? `The user talking to you is ${currentUser.name} (@${currentUser.username}), whose role in the church is ${currentUser.roleTitle || 'Church Member'}.`
      : 'The user is a member or visitor of Beholding Jesus Church.';

    const systemInstructionWithContext = `${BJC_SYSTEM_INSTRUCTION}\n\nCURRENT CONVERSATION CONTEXT:\n${userContext}`;

    const executeCall = async (modelName: string) => {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          model: modelName,
          input: prompt,
          system_instruction: systemInstructionWithContext,
          previous_interaction_id: previousInteractionId || undefined,
          generation_config: {
            max_output_tokens: 1200
          }
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        const errDetail = data.error?.message || `HTTP ${response.status}`;
        throw new Error(errDetail);
      }

      const outputStep = data.steps?.find((s: any) => s.type === 'model_output');
      const responseText = outputStep?.content?.map((c: any) => c.text).join('') || data.output_text || '';
      return {
        text: responseText || 'May the Lord bless you and keep you. How else can I assist your spiritual walk today?',
        interactionId: data.id
      };
    };

    try {
      try {
        // Primary: high-speed, high-quota gemini-3.5-flash-lite
        return await executeCall('gemini-3.5-flash-lite');
      } catch (primaryErr: any) {
        console.warn('Primary model issue, trying fallback gemini-3.1-flash-lite:', primaryErr);
        return await executeCall('gemini-3.1-flash-lite');
      }
    } catch (err: any) {
      console.error('BJC AI call failed:', err);

      const errorMessage = err?.message || String(err);
      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('403') || errorMessage.includes('key')) {
        return {
          text: `⚠️ **API Key Issue Detected**\n\nThe provided API key appears to be invalid or quota-limited.\n\nPlease check your key in the **API Key Settings** (gear icon) or get a free API key at [Google AI Studio](https://aistudio.google.com/).\n\n*Error details:* \`${errorMessage.substring(0, 150)}\``
        };
      }

      // Graceful fallback on network glitch without mentioning external brand name
      return {
        text: `Grace and peace to you! I experienced a temporary network connection issue reaching the AI service.\n\n*Scripture for today:*\n> *"Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths."* — **Proverbs 3:5–6**\n\nPlease try sending your message again in a moment.`
      };
    }
  }

  /**
   * Built-in spiritual fallback when no API key is yet configured.
   */
  private static getLocalSpiritualFallback(prompt: string): { text: string } {
    const p = prompt.toLowerCase();

    if (p.includes('ministry') || p.includes('ministries')) {
      return {
        text: `### ✝️ Beholding Jesus Church Ministries\n\nBeholding Jesus Church has **3 dedicated ministry departments** serving the body of Christ:\n\n1. **Multi Media Ministry**\n   - Sound engineering, live streaming, lyric projection, and creative production.\n   - *Meeting:* Sundays 7:30 AM (Tech Check)\n\n2. **Worship Team**\n   - Leading Spirit-filled, Christ-exalting praise and worship sets.\n   - *Meeting:* Saturdays 3:00 PM – 6:00 PM (Rehearsal)\n\n3. **Usher Ministry**\n   - Warm hospitality, greeting worshippers, sanctuary seating, and tithes collection.\n   - *Meeting:* Sundays 8:00 AM – 11:30 AM\n\n*(To unlock live AI conversational depth, add your API key via the settings gear above!)*`
      };
    }

    if (p.includes('service') || p.includes('schedule') || p.includes('time') || p.includes('address') || p.includes('location')) {
      return {
        text: `### 🏛️ Sunday Corporate Worship Schedule\n\n- **Service Time:** Every Sunday, 9:00 AM – 11:00 AM\n- **Location:** 2nd Flr B1 L34 Holy Spirit St. Goodwill Homes 1 Brgy. Bagbag Novaliches Q.C.\n- **Our Theme:** *"Love God, Make Disciples • Make Christ-Like Disciples"*\n\nEveryone is welcome to worship with unveiled face, beholding the glory of Jesus Christ!`
      };
    }

    if (p.includes('2 corinthians 3:18') || p.includes('verse') || p.includes('theme') || p.includes('motto')) {
      return {
        text: `### 📖 Anchor Scripture: 2 Corinthians 3:18\n\n> *“And we all, with unveiled face, beholding the glory of the Lord, are being transformed into the same image from glory to glory, just as from the Lord, the Spirit.”*\n\n**Theological Insight:**\nAs disciples fix our eyes upon Jesus Christ through the Word, prayer, and worship, the Holy Spirit supernaturally transforms our character to reflect His love, righteousness, and holiness!`
      };
    }

    return {
      text: `### 🕊️ Welcome to BJC AI\n\nTo enable full live conversations, please set your **API Key**:\n\n1. Tap the **API Key** button (⚙️ key icon) in the header.\n2. Paste your API key (get one for free at [aistudio.google.com](https://aistudio.google.com/)).\n3. Start asking deep Scripture questions, request prayers, or study discipleship lessons anytime!\n\n> *"The grass withers, the flower fades, but the word of our God will stand forever."* — **Isaiah 40:8**`
    };
  }
}
