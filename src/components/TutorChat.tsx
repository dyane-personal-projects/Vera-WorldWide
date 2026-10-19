import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  ArrowLeft,
  Activity,
  AlertCircle,
  Loader2,
  RefreshCw,
  Globe,
  HelpCircle,
  ShieldAlert,
  Info,
  ChevronDown,
  Bookmark,
  Check,
  Eye,
  EyeOff,
  Flame,
  Award,
  Zap,
  Coffee,
  Car,
  ShoppingBag,
  Beer,
  Swords,
  MessageCircle,
  Sliders,
  CheckCircle2,
  X,
  PhoneCall,
  Phone,
  Star,
  Clock,
  UserCheck
} from 'lucide-react';
import { DialectTrack, UserProfile } from '../types';
import { DIALECT_TRACKS } from '../data/languages';
import { generateTutorReply, getContextualDialectFallback, playNativeAudio, stopAllAudio, TutorResponse } from '../services/gemini';
import { logChatToFirestore, rewardUserSparksAndStreak } from '../firebase';
import { soundFX } from '../utils/soundEffects';
import { isNonLatinScript, shouldShowTransliteration, getTransliteration } from '../utils/transliteration';
import { getTutorPersona, TutorPersona } from '../data/tutorPersonas';
import { LiveVoiceCallModal } from './LiveVoiceCallModal';

interface TutorChatProps {
  initialDialect?: DialectTrack;
  user: UserProfile | null;
  onBackToLanding: () => void;
  onOpenAdmin: () => void;
  onRewardClaimed?: (user: UserProfile) => void;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  englishTranslation?: string;
  feedback?: string;
  rephraseSuggestion?: string;
  fluencyScore?: number;
  slangTip?: string;
  slangMeaning?: string;
  suggestedReplies?: string[];
  timestamp: number;
}

interface ScenarioMission {
  id: string;
  title: string;
  icon: any;
  prompt: string;
  goal: string;
  targetTurns: number;
  rewardSparks: number;
}

function getDialectScenarios(track: DialectTrack): ScenarioMission[] {
  const isAr = track.id.startsWith('ar');
  const isFr = track.id.startsWith('fr');
  const isJa = track.id.startsWith('ja');
  const isPt = track.id.startsWith('pt');
  const isCo = track.id === 'es-CO';

  if (isAr) {
    return [
      {
        id: 'free',
        title: 'دردشة حرة (Cairo Immersion)',
        icon: MessageCircle,
        prompt: 'أهلاً وسهلاً يا باشا! منور الدنيا كلها. إيه رأيك ندردش في إيه النهارده؟',
        goal: 'Chat freely with authentic Egyptian street phrases, humor, and warm banter',
        targetTurns: 2,
        rewardSparks: 50
      },
      {
        id: 'food',
        title: 'أكل وقهوة (Koshari & Ahwa)',
        icon: Coffee,
        prompt: 'مساء الفل يا ريس! نشرب شاي في الخمسينة، ولا تاكل كشري ميكس بدقة وشطة زيادة؟',
        goal: 'Order koshari, hawawshi, and ahwa drinks with authentic Cairo street phrasing',
        targetTurns: 3,
        rewardSparks: 65
      },
      {
        id: 'transit',
        title: 'تاكسي ومترو (Cairo Cabs)',
        icon: Car,
        prompt: 'يا أسطى، على وسط البلد لو سمحت؟ الشارع سالك ولا في زحمة كالعادة؟',
        goal: 'Hail Cairo white cabs, ask routes, and handle quick cash transactions',
        targetTurns: 3,
        rewardSparks: 70
      },
      {
        id: 'market',
        title: 'خان الخليلي (Souk Haggling)',
        icon: ShoppingBag,
        prompt: 'يا فنان، التحفة دي بكام في السريع عشان خاطر الزبون وحبايبنا؟',
        goal: 'Bargain tactfully for authentic handicrafts with warm Egyptian etiquette',
        targetTurns: 3,
        rewardSparks: 75
      },
      {
        id: 'nightlife',
        title: 'سهرة وقعدة صحاب (Evening Hangout)',
        icon: Beer,
        prompt: 'يا سيدي الفل والياسمين! قعدة الصحاب دي ما تتعوضش، نشرب إيه سوا؟',
        goal: 'Exchange Egyptian toasts, jokes, and cultural street banter',
        targetTurns: 3,
        rewardSparks: 80
      },
      {
        id: 'boss',
        title: 'الموظف الحكومي (Bureaucratic Duel)',
        icon: Swords,
        prompt: 'لو سمحت يا أستاذ، المعاملة دي ناقصة دمغة ومش هينفع تمشي دلوقتي خالص.',
        goal: 'Politely de-escalate bureaucratic tension with calm Egyptian diplomacy',
        targetTurns: 4,
        rewardSparks: 200
      }
    ];
  }

  if (isFr) {
    return [
      {
        id: 'free',
        title: 'Immersion libre',
        icon: MessageCircle,
        prompt: "Salut ! Quoi de neuf aujourd'hui ? De quoi as-tu envie de discuter ?",
        goal: 'Chat freely with Parisian slang, Verlan, and everyday banter',
        targetTurns: 2,
        rewardSparks: 50
      },
      {
        id: 'food',
        title: 'Café & Bistrot',
        icon: Coffee,
        prompt: "Bonjour ! On s'installe en terrasse ? Un petit café serré ou une formule déj ?",
        goal: 'Order café drinks and classic Parisian bistro specialties effortlessly',
        targetTurns: 3,
        rewardSparks: 65
      },
      {
        id: 'transit',
        title: 'Métro & Vélib',
        icon: Car,
        prompt: "Pardon, la ligne 4 est blindée aujourd'hui, vous savez si le bus 38 passe bientôt ?",
        goal: 'Navigate the Parisian metro system and ask locals for quick transit tips',
        targetTurns: 3,
        rewardSparks: 70
      },
      {
        id: 'market',
        title: 'Marché aux Puces',
        icon: ShoppingBag,
        prompt: "Bonjour, elle est magnifique cette veste vintage, vous me la feriez à combien ?",
        goal: 'Bargain tactfully at a Parisian vintage market without sounding rude',
        targetTurns: 3,
        rewardSparks: 75
      },
      {
        id: 'nightlife',
        title: 'Apéro & Soirée',
        icon: Beer,
        prompt: "Santé ! C'est trop sympa ce petit bar dans le Marais, tu prends quoi à boire ?",
        goal: 'Order rounds at an apéro and master casual Parisian socializing',
        targetTurns: 3,
        rewardSparks: 80
      },
      {
        id: 'boss',
        title: 'Contrôle des Billets',
        icon: Swords,
        prompt: "Bonjour madame/monsieur, contrôle des titres de transport s'il vous plaît.",
        goal: 'Politely present transit validation and resolve ticketing misunderstandings',
        targetTurns: 4,
        rewardSparks: 200
      }
    ];
  }

  if (isJa) {
    return [
      {
        id: 'free',
        title: '自由会話 (Tokyo Immersion)',
        icon: MessageCircle,
        prompt: 'こんにちは！今日はどんなテーマで話しましょうか？趣味でも日常でもなんでもどうぞ！',
        goal: 'Chat freely using natural modern Tokyo conversational rhythm and particles',
        targetTurns: 2,
        rewardSparks: 50
      },
      {
        id: 'food',
        title: '居酒屋 (Izakaya & Food)',
        icon: Coffee,
        prompt: 'いらっしゃい！とりあえず生でいいですか？今日のおすすめは焼き鳥の盛り合わせです！',
        goal: 'Order izakaya drinks, seasonal specials, and call waitstaff naturally',
        targetTurns: 3,
        rewardSparks: 65
      },
      {
        id: 'transit',
        title: '渋谷駅・地下鉄 (Tokyo Transit)',
        icon: Car,
        prompt: 'すみません、渋谷駅の山手線のホームはどちらでしょうか？乗り換えが難しくて…',
        goal: 'Navigate Tokyo stations, confirm train transfers, and ask platform directions',
        targetTurns: 3,
        rewardSparks: 70
      },
      {
        id: 'market',
        title: '秋葉原・買い物 (Shopping Banter)',
        icon: ShoppingBag,
        prompt: 'これすごく気になってるんですけど、セットで買うと少し安くなったりしますか？',
        goal: 'Inquire about products, discounts, and tax-free options politely',
        targetTurns: 3,
        rewardSparks: 75
      },
      {
        id: 'nightlife',
        title: '飲み会 (Nomikai & Nightlife)',
        icon: Beer,
        prompt: 'お疲れ様です！乾杯しましょう。今日一日のお仕事はどうでしたか？',
        goal: 'Exchange toasts (Kanpai) and casual workplace or friend conversations',
        targetTurns: 3,
        rewardSparks: 80
      },
      {
        id: 'boss',
        title: '駅員精算 (Station Duel)',
        icon: Swords,
        prompt: '恐れ入ります、Suicaの残高が不足しているようです。精算機でチャージをお願いします。',
        goal: 'Clarify transit fare adjustments with polite formal Keigo switches',
        targetTurns: 4,
        rewardSparks: 200
      }
    ];
  }

  if (isPt) {
    return [
      {
        id: 'free',
        title: 'Papo Livre (Rio Immersion)',
        icon: MessageCircle,
        prompt: 'Fala meu parceiro, tudo bem? Sobre o que você quer trocar uma ideia hoje?',
        goal: 'Chat freely with Carioca beach slang and relaxed Brazilian cadence',
        targetTurns: 2,
        rewardSparks: 50
      },
      {
        id: 'food',
        title: 'Quiosque & Açaí',
        icon: Coffee,
        prompt: 'E aí chefe, manda aquele açaí com granola bem caprichado por favor!',
        goal: 'Order beach snacks, fresh coconut water, and açaí at the kiosks',
        targetTurns: 3,
        rewardSparks: 65
      },
      {
        id: 'transit',
        title: 'Táxi & Trânsito',
        icon: Car,
        prompt: 'Boa tarde, amigo! Tá muito engarrafado pra ir até Copacabana agora?',
        goal: 'Confirm ride fares, routes, and traffic updates with local drivers',
        targetTurns: 3,
        rewardSparks: 70
      },
      {
        id: 'market',
        title: 'Feirinha Hippie',
        icon: ShoppingBag,
        prompt: 'Boa tarde! Achei muito maneira essa canga artesanal, rola um desconto se levar duas?',
        goal: 'Bargain gently at neighborhood artisan craft fairs',
        targetTurns: 3,
        rewardSparks: 75
      },
      {
        id: 'nightlife',
        title: 'Roda de Samba',
        icon: Beer,
        prompt: 'Saúde meu irmão! Que energia boa esse samba, você vem sempre aqui na Lapa?',
        goal: 'Toast with cold drinks and socialize at live samba circles in Lapa',
        targetTurns: 3,
        rewardSparks: 80
      },
      {
        id: 'boss',
        title: 'Fiscal de Trânsito',
        icon: Swords,
        prompt: 'Boa tarde condutor, operação de rotina da Lei Seca. Apresente seus documentos.',
        goal: 'De-escalate official traffic checks politely and present credentials',
        targetTurns: 4,
        rewardSparks: 200
      }
    ];
  }

  if (isCo) {
    return [
      {
        id: 'free',
        title: 'Charla Libre (Medellín Paisa)',
        icon: MessageCircle,
        prompt: '¡Qué hubo pues mi parce! ¿De qué te gustaría charlar hoy? ¿Música, planes o la tierrita?',
        goal: 'Chat freely with Medellín Paisa cadence and warm Antioquian greetings',
        targetTurns: 2,
        rewardSparks: 50
      },
      {
        id: 'food',
        title: 'Fonda Paisa & Café',
        icon: Coffee,
        prompt: 'Buenas tardes marchante, ¿me regala un tintico bien caliente y una arepa con queso?',
        goal: 'Order tinto coffee, buñuelos, and typical Paisa meals naturally',
        targetTurns: 3,
        rewardSparks: 65
      },
      {
        id: 'transit',
        title: 'Taxis & Metro Medellín',
        icon: Car,
        prompt: 'Buenas jefe, ¿cuánto me cobra hasta El Poblado? El tráfico está pesado hoy.',
        goal: 'Hail taxis, check flat rates, and use Medellín transit politely',
        targetTurns: 3,
        rewardSparks: 70
      },
      {
        id: 'market',
        title: 'Mercado San Alejo',
        icon: ShoppingBag,
        prompt: '¡Buenas vecino! Están muy bonitas estas artesanías, ¿en cuánto me deja las dos?',
        goal: 'Bargain tactfully for handmade crafts with Paisa warmth',
        targetTurns: 3,
        rewardSparks: 75
      },
      {
        id: 'nightlife',
        title: 'Rumba & Salsa',
        icon: Beer,
        prompt: '¡Salud mi hermano! Qué chimba de música, ¿qué estás tomando compa?',
        goal: 'Exchange friendly toasts and enjoy Medellín nightlife conversations',
        targetTurns: 3,
        rewardSparks: 80
      },
      {
        id: 'boss',
        title: 'Inspector de Tránsito',
        icon: Swords,
        prompt: 'Buenas tardes caballero, control de rutina, permítame sus documentos por favor.',
        goal: 'Politely de-escalate bureaucratic tension with respect and calm composure',
        targetTurns: 4,
        rewardSparks: 200
      }
    ];
  }

  // Mexican Spanish default
  return [
    {
      id: 'free',
      title: 'Plática Callejera (CDMX)',
      icon: MessageCircle,
      prompt: '¡Qué onda! ¿De qué te gustaría platicar hoy compa? ¿Comida callejera, música o planes?',
      goal: 'Chat freely with native Mexican colloquialisms and everyday CDMX banter',
      targetTurns: 2,
      rewardSparks: 50
    },
    {
      id: 'food',
      title: 'Taquería & Fonda',
      icon: Coffee,
      prompt: 'Buenas tardes marchante, ¿qué le preparamos hoy? ¿Con salsa de la que pica o regular?',
      goal: 'Order tacos al pastor, ask for recommendations and local salsas',
      targetTurns: 3,
      rewardSparks: 65
    },
    {
      id: 'transit',
      title: 'Taxis & Tráfico CDMX',
      icon: Car,
      prompt: 'Buenas jefe, ¿para dónde le damos? El tráfico al centro está pesado hoy.',
      goal: 'Confirm routes, direct drivers, and handle quick transit transactions',
      targetTurns: 3,
      rewardSparks: 70
    },
    {
      id: 'market',
      title: 'Tianguis & Bazar',
      icon: ShoppingBag,
      prompt: '¡Pásele a ver sin compromiso! Artesanías auténticas hechas a mano, ¿qué le gusta?',
      goal: 'Bargain tactfully for a package deal without offending the artisan',
      targetTurns: 3,
      rewardSparks: 75
    },
    {
      id: 'nightlife',
      title: 'Cantina & Noche',
      icon: Beer,
      prompt: '¡Salud por la buena música! La noche está empezando, ¿qué estás tomando compa?',
      goal: 'Exchange toasts, understand colloquial humor, and buy rounds',
      targetTurns: 3,
      rewardSparks: 80
    },
    {
      id: 'boss',
      title: 'Oficial de Tránsito',
      icon: Swords,
      prompt: '¡Alto ahí joven! Su comprobante de transferencia no fue registrado. La infracción es inmediata.',
      goal: 'Politely de-escalate bureaucratic tension and present valid credentials',
      targetTurns: 4,
      rewardSparks: 200
    }
  ];
}

export const TutorChat: React.FC<TutorChatProps> = ({
  initialDialect = DIALECT_TRACKS[0],
  user,
  onBackToLanding,
  onOpenAdmin,
  onRewardClaimed
}) => {
  const [selectedTrack, setSelectedTrack] = useState<DialectTrack>(initialDialect);
  const currentScenarios = getDialectScenarios(selectedTrack);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [fluencyAverage, setFluencyAverage] = useState<number>(93);
  const [activeScenario, setActiveScenario] = useState<ScenarioMission>(() => getDialectScenarios(initialDialect)[0]);
  const [showDialectDropdown, setShowDialectDropdown] = useState(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [micNotice, setMicNotice] = useState(false);
  const [revealedTranslations, setRevealedTranslations] = useState<Record<string, boolean>>({});
  const [savedVocabIds, setSavedVocabIds] = useState<string[]>([]);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [missionCelebration, setMissionCelebration] = useState<{ sparks: number } | null>(null);

  // CEFR Student Proficiency Level (A1, A2, B1, B2, C1)
  const [learnerLevel, setLearnerLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>(
    (user?.cefrLevel as any) || 'A1'
  );

  const currentTutor = getTutorPersona(selectedTrack.id);

  const getTutorLocalTime = (offsetHours: number) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const tutorTime = new Date(utc + 3600000 * offsetHours);
    return tutorTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isNonLatin = isNonLatinScript(selectedTrack.id);
  const [showTransliteration, setShowTransliteration] = useState(() =>
    shouldShowTransliteration(selectedTrack.id, learnerLevel)
  );

  // Sync selectedTrack with initialDialect prop
  useEffect(() => {
    if (initialDialect && initialDialect.id !== selectedTrack.id) {
      setSelectedTrack(initialDialect);
    }
  }, [initialDialect]);

  // Sync active scenario and transliteration default when selectedTrack changes
  useEffect(() => {
    const scs = getDialectScenarios(selectedTrack);
    setActiveScenario(scs[0]);
    setShowTransliteration(shouldShowTransliteration(selectedTrack.id, learnerLevel));
  }, [selectedTrack.id, learnerLevel]);

  // Pronunciation Practice Modal State
  const [practiceTarget, setPracticeTarget] = useState<string | null>(null);
  const [isPracticingMic, setIsPracticingMic] = useState(false);
  const [practiceSpoken, setPracticeSpoken] = useState('');
  const [practiceAccuracy, setPracticeAccuracy] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const practiceRecognitionRef = useRef<any>(null);

  const isStaff = user?.role === 'staff';

  // Available dialect tracks: staff unlocks all, standard users see active tracks
  const selectableTracks = isStaff
    ? DIALECT_TRACKS
    : DIALECT_TRACKS.filter((t) => t.status === 'active');

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Load existing saved vocab keys
  useEffect(() => {
    try {
      const raw = localStorage.getItem('vera_custom_vocab');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSavedVocabIds(parsed.map((item: any) => item.word));
      }
    } catch {}
  }, []);

  // Initialize Speech-to-Text
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) setInputText(transcript);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);

        // Practice recognition
        practiceRecognitionRef.current = new SpeechRecognition();
        practiceRecognitionRef.current.continuous = false;
        practiceRecognitionRef.current.interimResults = false;

        practiceRecognitionRef.current.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript;
          setPracticeSpoken(spoken);
          setIsPracticingMic(false);

          if (practiceTarget) {
            // Calculate similarity score supporting all Unicode letters (Arabic, Japanese, accented characters)
            const targetWords = practiceTarget.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean);
            const spokenWords = spoken.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean);
            const matched = spokenWords.filter(w => targetWords.includes(w)).length;
            const score = Math.min(100, Math.max(70, Math.round((matched / Math.max(targetWords.length, 1)) * 100)));
            setPracticeAccuracy(score);
            if (score >= 80) soundFX.playCorrect();
            else soundFX.playTap();
          }
        };

        practiceRecognitionRef.current.onerror = () => setIsPracticingMic(false);
        practiceRecognitionRef.current.onend = () => setIsPracticingMic(false);
      } catch (err) {
        console.warn("Speech recognition initialization error", err);
      }
    }
  }, [practiceTarget]);

  // Set recognition language and adapt greeting when dialect or learner level changes
  useEffect(() => {
    const langCode = getSpeechLangCode(selectedTrack.id);
    if (recognitionRef.current) recognitionRef.current.lang = langCode;
    if (practiceRecognitionRef.current) practiceRecognitionRef.current.lang = langCode;

    // Set Welcome greeting tailored to the 24/7 personal tutor persona and active learner level
    const tutor = getTutorPersona(selectedTrack.id);
    const greetingData = tutor.levelGreetings[learnerLevel] || tutor.levelGreetings.A1;
    setMessages([
      {
        id: 'msg_init_' + Date.now(),
        role: 'assistant',
        content: greetingData.native,
        englishTranslation: greetingData.english,
        feedback: `${tutor.name} (${tutor.city}) • Live 24/7. Level: ${learnerLevel}. ${greetingData.pedagogyNote}`,
        rephraseSuggestion: greetingData.translit ? `Phonetic guide: ${greetingData.translit}` : undefined,
        fluencyScore: 100,
        slangTip: isNonLatinScript(selectedTrack.id) ? (greetingData.translit || greetingData.native) : greetingData.native.split(' ')[0],
        slangMeaning: greetingData.english,
        suggestedReplies: greetingData.quickReplies,
        timestamp: Date.now()
      }
    ]);
  }, [selectedTrack.id, learnerLevel]);

  const toggleMic = () => {
    soundFX.playTap();
    if (!recognitionRef.current) {
      setMicNotice(true);
      setTimeout(() => setMicNotice(false), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputText('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startPracticeMic = () => {
    soundFX.playTap();
    setPracticeSpoken('');
    setPracticeAccuracy(null);
    if (!practiceRecognitionRef.current) {
      setPracticeSpoken(practiceTarget || '¡Excelente!');
      setPracticeAccuracy(95);
      soundFX.playCorrect();
      return;
    }
    try {
      setIsPracticingMic(true);
      practiceRecognitionRef.current.start();
    } catch {
      setIsPracticingMic(false);
      setPracticeSpoken(practiceTarget || '¡Excelente!');
      setPracticeAccuracy(95);
      soundFX.playCorrect();
    }
  };

  // Play audio TTS with studio native audio engine
  const playTTS = (text: string, msgId: string, rate = speechRate) => {
    if (playingAudioId === msgId) {
      stopAllAudio();
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(msgId);
    playNativeAudio({
      text,
      dialectId: selectedTrack.id,
      voiceName: currentTutor.recommendedVoice,
      rate,
      onStart: () => setPlayingAudioId(msgId),
      onEnd: () => setPlayingAudioId(null),
      onError: () => setPlayingAudioId(null)
    });
  };

  // Toggle Translation
  const toggleTranslation = (msgId: string) => {
    soundFX.playTap();
    setRevealedTranslations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  // Save Slang Word to Vocab Vault
  const handleSaveToVault = (word: string, meaning: string, context: string) => {
    soundFX.playCorrect();
    try {
      const raw = localStorage.getItem('vera_custom_vocab');
      const existing = raw ? JSON.parse(raw) : [];
      if (!existing.some((item: any) => item.word.toLowerCase() === word.toLowerCase())) {
        const newItem = {
          id: 'custom_' + Date.now(),
          word,
          translation: meaning,
          context,
          dialect: selectedTrack.dialect,
          type: 'slang'
        };
        const updated = [newItem, ...existing];
        localStorage.setItem('vera_custom_vocab', JSON.stringify(updated));
        setSavedVocabIds((prev) => [...prev, word]);
        setSaveToast(`Saved «${word}» to your Vocab Vault!`);
        setTimeout(() => setSaveToast(null), 3500);
      }
    } catch {}
  };

  // Handle Send Message (returns TutorResponse for chat and voice calls)
  const handleSendMessage = async (textToSend?: string): Promise<TutorResponse> => {
    const text = (textToSend || inputText).trim();
    if (!text) {
      return getContextualDialectFallback(selectedTrack.dialect, 'مرحبا', learnerLevel);
    }

    soundFX.playTap();

    const userMsgId = 'msg_user_' + Date.now();
    const newUserMessage: MessageItem = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const updatedHistory = [...messages, newUserMessage];
    setMessages(updatedHistory);
    setInputText('');
    setIsThinking(true);

    try {
      // 1. Generate response via Gemini 3.8 tailored to learner level
      const replyData = await generateTutorReply({
        userMessage: text,
        dialectName: selectedTrack.dialect,
        persona: `${currentTutor.name} (${currentTutor.city})`,
        culturalNote: selectedTrack.culturalNote,
        level: learnerLevel,
        chatHistory: updatedHistory.map((m) => ({
          role: m.role,
          content: m.content
        }))
      });

      const assistantMsgId = 'msg_ai_' + Date.now();
      const newAssistantMessage: MessageItem = {
        id: assistantMsgId,
        role: 'assistant',
        content: replyData.reply,
        englishTranslation: replyData.englishTranslation,
        feedback: replyData.feedback,
        rephraseSuggestion: replyData.rephraseSuggestion,
        fluencyScore: replyData.fluencyScore,
        slangTip: replyData.slangTip,
        slangMeaning: replyData.slangMeaning,
        suggestedReplies: replyData.suggestedReplies,
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, newAssistantMessage]);

      if (replyData.fluencyScore) {
        setFluencyAverage((prev) => Math.round(prev * 0.7 + replyData.fluencyScore * 0.3));
      }

      // Auto play assistant reply audio with studio voice
      playTTS(replyData.reply, assistantMsgId, speechRate);

      // Log conversation to Firestore
      await logChatToFirestore({
        userId: user?.uid || 'guest_user',
        userEmail: user?.email || 'learner@veraworldwide.com',
        message: text,
        response: replyData.reply,
        language: selectedTrack.dialect,
        fluencyScore: replyData.fluencyScore,
        feedback: replyData.feedback
      });

      setIsThinking(false);
      return replyData;
    } catch (err) {
      console.error("Tutor error:", err);
      const fallbackReply = getContextualDialectFallback(selectedTrack.dialect, text, learnerLevel);
      const fallbackMsg: MessageItem = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: fallbackReply.reply,
        englishTranslation: fallbackReply.englishTranslation,
        feedback: fallbackReply.feedback,
        rephraseSuggestion: fallbackReply.rephraseSuggestion,
        fluencyScore: fallbackReply.fluencyScore,
        slangTip: fallbackReply.slangTip,
        slangMeaning: fallbackReply.slangMeaning,
        suggestedReplies: fallbackReply.suggestedReplies,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      playTTS(fallbackReply.reply, fallbackMsg.id, speechRate);
      setIsThinking(false);
      return fallbackReply;
    }
  };

  const userTurnCount = messages.filter((m) => m.role === 'user').length;
  const isMissionReady = userTurnCount >= activeScenario.targetTurns;

  const handleFinishMission = async () => {
    soundFX.playVictory();
    if (user?.uid) {
      const updated = await rewardUserSparksAndStreak(user.uid, activeScenario.rewardSparks);
      if (updated && onRewardClaimed) onRewardClaimed(updated);
    }
    setMissionCelebration({ sparks: activeScenario.rewardSparks });
  };

  const handleSelectScenario = (sc: ScenarioMission) => {
    soundFX.playTap();
    setActiveScenario(sc);
    handleSendMessage(sc.prompt);
  };

  // Last assistant message with suggested quick replies
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const availableQuickReplies = lastAssistantMessage?.suggestedReplies || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Top Header Bar */}
      <header className="h-16 px-4 md:px-6 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Showcase</span>
          </button>

          {/* Dialect Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDialectDropdown(!showDialectDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-emerald-500 transition-all text-xs font-bold text-white shadow-inner"
            >
              <span className="text-base">{selectedTrack.flag}</span>
              <span className="truncate max-w-[130px] sm:max-w-none">{selectedTrack.dialect}</span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>

            {showDialectDropdown && (
              <div className="absolute top-12 left-0 w-72 max-h-80 overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Select Immersion Track
                </div>
                {selectableTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setSelectedTrack(track);
                      setShowDialectDropdown(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${
                      selectedTrack.id === track.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{track.flag}</span>
                      <div>
                        <div className="font-bold text-white">{track.dialect}</div>
                        <div className="text-[10px] text-slate-400">{track.region}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Persona Presence Tag */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <span className="text-base">{currentTutor.avatarEmoji}</span>
            <span className="text-slate-400 text-[11px]">Tutor:</span>
            <span className="font-bold text-emerald-400">{currentTutor.name}</span>
          </div>

          {/* CEFR Level Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLevelDropdown(!showLevelDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-emerald-500 text-xs font-mono font-bold text-emerald-300 transition-all shadow-inner"
              title="Change your active learning proficiency level"
            >
              <span className="text-emerald-400">🌱</span>
              <span>Level: {learnerLevel}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {showLevelDropdown && (
              <div className="absolute top-12 left-0 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Adaptive Teaching Level
                </div>
                {[
                  { id: 'A1', name: 'A1 Beginner', desc: 'Slow pace, simple sentences, full phonetics & English breakdown' },
                  { id: 'A2', name: 'A2 Elementary', desc: 'Everyday conversations & gentle grammar coaching' },
                  { id: 'B1', name: 'B1 Intermediate', desc: 'Natural street pace, idioms & open-ended questions' },
                  { id: 'B2', name: 'B2 Upper Int.', desc: 'Fast cadence, colloquial slang & cultural debates' },
                  { id: 'C1', name: 'C1 Native Mastery', desc: 'Full street speed, humor & cinema quotes' }
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      soundFX.playTap();
                      setLearnerLevel(lvl.id as any);
                      setShowLevelDropdown(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-colors flex items-start justify-between text-xs ${
                      learnerLevel === lvl.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{lvl.name}</div>
                      <div className="text-[10px] text-slate-400">{lvl.desc}</div>
                    </div>
                    {learnerLevel === lvl.id && <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Telemetry & Voice Call Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1-on-1 Voice Call Button */}
          <button
            onClick={() => {
              soundFX.playTap();
              setIsVoiceCallOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs font-mono shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            title="Start 1-on-1 Live Voice Call with your personal native tutor"
          >
            <PhoneCall size={14} className="animate-bounce shrink-0" />
            <span className="hidden sm:inline">24/7 Voice Call</span>
            <span className="sm:hidden">Call</span>
          </button>

          {/* Transliteration Toggle Button for Non-Latin scripts */}
          {isNonLatin && (
            <button
              onClick={() => {
                soundFX.playTap();
                setShowTransliteration(!showTransliteration);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                showTransliteration
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
              title="Toggle Franco-Arab / Romaji phonetic transliteration"
            >
              <span className="font-bold">Aa:</span>
              <span>{showTransliteration ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* Audio Speech Speed Selector */}
          <button
            onClick={() => {
              soundFX.playTap();
              setSpeechRate((prev) => (prev === 1.0 ? 0.8 : 1.0));
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono transition-all text-slate-300 hover:text-white"
            title="Toggle playback speed (0.8x slow / 1.0x normal)"
          >
            <Sliders size={13} className="text-emerald-400" />
            <span>{speechRate === 0.8 ? '0.8x SLOW' : '1.0x NORMAL'}</span>
          </button>

          {/* Fluency Score Meter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <Activity size={14} className={fluencyAverage >= 90 ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="hidden sm:inline text-slate-400 text-[11px]">Fluency:</span>
            <span className="font-black text-white">{fluencyAverage}%</span>
          </div>
        </div>
      </header>

      {/* Real Human Tutor Profile Banner */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${currentTutor.avatarBg} border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner`}>
              {currentTutor.avatarEmoji}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white truncate text-xs sm:text-sm">{currentTutor.name}</span>
              {currentTutor.nativeName && (
                <span className="text-[11px] text-slate-400 hidden sm:inline" dir={isNonLatin ? 'rtl' : 'ltr'}>
                  ({currentTutor.nativeName})
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                ● Live 24/7 Tutor
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              <span>{currentTutor.city}</span>
              <span>•</span>
              <span>Local Time: {getTutorLocalTime(currentTutor.timeZoneOffsetHours)}</span>
              <span>•</span>
              <span className="text-amber-400 flex items-center gap-0.5">
                <Star size={10} className="fill-amber-400 shrink-0" />
                {currentTutor.rating} ({currentTutor.sessionsCompleted.toLocaleString()} sessions)
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 italic max-w-xs truncate">
            "{currentTutor.specialty}"
          </span>
        </div>
      </div>

      {/* Scenario Missions Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 whitespace-nowrap pl-1">
          Missions:
        </span>
        {currentScenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScenario.id === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-sm ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/60 text-emerald-300 shadow-emerald-500/10'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
              <span>{sc.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Mission Objective Banner */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/60 flex items-center justify-between gap-4 text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
            GOAL
          </span>
          <p className="text-slate-300 truncate text-[11px] sm:text-xs">{activeScenario.goal}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
          <span className="text-slate-400">
            Turns: <strong className={isMissionReady ? 'text-emerald-400' : 'text-white'}>{userTurnCount}</strong>/{activeScenario.targetTurns}
          </span>

          {isMissionReady && (
            <button
              onClick={handleFinishMission}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md animate-pulse transition-all flex items-center gap-1"
            >
              <Sparkles size={11} />
              <span>Claim +{activeScenario.rewardSparks} Sparks</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl w-full mx-auto">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isAudioPlaying = playingAudioId === msg.id;
          const isTranslated = Boolean(revealedTranslations[msg.id]);
          const isVocabSaved = msg.slangTip ? savedVocabIds.includes(msg.slangTip) : false;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
            >
              <div
                className={`max-w-[88%] md:max-w-[78%] rounded-3xl p-5 shadow-xl relative ${
                  isUser
                    ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-700 text-white rounded-br-sm shadow-emerald-950/20'
                    : 'bg-slate-900/95 border border-slate-800 text-slate-100 rounded-bl-sm shadow-slate-950/80'
                }`}
              >
                {/* Speaker Header */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-white/10 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{isUser ? '👤' : currentTutor.avatarEmoji}</span>
                    <span className={isUser ? 'text-emerald-100 font-bold' : 'text-emerald-400 font-bold'}>
                      {isUser ? user?.displayName || 'Learner' : `${currentTutor.name} (${selectedTrack.dialect})`}
                    </span>
                    {!isUser && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                        Level: {learnerLevel}
                      </span>
                    )}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-1.5">
                      {/* Audio pronunciation with animated waveform visualizer */}
                      <button
                        onClick={() => playTTS(msg.content, msg.id, speechRate)}
                        className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 text-xs font-mono ${
                          isAudioPlaying
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Listen to native voice pronunciation"
                      >
                        {isAudioPlaying ? (
                          <div className="flex items-end gap-0.5 h-3">
                            <span className="w-0.5 bg-slate-950 h-3 animate-pulse" />
                            <span className="w-0.5 bg-slate-950 h-1.5 animate-bounce" />
                            <span className="w-0.5 bg-slate-950 h-3.5 animate-pulse" />
                            <span className="w-0.5 bg-slate-950 h-2 animate-bounce" />
                          </div>
                        ) : (
                          <Volume2 size={13} />
                        )}
                        <span>{isAudioPlaying ? 'Speaking...' : 'Listen'}</span>
                      </button>

                      {/* Practice Speaking Modal Trigger */}
                      <button
                        onClick={() => {
                          soundFX.playTap();
                          setPracticeTarget(msg.content);
                          setPracticeSpoken('');
                          setPracticeAccuracy(null);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] hidden sm:flex items-center gap-1"
                        title="Practice pronouncing this phrase"
                      >
                        <Mic size={12} />
                        <span>Practice</span>
                      </button>

                      {/* Translate toggle */}
                      {msg.englishTranslation && (
                        <button
                          onClick={() => toggleTranslation(msg.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                          title="Toggle English translation"
                        >
                          {isTranslated ? <EyeOff size={12} /> : <Eye size={12} />}
                          <span>{isTranslated ? 'Hide' : 'Translate'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {isUser && msg.fluencyScore && (
                    <span className="text-[10px] font-mono bg-slate-950/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      {msg.fluencyScore}% Fluency
                    </span>
                  )}
                </div>

                {/* Main Native Message Text */}
                <p
                  dir={selectedTrack.id.startsWith('ar') ? 'rtl' : 'ltr'}
                  className={`whitespace-pre-wrap text-base sm:text-[17px] leading-relaxed select-text font-normal tracking-wide ${
                    selectedTrack.id.startsWith('ar') ? 'text-right' : ''
                  }`}
                >
                  {msg.content}
                </p>

                {/* English Translation Dropdown */}
                {!isUser && isTranslated && msg.englishTranslation && (
                  <div className="mt-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 italic animate-in fade-in flex items-start gap-2">
                    <span className="text-slate-500 font-mono text-[10px] uppercase font-bold not-italic">EN:</span>
                    <span>{msg.englishTranslation}</span>
                  </div>
                )}

                {/* Native Dialect Feedback & Slang Tip Card */}
                {!isUser && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    {/* Feedback analysis */}
                    {msg.feedback && (
                      <div className="flex items-start gap-2 text-slate-300 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/60">
                        <Sparkles size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{msg.feedback}</span>
                      </div>
                    )}

                    {/* How a Local Would Rephrase It */}
                    {msg.rephraseSuggestion && (
                      <div className="p-2.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 flex items-start gap-2 text-xs">
                        <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold shrink-0 mt-0.5">
                          LOCAL POLISH:
                        </span>
                        <span className="italic">{msg.rephraseSuggestion}</span>
                      </div>
                    )}

                    {/* Slang / Idiom Pill with Save to Vault Button */}
                    {msg.slangTip && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-amber-300 font-bold font-mono text-xs">
                            <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px] uppercase">SLANG</span>
                            <span>{msg.slangTip}</span>
                          </div>
                          {msg.slangMeaning && (
                            <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">{msg.slangMeaning}</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleSaveToVault(msg.slangTip!, msg.slangMeaning || '', msg.content)}
                          disabled={isVocabSaved}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                            isVocabSaved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          }`}
                          title="Save this native slang word to your Vocab Vault"
                        >
                          {isVocabSaved ? (
                            <>
                              <Check size={13} />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Bookmark size={13} />
                              <span>Save to Vault</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Formulating Loading Indicator */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl rounded-bl-sm p-4 flex items-center gap-3 text-slate-300 text-xs shadow-lg">
              <Loader2 size={18} className="text-emerald-400 animate-spin" />
              <div>
                <span className="font-bold text-white block">{selectedTrack.persona} is typing...</span>
                <span className="text-[11px] text-slate-400 font-mono">Formulating authentic {selectedTrack.dialect} phrasing</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Interactive Quick Reply Suggestion Chips */}
      {availableQuickReplies.length > 0 && !isThinking && (
        <div className="bg-slate-900/80 border-t border-slate-800/80 px-4 py-2.5 shrink-0 overflow-x-auto scrollbar-none flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 shrink-0">
            Suggested:
          </span>
          {availableQuickReplies.map((reply, i) => (
            <button
              key={i}
              dir={selectedTrack.id.startsWith('ar') ? 'rtl' : 'ltr'}
              onClick={() => handleSendMessage(reply)}
              className="px-3.5 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-xs text-slate-300 hover:text-emerald-300 whitespace-nowrap transition-all shadow-sm active:scale-95"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Footer */}
      <footer className="p-4 bg-slate-950/95 border-t border-slate-800/80 shrink-0">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          {/* Mic Speech-to-Text Button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3.5 rounded-2xl transition-all border shrink-0 relative ${
              isListening
                ? 'bg-rose-500 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isListening ? 'Stop recording speech' : 'Speak to Vera (Speech-to-Text)'}
          >
            <Mic size={20} />
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-400 animate-ping" />
            )}
          </button>

          {/* Text input */}
          <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all shadow-inner px-4 py-1.5">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={isListening ? `Listening in ${selectedTrack.dialect}... speak now` : `Reply in ${selectedTrack.dialect} or ask how to say something...`}
              rows={1}
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none resize-none py-2 max-h-32"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isThinking}
              className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/20 shrink-0 ml-2"
              title="Send to Vera"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Status footnote */}
        <div className="max-w-4xl mx-auto mt-2 text-center text-[10px] text-slate-500 font-mono flex items-center justify-center gap-2">
          <span>Active: {selectedTrack.dialect} ({selectedTrack.region})</span>
          <span>•</span>
          <span>Live Audio &amp; Speech API</span>
          <span>•</span>
          <button onClick={onOpenAdmin} className="text-emerald-500 hover:underline">
            Telemetry Feed
          </button>
        </div>
      </footer>

      {/* Vocab Saved Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-2xl shadow-2xl text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Bookmark size={15} />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Mic Unsupported Notice Toast */}
      {micNotice && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Info size={16} className="text-cyan-400" />
          <span>Speech recognition not supported in this browser. Please type directly!</span>
        </div>
      )}

      {/* Pronunciation Practice Modal */}
      {practiceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-5 relative">
            <button
              onClick={() => {
                soundFX.playTap();
                setPracticeTarget(null);
                setPracticeAccuracy(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Mic size={15} />
              <span>Pronunciation Coach</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Target Sentence:</span>
              <p className="text-lg font-bold text-white leading-relaxed">{practiceTarget}</p>
              <button
                onClick={() => playTTS(practiceTarget, 'practice', 0.85)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1.5 pt-1"
              >
                <Volume2 size={13} />
                <span>Hear Native Cadence (Slow 0.85x)</span>
              </button>
            </div>

            {/* Mic Practice Button */}
            <div className="text-center py-2 space-y-3">
              <button
                onClick={startPracticeMic}
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all shadow-xl ${
                  isPracticingMic
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                }`}
                title="Speak to practice"
              >
                <Mic size={26} />
              </button>
              <span className="text-xs font-mono text-slate-400 block">
                {isPracticingMic ? 'Listening... speak the sentence clearly!' : 'Tap mic to record your voice'}
              </span>
            </div>

            {/* Transcript & Accuracy Score */}
            {practiceSpoken && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Heard:</span>
                  {practiceAccuracy && (
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      practiceAccuracy >= 85
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {practiceAccuracy}% Accuracy
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-200 italic">"{practiceSpoken}"</p>
              </div>
            )}

            <button
              onClick={() => {
                setPracticeTarget(null);
                setPracticeAccuracy(null);
              }}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Done Practicing
            </button>
          </div>
        </div>
      )}

      {/* Mission Celebration Modal */}
      {missionCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
              <Sparkles size={32} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                MISSION COMPLETED
              </span>
              <h3 className="text-xl font-black text-white">Conversational Milestone Reached!</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Earned <span className="text-emerald-400 font-bold">+{missionCelebration.sparks} Sparks</span> and sharpened your conversational reflex in {selectedTrack.dialect}!
              </p>
            </div>
            <button
              onClick={() => {
                soundFX.playTap();
                setMissionCelebration(null);
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase font-mono tracking-wider shadow-md transition-all active:scale-95"
            >
              Continue Conversing
            </button>
          </div>
        </div>
      )}

      {/* 24/7 Live Voice Call Screen Modal */}
      <LiveVoiceCallModal
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        tutor={currentTutor}
        dialectTrack={selectedTrack}
        level={learnerLevel}
        onLevelChange={(lvl) => setLearnerLevel(lvl)}
        onSendMessage={handleSendMessage}
        onSparksEarned={(sparks) => {
          if (user?.uid) {
            rewardUserSparksAndStreak(user.uid, sparks).then((updated) => {
              if (updated && onRewardClaimed) onRewardClaimed(updated);
            });
          }
        }}
        showTransliteration={showTransliteration}
        speechRate={speechRate}
        onSpeechRateChange={(rate) => setSpeechRate(rate)}
      />
    </div>
  );
};

function getSpeechLangCode(trackId: string): string {
  if (trackId.startsWith('es')) return 'es-MX';
  if (trackId.startsWith('fr')) return 'fr-FR';
  if (trackId.startsWith('ja')) return 'ja-JP';
  if (trackId.startsWith('ar')) return 'ar-EG';
  if (trackId.startsWith('it')) return 'it-IT';
  if (trackId.startsWith('pt')) return 'pt-BR';
  if (trackId.startsWith('zh')) return 'zh-HK';
  if (trackId.startsWith('de')) return 'de-DE';
  return 'en-US';
}

function getDialectGreetingData(track: DialectTrack): {
  content: string;
  translation: string;
  slangTip: string;
  slangMeaning: string;
  rephraseTip: string;
  suggestedReplies: string[];
} {
  switch (track.id) {
    case 'es-MX':
      return {
        content: `¡Qué onda! Soy ${track.persona}. Estoy listo para que hablemos español mexicano de verdad. Cuéntame, ¿qué tal pinta tu día hoy?`,
        translation: "What's up! I am Mateo. I'm ready for us to speak real Mexican Spanish. Tell me, how is your day shaping up today?",
        slangTip: '«¿Qué onda?»',
        slangMeaning: 'The ubiquitous informal Mexican greeting for "What\'s up?".',
        rephraseTip: 'En un saludo casual, puedes responder con: «Todo bien carnal, ¿y tú qué cuentas?»',
        suggestedReplies: [
          '¡Todo al cien compa, con toda la actitud!',
          '¿Qué me recomiendas pedir para comer hoy?',
          'Ando explorando la ciudad un rato'
        ]
      };
    case 'fr-FR':
      return {
        content: `Salut ! C'est ${track.persona}. Bienvenue dans notre session d'immersion parisienne. De quoi tu as envie de parler aujourd'hui ?`,
        translation: "Hey! It's Chloé. Welcome to our Parisian immersion session. What do you feel like talking about today?",
        slangTip: '« Ça roule »',
        slangMeaning: 'Extremely common colloquial French for "Things are going smoothly / sounds good".',
        rephraseTip: 'À Paris on dit souvent : « Ça fait un bail ! » quand on retrouve un ami.',
        suggestedReplies: [
          'Ça roule impec, et toi comment ça va ?',
          'On se prend un petit café en terrasse ?',
          "C'est quoi le meilleur endroit pour flâner ?"
        ]
      };
    case 'ja-JP':
      return {
        content: `こんにちは！${track.persona}です。東京のリアルな日常会話を練習しましょう。よろしくお願いします！`,
        translation: "Hello! It's Kenji. Let's practice real Tokyo everyday conversation. Looking forward to chatting!",
        slangTip: '「よろしく！」',
        slangMeaning: 'Short friendly version of Yoroshiku onegaishimasu used between peers.',
        rephraseTip: '居酒屋に入ったらまず「生ひとつ！」と頼むと最高にローカルです。',
        suggestedReplies: [
          'よろしくお願いします！元気ですよ',
          '東京のおすすめのラーメン屋は？',
          '今日の天気は最高ですね！'
        ]
      };
    case 'pt-BR':
      return {
        content: `E aí meu irmão, beleza? Sou o ${track.persona}. Bora trocar uma ideia naquele clima carioca suave?`,
        translation: "What's up my brother, all good? I'm Thiago. Let's chat in that smooth Carioca beach vibe?",
        slangTip: '«Trocar uma ideia»',
        slangMeaning: 'Iconic Brazilian idiom for having a friendly, relaxed chat or catching up.',
        rephraseTip: 'Para cumprimentar no calçadão, mande: «Fala parceiro, tranquilidade?»',
        suggestedReplies: [
          'Tudo suave meu parceiro, só na paz!',
          'Bora tomar uma água de coco na praia?',
          'O que tá rolando de bom no Rio hoje?'
        ]
      };
    case 'es-CO':
      return {
        content: `¡Qué hubo, parce! Soy ${track.persona}. Qué alegría tenerte aquí para practicar el mejor acento paisa. ¿Qué más pues?`,
        translation: "What's up, buddy! I'm Mateo. Such a pleasure to have you here to practice the best Paisa accent. What else is new?",
        slangTip: '«¿Qué más pues?»',
        slangMeaning: 'Classic Medellín conversation starter meaning "So, what\'s new with you?".',
        rephraseTip: 'Usa «bacano» o «chévere» para decir que algo te gusta mucho.',
        suggestedReplies: [
          '¡Todo bien mi parce, qué berraquera!',
          '¿Dónde me recomiendas comer una buena bandeja?',
          'Ando conociendo Medellín por primera vez'
        ]
      };
    case 'ar-EG':
      return {
        content: `أهلاً بيك يا باشا! أنا ${track.persona}. جاهز نتكلم مصري زي أهل البلد بالظبط. إيه الأخبار عندك النهارده؟`,
        translation: "Welcome boss! I am Omar. Ready to speak Egyptian just like the locals. What's the news with you today?",
        slangTip: '«يا باشا (Ya basha)»',
        slangMeaning: 'Affectionate title meaning "boss / sir", universally used in Cairo street etiquette.',
        rephraseTip: 'قول: «كله تمام الحمد لله» للرد السريع.',
        suggestedReplies: [
          'كله تمام والحمد لله يا باشا',
          'عايز أعرف أحسن مكان للكشري',
          'إيه الأخبار في وسط البلد؟'
        ]
      };
    case 'it-NAP':
      return {
        content: `Uè guaglió! Sono ${track.persona}. Benvenuto a Napoli! Pronto per imparare la lingua della strada e del cuore?`,
        translation: "Hey kid/bro! I'm Marco. Welcome to Naples! Ready to learn the language of the street and the heart?",
        slangTip: '«Uè guaglió»',
        slangMeaning: 'The quintessential Neapolitan shout of warm greeting to a friend or fellow youth.',
        rephraseTip: 'A Napoli il caffè non è una bevanda, è una religione: ordina sempre «un caffè ristretto»!',
        suggestedReplies: [
          'Uè Marco! Stamme senza pensieri!',
          'Dove si mangia la pizza più buona?',
          'Che bella città, sono felicissimo!'
        ]
      };
    default:
      return {
        content: `Hello! I am ${track.persona}, your native coach for ${track.dialect}. What would you like to explore today?`,
        translation: `Hello! I am ${track.persona}, your native coach for ${track.dialect}. What would you like to explore today?`,
        slangTip: 'Colloquial cadence',
        slangMeaning: 'Informal connectors help conversations flow naturally without textbook stiffness.',
        rephraseTip: 'Start with a relaxed everyday greeting to set a welcoming tone.',
        suggestedReplies: [
          'Tell me about local street food!',
          'How do locals greet each other?',
          'Everything is great, thank you!'
        ]
      };
  }
}
