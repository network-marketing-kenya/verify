import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Analytics } from '@vercel/analytics/react';
import countriesData from './data/countries.json';
import {
  ChevronDown,
  Search,
  Phone,
  Check,
  Download,
  Users,
  X,
  Database,
  ArrowRight,
  UserCheck,
  Shield,
  UserPlus,
  LogIn,
  LogOut,
  Plus,
  AlertTriangle,
  FileText,
  User,
  Copy,
  Link2,
  MessageCircle,
  Eye,
  EyeOff,
  Bell,
  Key,
  ToggleLeft,
  ToggleRight,
  UserMinus,
  Maximize2,
  Minimize2,
  Trash2,
  Clock,
  Sparkles,
  Trophy,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';



const copyToClipboard = async (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard failed, trying fallback:', err);
    }
  }

  // Fallback using traditional document.execCommand
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) return true;
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  return false;
};

// Typewriter component for daily inspiration powered by Gemini
function MotivationalQuote() {
  const defaultQuotes = [
    "The strength of the team is each individual member. The strength of each member is the team.",
    "Alone we can do so little; together we can do so much.",
    "Success in this industry is not in finding the right person, but in becoming the right person.",
    "Build your network, build your dream.",
    "Great things in business are never done by one person. They are done by a team of people.",
    "Your downline is a reflection of your own leadership, commitment, and daily actions.",
    "If you want to go fast, go alone. If you want to go far, go together.",
    "Your network is your net worth. Build genuine connections and success will follow.",
    "Consistency is the key. Small daily actions lead to monumental network growth.",
    "The best way to predict the future is to create it with an extraordinary team."
  ];

  const [quotesPool, setQuotesPool] = useState(defaultQuotes);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() => Math.floor(Math.random() * defaultQuotes.length));
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeQuote = quotesPool[currentQuoteIndex] || defaultQuotes[0];

  // Fetch a quote from Gemini in the background on mount to enrich the pool
  useEffect(() => {
    let active = true;
    const fetchEnrichedQuote = async () => {
      try {
        const res = await fetch('/api/motivation');
        if (!res.ok) return;
        const data = await res.json();
        if (active && data && data.quote) {
          setQuotesPool(prev => {
            // Avoid duplicates
            if (prev.includes(data.quote)) return prev;
            return [...prev, data.quote];
          });
        }
      } catch (err) {
        // Silent background fallback
      }
    };
    fetchEnrichedQuote();
    return () => { active = false; };
  }, []);

  // Handle typing animation and rotation
  useEffect(() => {
    if (charIndex < activeQuote.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + activeQuote[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 40); // typing speed
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCharIndex(0);
        setDisplayedText("");
        setCurrentQuoteIndex(prev => (prev + 1) % quotesPool.length);
      }, 60000); // 60 seconds stay
      return () => clearTimeout(timeout);
    }
  }, [charIndex, activeQuote, quotesPool.length]);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(activeQuote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      title="Click/Touch to copy quote"
      style={{
        minHeight: '64px',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: '1rem',
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        borderLeft: '3px solid var(--accent-purple)',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '0 12px 12px 0',
        lineHeight: '1.45',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.15)',
        animation: 'fadeIn 0.5s ease-in',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
    >
      <div style={{ position: 'relative', width: '100%' }}>
        <span style={{ color: 'var(--accent-teal)', marginRight: '6px', fontWeight: 'bold' }}>✦</span>
        <span>{displayedText}</span>
        {charIndex < activeQuote.length && (
          <span style={{
            marginLeft: '2px',
            color: 'var(--accent-purple)',
            fontWeight: 'bold',
            opacity: 0.8
          }}>|</span>
        )}
      </div>

      <span style={{
        fontSize: '0.7rem',
        color: copied ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.35)',
        marginTop: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: copied ? 'bold' : 'normal',
        transition: 'all 0.2s'
      }}>
        {copied ? (
          <>✓ Copied to clipboard!</>
        ) : (
          <>⎘ Click to copy</>
        )}
      </span>
    </div>
  );
}

function App() {
  const countries = countriesData;
  const defaultCountry = countries.find(c => c.code === 'KE') || countries[0];

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');

  // App States
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Registration Country Selector
  const [regSelectedCountry, setRegSelectedCountry] = useState(defaultCountry);
  const [isRegDropdownOpen, setIsRegDropdownOpen] = useState(false);
  const [regSearchQuery, setRegSearchQuery] = useState('');

  // Visitor Form States
  const [visitorName, setVisitorName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [referrer, setReferrer] = useState(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(15);
  // Group param tracking for duplicate detection
  const [activeGroupId, setActiveGroupId] = useState(null);
  // Duplicate detection state (for visitor landing)
  const [duplicateData, setDuplicateData] = useState(null); // { assignedMemberPhone }

  // Authentication States
  const [currentUser, setCurrentUser] = useState(null);
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isRegSuccess, setIsRegSuccess] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Database States
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const knownLeadIdsRef = useRef(new Set());
  const hasInitializedLeadsRef = useRef(false);

  // Dashboard filter states
  const [filterMode, setFilterMode] = useState('unseen'); // 'unseen' | 'seen' | 'all'
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [activeImpersonatedUser, setActiveImpersonatedUser] = useState(null);

  // ─── Effective Dashboard User (impersonation support) ───────────────────────
  const effectiveDashboardUser = activeImpersonatedUser || currentUser;
  const effectiveDashboardUserRef = useRef(effectiveDashboardUser);
  useEffect(() => {
    effectiveDashboardUserRef.current = effectiveDashboardUser;
  }, [effectiveDashboardUser]);

  // AI Copilot States
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState('');
  const [copilotProvider, setCopilotProvider] = useState('');
  const [isCopilotAnalyzing, setIsCopilotAnalyzing] = useState(false);
  const [copilotError, setCopilotError] = useState('');
  const [copilotSnapshot, setCopilotSnapshot] = useState(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Admin Counter Reset States
  const [resetTargetPhone, setResetTargetPhone] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetSecondConfirm, setShowResetSecondConfirm] = useState(false);
  const [isResettingCounter, setIsResettingCounter] = useState(false);

  // VCF export mode per dashboard
  const [exportMode, setExportMode] = useState('suffix'); // 'fullname' | 'suffix'
  const [smsOnly, setSmsOnly] = useState(() => localStorage.getItem('sms_only_mode') === 'true');
  const handleToggleSmsOnly = (val) => {
    setSmsOnly(val);
    localStorage.setItem('sms_only_mode', String(val));
    showToast(`📝 Mode: ${val ? 'Direct SMS Only (20 Max)' : 'WhatsApp + SMS Mode'}`);
  };
  const [viewMode, setViewMode] = useState('swipe'); // 'list' | 'swipe'
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' | 'right' | null
  const [swipeHistory, setSwipeHistory] = useState([]);
  const [swipeLeads, setSwipeLeads] = useState([]);
  const [timeTick, setTimeTick] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCardHinting, setIsCardHinting] = useState(false);
  const swipeCardRef = useRef(null);
  // Use refs for drag values to avoid stale closures in event handlers
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const hasHintedRef = useRef(false);

  const handleDragStart = (clientX) => {
    // Enforce anti-spam cooldown and daily locked states on drag gestures
    const status = getSwipeStatus();
    if (status.cooldownRemaining > 0 || status.currentChannel === 'locked') {
      return;
    }
    isDraggingRef.current = true;
    startXRef.current = clientX;
    dragOffsetRef.current = 0;
    setIsDragging(true);
    setDragOffset(0);
    // Stop hint animation when user starts interacting
    setIsCardHinting(false);
  };

  const handleDragMove = (clientX) => {
    if (!isDraggingRef.current) return;
    const diff = clientX - startXRef.current;
    dragOffsetRef.current = diff;
    setDragOffset(diff);
  };

  const handleDragEnd = (lead) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    const finalOffset = dragOffsetRef.current;
    dragOffsetRef.current = 0;
    setDragOffset(0);

    const threshold = 80;
    if (finalOffset > threshold) {
      const status = getSwipeStatus();
      if (status.currentChannel === 'locked') {
        alert(smsOnly
          ? "⚠️ Daily Limit Reached: You have reached the limit of 20 SMS swipes for today."
          : "⚠️ Daily Limit Reached: You have reached the limit of 10 WhatsApp and 20 SMS swipes for today."
        );
        return; // snaps back, does not advance
      }
      if (status.cooldownRemaining > 0) {
        alert(`⚠️ Anti-Spam Cooldown: Please wait ${status.cooldownRemaining} seconds before swiping to message another lead.`);
        return; // snaps back, does not advance
      }

      setSwipeDirection('right');
      setTimeout(async () => {
        if (status.currentChannel === 'sms') {
          await handleSmsLead(lead);
        } else {
          await handleWhatsAppLead(lead);
        }
        setCurrentSwipeIndex(prev => prev + 1);
        setSwipeDirection(null);
      }, 250);
    } else if (finalOffset < -threshold) {
      setSwipeDirection('left');
      setSwipeHistory(prev => [...prev, currentSwipeIndex]);
      setTimeout(() => {
        setCurrentSwipeIndex(prev => prev + 1);
        setSwipeDirection(null);
      }, 250);
    }
  };


  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e) => {
      handleDragMove(e.clientX);
    };

    const handleWindowMouseUp = () => {
      // Find the current active lead to pass to handleDragEnd
      const activeList = swipeLeads;
      if (activeList.length > 0) {
        const rawLead = activeList[currentSwipeIndex % activeList.length];
        const currentLead = leads.find(l => l.id === rawLead?.id) || rawLead;
        handleDragEnd(currentLead);
      } else {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    };

    const handleWindowTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handleDragMove(e.touches[0].clientX);
      }
    };

    const handleWindowTouchEnd = () => {
      const activeList = swipeLeads;
      if (activeList.length > 0) {
        const rawLead = activeList[currentSwipeIndex % activeList.length];
        const currentLead = leads.find(l => l.id === rawLead?.id) || rawLead;
        handleDragEnd(currentLead);
      } else {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
    window.addEventListener('touchend', handleWindowTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
    };
  }, [isDragging, swipeLeads, currentSwipeIndex, leads]);

  const handleUndoSwipe = () => {
    if (swipeHistory.length === 0) return;
    const previousIndex = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory(prev => prev.slice(0, -1));

    setSwipeDirection('left');
    setCurrentSwipeIndex(previousIndex);
    setTimeout(() => {
      setSwipeDirection(null);
    }, 50);
  };

  // Groups & rotation
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');

  // Group requests (member-initiated)
  const [groupRequests, setGroupRequests] = useState([]);
  const [memberGroupRequestName, setMemberGroupRequestName] = useState('');
  const [memberGroupRequestStatus, setMemberGroupRequestStatus] = useState(null);

  // Group member phone-search state (per group, keyed by groupId)
  const [groupMemberSearch, setGroupMemberSearch] = useState({}); // { [groupId]: query }
  const [groupMemberSearchResults, setGroupMemberSearchResults] = useState({}); // { [groupId]: [] }

  // Fully open/expanded group analytics view state
  const [expandedGroupAnalytics, setExpandedGroupAnalytics] = useState(null);

  // Password reset state (admin only — resets another user's password)
  const [resetPasswordTarget, setResetPasswordTarget] = useState(null); // phone
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetPasswordMsg, setResetPasswordMsg] = useState('');

  // Change own password (self-service modal)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [cpCurrentPassword, setCpCurrentPassword] = useState('');
  const [cpNewPassword, setCpNewPassword] = useState('');
  const [cpConfirmPassword, setCpConfirmPassword] = useState('');
  const [cpError, setCpError] = useState('');
  const [cpSuccess, setCpSuccess] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [cpShowCurrent, setCpShowCurrent] = useState(false);
  const [cpShowNew, setCpShowNew] = useState(false);

  // Referrer info
  const [referrerInfo, setReferrerInfo] = useState({ name: 'Tonny', phone: '254775499650' });
  // Duplicate-detected original referrer info (for the "already registered" screen)
  const [duplicateReferrerInfo, setDuplicateReferrerInfo] = useState(null);

  const currentUserRef = useRef(currentUser);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  const dropdownRef = useRef(null);
  const badgeRef = useRef(null);
  const [badgeWidth, setBadgeWidth] = useState(90);

  const regDropdownRef = useRef(null);
  const regBadgeRef = useRef(null);
  const [regBadgeWidth, setRegBadgeWidth] = useState(90);

  // ─── Fetch Helpers ──────────────────────────────────────────────────────────
  const fetchGroupReferrerDetails = async (groupId) => {
    try {
      const res = await fetch(`/api/referrer?group=${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setReferrerInfo(data);
        setReferrer(data.phone);
        setActiveGroupId(groupId);
      }
    } catch (error) {
      console.error('Error fetching group referrer:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      if (res.ok) setGroups(await res.json());
    } catch (error) { console.error('Error fetching groups:', error); }
  };

  const fetchGroupRequests = async () => {
    try {
      const res = await fetch('/api/groups?scope=requests');
      if (res.ok) setGroupRequests(await res.json());
    } catch (error) { console.error('Error fetching group requests:', error); }
  };

  const fetchLeads = async (userPhone = null) => {
    try {
      let url = '/api/leads';
      if (userPhone) {
        url = `/api/leads?refUserPhone=${userPhone}`;
      } else {
        const targetUser = effectiveDashboardUser || currentUser;
        if (targetUser) {
          const isCreator = groups.some(g => g.createdByPhone === targetUser.phone);
          const fetchAll = targetUser.role === 'admin' || isCreator;
          if (!fetchAll) {
            url = `/api/leads?refUserPhone=${targetUser.phone}`;
          }
        }
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
        const validFetched = data.filter(l => l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__');
        validFetched.forEach(l => knownLeadIdsRef.current.add(l.id));
        hasInitializedLeadsRef.current = true;
      }
    } catch (error) { console.error('Error fetching leads:', error); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (error) { console.error('Error fetching users:', error); }
  };

  const fetchReferrerDetails = async (refPhone) => {
    try {
      const res = await fetch(`/api/referrer?phone=${refPhone}`);
      if (res.ok) setReferrerInfo(await res.json());
    } catch (error) { console.error('Error fetching referrer:', error); }
  };

  // 1-second interval to update cooldown timers dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll for new leads every 8 seconds when user is logged in
  useEffect(() => {
    if (!currentUser) {
      hasInitializedLeadsRef.current = false;
      knownLeadIdsRef.current.clear();
      return;
    }

    const checkNewLeads = async () => {
      try {
        const isCreator = groups.some(g => g.createdByPhone === effectiveDashboardUser.phone);
        const fetchAll = effectiveDashboardUser.role === 'admin' || isCreator;
        const url = fetchAll ? '/api/leads' : `/api/leads?refUserPhone=${effectiveDashboardUser.phone}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const currentFetchedLeads = await res.json();

        // Filter out WA logs, Skip logs, and SMS logs
        const validFetched = currentFetchedLeads.filter(l => l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__');

        if (!hasInitializedLeadsRef.current) {
          // Initialize known leads
          validFetched.forEach(l => knownLeadIdsRef.current.add(l.id));
          hasInitializedLeadsRef.current = true;
          setLeads(currentFetchedLeads);
          return;
        }

        // Check for new leads
        const newLeadsDetected = validFetched.filter(l => !knownLeadIdsRef.current.has(l.id));

        if (newLeadsDetected.length > 0) {
          // Add newly detected lead IDs to known set
          newLeadsDetected.forEach(l => knownLeadIdsRef.current.add(l.id));
        }

        // Update leads state
        setLeads(currentFetchedLeads);
      } catch (error) {
        console.error('Error polling for new leads:', error);
      }
    };

    // Run check immediately on login/mount or impersonation switch
    checkNewLeads();

    const intervalId = setInterval(checkNewLeads, 8000);
    return () => clearInterval(intervalId);
  }, [currentUser, effectiveDashboardUser, groups]);

  // ─── Routing & Session Restore ──────────────────────────────────────────────
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref');
      const groupParam = urlParams.get('group');

      if (!refParam && !groupParam && (hash === '#/' || hash === '')) {
        window.location.hash = '#/login';
        return;
      }
      const storedUser = JSON.parse(localStorage.getItem('contacts_current_user') || 'null');
      if (hash === '#/dashboard' && (!storedUser || storedUser.role !== 'user')) {
        window.location.hash = '#/login'; return;
      }
      if (hash === '#/admin' && (!storedUser || storedUser.role !== 'admin')) {
        window.location.hash = '#/login'; return;
      }
      setCurrentRoute(hash);
      setAuthError('');
      setIsRegSuccess(false);
    };
    window.addEventListener('hashchange', handleHashChange);

    const storedUser = localStorage.getItem('contacts_current_user');
    let loggedInUser = null;
    if (storedUser) {
      loggedInUser = JSON.parse(storedUser);
      setCurrentUser(loggedInUser);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    const groupParam = urlParams.get('group');
    const hash = window.location.hash || '#/';

    if (groupParam) {
      fetchGroupReferrerDetails(groupParam);
    } else if (refParam) {
      setReferrer(refParam);
      fetchReferrerDetails(refParam);
    } else {
      if (hash === '#/' || hash === '') window.location.hash = '#/login';
      else if (hash === '#/dashboard' && (!loggedInUser || loggedInUser.role !== 'user')) window.location.hash = '#/login';
      else if (hash === '#/admin' && (!loggedInUser || loggedInUser.role !== 'admin')) window.location.hash = '#/login';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync data on route change
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('contacts_current_user') || 'null');
    if (storedUser) {
      if (storedUser.role === 'admin') {
        fetchUsers();
        fetchLeads();
        fetchGroups();
        fetchGroupRequests();
      } else if (storedUser.role === 'user') {
        fetchLeads();
        fetchGroups();
        // Re-fetch current user's permissions
        fetch('/api/users').then(r => r.ok ? r.json() : []).then(data => {
          const me = data.find(u => u.phone === storedUser.phone);
          if (me) {
            const updated = { ...storedUser, canCreateGroup: me.canCreateGroup, canRegisterMembers: me.canRegisterMembers };
            localStorage.setItem('contacts_current_user', JSON.stringify(updated));
            setCurrentUser(updated);
          }
        });
      }
    }
  }, [currentRoute, isSaved]);

  // Adjust badge width
  useEffect(() => {
    if (badgeRef.current) setBadgeWidth(badgeRef.current.offsetWidth);
  }, [selectedCountry, currentRoute]);
  useEffect(() => {
    if (regBadgeRef.current) setRegBadgeWidth(regBadgeRef.current.offsetWidth);
  }, [regSelectedCountry, currentRoute]);

  // IntersectionObserver: trigger swipe hint animation once when card enters viewport
  useEffect(() => {
    if (viewMode !== 'swipe' || hasHintedRef.current) return;
    if (!swipeCardRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasHintedRef.current) {
          hasHintedRef.current = true;
          // Small delay so the card settles before hinting
          setTimeout(() => setIsCardHinting(true), 400);
          // Remove class after animation completes so it can re-trigger if needed
          setTimeout(() => setIsCardHinting(false), 400 + 1600);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(swipeCardRef.current);
    return () => observer.disconnect();
  }, [swipeCardRef.current, viewMode]);

  // Geolocation auto-detect
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.country_code) {
          const detected = countries.find(c => c.code === data.country_code.toUpperCase());
          if (detected) { setSelectedCountry(detected); setRegSelectedCountry(detected); }
        }
      })
      .catch(() => { });
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (isCountingDown && countdown > 0 && !isLoading) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isCountingDown && countdown === 0 && !isLoading) {
      executeSaveLead();
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown, isLoading]);

  // Filter helpers
  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.dial_code.includes(searchQuery)
  );
  const filteredRegCountries = countries.filter(c =>
    c.name.toLowerCase().includes(regSearchQuery.toLowerCase()) || c.dial_code.includes(regSearchQuery)
  );

  // Click outside dropdowns
  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
      if (regDropdownRef.current && !regDropdownRef.current.contains(e.target)) setIsRegDropdownOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // ─── Auth Handlers ──────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authName || !authPhone || !authPassword) { setAuthError('Please fill in all fields'); return; }
    setIsLoading(true); setAuthError('');

    let cleanedPhone = authPhone.trim().replace(/\D/g, '');
    const dialCodeDigits = regSelectedCountry.dial_code.replace(/\D/g, '');
    if (cleanedPhone.startsWith(dialCodeDigits)) cleanedPhone = cleanedPhone.substring(dialCodeDigits.length);
    if (cleanedPhone.startsWith('0')) cleanedPhone = cleanedPhone.substring(1);
    const cleanFullPhone = `${regSelectedCountry.dial_code.replace(/\D/g, '')}${cleanedPhone}`;

    try {
      const res = await fetch('/api/auth?action=register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authName.trim(), phone: cleanFullPhone, password: authPassword })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
      setIsRegSuccess(true); setAuthError(''); setAuthName(''); setAuthPhone(''); setAuthPassword('');
      setTimeout(() => { window.location.hash = '#/login'; }, 1500);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setAuthError(''); setIsLoading(true);
    let cleanedPhone = authPhone.trim().replace(/\D/g, '');
    if (cleanedPhone.startsWith('0')) cleanedPhone = cleanedPhone.substring(1);
    try {
      const res = await fetch('/api/auth?action=login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanedPhone, password: authPassword })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
      const userSession = await res.json();
      localStorage.setItem('contacts_current_user', JSON.stringify(userSession));
      setCurrentUser(userSession);
      window.location.hash = userSession.role === 'admin' ? '#/admin' : '#/dashboard';
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('contacts_current_user');
    setCurrentUser(null);
    window.location.hash = '#/login';
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setCpError('');
    setCpSuccess('');
    if (!cpCurrentPassword || !cpNewPassword || !cpConfirmPassword) {
      setCpError('All fields are required.');
      return;
    }
    if (cpNewPassword !== cpConfirmPassword) {
      setCpError('New passwords do not match.');
      return;
    }
    if (cpNewPassword.length < 4) {
      setCpError('New password must be at least 4 characters.');
      return;
    }
    setCpLoading(true);
    try {
      const res = await fetch('/api/users?action=change_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: currentUser.phone,
          currentPassword: cpCurrentPassword,
          newPassword: cpNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setCpSuccess('Password changed successfully! You can now log in with your new password.');
      setCpCurrentPassword('');
      setCpNewPassword('');
      setCpConfirmPassword('');
      // Auto-close after 2.5 seconds
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setCpSuccess('');
      }, 2500);
    } catch (err) {
      setCpError(err.message);
    } finally {
      setCpLoading(false);
    }
  };

  // ─── Utilities ──────────────────────────────────────────────────────────────
  const toSentenceCase = (str) => {
    if (!str) return '';
    return str.trim().toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatGlobalPhoneNumber = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    const startsWithCC = countries.some(c => {
      const code = c.dial_code.replace('+', '');
      return cleaned.startsWith(code) && cleaned.length > code.length;
    });
    return startsWithCC ? '+' + cleaned : '+254' + cleaned;
  };

  // Build the exported VCF name based on mode
  const buildVcfName = (lead) => {
    if (exportMode === 'suffix') {
      const firstName = lead.name.split(' ')[0];
      const code = lead.countryCode || 'KE';
      return `${firstName} ${code}`;
    }
    return lead.name;
  };

  // ─── Visitor Form Handlers ──────────────────────────────────────────────────
  const handleSaveLead = (e) => {
    e.preventDefault();
    if (!visitorName.trim() || !phoneNumber.trim()) return;

    let cleanPhone = phoneNumber.replace(/\D/g, '');
    const dialCodeDigits = selectedCountry.dial_code.replace(/\D/g, '');
    
    // Strip dial code if user typed it
    if (cleanPhone.startsWith(dialCodeDigits)) {
      cleanPhone = cleanPhone.substring(dialCodeDigits.length);
    }
    // Strip leading zero
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }

    // Validate Kenyan numbers (dial code 254)
    if (dialCodeDigits === '254') {
      const startsWithValidPrefix = cleanPhone.startsWith('7') || cleanPhone.startsWith('1');
      if (cleanPhone.length !== 9 || !startsWithValidPrefix) {
        alert("⚠️ Please double check your phone number. A valid Kenyan mobile number must start with 7 or 1 and contain 9 digits (e.g. 0712345678 or 0112345678).");
        return;
      }
    } else {
      // General validation for other countries (7 to 15 digits)
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        alert("⚠️ Please double check your phone number. Ensure you entered a valid mobile number.");
        return;
      }
    }

    setCountdown(15);
    setIsCountingDown(true);
  };

  async function executeSaveLead() {
    setIsLoading(true);
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    const dialCodeDigits = selectedCountry.dial_code.replace(/\D/g, '');
    if (cleanPhone.startsWith(dialCodeDigits)) cleanPhone = cleanPhone.substring(dialCodeDigits.length);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);

    // Validation check before submitting to database
    if (dialCodeDigits === '254') {
      const startsWithValidPrefix = cleanPhone.startsWith('7') || cleanPhone.startsWith('1');
      if (cleanPhone.length !== 9 || !startsWithValidPrefix) {
        alert("⚠️ Please double check your phone number. A valid Kenyan mobile number must start with 7 or 1 and contain 9 digits (e.g. 0712345678 or 0112345678).");
        setIsLoading(false);
        setIsCountingDown(false);
        return;
      }
    } else {
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        alert("⚠️ Please double check your phone number. Ensure you entered a valid mobile number.");
        setIsLoading(false);
        setIsCountingDown(false);
        return;
      }
    }

    const cleanDialCode = selectedCountry.dial_code.replace(/\s+/g, '');
    const fullNumber = `${cleanDialCode}${cleanPhone}`;
    const formattedName = toSentenceCase(visitorName);

    try {
      const res = await fetch('/api/leads?action=create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formattedName,
          countryName: selectedCountry.name,
          countryCode: selectedCountry.code,
          dialCode: selectedCountry.dial_code,
          rawNumber: cleanPhone,
          fullNumber: fullNumber,
          refUserPhone: referrer || '254775499650',
          groupId: activeGroupId || null
        })
      });

      if (res.status === 409) {
        // Duplicate registration in this group
        const errData = await res.json();
        setIsCountingDown(false);
        setDuplicateData({ assignedMemberPhone: errData.assignedMemberPhone });
        // Fetch the original assignee's info to show their save button
        if (errData.assignedMemberPhone) {
          const refRes = await fetch(`/api/referrer?phone=${errData.assignedMemberPhone}`);
          if (refRes.ok) setDuplicateReferrerInfo(await refRes.json());
        }
        setIsLoading(false);
        return;
      }

      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save contact information');

      const successData = await res.json();

      // Update referrerInfo to whoever the backend ACTUALLY assigned this lead to.
      // This is critical — the backend may have assigned a different member than the
      // one shown at page-load time (due to concurrent submissions).
      if (successData.assignedPhone) {
        try {
          const assignedRes = await fetch(`/api/referrer?phone=${successData.assignedPhone}`);
          if (assignedRes.ok) {
            const assignedInfo = await assignedRes.json();
            setReferrerInfo(assignedInfo);
          }
        } catch (_) {
          // Non-critical — worst case the visitor sees the page-load referrer
        }
      }

      setIsSaved(true);
      setIsCountingDown(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveContactBack = (customPhone = null) => {
    const phoneToUse = customPhone || referrerInfo.phone;
    window.location.href = `tel:${formatGlobalPhoneNumber(phoneToUse)}`;
  };

  // ─── VCF Export ─────────────────────────────────────────────────────────────
  const handleExportVCF = async (targetRefPhone = null) => {
    const isRealLead = l => l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__';
    const newLeads = targetRefPhone
      ? leads.filter(l => l.refUserPhone === targetRefPhone && !l.exported && isRealLead(l))
      : leads.filter(l => !l.exported && isRealLead(l));

    if (newLeads.length === 0) { alert('No new contacts to export!'); return; }

    const vcardContent = newLeads.map(lead => [
      'BEGIN:VCARD', 'VERSION:3.0',
      `FN:${buildVcfName(lead)}`,
      `TEL;TYPE=CELL,VOICE:${lead.fullNumber}`,
      'END:VCARD'
    ].join('\r\n')).join('\r\n');

    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contacts_${exportMode}_${targetRefPhone || 'master'}_${Date.now()}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const exportedIds = newLeads.map(l => l.id);
    try {
      const res = await fetch('/api/leads?action=mark_exported', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: exportedIds })
      });
      if (res.ok) setLeads(prev => prev.map(l => exportedIds.includes(l.id) ? { ...l, exported: true } : l));
    } catch (err) { console.error('Error marking exported:', err); }
  };

  const handleDownloadLeadVCard = (lead) => {
    const displayName = buildVcfName(lead);
    const vcardContent = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${displayName}`, `TEL;TYPE=CELL,VOICE:${lead.fullNumber}`, 'END:VCARD'].join('\r\n');
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', `${displayName.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // ─── Gemini AI Copilot Query & Rendering ──────────────────────────────────────
  const handleAskCopilot = async (queryText) => {
    const q = queryText || copilotQuery;
    if (!q || !q.trim()) return;

    // Clear input field immediately for native chat experience
    setCopilotQuery('');

    setIsCopilotAnalyzing(true);
    setCopilotError('');
    try {
      const response = await fetch('/api/ai_copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q })
      });

      const data = await response.json();
      if (!response.ok) {
        setCopilotError(data.message || data.error || 'Failed to communicate with AI Copilot');
      } else {
        setCopilotResponse(data.text);
        setCopilotProvider(data.provider || 'Primary Model (Gemini)');
        if (data.snapshot) {
          setCopilotSnapshot(data.snapshot);
        }
      }
    } catch (err) {
      console.error('Copilot request failed:', err);
      setCopilotError('Network error. Please make sure your server is online and try again.');
    } finally {
      setIsCopilotAnalyzing(false);
    }
  };

  const renderBoldText = (str) => {
    if (!str) return '';
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} style={{ color: '#10B981', fontWeight: 'bold' }}>{part}</strong>;
      }
      return part;
    });
  };

  const formatCopilotResponse = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('###')) {
        return <h4 key={idx} style={{ color: 'var(--accent-teal)', fontSize: '0.925rem', fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem' }}>{trimmed.replace(/^###\s*/, '')}</h4>;
      }
      if (trimmed.startsWith('##')) {
        return <h3 key={idx} style={{ color: 'var(--accent-purple)', fontSize: '1rem', fontWeight: 'bold', marginTop: '1.25rem', marginBottom: '0.5rem' }}>{trimmed.replace(/^##\s*/, '')}</h3>;
      }

      // Bullet points
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const content = trimmed.replace(/^[-*]\s*/, '');
        return (
          <li key={idx} style={{ marginLeft: '1rem', marginBottom: '0.35rem', listStyleType: 'disc', fontSize: '0.825rem', color: '#f3f4f6', lineHeight: '1.4' }}>
            {renderBoldText(content)}
          </li>
        );
      }

      // Empty lines
      if (trimmed === '') {
        return <div key={idx} style={{ height: '0.5rem' }} />;
      }

      return (
        <p key={idx} style={{ fontSize: '0.825rem', lineHeight: '1.4', margin: '0 0 0.5rem 0', color: '#e5e7eb' }}>
          {renderBoldText(trimmed)}
        </p>
      );
    });
  };

  // ─── WhatsApp + Seen ────────────────────────────────────────────────────────
  const handleWhatsAppLead = async (lead) => {
    const userPhone = effectiveDashboardUser?.phone || effectiveDashboardUserRef.current?.phone;
    if (!userPhone) return;

    // Check status first
    const waStatus = getWhatsAppStatus();
    if (waStatus.limitReached) {
      alert("⚠️ Daily Limit Reached: To protect your WhatsApp account from being banned for spam, you are limited to 10 messages per 24 hours. Please try again later.");
      return;
    }
    if (waStatus.cooldownRemaining > 0) {
      alert(`⚠️ Anti-Spam Cooldown: Please wait ${waStatus.cooldownRemaining} seconds before sending the next message.`);
      return;
    }

    const firstName = lead.name.split(' ')[0];

    // 50 different variations of conversation starters
    const starters = [
      "Hi {name}!",
      "Hello {name} 👋",
      "Hey {name}, how is it going?",
      "Hi {name}, glad to connect with you!",
      "Hello {name}, hope you are having a great day!",
      "Hey {name}!",
      "Hello {name}, nice to meet you!",
      "Hi {name}, how are you doing today?",
      "Hey {name}, welcome!",
      "Hi {name}, hope you're doing well.",
      "Hello {name}, great to meet you here!",
      "Hey {name}, hope all is well with you.",
      "Hi there {name}!",
      "Hello {name}, thanks for reaching out!",
      "Hey {name}, glad to link up.",
      "Hi {name}, hope your week is going great!",
      "Hello {name}, how are things?",
      "Hey there {name} 👋",
      "Hi {name}, excited to chat with you!",
      "Hello {name}, hope you're having a good week.",
      "Hey {name}, nice to connect with you.",
      "Hi {name}, how's your day going?",
      "Hello {name}, hope you're doing fantastic!",
      "Hey {name}, glad we could connect.",
      "Hi {name}, how have you been?",
      "Hello {name}, hope everything is going well.",
      "Hey {name}, great connecting with you!",
      "Hi {name}, hope you are doing good.",
      "Hello {name}, nice to link up with you.",
      "Hey {name}, hope your day is going great!",
      "Hi {name}, hope you're having a wonderful day.",
      "Hello {name}, welcome to the group!",
      "Hey {name}, how's everything on your end?",
      "Hi {name}, great to meet you.",
      "Hello {name}, how is your week going?",
      "Hey {name}, hope you are doing well today.",
      "Hi {name}, glad to have you here!",
      "Hello {name}, hope you are having a productive day!",
      "Hey {name}, how are you today?",
      "Hi {name}, nice to meet you here.",
      "Hello {name}, hope you're having a great time.",
      "Hey {name}, welcome aboard!",
      "Hi {name}, hope your day is going fine.",
      "Hello {name}, nice connecting with you today.",
      "Hey {name}, glad to be in touch!",
      "Hi {name}, hope you're having a lovely day.",
      "Hello {name}, hope you are doing great today.",
      "Hey {name}, how is your day treating you?",
      "Hi {name}, welcome to our team/group!",
      "Hello {name}, hope you're doing well today 👋"
    ];

    const randomStarter = starters[Math.floor(Math.random() * starters.length)];
    const message = randomStarter.replace('{name}', firstName);

    // Copy starter message to clipboard
    await copyToClipboard(message);

    // Save the timestamp to log (local and database)
    const timestampNow = Date.now();
    try {
      const key = `wa_log_${userPhone}`;
      const logStr = localStorage.getItem(key);
      let log = logStr ? JSON.parse(logStr) : [];
      log.push(timestampNow);
      localStorage.setItem(key, JSON.stringify(log));
      // Force tick increment to update the UI instantly
      setTimeTick(prev => prev + 1);
    } catch (e) {
      console.error('Error logging WhatsApp message locally:', e);
    }

    try {
      await fetch('/api/leads?action=create_wa_log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPhone, timestamp: timestampNow })
      });
    } catch (dbErr) {
      console.error('Error logging WhatsApp message to database:', dbErr);
    }

    const cleanNumber = lead.fullNumber.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanNumber}`;
    window.open(waUrl, '_blank');

    // Mark as seen
    try {
      const res = await fetch('/api/leads?action=mark_seen', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id })
      });
      if (res.ok) setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, seen: true } : l));
    } catch (err) { console.error('Error marking seen:', err); }
  };

  const handleSmsLead = async (lead) => {
    const userPhone = effectiveDashboardUser?.phone || effectiveDashboardUserRef.current?.phone;
    if (!userPhone) return;

    // Check status first
    const status = getSwipeStatus();
    if (status.currentChannel === 'locked') {
      alert(smsOnly
        ? "⚠️ Daily Limit Reached: You have reached the limit of 20 SMS swipes for today."
        : "⚠️ Daily Limit Reached: You have reached the limit of 10 WhatsApp and 20 SMS swipes for today."
      );
      return;
    }
    if (status.cooldownRemaining > 0) {
      alert(`⚠️ Anti-Spam Cooldown: Please wait ${status.cooldownRemaining} seconds before sending the next message.`);
      return;
    }

    const leadFirstName = lead.name.split(' ')[0];
    const dashboardOwnerName = effectiveDashboardUser?.name ? effectiveDashboardUser.name.split(' ')[0] : 'Admin';

    // Custom SMS template substitution
    const template = `Hey ${leadFirstName}! It's ${dashboardOwnerName}. Your registration was received to join online marketing! 🚀 Please save my number as '${dashboardOwnerName}' and reply 'SAVED' on WhatsApp to activate your team access. (Reply STOP to opt out)`;

    // Step A: Copy template to clipboard
    await copyToClipboard(template);

    // Step B: Trigger a quick toast notification
    showToast("📋 SMS message template copied to clipboard!");

    // Save the timestamp to log (local and database)
    const timestampNow = Date.now();
    try {
      const key = `sms_log_${userPhone}`;
      const logStr = localStorage.getItem(key);
      let log = logStr ? JSON.parse(logStr) : [];
      log.push(timestampNow);
      localStorage.setItem(key, JSON.stringify(log));
      // Force tick increment to update UI
      setTimeTick(prev => prev + 1);
    } catch (e) {
      console.error('Error logging SMS message locally:', e);
    }

    try {
      await fetch('/api/leads?action=create_sms_log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPhone, timestamp: timestampNow })
      });
    } catch (dbErr) {
      console.error('Error logging SMS message to database:', dbErr);
    }

    // Step C: Format phone number cleanly (keep prefix, e.g. 254..., remove leading zero or plus sign)
    let cleanNumber = lead.fullNumber.replace(/\D/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '254' + cleanNumber.substring(1);
    }

    // Launch native message client with blank body
    const smsUrl = `sms:${cleanNumber}`;
    window.open(smsUrl, '_blank');

    // Mark as seen
    try {
      const res = await fetch('/api/leads?action=mark_seen', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id })
      });
      if (res.ok) setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, seen: true } : l));
    } catch (err) { console.error('Error marking seen:', err); }
  };

  const handleLeadAction = async (lead) => {
    const swipeStatus = getSwipeStatus();
    if (swipeStatus.currentChannel === 'sms') {
      await handleSmsLead(lead);
    } else {
      await handleWhatsAppLead(lead);
    }
  };


  // ─── Admin: User Management ─────────────────────────────────────────────────
  const handleToggleUserStatus = async (userPhone) => {
    try {
      const res = await fetch('/api/users?action=toggle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to toggle status');
      await fetchUsers();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteUser = async (userPhone) => {
    if (!window.confirm('Are you sure you want to permanently delete this team member? All their associated leads will be deleted as well.')) return;
    try {
      const res = await fetch('/api/users?action=delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete user');
      setLeads(prev => prev.filter(l => l.refUserPhone !== userPhone));
      await fetchUsers();
      if (activeImpersonatedUser && activeImpersonatedUser.phone === userPhone) {
        setActiveImpersonatedUser(null);
      }
    } catch (err) { alert(err.message); }
  };

  const handleToggleGroupCreation = async (userPhone) => {
    try {
      const res = await fetch('/api/users?action=toggle_group_creation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone })
      });
      if (res.ok) await fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleToggleMemberRegistration = async (userPhone) => {
    try {
      const res = await fetch('/api/users?action=toggle_member_registration', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone })
      });
      if (res.ok) await fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleResetPassword = async (userPhone) => {
    if (!resetPasswordValue.trim()) { alert('Please enter a new password'); return; }
    try {
      const res = await fetch('/api/users?action=reset_password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone, newPassword: resetPasswordValue.trim() })
      });
      if (res.ok) {
        setResetPasswordMsg('Password reset successfully!');
        setTimeout(() => { setResetPasswordTarget(null); setResetPasswordValue(''); setResetPasswordMsg(''); }, 1500);
      } else {
        setResetPasswordMsg((await res.json()).error || 'Reset failed');
      }
    } catch (err) { setResetPasswordMsg('Error: ' + err.message); }
  };

  const handleCreateDownline = async () => {
    const nameInput = prompt('Enter Team Member Name:');
    if (!nameInput) return;
    const phoneInput = prompt('Enter WhatsApp Phone Number (with country code):');
    if (!phoneInput) return;
    const passInput = prompt('Enter Password:');
    if (!passInput) return;

    let cleaned = phoneInput.replace(/\D/g, '');
    const startsWithCode = countries.some(c => {
      const d = c.dial_code.replace(/\D/g, '');
      return cleaned.startsWith(d) && cleaned.length > d.length;
    });
    if (!startsWithCode) {
      if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
      cleaned = '254' + cleaned;
    }
    try {
      const res = await fetch('/api/users?action=create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim(), phone: cleaned, password: passInput })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create member');
      await fetchUsers();
    } catch (err) { alert(err.message); }
  };

  // ─── Admin: Group Management ─────────────────────────────────────────────────
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch('/api/groups?action=create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim() })
      });
      if (res.ok) { setNewGroupName(''); fetchGroups(); }
      else alert((await res.json()).error || 'Failed to create group');
    } catch (err) { console.error(err); }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Delete this rotation group?')) return;
    try {
      const res = await fetch('/api/groups?action=delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: groupId })
      });
      if (res.ok) fetchGroups();
    } catch (err) { console.error(err); }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch(`/api/leads?action=delete_single&id=${leadId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchLeads();
      } else {
        alert('Failed to delete lead');
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  const handleAddMemberToGroup = async (groupId, userPhone) => {
    try {
      const res = await fetch('/api/groups?action=add_member', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, userPhone })
      });
      if (res.ok) fetchGroups();
    } catch (err) { console.error(err); }
  };

  const handleRemoveMemberFromGroup = async (groupId, userPhone) => {
    try {
      const res = await fetch('/api/groups?action=remove_member', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, userPhone })
      });
      if (res.ok) fetchGroups();
    } catch (err) { console.error(err); }
  };

  const handleGroupMemberSearch = async (groupId, query) => {
    setGroupMemberSearch(prev => ({ ...prev, [groupId]: query }));
    if (!query.trim() || query.length < 3) {
      setGroupMemberSearchResults(prev => ({ ...prev, [groupId]: [] }));
      return;
    }
    try {
      const res = await fetch(`/api/users?action=search&phone=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setGroupMemberSearchResults(prev => ({ ...prev, [groupId]: data }));
      }
    } catch (err) { console.error(err); }
  };

  const handleCopyGroupLink = async (groupId) => {
    const link = `${window.location.origin}${window.location.pathname}?group=${groupId}`;
    await copyToClipboard(link);
    alert(`Copied: ${link}`);
  };

  const handleCopyRefLink = async (phone) => {
    const link = `${window.location.origin}${window.location.pathname}?ref=${phone}`;
    await copyToClipboard(link);
    alert(`Copied: ${link}`);
  };

  // ─── Admin: Group Requests ──────────────────────────────────────────────────
  const handleApproveGroupRequest = async (id) => {
    try {
      const res = await fetch('/api/groups?action=approve_request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) { fetchGroups(); fetchGroupRequests(); }
    } catch (err) { console.error(err); }
  };

  const handleRejectGroupRequest = async (id) => {
    try {
      const res = await fetch('/api/groups?action=reject_request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchGroupRequests();
    } catch (err) { console.error(err); }
  };

  // ─── Member: Request Group ──────────────────────────────────────────────────
  const handleMemberRequestGroup = async (e) => {
    e.preventDefault();
    if (!memberGroupRequestName.trim()) return;
    setMemberGroupRequestStatus(null);
    try {
      const res = await fetch('/api/groups?action=request_create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName: memberGroupRequestName.trim(), requestedByPhone: currentUser.phone })
      });
      const data = await res.json();
      if (res.ok) {
        setMemberGroupRequestStatus({ success: true, msg: data.message });
        setMemberGroupRequestName('');
      } else {
        setMemberGroupRequestStatus({ success: false, msg: data.error || 'Request failed' });
      }
    } catch (err) {
      setMemberGroupRequestStatus({ success: false, msg: 'Network error' });
    }
  };

  // ─── Other Helpers ─────────────────────────────────────────────────────────
  const handleVerifyLead = async (lead) => {
    window.location.href = `tel:${lead.fullNumber}`;
    try {
      const res = await fetch('/api/leads?action=verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id })
      });
      if (res.ok) setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, verified: true } : l));
    } catch (err) { console.error(err); }
  };

  const formatRemainingTime = (futureTimestamp) => {
    if (!futureTimestamp) return '00:00:00';
    const remainingMs = futureTimestamp - Date.now();
    if (remainingMs <= 0) return '00:00:00';

    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getWhatsAppStatus = () => {
    const userPhone = effectiveDashboardUser?.phone || effectiveDashboardUserRef.current?.phone;
    if (!userPhone) return { canSend: true, cooldownRemaining: 0, dailyCount: 0, limitReached: false, nextAvailableTime: null };

    const key = `wa_log_${userPhone}`;
    const logStr = localStorage.getItem(key);
    let log = logStr ? JSON.parse(logStr) : [];

    // Read and merge logs stored in the database
    const dbLogs = leads
      .filter(l => l.name === '__wa_log__' && l.refUserPhone === userPhone)
      .map(l => parseInt(l.fullNumber))
      .filter(ts => !isNaN(ts));

    const combinedSet = new Set([...log, ...dbLogs]);
    let combinedLog = Array.from(combinedSet).sort((a, b) => a - b);

    const now = Date.now();
    // Filter out clicks older than 24 hours (86,400,000 milliseconds)
    const activeLog = combinedLog.filter(ts => now - ts < 86400000);

    // Check cooldown (90 seconds = 90,000 milliseconds)
    let cooldownRemaining = 0;
    if (activeLog.length > 0) {
      const lastClick = activeLog[activeLog.length - 1];
      const elapsed = now - lastClick;
      if (elapsed < 90000) {
        cooldownRemaining = Math.ceil((90000 - elapsed) / 1000);
      }
    }

    const dailyCount = activeLog.length;
    const limitReached = dailyCount >= 10;

    let nextAvailableTime = null;
    if (limitReached && activeLog.length > 0) {
      const oldestActiveClick = activeLog[0];
      nextAvailableTime = oldestActiveClick + 86400000;
    }

    return {
      canSend: !limitReached && cooldownRemaining === 0,
      cooldownRemaining,
      dailyCount,
      limitReached,
      nextAvailableTime
    };
  };

  const getSwipeStatus = () => {
    const userPhone = effectiveDashboardUser?.phone || effectiveDashboardUserRef.current?.phone;
    if (!userPhone) return {
      waCount: 0,
      smsCount: 0,
      totalCount: 0,
      currentChannel: 'whatsapp',
      cooldownRemaining: 0,
      nextAvailableTime: null
    };

    const now = Date.now();

    // 1. WhatsApp count calculation (last 24 hours)
    const waKey = `wa_log_${userPhone}`;
    const waLogStr = localStorage.getItem(waKey);
    let waLog = waLogStr ? JSON.parse(waLogStr) : [];
    const waDbLogs = leads
      .filter(l => l.name === '__wa_log__' && l.refUserPhone === userPhone)
      .map(l => parseInt(l.fullNumber))
      .filter(ts => !isNaN(ts));
    const combinedWaLog = Array.from(new Set([...waLog, ...waDbLogs])).sort((a, b) => a - b);
    const activeWaLog = combinedWaLog.filter(ts => now - ts < 86400000);
    const waCount = activeWaLog.length;

    // 2. SMS count calculation (last 24 hours)
    const smsKey = `sms_log_${userPhone}`;
    const smsLogStr = localStorage.getItem(smsKey);
    let smsLog = smsLogStr ? JSON.parse(smsLogStr) : [];
    const smsDbLogs = leads
      .filter(l => l.name === '__sms_log__' && l.refUserPhone === userPhone)
      .map(l => parseInt(l.fullNumber))
      .filter(ts => !isNaN(ts));
    const combinedSmsLog = Array.from(new Set([...smsLog, ...smsDbLogs])).sort((a, b) => a - b);
    const activeSmsLog = combinedSmsLog.filter(ts => now - ts < 86400000);
    const smsCount = activeSmsLog.length;

    // 3. Combined logs for cooldown check (cooldown applies to either channel)
    const combinedAllLogs = [...activeWaLog, ...activeSmsLog].sort((a, b) => a - b);
    let cooldownRemaining = 0;
    if (combinedAllLogs.length > 0) {
      const lastClick = combinedAllLogs[combinedAllLogs.length - 1];
      const elapsed = now - lastClick;
      if (elapsed < 90000) {
        cooldownRemaining = Math.ceil((90000 - elapsed) / 1000);
      }
    }

    // Determine current channel based on capping rules and smsOnly toggle
    let currentChannel = 'whatsapp';
    if (smsOnly) {
      if (smsCount >= 20) {
        currentChannel = 'locked';
      } else {
        currentChannel = 'sms';
      }
    } else {
      if (waCount >= 10) {
        if (smsCount >= 20) {
          currentChannel = 'locked';
        } else {
          currentChannel = 'sms';
        }
      }
    }

    // Next available time calculation when locked
    let nextAvailableTime = null;
    if (currentChannel === 'locked') {
      const waUnlockTime = activeWaLog.length >= 10 ? activeWaLog[activeWaLog.length - 10] + 86400000 : null;
      const smsUnlockTime = activeSmsLog.length >= 20 ? activeSmsLog[activeSmsLog.length - 20] + 86400000 : null;
      if (smsOnly) {
        nextAvailableTime = smsUnlockTime || (combinedAllLogs[0] + 86400000);
      } else {
        if (waUnlockTime && smsUnlockTime) {
          nextAvailableTime = Math.min(waUnlockTime, smsUnlockTime);
        } else {
          nextAvailableTime = waUnlockTime || smsUnlockTime || (combinedAllLogs[0] + 86400000);
        }
      }
    }

    return {
      waCount,
      smsCount,
      totalCount: waCount + smsCount,
      currentChannel,
      cooldownRemaining,
      nextAvailableTime
    };
  };


  const handleClearAllLeads = async () => {
    if (!window.confirm('Permanently wipe all leads from database? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/leads?action=clear', { method: 'DELETE' });
      if (res.ok) setLeads([]);
      else alert((await res.json()).error || 'Failed to clear');
    } catch (err) { alert(err.message); }
  };

  const handleResetUnseenLeads = async () => {
    if (!currentUser || currentUser.phone !== '254775499650') {
      alert("Unauthorized: Only administrators can perform this action.");
      return;
    }
    if (!resetTargetPhone) {
      alert("Please select a target team member.");
      return;
    }
    setIsResettingCounter(true);
    try {
      const res = await fetch('/api/leads?action=reset_unseen_leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminPhone: currentUser.phone,
          targetUserPhone: resetTargetPhone
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Success: Unseen lead counter reset to zero.");
        setLeads(prev => prev.map(l => {
          if (l.refUserPhone === resetTargetPhone && !l.seen) {
            return { ...l, seen: true };
          }
          return l;
        }));
        setShowResetConfirm(false);
        setShowResetSecondConfirm(false);
      } else {
        alert(data.error || "Failed to reset unseen leads.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsResettingCounter(false);
    }
  };

  // ─── Derived data ────────────────────────────────────────────────────────────
  const userLeads = leads.filter(l => l.refUserPhone === effectiveDashboardUser?.phone && l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__');
  const actualLeads = leads.filter(l => l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__');

  const formatLeadDate = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;

    // Within 60 seconds
    if (diff < 60000) {
      return 'active rn ⚡';
    }
    // Within 60 minutes
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago ⏱️`;
    }
    // Within 24 hours
    if (diff < 86400000) {
      const hrs = Math.floor(diff / 3600000);
      return `${hrs}h ago 🔥`;
    }
    // Within 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      if (days === 1) return 'yesterday 💤';
      return `${days}d ago 🗓️`;
    }

    // Fallback to absolute date but in an ultra-clean lowercase minimalist layout
    const date = new Date(timestamp);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthName = months[date.getMonth()];
    const day = date.getDate();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${monthName} • ${hours}:${minutes}${ampm} ✨`;
  };

  const renderGroupAnalyticsModal = () => {
    if (expandedGroupAnalytics === null) return null;
    const group = groups.find(g => String(g.id) === String(expandedGroupAnalytics));
    if (!group) return null;

    const followingUpCount = group.members.filter(member => {
      const memberLeads = leads.filter(l => l.refUserPhone === member.phone && String(l.groupId) === String(group.id) && l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__');
      const seenCount = memberLeads.filter(l => l.seen).length;
      return seenCount > 0;
    }).length;

    return (
      <div className="analytics-modal-overlay">
        <div className="analytics-modal-container">
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <Users size={18} /> {group.name} — Group Analytics
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem', marginBottom: 0 }}>
                Detailed tracking of rotation group follow ups
              </p>
            </div>
            <button
              onClick={() => setExpandedGroupAnalytics(null)}
              className="btn-close"
              style={{
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <div className="stat-card" style={{ background: 'rgba(20,184,166,0.04)', borderColor: 'rgba(20,184,166,0.15)', padding: '0.5rem 0.75rem' }}>
              <div className="stat-label" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Members</div>
              <div className="stat-value" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-teal)', marginTop: '0.15rem' }}>{group.members.length}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.15)', padding: '0.5rem 0.75rem' }}>
              <div className="stat-label" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Following Up</div>
              <div className="stat-value" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e', marginTop: '0.15rem' }}>{followingUpCount} / {group.members.length}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)', padding: '0.5rem 0.75rem' }}>
              <div className="stat-label" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inactive</div>
              <div className="stat-value" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.15rem' }}>{group.members.length - followingUpCount}</div>
            </div>
          </div>

          {/* Table list */}
          <div className="modal-table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Member Info</th>
                  <th>Total Assigned</th>
                  <th>Seen / Followed Up</th>
                  <th>Unseen Leads</th>
                  <th>Follow-up Progress</th>
                  <th>Remind Action</th>
                </tr>
              </thead>
              <tbody>
                {group.members.map(member => {
                  const memberLeads = leads.filter(l => l.refUserPhone === member.phone && String(l.groupId) === String(group.id) && l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__');
                  const total = memberLeads.length;
                  const seen = memberLeads.filter(l => l.seen).length;
                  const unseen = total - seen;
                  const progressPct = total > 0 ? Math.round((seen / total) * 100) : 0;
                  const reminderText = `Hello ${member.name.split(' ')[0]}, please log in to your dashboard to follow up on your leads! You have ${unseen} unseen leads out of ${total} total.`;

                  return (
                    <tr key={member.phone}>
                      <td data-label="Member Info">
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{member.phone}</div>
                      </td>
                      <td data-label="Total Assigned" style={{ fontWeight: 600 }}>{total}</td>
                      <td data-label="Seen / Followed Up" style={{ color: '#22c55e', fontWeight: 700 }}>
                        {seen} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>({progressPct}%)</span>
                      </td>
                      <td data-label="Unseen Leads" style={{ color: unseen > 0 ? '#f59e0b' : 'var(--text-secondary)', fontWeight: 700 }}>
                        {unseen}
                      </td>
                      <td data-label="Follow-up Progress">
                        <div style={{ width: '100px', background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '4px', overflow: 'hidden', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}>
                          <div style={{ width: `${progressPct}%`, background: progressPct === 100 ? '#22c55e' : progressPct > 0 ? '#3b82f6' : 'transparent', height: '100%', borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{progressPct}%</span>
                      </td>
                      <td data-label="Remind Action">
                        <a
                          href={`https://wa.me/${member.phone}?text=${encodeURIComponent(reminderText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-action btn-whatsapp"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', gap: '4px', display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', color: '#fff', border: 'none', borderRadius: '8px', textDecoration: 'none' }}
                        >
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12.012 2C6.48 2 2 6.48 2 12.012c0 1.73.443 3.42 1.285 4.91L2 22l5.22-1.37a9.952 9.952 0 0 0 4.793 1.22c5.53 0 10.01-4.48 10.01-10.012C22.025 6.48 17.543 2 12.012 2zm3.626 14.157c-.206.58-.997 1.097-1.63 1.185-.562.078-1.29.1-2.072-.15-3.056-.99-5.045-4.093-5.198-4.3-.152-.206-1.22-1.625-1.22-3.1s.766-2.203 1.037-2.508c.27-.305.592-.38.79-.38.2 0 .393.003.565.01.178.008.416-.068.65.49.24.576.82 2.01.892 2.155.072.146.12.316.023.51-.097.195-.146.317-.29.49-.146.17-.306.38-.437.51-.146.146-.3.305-.128.6.172.296.767 1.266 1.644 2.046.877.78 1.62 1.02 1.92 1.14.3.122.474.1.65-.1.178-.2.766-.89.972-1.196.206-.305.412-.254.694-.15.282.105 1.79.845 2.1 1 .31.155.517.23.593.36.076.13.076.755-.13 1.335z" /></svg>
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setExpandedGroupAnalytics(null)}
              className="btn-outline"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Close Panel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderChangePasswordModal = () => {
    if (!showChangePasswordModal) return null;
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10001,
        background: 'rgba(7, 9, 14, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          width: '100%', maxWidth: '420px',
          background: 'linear-gradient(145deg, #0d1117 0%, #0c0f17 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '1.75rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-purple)' }}>
              <Key size={20} />
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Change Password</span>
            </div>
            <button
              onClick={() => setShowChangePasswordModal(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {cpSuccess ? (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '1rem', color: '#22c55e', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Check size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              {cpSuccess}
            </div>
          ) : (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Current Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={cpShowCurrent ? 'text' : 'password'}
                    value={cpCurrentPassword}
                    onChange={e => setCpCurrentPassword(e.target.value)}
                    placeholder="Your current password"
                    className="phone-field"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setCpShowCurrent(v => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                    {cpShowCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={cpShowNew ? 'text' : 'password'}
                    value={cpNewPassword}
                    onChange={e => setCpNewPassword(e.target.value)}
                    placeholder="Choose a new password"
                    className="phone-field"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setCpShowNew(v => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                    {cpShowNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Confirm New Password</label>
                <input
                  type="password"
                  value={cpConfirmPassword}
                  onChange={e => setCpConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="phone-field"
                />
              </div>

              {cpError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f87171', fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <AlertTriangle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                  {cpError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn-outline" style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }} onClick={() => setShowChangePasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} disabled={cpLoading}>
                  {cpLoading ? <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} /> : <Key size={14} />}
                  {cpLoading ? 'Saving…' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  const renderOverlays = () => {
    return (
      <>
        {renderGroupAnalyticsModal()}
        {renderChangePasswordModal()}
        {/* Stage 1 Confirmation Modal */}
        {showResetConfirm && (() => {
          const targetUser = users.find(u => u.phone === resetTargetPhone);
          return (
            <div className="modal-backdrop" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              animation: 'fadeIn 0.25s ease-out'
            }}>
              <div className="admin-container" style={{
                maxWidth: '440px',
                width: '90%',
                background: 'rgba(20, 20, 25, 0.95)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}>
                  <AlertTriangle size={32} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>
                  Reset Unseen Leads?
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.75rem' }}>
                  Are you sure you want to reset the unseen lead counter to zero for <strong>{targetUser?.name || 'this team member'}</strong> (+{resetTargetPhone})?
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn-outline"
                    style={{ width: '100%' }}
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      border: 'none',
                      color: '#fff'
                    }}
                    onClick={() => {
                      setShowResetConfirm(false);
                      setShowResetSecondConfirm(true);
                    }}
                  >
                    Yes, Continue
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Stage 2 Double Confirmation Modal */}
        {showResetSecondConfirm && (() => {
          const targetUser = users.find(u => u.phone === resetTargetPhone);
          return (
            <div className="modal-backdrop" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div className="admin-container" style={{
                maxWidth: '440px',
                width: '90%',
                background: 'rgba(25, 15, 15, 0.98)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}>
                  <Shield size={32} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f87171' }}>
                  Final Warning: Confirm Reset
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.75rem' }}>
                  This action cannot be undone. All currently unseen leads for <strong>{targetUser?.name || 'this team member'}</strong> will be marked as seen. 
                  This will immediately clear their dashboard notification indicator metrics to 0. 
                  Do you want to proceed?
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn-outline"
                    style={{ width: '100%', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
                    onClick={() => setShowResetSecondConfirm(false)}
                    disabled={isResettingCounter}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      border: 'none',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onClick={handleResetUnseenLeads}
                    disabled={isResettingCounter}
                  >
                    {isResettingCounter ? 'Resetting...' : 'Yes, Confirm Reset'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </>
    );
  };

  const getLocalDateString = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const displayLeads = (
    filterMode === 'unseen' ? userLeads.filter(l => !l.seen) :
      filterMode === 'seen' ? userLeads.filter(l => l.seen) :
        userLeads
  ).slice().sort((a, b) => {
    // Primary: oldest leads first (by created_at / timestamp)
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    if (timeA !== timeB) return timeA - timeB;
    // Secondary: alphabetical by name within the same timestamp
    return a.name.localeCompare(b.name);
  });

  // Keep swipe stack stable so leads do not disappear instantly when marked as seen or verified
  useEffect(() => {
    setSwipeLeads(displayLeads);
  }, [filterMode, leads.length, viewMode, effectiveDashboardUser?.phone]);

  // Reset index and clear skip history when switching filters or views
  useEffect(() => {
    setCurrentSwipeIndex(0);
    setSwipeHistory([]);
  }, [filterMode, viewMode, effectiveDashboardUser?.phone]);

  const referrerDetails = referrerInfo;
  const referrerFirstName = referrerDetails.name ? referrerDetails.name.split(' ')[0] : 'Tonny';

  // ════════════════════════════════════════════════════════════════════════════
  // ROUTE: Registration Page (accessible only through admin-provided link)
  // ════════════════════════════════════════════════════════════════════════════
  if (currentRoute === '#/register') {
    return (
      <div className="admin-container" style={{ maxWidth: '440px' }}>
        <div className="admin-header" style={{ marginBottom: '1.5rem', textAlign: 'center', display: 'block' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}><UserPlus size={24} style={{ color: 'var(--accent-purple)', display: 'inline', marginRight: '6px' }} /> Join Our Team</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Create a dashboard account to start collecting downline contacts</p>
        </div>

        {authError && <div className="error-banner"><AlertTriangle size={16} /> {authError}</div>}
        {isRegSuccess && <div className="success-banner"><Check size={16} /> Registration successful! <a href="#/login" style={{ color: 'white', fontWeight: 'bold' }}>Login here</a></div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="phone-field" style={{ paddingLeft: '1rem' }} placeholder="John Doe" value={authName} onChange={e => setAuthName(e.target.value)} required />
          </div>

          <div className="form-group" ref={regDropdownRef}>
            <label className="form-label">Country of Residence</label>
            <button type="button" className={`selector-trigger ${isRegDropdownOpen ? 'active' : ''}`} onClick={() => setIsRegDropdownOpen(!isRegDropdownOpen)}>
              <div className="trigger-value"><span className="country-flag">{regSelectedCountry.flag}</span><span>{regSelectedCountry.name}</span></div>
              <ChevronDown size={18} style={{ transform: isRegDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {isRegDropdownOpen && (
              <div className="dropdown-panel">
                <div className="search-container">
                  <Search size={18} className="search-icon" />
                  <input type="text" className="search-input" placeholder="Type country name..." value={regSearchQuery} onChange={e => setRegSearchQuery(e.target.value)} autoFocus />
                </div>
                <div className="country-list">
                  {filteredRegCountries.length === 0 ? <div className="no-results">No countries found</div> : filteredRegCountries.map(country => (
                    <button key={country.code} type="button" className="country-option" onClick={() => { setRegSelectedCountry(country); setIsRegDropdownOpen(false); setRegSearchQuery(''); }}>
                      <div className="country-option-info"><span className="country-flag">{country.flag}</span><span>{country.name}</span></div>
                      <span className="country-dial">{country.dial_code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">WhatsApp Number</label>
            <div className="phone-input-wrapper">
              <div ref={regBadgeRef} className="phone-dial-badge">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '1px', fontWeight: '600' }}>{regSelectedCountry.code}</span>
                <span>{regSelectedCountry.dial_code}</span>
              </div>
              <input type="tel" className="phone-field" style={{ paddingLeft: `${regBadgeWidth + 24}px`, paddingRight: '2.75rem' }} placeholder="e.g. 712345678" value={authPhone} onChange={e => setAuthPhone(e.target.value.replace(/\D/g, ''))} required />
              <div style={{ position: 'absolute', right: '1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ color: '#25D366' }}><path d="M12.012 2C6.48 2 2 6.48 2 12.012c0 1.73.443 3.42 1.285 4.91L2 22l5.22-1.37a9.952 9.952 0 0 0 4.793 1.22c5.53 0 10.01-4.48 10.01-10.012C22.025 6.48 17.543 2 12.012 2zm3.626 14.157c-.206.58-.997 1.097-1.63 1.185-.562.078-1.29.1-2.072-.15-3.056-.99-5.045-4.093-5.198-4.3-.152-.206-1.22-1.625-1.22-3.1s.766-2.203 1.037-2.508c.27-.305.592-.38.79-.38.2 0 .393.003.565.01.178.008.416-.068.65.49.24.576.82 2.01.892 2.155.072.146.12.316.023.51-.097.195-.146.317-.29.49-.146.17-.306.38-.437.51-.146.146-.3.305-.128.6.172.296.767 1.266 1.644 2.046.877.78 1.62 1.02 1.92 1.14.3.122.474.1.65-.1.178-.2.766-.89.972-1.196.206-.305.412-.254.694-.15.282.105 1.79.845 2.1 1 .31.155.517.23.593.36.076.13.076.755-.13 1.335z" /></svg>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showRegisterPassword ? "text" : "password"}
                className="phone-field"
                style={{ paddingLeft: '1rem', paddingRight: '2.5rem', width: '100%' }}
                placeholder="••••••••"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  zIndex: 5
                }}
              >
                {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)' }}>Register Now</button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Already have an account? <a href="#/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Login here</a>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ROUTE: Login Page (no "register as downline" link)
  // ════════════════════════════════════════════════════════════════════════════
  if (currentRoute === '#/login') {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
      }}>
        <div className="admin-container" style={{
          maxWidth: '440px',
          margin: '0 auto',
          width: '100%',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(15, 18, 28, 0.85)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: '24px',
          padding: '2.5rem 2rem'
        }}>
          <div className="admin-header" style={{ marginBottom: '1.5rem', textAlign: 'center', display: 'block' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>Member Login</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: '1.4' }}>Sign in to access your Team Network Marketing dashboard</p>
          </div>

          <MotivationalQuote />

          {authError && <div className="error-banner" style={{ margin: '1rem 0' }}><AlertTriangle size={16} /> {authError}</div>}

          <form onSubmit={handleLogin} style={{ marginTop: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>WhatsApp Phone Number</label>
              <input
                type="tel"
                className="phone-field"
                style={{
                  paddingLeft: '1.25rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
                placeholder="e.g. 0712345678"
                value={authPhone}
                onChange={e => setAuthPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ position: 'relative', marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showAuthPassword ? "text" : "password"}
                  className="phone-field"
                  style={{
                    paddingLeft: '1.25rem',
                    paddingRight: '2.75rem',
                    width: '100%',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAuthPassword(!showAuthPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    zIndex: 5
                  }}
                  title={showAuthPassword ? "Hide password" : "Show password"}
                >
                  {showAuthPassword ? <EyeOff size={18} style={{ color: 'var(--accent-purple)' }} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '0.875rem',
                borderRadius: '12px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
                boxShadow: '0 8px 20px rgba(168, 85, 247, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              Sign In to Dashboard
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem' }}>
            <a href="#/" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              ← Go back to Registration Landing
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ROUTE: Team Member Dashboard
  // ════════════════════════════════════════════════════════════════════════════
  const renderMemberDashboard = (dashboardUser, isImpersonating = false) => {
    const userLeads = leads.filter(l => l.refUserPhone === dashboardUser?.phone && l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__');
    const memberSkippedIds = leads
      .filter(l => l.name === '__skip_log__' && l.refUserPhone === dashboardUser?.phone)
      .map(l => parseInt(l.fullNumber))
      .filter(id => !isNaN(id));
    const displayLeads = (
      filterMode === 'unseen' ? userLeads.filter(l => !l.seen) :
        filterMode === 'seen' ? userLeads.filter(l => l.seen) :
          userLeads
    ).filter(l => !memberSkippedIds.includes(l.id));
    const unseenCount = userLeads.filter(l => !l.seen && !memberSkippedIds.includes(l.id)).length;

    return (
      <div className="admin-container" style={{ maxWidth: '620px', padding: isImpersonating ? '0' : undefined, border: isImpersonating ? 'none' : undefined, background: isImpersonating ? 'transparent' : undefined, boxShadow: isImpersonating ? 'none' : undefined, margin: isImpersonating ? '0' : undefined, minHeight: isImpersonating ? 'auto' : undefined }}>
        {/* Header */}
        {!isImpersonating && (
          <div className="admin-header">
            <div>
              <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                Welcome, {dashboardUser.name}!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Team Member Dashboard</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                className="btn-outline"
                style={{ borderRadius: '10px', width: 'auto', padding: '0 0.75rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center', height: '36px' }}
                onClick={() => { setCpError(''); setCpSuccess(''); setCpCurrentPassword(''); setCpNewPassword(''); setCpConfirmPassword(''); setShowChangePasswordModal(true); }}
              >
                <Key size={14} /> Change Password
              </button>
              <button className="btn-close" style={{ borderRadius: '10px', width: 'auto', padding: '0 0.75rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center', height: '36px' }} onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>

        )}

        {/* Referral link */}
        <div className="ref-link-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <Link2 size={16} /> Campaign Link
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Leads from this link appear on this dashboard!
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" readOnly className="phone-field" style={{ paddingLeft: '1rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem' }} value={`${window.location.origin}${window.location.pathname}?ref=${dashboardUser.phone}`} />
            <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => handleCopyRefLink(dashboardUser.phone)}><Copy size={16} /></button>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-label">Total Leads</div>
            <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>{userLeads.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unseen</div>
            <div className="stat-value" style={{ color: unseenCount > 0 ? '#f59e0b' : 'var(--accent-teal)' }}>{unseenCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Account Status</div>
            <div className="stat-value" style={{ fontSize: '1.1rem', color: 'var(--accent-teal)', textTransform: 'capitalize', fontWeight: 'bold', paddingTop: '0.4rem' }}>● {dashboardUser.status}</div>
          </div>
        </div>

        {/* WhatsApp Phone Account Reminder Banner */}

        <div style={{
          background: 'rgba(59, 130, 246, 0.07)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '14px',
          padding: '0.85rem 1rem',
          marginTop: '1.25rem',
          fontSize: '0.8rem',
          lineHeight: '1.4',
          color: '#93c5fd',
          display: 'flex',
          gap: '0.65rem',
          alignItems: 'center'
        }}>
          <AlertCircle size={18} style={{ color: '#60a5fa', flexShrink: 0 }} />
          <span>
            Reminder: Please make sure you are logged into WhatsApp using the phone number <strong style={{ color: '#fff' }}>+{dashboardUser.phone}</strong> when contacting your leads.
          </span>
        </div>

        {/* ── SMS Only Toggle Card ── */}
        <div style={{
          background: smsOnly ? 'rgba(14, 165, 233, 0.04)' : 'rgba(255, 255, 255, 0.01)',
          border: smsOnly ? '1px solid rgba(14, 165, 233, 0.25)' : '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: smsOnly ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: smsOnly ? '#38bdf8' : 'var(--text-secondary)',
              transition: 'all 0.3s ease'
            }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                SMS Only Mode 
                {smsOnly && <span className="pulse-dot" style={{ background: '#38bdf8', width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block' }} />}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Bypass WhatsApp & use direct SMS as main flow (20 daily limit)
              </div>
            </div>
          </div>
          <div>
            <div 
              className={`switch-track ${smsOnly ? 'active' : ''}`} 
              onClick={() => handleToggleSmsOnly(!smsOnly)}
              style={smsOnly ? { background: '#0ea5e9', borderColor: 'rgba(14, 165, 233, 0.4)' } : undefined}
            >
              <div className="switch-thumb" />
            </div>
          </div>
        </div>


        {/* ── Export Controls (at top) ── */}
        {userLeads.length > 0 && (
          <div className="export-controls-card" style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Download size={14} /> Export Options
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <label className={`export-mode-btn ${exportMode === 'fullname' ? 'active' : ''}`}>
                <input type="radio" name="exportMode" value="fullname" checked={exportMode === 'fullname'} onChange={() => setExportMode('fullname')} style={{ display: 'none' }} />
                Full Name
              </label>
              <label className={`export-mode-btn ${exportMode === 'suffix' ? 'active' : ''}`}>
                <input type="radio" name="exportMode" value="suffix" checked={exportMode === 'suffix'} onChange={() => setExportMode('suffix')} style={{ display: 'none' }} />
                First Name + Country Code (e.g. John KE)
              </label>
            </div>
            <button className="btn-outline" style={{ width: '100%' }} onClick={() => handleExportVCF(dashboardUser.phone)}>
              <Download size={16} /> Download Contacts ({userLeads.filter(l => !l.exported).length} new)
            </button>
          </div>
        )}

        {/* ── View Controls ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0 0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Database size={15} style={{ color: 'var(--accent-blue)' }} /> Leads Log
            {(() => {
              const status = getSwipeStatus();
              const isLocked = status.currentChannel === 'locked';
              const isSms = status.currentChannel === 'sms';
              const text = isLocked
                ? (smsOnly ? 'Daily Limit Reached (20/20)' : 'Daily Limit Reached (30/30)')
                : isSms
                  ? `SMS Active: ${status.smsCount}/20 sent`
                  : `WhatsApp Active: ${status.waCount}/10 sent`;
              const bgColor = isLocked
                ? 'rgba(239, 68, 68, 0.1)'
                : isSms
                  ? 'rgba(14, 165, 233, 0.1)'
                  : 'rgba(37, 211, 102, 0.1)';
              const textColor = isLocked
                ? '#f87171'
                : isSms
                  ? '#38bdf8'
                  : '#4ade80';
              const borderColor = isLocked
                ? 'rgba(239, 68, 68, 0.2)'
                : isSms
                  ? 'rgba(14, 165, 233, 0.2)'
                  : 'rgba(37, 211, 102, 0.2)';
              return (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  background: bgColor,
                  color: textColor,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '6px',
                  border: `1px solid ${borderColor}`,
                  marginLeft: '0.4rem',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  Anti-Spam: {text}
                </span>
              );
            })()}
          </h3>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              className={`filter-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
            >
              List
            </button>
            <button
              className={`filter-toggle-btn ${viewMode === 'swipe' ? 'active' : ''}`}
              onClick={() => { setViewMode('swipe'); setCurrentSwipeIndex(0); }}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
            >
              Swipe
            </button>
            <div className="filter-group" style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '2px', border: '1px solid var(--border-glass)' }}>
              <button
                type="button"
                className={`filter-segment-btn ${filterMode === 'unseen' ? 'active' : ''}`}
                onClick={() => { setFilterMode('unseen'); setCurrentSwipeIndex(0); }}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '8px',
                  background: filterMode === 'unseen' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: filterMode === 'unseen' ? '#f59e0b' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  border: filterMode === 'unseen' ? '1px solid rgba(245,158,11,0.4)' : '1px solid transparent'
                }}
              >
                Unseen
                {unseenCount > 0 && (
                  <span className="unseen-badge" style={{ minWidth: '14px', height: '14px', fontSize: '0.55rem', margin: 0, background: '#f59e0b', color: '#0f172a' }}>
                    {unseenCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                className={`filter-segment-btn ${filterMode === 'seen' ? 'active' : ''}`}
                onClick={() => { setFilterMode('seen'); setCurrentSwipeIndex(0); }}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '8px',
                  background: filterMode === 'seen' ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
                  color: filterMode === 'seen' ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  border: filterMode === 'seen' ? '1px solid rgba(20,184,166,0.4)' : '1px solid transparent'
                }}
              >
                Seen ({userLeads.filter(l => l.seen).length})
              </button>
              <button
                type="button"
                className={`filter-segment-btn ${filterMode === 'all' ? 'active' : ''}`}
                onClick={() => { setFilterMode('all'); setCurrentSwipeIndex(0); }}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '8px',
                  background: filterMode === 'all' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: filterMode === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  border: filterMode === 'all' ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent'
                }}
              >
                All ({userLeads.length})
              </button>
            </div>
          </div>
        </div>

        {/* Conditional Content: List vs Swipe Cards */}
        {viewMode === 'swipe' ? (
          <div className="swipe-view-container" style={{ margin: '1rem 0', display: 'flex', justifyContent: 'center' }}>
            {(() => {
              const swipeStatus = getSwipeStatus();
              if (swipeStatus.currentChannel === 'locked') {
                const remainingTimeMs = swipeStatus.nextAvailableTime ? Math.max(0, swipeStatus.nextAvailableTime - Date.now()) : 0;
                const totalCooldownMs = 24 * 60 * 60 * 1000;
                const elapsedMs = Math.max(0, totalCooldownMs - remainingTimeMs);
                const progress = Math.min(1, elapsedMs / totalCooldownMs);
                const fillAngle = progress * 360;

                return (
                  <div className="congrats-celebration-card" style={{ border: 'none' }}>
                    {/* Dynamic progress filling border */}
                    <div 
                      className="congrats-glow-border"
                      style={{
                        background: `conic-gradient(from 0deg, #4285F4 0deg, #34A853 ${fillAngle * 0.25}deg, #FBBC05 ${fillAngle * 0.5}deg, #EA4335 ${fillAngle * 0.75}deg, #4285F4 ${fillAngle}deg, rgba(255, 255, 255, 0.08) ${fillAngle}deg, rgba(255, 255, 255, 0.08) 360deg)`
                      }}
                    />
                    {/* Falling confetti pieces */}
                    <div className="congrats-confetti-container">
                      <div className="confetti-piece" />
                      <div className="confetti-piece" />
                      <div className="confetti-piece" />
                      <div className="confetti-piece" />
                      <div className="confetti-piece" />
                      <div className="confetti-piece" />
                      <div className="confetti-piece" />
                    </div>
                    {/* Floating trophy */}
                    <div className="congrats-trophy-container">
                      <div className="congrats-trophy-bg" />
                      <Trophy size={42} className="congrats-trophy" />
                    </div>
                    <h2 className="congrats-title">You Crushed It! 🎉</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
                      Amazing work! You've contacted all <strong style={{ color: '#d8b4fe' }}>30 people</strong> (10 WhatsApp, 20 SMS) for today.
                      Your accounts are now protected from carrier blockages.
                    </p>
                    <div className="congrats-stats-pill">
                      <Sparkles size={14} /> 10 WA & 20 SMS contacts reached today
                    </div>
                    <div className="congrats-reset-timer">
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New batch unlocks in</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: '#fff', letterSpacing: '0.05em' }}>{formatRemainingTime(swipeStatus.nextAvailableTime)}</span>
                    </div>
                  </div>
                );
              }
              if (swipeLeads.length === 0) {
                return (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid var(--border-glass)', width: '100%' }}>
                    No leads match this filter! 🎉
                  </div>
                );
              }
              return (() => {
                const activeList = swipeLeads;
                const currentLeadRaw = activeList[currentSwipeIndex % activeList.length];
                // Merge with latest status from leads state to get real-time badges (seen/verified)
                const currentLead = leads.find(l => l.id === currentLeadRaw?.id) || currentLeadRaw;
                const leadCountry = countries.find(c => c.code === currentLead.countryCode);
                const flag = leadCountry ? leadCountry.flag : '🌐';
                const swipeStatus = getSwipeStatus();

                const nextLeadRaw = activeList[(currentSwipeIndex + 1) % activeList.length];
                const nextLead = nextLeadRaw ? (leads.find(l => l.id === nextLeadRaw?.id) || nextLeadRaw) : null;
                const hasNextLead = activeList.length > 1 && nextLead && nextLead.id !== currentLead.id;

                const thirdLeadRaw = activeList[(currentSwipeIndex + 2) % activeList.length];
                const thirdLead = thirdLeadRaw ? (leads.find(l => l.id === thirdLeadRaw?.id) || thirdLeadRaw) : null;
                const hasThirdLead = activeList.length > 2 && thirdLead && thirdLead.id !== nextLead?.id && thirdLead.id !== currentLead.id;

                // Calculate linear progress of dragging (0 to 1) to transition the stacked cards smoothly
                const progress = isDragging
                  ? Math.min(1, Math.abs(dragOffset) / 120)
                  : (swipeDirection ? 1 : 0);

                return (
                  <div className="swipe-card-wrapper" style={{ width: '100%', maxWidth: '340px', position: 'relative', height: '300px', margin: '0 auto' }}>

                    {/* Card 3 (Bottom-most Card in Stack) */}
                    {hasThirdLead && (
                      <div
                        key={thirdLead.id}
                        className="swipe-card"
                        style={{
                          width: '100%',
                          background: 'rgba(23, 23, 35, 0.96)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '20px',
                          padding: '1.25rem',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transform: `scale(${0.92 + progress * 0.04}) translateY(${20 - progress * 10}px)`,
                          opacity: 0.1 + progress * 0.2,
                          transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.22s ease',
                          zIndex: 1,
                          pointerEvents: 'none',
                          userSelect: 'none'
                        }}
                      >
                        {/* Date/Country badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.6rem', marginBottom: '0.6rem', opacity: 0.3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>{countries.find(c => c.code === thirdLead.countryCode)?.flag || '🌐'}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{thirdLead.countryName}</span>
                          </div>
                          <span className="swipe-card-time" style={{
                            fontSize: '0.68rem',
                            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                            color: 'rgba(255, 255, 255, 0.85)',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textTransform: 'lowercase'
                          }}>
                            <Clock size={11} style={{ strokeWidth: 2.5 }} /> {thirdLead.timestamp ? formatLeadDate(thirdLead.timestamp) : ''}
                          </span>
                        </div>

                        {/* Status Badges Row */}
                        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.6rem', flexWrap: 'wrap', opacity: 0.3 }}>
                          {thirdLead.seen ? (
                            <span className="badge badge-seen" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>Seen</span>
                          ) : (
                            <span className="badge" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>Unseen</span>
                          )}
                          {thirdLead.verified ? (
                            <span className="badge badge-verified" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>Verified</span>
                          ) : (
                            <span className="badge" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>Unverified</span>
                          )}
                        </div>

                        {/* Name/Phone */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '0.2rem 0', opacity: 0.3 }}>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#fff', letterSpacing: '-0.01em' }}>{thirdLead.name}</h3>
                          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500, fontFamily: 'monospace', letterSpacing: '0.02em' }}>{thirdLead.fullNumber}</p>
                        </div>

                        {/* Footer placeholders */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', opacity: 0.05 }}>
                          <div style={{ flex: 1, height: '42px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}></div>
                          <div style={{ flex: 1.2, height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)' }}></div>
                          <div style={{ flex: 1.3, height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)' }}></div>
                        </div>
                      </div>
                    )}

                    {/* Card 2 (Middle Card in Stack - Next Lead) */}
                    {hasNextLead && (
                      <div
                        key={nextLead.id}
                        className="swipe-card"
                        style={{
                          width: '100%',
                          background: 'rgba(23, 23, 35, 0.96)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '20px',
                          padding: '1.25rem',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transform: `scale(${0.96 + progress * 0.04}) translateY(${10 - progress * 10}px)`,
                          opacity: 0.3 + progress * 0.7,
                          transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.22s ease',
                          zIndex: 2,
                          pointerEvents: 'none',
                          userSelect: 'none'
                        }}
                      >
                        {/* Date/Country badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.6rem', marginBottom: '0.6rem', opacity: 0.5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>{countries.find(c => c.code === nextLead.countryCode)?.flag || '🌐'}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{nextLead.countryName}</span>
                          </div>
                          <span className="swipe-card-time" style={{
                            fontSize: '0.68rem',
                            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                            color: 'rgba(255, 255, 255, 0.85)',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textTransform: 'lowercase'
                          }}>
                            <Clock size={11} style={{ strokeWidth: 2.5 }} /> {nextLead.timestamp ? formatLeadDate(nextLead.timestamp) : ''}
                          </span>
                        </div>

                        {/* Status Badges Row */}
                        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.6rem', flexWrap: 'wrap', opacity: 0.5 }}>
                          {nextLead.seen ? (
                            <span className="badge badge-seen" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>Seen</span>
                          ) : (
                            <span className="badge" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>Unseen</span>
                          )}
                          {nextLead.verified ? (
                            <span className="badge badge-verified" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>Verified</span>
                          ) : (
                            <span className="badge" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>Unverified</span>
                          )}
                        </div>

                        {/* Name/Phone */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '0.2rem 0', opacity: 0.5 }}>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#fff', letterSpacing: '-0.01em' }}>{nextLead.name}</h3>
                          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500, fontFamily: 'monospace', letterSpacing: '0.02em' }}>{nextLead.fullNumber}</p>
                        </div>

                        {/* Footer placeholders */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', opacity: 0.08 }}>
                          <div style={{ flex: 1, height: '42px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}></div>
                          <div style={{ flex: 1.2, height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)' }}></div>
                          <div style={{ flex: 1.3, height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)' }}></div>
                        </div>
                      </div>
                    )}

                    {/* Top Card (Active Lead) */}
                    <div
                      key={currentLead.id}
                      ref={swipeCardRef}
                      className={`swipe-card google-glow-card${isCardHinting && !isDragging ? ' swipe-card-hint' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleDragStart(e.clientX);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleDragStart(e.touches[0].clientX);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '20px',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        height: '100%',
                        touchAction: 'none',
                        userSelect: 'none',
                        transform: isDragging
                          ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.06}deg)`
                          : swipeDirection === 'left'
                            ? 'translateX(-150%) rotate(-25deg)'
                            : swipeDirection === 'right'
                              ? 'translateX(120%) rotate(18deg)'
                              : 'translateX(0) rotate(0)',
                        opacity: swipeDirection ? 0 : 1,
                        transition: isDragging ? 'none' : isCardHinting ? 'none' : swipeDirection ? 'transform 0.2s ease-in, opacity 0.2s ease-in' : 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.2s ease, border-color 0.2s ease, opacity 0.25s ease',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        willChange: 'transform',
                        zIndex: 3,
                      }}
                    >
                      {/* Google Brand Color Spinning Border */}
                      {(() => {
                        const isCooldowned = swipeStatus.cooldownRemaining > 0;
                        const cooldownProgress = isCooldowned ? (90 - swipeStatus.cooldownRemaining) / 90 : 1;
                        const fillAngle = cooldownProgress * 360;
                        
                        return (
                          <div 
                            className={`google-glow-border ${isCooldowned ? 'cooldown-active' : ''}`}
                            style={isCooldowned ? {
                              background: `conic-gradient(from 0deg, #4285F4 0deg, #34A853 ${fillAngle * 0.25}deg, #FBBC05 ${fillAngle * 0.5}deg, #EA4335 ${fillAngle * 0.75}deg, #4285F4 ${fillAngle}deg, rgba(255, 255, 255, 0.08) ${fillAngle}deg, rgba(255, 255, 255, 0.08) 360deg)`
                            } : {}}
                          />
                        );
                      })()}
                      <div className="google-glow-inner" />

                      <div className="swipe-card-content" style={{ padding: '1.25rem', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>


                        {/* Date/Country badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.6rem', marginBottom: '0.6rem', userSelect: 'none', pointerEvents: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>{flag}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{currentLead.countryName}</span>
                          </div>
                          <span className="swipe-card-time" style={{
                            fontSize: '0.68rem',
                            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                            color: 'rgba(255, 255, 255, 0.85)',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textTransform: 'lowercase'
                          }}>
                            <Clock size={11} style={{ strokeWidth: 2.5 }} /> {currentLead.timestamp ? formatLeadDate(currentLead.timestamp) : ''}
                          </span>
                        </div>

                        {/* Status Badges Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {currentLead.seen ? (
                              <span className="badge badge-seen" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>Seen</span>
                            ) : (
                              <span className="badge" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>Unseen</span>
                            )}
                            {currentLead.verified ? (
                              <span className="badge badge-verified" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>Verified</span>
                            ) : (
                              <span className="badge" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>Unverified</span>
                            )}
                          </div>
                          {currentUser?.role === 'admin' && (
                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLead(currentLead.id);
                              }}
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '4px',
                                padding: '0.15rem 0.45rem',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                pointerEvents: 'auto',
                                userSelect: 'none'
                              }}
                            >
                              ❌ Delete
                            </button>
                          )}
                        </div>

                        {/* Name/Phone */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '0.1rem 0', userSelect: 'none', pointerEvents: 'none' }}>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#fff', letterSpacing: '-0.01em' }}>{currentLead.name}</h3>
                          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500, fontFamily: 'monospace', letterSpacing: '0.02em' }}>{currentLead.fullNumber}</p>
                        </div>

                        <div className="swipe-card-footer" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                          <button
                            className="btn-outline"
                            disabled={swipeStatus.cooldownRemaining > 0}
                            style={{
                              flex: 1,
                              height: '42px',
                              padding: '0 0.5rem',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              borderColor: swipeStatus.cooldownRemaining > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.3)',
                              color: swipeStatus.cooldownRemaining > 0 ? 'rgba(248,113,113,0.4)' : '#f87171',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              cursor: swipeStatus.cooldownRemaining > 0 ? 'not-allowed' : 'pointer',
                              opacity: swipeStatus.cooldownRemaining > 0 ? 0.4 : 1,
                              transition: 'all 0.2s ease'
                            }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (swipeDirection || swipeStatus.cooldownRemaining > 0) return;
                              setSwipeDirection('left');
                              setSwipeHistory(prev => [...prev, currentSwipeIndex]);
                              const leadToSkip = currentLead;
                              setTimeout(async () => {
                                setCurrentSwipeIndex(prev => prev + 1);
                                setSwipeDirection(null);
                                try {
                                  const uPhone = effectiveDashboardUser?.phone || effectiveDashboardUserRef.current?.phone;
                                  if (uPhone) {
                                    await fetch('/api/leads?action=create_skip_log', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ userPhone: uPhone, leadId: leadToSkip.id })
                                    });
                                    await fetchLeads();
                                  }
                                } catch (err) { console.error('Error saving skip log:', err); }
                              }, 250);
                            }}
                          >
                            <X size={13} /> Skip
                          </button>
                          <button
                            className={currentLead.verified ? "btn-outline" : "btn-primary"}
                            disabled={swipeStatus.cooldownRemaining > 0}
                            style={{
                              flex: 1.2,
                              height: '42px',
                              padding: '0 0.5rem',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              borderRadius: '10px',
                              background: swipeStatus.cooldownRemaining > 0 
                                ? 'rgba(255, 255, 255, 0.03)' 
                                : currentLead.verified 
                                  ? 'rgba(16,185,129,0.1)' 
                                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              color: swipeStatus.cooldownRemaining > 0 
                                ? 'rgba(255,255,255,0.3)' 
                                : currentLead.verified 
                                  ? '#10b981' 
                                  : '#fff',
                              borderColor: swipeStatus.cooldownRemaining > 0 
                                ? 'rgba(255,255,255,0.08)' 
                                : currentLead.verified 
                                  ? 'rgba(16,185,129,0.3)' 
                                  : 'transparent',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              cursor: swipeStatus.cooldownRemaining > 0 ? 'not-allowed' : 'pointer',
                              opacity: swipeStatus.cooldownRemaining > 0 ? 0.4 : 1,
                              transition: 'all 0.2s ease'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (swipeStatus.cooldownRemaining > 0) return;
                              handleVerifyLead(currentLead);
                            }}
                          >
                            {currentLead.verified ? <Check size={13} /> : <Phone size={13} />}
                            {currentLead.verified ? 'Verified' : 'Verify'}
                          </button>
                          {(() => {
                            const isSms = swipeStatus.currentChannel === 'sms';
                            const isLocked = swipeStatus.currentChannel === 'locked';
                            const cooldownRemaining = swipeStatus.cooldownRemaining;
                            
                            const btnBackground = isLocked
                              ? 'rgba(239, 68, 68, 0.15)'
                              : cooldownRemaining > 0
                                ? 'rgba(245, 158, 11, 0.15)'
                                : isSms
                                  ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                                  : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
                            
                            const btnColor = isLocked
                              ? '#f87171'
                              : cooldownRemaining > 0
                                ? '#f59e0b'
                                : '#fff';
                                
                            const btnBorderColor = isLocked
                              ? 'rgba(239, 68, 68, 0.3)'
                              : cooldownRemaining > 0
                                ? 'rgba(245, 158, 11, 0.3)'
                                : 'transparent';
                            
                            return (
                              <button
                                className="btn-primary"
                                disabled={isLocked || cooldownRemaining > 0}
                                style={{
                                  flex: 1.3,
                                  height: '42px',
                                  padding: '0 0.5rem',
                                  fontSize: '0.78rem',
                                  fontWeight: '700',
                                  background: btnBackground,
                                  color: btnColor,
                                  borderColor: btnBorderColor,
                                  borderWidth: '1px',
                                  borderStyle: 'solid',
                                  cursor: (isLocked || cooldownRemaining > 0) ? 'not-allowed' : 'pointer',
                                  boxShadow: 'none',
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  transition: 'all 0.2s ease'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (swipeDirection || isLocked || cooldownRemaining > 0) return;
                                  setSwipeDirection('right');
                                  setTimeout(async () => {
                                    if (isSms) {
                                      await handleSmsLead(currentLead);
                                    } else {
                                      await handleWhatsAppLead(currentLead);
                                    }
                                    setCurrentSwipeIndex(prev => prev + 1);
                                    setSwipeDirection(null);
                                  }, 250);
                                }}
                              >
                                {isLocked ? (
                                  <>⚠️ Limit</>
                                ) : cooldownRemaining > 0 ? (
                                  <>⏳ {cooldownRemaining}s</>
                                ) : isSms ? (
                                  <><MessageSquare size={13} /> SMS</>
                                ) : (
                                  <><MessageCircle size={13} /> Chat</>
                                )}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    {/* Counter + swipe instructions */}
                    <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {(currentSwipeIndex % activeList.length) + 1}
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> of </span>
                        {activeList.length}
                        {' '}<span style={{
                          fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '99px',
                          background: filterMode === 'unseen' ? 'rgba(245,158,11,0.15)' : filterMode === 'seen' ? 'rgba(20,184,166,0.15)' : 'rgba(99,102,241,0.15)',
                          color: filterMode === 'unseen' ? '#f59e0b' : filterMode === 'seen' ? 'var(--accent-teal)' : 'var(--text-secondary)',
                          border: filterMode === 'unseen' ? '1px solid rgba(245,158,11,0.3)' : filterMode === 'seen' ? '1px solid rgba(20,184,166,0.3)' : '1px solid rgba(99,102,241,0.3)',
                        }}>{filterMode === 'unseen' ? 'Unseen' : filterMode === 'seen' ? 'Seen' : 'All'}</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>← Skip &nbsp;·&nbsp; WhatsApp →</div>
                    </div>
                  </div>
                );
              })();
            })()}
          </div>
        ) : (
          <div className="table-wrapper">
            {displayLeads.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                {filterMode === 'unseen' ? 'No unseen leads — great job! 🎉' : filterMode === 'seen' ? 'No seen/replied leads yet.' : 'No leads yet.'}
              </div>
            ) : (
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayLeads.map(lead => {
                    const leadCountry = countries.find(c => c.code === lead.countryCode);
                    const flag = leadCountry ? leadCountry.flag : '🌐';
                    return (
                      <tr key={lead.id} className={lead.seen ? 'lead-row-seen' : ''}>
                        <td data-label="Name" style={{ fontWeight: '600' }}>
                          <div className="lead-name" style={{ opacity: lead.seen ? 0.55 : 1 }}>{lead.name}</div>
                          <div className="lead-time" style={{
                            fontSize: '0.68rem',
                            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                            color: 'rgba(255, 255, 255, 0.75)',
                            marginTop: '0.3rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            textTransform: 'lowercase'
                          }}>
                            <Clock size={11} style={{ strokeWidth: 2.5 }} /> {lead.timestamp ? formatLeadDate(lead.timestamp) : ''}
                          </div>
                          {lead.seen && <span className="badge badge-seen" style={{ marginLeft: '0.4rem' }}>Seen</span>}
                        </td>
                        <td data-label="Number" style={{ color: 'var(--text-secondary)', opacity: lead.seen ? 0.6 : 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.1rem' }} title={lead.countryName}>{flag}</span>
                            <span>{lead.fullNumber}</span>
                            {lead.exported && <span className="badge badge-exported">Exported</span>}
                            {lead.verified && <span className="badge badge-verified">Verified</span>}
                          </div>
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons-group">
                            {(() => {
                              const status = getSwipeStatus();
                              const isLocked = status.currentChannel === 'locked';
                              const isSms = status.currentChannel === 'sms';
                              const isWaDisabled = isLocked || status.cooldownRemaining > 0;
                              let waText = lead.seen ? 'Replied' : isSms ? 'SMS' : 'WhatsApp';
                              let waTooltip = isSms ? `Open SMS with ${lead.name.split(' ')[0]}` : `Open WhatsApp chat with ${lead.name.split(' ')[0]}`;

                              if (isLocked) {
                                waText = 'Limit Reached';
                                waTooltip = 'Daily limit of 10 WhatsApp and 20 SMS reached. Try again in 24 hours.';
                              } else if (status.cooldownRemaining > 0) {
                                waText = `${status.cooldownRemaining}s`;
                                waTooltip = `Anti-spam cooldown active: wait ${status.cooldownRemaining} seconds.`;
                              }

                              const btnBg = isLocked 
                                ? 'rgba(239, 68, 68, 0.15)' 
                                : status.cooldownRemaining > 0 
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : isSms
                                    ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                                    : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
                              const btnColor = isLocked 
                                ? '#f87171' 
                                : status.cooldownRemaining > 0 
                                  ? '#f59e0b' 
                                  : '#fff';
                              const btnBorderColor = isLocked 
                                ? 'rgba(239, 68, 68, 0.3)' 
                                : status.cooldownRemaining > 0 
                                  ? 'rgba(245, 158, 11, 0.3)' 
                                  : 'transparent';

                              return (
                                <button
                                  onClick={() => handleLeadAction(lead)}
                                  className="btn-action btn-whatsapp"
                                  disabled={isWaDisabled}
                                  title={waTooltip}
                                  style={{
                                    color: btnColor,
                                    background: btnBg,
                                    borderColor: btnBorderColor,
                                    opacity: 1,
                                    filter: 'none',
                                    fontWeight: '700',
                                    cursor: isWaDisabled ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  {isLocked ? null : isSms ? <MessageSquare size={12} /> : <MessageCircle size={12} />}
                                  {waText}
                                </button>
                              );
                            })()}
                            {!lead.verified && (
                              <button onClick={() => handleVerifyLead(lead)} className="btn-action btn-verify" title="Verify contact">
                                <Phone size={12} /> Verify
                              </button>
                            )}
                            <button className="btn-action btn-vcard" onClick={() => handleDownloadLeadVCard(lead)} title="Download vCard">
                              <Download size={12} /> VCF
                            </button>
                            {currentUser?.role === 'admin' && (
                              <button
                                className="btn-action"
                                onClick={() => handleDeleteLead(lead.id)}
                                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                title="Delete Lead"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Creator Groups Panel */}
        {(() => {
          const userCreatedGroups = groups.filter(g => g.createdByPhone === dashboardUser.phone);
          if (userCreatedGroups.length === 0) return null;
          return (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-teal)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                <Users size={16} /> Manage Your Rotation Groups
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {userCreatedGroups.map(group => {
                  const searchQuery = groupMemberSearch[group.id] || '';
                  const searchResults = groupMemberSearchResults[group.id] || [];
                  return (
                    <div key={group.id} className="group-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1.25rem', position: 'relative' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>{group.name}</h4>

                      {/* Campaign Link */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                          type="text"
                          readOnly
                          className="phone-field"
                          style={{
                            paddingLeft: '1rem',
                            fontSize: '0.8rem',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '0.4rem 0.8rem',
                            flex: 1,
                            opacity: group.members.length > 0 ? 1 : 0.4
                          }}
                          value={group.members.length > 0 ? `${window.location.origin}${window.location.pathname}?group=${group.id}` : "Add members to activate group link..."}
                        />
                        <button
                          className={group.members.length > 0 ? "btn-primary" : "btn-outline"}
                          style={{
                            width: 'auto',
                            padding: '0.4rem 0.8rem',
                            opacity: group.members.length > 0 ? 1 : 0.4,
                            cursor: group.members.length > 0 ? 'pointer' : 'not-allowed'
                          }}
                          onClick={() => {
                            if (group.members.length > 0) {
                              handleCopyGroupLink(group.id);
                            }
                          }}
                          disabled={group.members.length === 0}
                          title={group.members.length > 0 ? "Copy Group Link" : "Add members first to enable link copy"}
                        >
                          <Copy size={14} />
                        </button>
                      </div>


                      {/* Current Members */}
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Current Members:</div>
                      {group.members.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                          {group.members.map(m => (
                            <div key={m.phone} className="member-pill">
                              <span>{m.name}</span>
                              <button type="button" onClick={() => handleRemoveMemberFromGroup(group.id, m.phone)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', color: 'rgba(255,255,255,0.5)' }}>
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>No members in this group yet. Add members below.</div>
                      )}

                      {/* Phone Search to Add Member */}
                      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Search by phone to add member:</div>
                        <div className="phone-search-wrapper">
                          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                          <input
                            type="tel"
                            className="phone-field"
                            style={{ paddingLeft: '2.25rem', fontSize: '0.82rem' }}
                            placeholder="Type phone number (min 3 digits)"
                            value={searchQuery}
                            onChange={e => handleGroupMemberSearch(group.id, e.target.value)}
                          />
                        </div>
                        {searchResults.length > 0 && (
                          <div className="search-results-dropdown">
                            {searchResults.map(user => {
                              const alreadyMember = group.members.some(m => m.phone === user.phone);
                              return (
                                <div key={user.phone} className="search-result-card">
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>+{user.phone}</div>
                                  </div>
                                  {alreadyMember ? (
                                    <span className="badge badge-verified">In Group</span>
                                  ) : (
                                    <button
                                      className="btn-follow"
                                      onClick={() => {
                                        handleAddMemberToGroup(group.id, user.phone);
                                        setGroupMemberSearch(p => ({ ...p, [group.id]: '' }));
                                        setGroupMemberSearchResults(p => ({ ...p, [group.id]: [] }));
                                      }}
                                    >
                                      <Plus size={13} /> Add
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {group.members.length > 0 && (() => {
                        const followingUpCount = group.members.filter(member => {
                          const memberLeads = leads.filter(l => l.refUserPhone === member.phone && String(l.groupId) === String(group.id) && l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__');
                          const seenCount = memberLeads.filter(l => l.seen).length;
                          return seenCount > 0;
                        }).length;

                        return (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                Group Member Analytics: <span style={{ color: 'var(--accent-teal)' }}>{followingUpCount} of {group.members.length} members</span> following up
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedGroupAnalytics(group.id)}
                                className="btn-outline"
                                style={{ padding: '0.15rem 0.45rem', fontSize: '0.65rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.02)' }}
                              >
                                <Maximize2 size={10} /> Fully Open View
                              </button>
                            </div>
                            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                              <table className="leads-table" style={{ fontSize: '0.72rem' }}>
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    <th>Total</th>
                                    <th>Seen</th>
                                    <th>Unseen</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.members.map(member => {
                                    const memberLeads = leads.filter(l => l.refUserPhone === member.phone && String(l.groupId) === String(group.id) && l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__');
                                    const total = memberLeads.length;
                                    const seen = memberLeads.filter(l => l.seen).length;
                                    const unseen = total - seen;
                                    const reminderText = `Hello ${member.name.split(' ')[0]}, please log in to your dashboard to follow up on your leads! You have ${unseen} unseen leads out of ${total} total.`;
                                    return (
                                      <tr key={member.phone}>
                                        <td data-label="Member" style={{ fontWeight: '600' }}>{member.name}</td>
                                        <td data-label="Total">{total}</td>
                                        <td data-label="Seen" style={{ color: 'var(--accent-teal)', fontWeight: 'bold' }}>{seen}</td>
                                        <td data-label="Unseen" style={{ color: unseen > 0 ? '#f59e0b' : 'var(--text-secondary)', fontWeight: 'bold' }}>{unseen}</td>
                                        <td data-label="Action">
                                          <a
                                            href={`https://wa.me/${member.phone}?text=${encodeURIComponent(reminderText)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-action btn-whatsapp"
                                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                                          >
                                            <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12.012 2C6.48 2 2 6.48 2 12.012c0 1.73.443 3.42 1.285 4.91L2 22l5.22-1.37a9.952 9.952 0 0 0 4.793 1.22c5.53 0 10.01-4.48 10.01-10.012C22.025 6.48 17.543 2 12.012 2zm3.626 14.157c-.206.58-.997 1.097-1.63 1.185-.562.078-1.29.1-2.072-.15-3.056-.99-5.045-4.093-5.198-4.3-.152-.206-1.22-1.625-1.22-3.1s.766-2.203 1.037-2.508c.27-.305.592-.38.79-.38.2 0 .393.003.565.01.178.008.416-.068.65.49.24.576.82 2.01.892 2.155.072.146.12.316.023.51-.097.195-.146.317-.29.49-.146.17-.306.38-.437.51-.146.146-.3.305-.128.6.172.296.767 1.266 1.644 2.046.877.78 1.62 1.02 1.92 1.14.3.122.474.1.65-.1.178-.2.766-.89.972-1.196.206-.305.412-.254.694-.15.282.105 1.79.845 2.1 1 .31.155.517.23.593.36.076.13.076.755-.13 1.335z" /></svg>
                                            WhatsApp
                                          </a>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── Delegated Registration (if permission granted) ── */}
        {dashboardUser.canRegisterMembers && (
          <div style={{ marginTop: '1.5rem', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>
              <UserPlus size={16} /> Register a New Team Member
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>You have been granted permission to register new members.</p>
            <a href="#/register" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', width: 'fit-content', textDecoration: 'none' }}>
              <UserPlus size={14} /> Open Registration Form
            </a>
          </div>
        )}

        {/* ── Group Creation Request (if permission granted) ── */}
        {dashboardUser.canCreateGroup && (
          <div style={{ marginTop: '1.5rem', background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '16px', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-teal)', marginBottom: '0.5rem' }}>
              <Users size={16} /> Request a Rotation Group
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Submit a group name — the admin will review and approve it.</p>
            {memberGroupRequestStatus && (
              <div className={memberGroupRequestStatus.success ? 'success-banner' : 'error-banner'} style={{ marginBottom: '0.75rem' }}>
                {memberGroupRequestStatus.success ? <Check size={14} /> : <AlertTriangle size={14} />} {memberGroupRequestStatus.msg}
              </div>
            )}
            <form onSubmit={handleMemberRequestGroup} style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" className="phone-field" style={{ paddingLeft: '1rem', flex: 1 }} placeholder="e.g. Meta Ads Kenya Team" value={memberGroupRequestName} onChange={e => setMemberGroupRequestName(e.target.value)} required />
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 1rem' }}><Plus size={16} /></button>
            </form>
          </div>
        )}
        {/* ── Admin Reset Unseen Lead Counter Utility ── */}
        {isImpersonating && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '1.25rem',
            marginTop: '1.5rem',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              <Shield size={16} style={{ color: 'var(--accent-teal)' }} /> Admin Controls: Reset Leads Counter
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
              Reset the unseen lead counter to zero for <strong>{dashboardUser.name}</strong>. This will mark all currently unseen leads on their dashboard as seen to clear their notification indicator metrics.
            </p>
            <button
              className="btn-outline"
              style={{
                width: '100%',
                height: '40px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                fontWeight: '600',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => {
                setResetTargetPhone(dashboardUser.phone);
                setShowResetConfirm(true);
              }}
            >
              Reset Unseen Lead Counter to Zero
            </button>
          </div>
        )}

        {renderOverlays()}
      </div>
    );
  };

  if (currentRoute === '#/dashboard' && currentUser && currentUser.role === 'user') {
    return renderMemberDashboard(currentUser, false);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ROUTE: Super Admin Dashboard
  // ════════════════════════════════════════════════════════════════════════════
  if (currentRoute === '#/admin' && currentUser && currentUser.role === 'admin') {
    const pendingRequests = groupRequests.filter(r => r.status === 'pending');

    // ─── Dedicated Password Reset View ───
    if (resetPasswordTarget) {
      const targetUserObj = users.find(u => u.phone === resetPasswordTarget);
      return (
        <div className="admin-container" style={{ maxWidth: '440px' }}>
          <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
              <Key style={{ color: 'var(--accent-purple)' }} /> Set New Password
            </h2>
            <button className="btn-close" style={{ borderRadius: '10px', width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setResetPasswordTarget(null); setResetPasswordValue(''); setResetPasswordMsg(''); }}>
              Back to Admin
            </button>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Create a new secure password for <strong>{targetUserObj ? targetUserObj.name : 'User'}</strong> (+{resetPasswordTarget}).
            </p>

            {resetPasswordMsg && (
              <div className={resetPasswordMsg.includes('success') ? 'success-banner' : 'error-banner'} style={{ marginBottom: '1rem' }}>
                {resetPasswordMsg}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(resetPasswordTarget); }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="phone-field"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="Enter new password"
                  value={resetPasswordValue}
                  onChange={e => setResetPasswordValue(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  Save Password
                </button>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => { setResetPasswordTarget(null); setResetPasswordValue(''); setResetPasswordMsg(''); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // ─── Dashboard Impersonation View ───
    if (activeImpersonatedUser) {
      return (
        <div className="admin-container" style={{ maxWidth: '620px' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid var(--accent-purple)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem'
          }}>
            <span>Viewing dashboard as <strong>{activeImpersonatedUser.name}</strong> (+{activeImpersonatedUser.phone})</span>
            <button className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)', width: 'auto' }} onClick={() => setActiveImpersonatedUser(null)}>
              Exit Impersonation
            </button>
          </div>
          {renderMemberDashboard(activeImpersonatedUser, true)}
        </div>
      );
    }

    // Filter users list based on search query
    const filteredUsers = users.filter(u =>
      u.name.toLowerCase().includes(adminUserSearch.toLowerCase()) ||
      u.phone.includes(adminUserSearch)
    );

    return (
      <>
        <div className="admin-container" style={{ maxWidth: '760px' }}>
          {/* Header */}
          <div className="admin-header">
            <div>
              <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800 }}>
                Super Master Admin
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Control Panel &amp; Downline Network Analytics</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                className="btn-outline"
                style={{ borderRadius: '10px', width: 'auto', padding: '0 0.75rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center', height: '36px' }}
                onClick={() => { setCpError(''); setCpSuccess(''); setCpCurrentPassword(''); setCpNewPassword(''); setCpConfirmPassword(''); setShowChangePasswordModal(true); }}
              >
                <Key size={14} /> Change Password
              </button>
              <button className="btn-close" style={{ borderRadius: '10px', width: 'auto', padding: '0 0.75rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center', height: '36px' }} onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>


          {/* Stats */}
          <div className="admin-stats" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-label">Total Leads</div>
              <div className="stat-value">{actualLeads.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Downlines</div>
              <div className="stat-value">{users.filter(u => u.status === 'active').length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending Requests</div>
              <div className="stat-value" style={{ color: pendingRequests.length > 0 ? '#f59e0b' : 'var(--text-muted)' }}>{pendingRequests.length}</div>
            </div>
          </div>

          {/* ── Gemini AI Copilot & System Analyst ── */}
          <div className="google-glow-card" style={{
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Subtle spinning background accents for the premium look */}
            <div className="google-glow-border" style={{ opacity: 0.15 }} />
            <div className="google-glow-inner" style={{ background: '#090d16 !important' }} />

            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
                    padding: '8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                  }}>
                    <Sparkles size={20} style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                      Gemini Live System Copilot
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '2px 0 0' }}>
                      Ask anything about lead distributions, downline activities, or system performance.
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.25rem 0.6rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚡ Powered by Gemini 3.5
                </span>
              </div>

              {/* Quick Prompt Chips */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <button
                  className="btn-outline"
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '30px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    setCopilotQuery('Give me an executive summary of what is happening in the system.');
                    handleAskCopilot('Give me an executive summary of what is happening in the system.');
                  }}
                  disabled={isCopilotAnalyzing}
                >
                  📊 Executive Brief
                </button>
                <button
                  className="btn-outline"
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '30px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    setCopilotQuery('Who should I focus on? Who is stuck or lagging behind with their leads?');
                    handleAskCopilot('Who should I focus on? Who is stuck or lagging behind with their leads?');
                  }}
                  disabled={isCopilotAnalyzing}
                >
                  🔍 Stuck Downlines & Focus Areas
                </button>
                <button
                  className="btn-outline"
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '30px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    setCopilotQuery('How is the rotation group system doing overall? Give me a quick health check.');
                    handleAskCopilot('How is the rotation group system doing overall? Give me a quick health check.');
                  }}
                  disabled={isCopilotAnalyzing}
                >
                  ⚙️ Group Health Check
                </button>
              </div>

              {/* Chat Output Area */}
              {(copilotResponse || isCopilotAnalyzing || copilotError) && (
                <div style={{
                  background: 'rgba(10, 15, 30, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  marginBottom: '1rem',
                  maxHeight: '360px',
                  overflowY: 'auto',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                }}>
                  {isCopilotAnalyzing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 0', gap: '0.75rem' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.1)',
                        borderTopColor: '#10B981',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Accessing Database & Analyzing System Metrics...
                      </span>
                    </div>
                  ) : copilotError ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#f87171' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} /> Analysis Interrupted
                      </div>
                      <div style={{ fontSize: '0.8rem', lineHeight: '1.4', opacity: 0.9 }}>{copilotError}</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          Analysis Report
                          {copilotProvider && (
                            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', border: '1px solid rgba(16, 185, 129, 0.3)', textTransform: 'none' }}>
                              ⚡ {copilotProvider}
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setCopilotResponse(''); setCopilotProvider(''); setCopilotSnapshot(null); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                        >
                          Clear Report
                        </button>
                      </div>
                      <div className="copilot-report-body" style={{ color: '#f3f4f6' }}>
                        {formatCopilotResponse(copilotResponse)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Prompt input field */}
              <form onSubmit={(e) => { e.preventDefault(); handleAskCopilot(); }} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="phone-field"
                  style={{ paddingLeft: '1rem', flex: 1, fontSize: '0.85rem', height: '40px' }}
                  placeholder="Ask Gemini (e.g. 'Is there anyone stuck with many unseen leads?')"
                  value={copilotQuery}
                  onChange={e => setCopilotQuery(e.target.value)}
                  disabled={isCopilotAnalyzing}
                  required
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: 'auto', padding: '0 1.25rem', height: '40px', background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  disabled={isCopilotAnalyzing}
                >
                  <Sparkles size={14} /> Ask
                </button>
              </form>
            </div>
          </div>

          {/* ── Pending Group Requests ── */}
          {pendingRequests.length > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Bell size={16} style={{ color: '#f59e0b' }} /> Pending Group Requests
              </h3>
              {pendingRequests.map(req => (
                <div key={req.id} className="request-card">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>"{req.group_name}"</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requested by {req.requestedByName} (+{req.requestedByPhone})</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-action btn-verify" onClick={() => handleApproveGroupRequest(req.id)}><Check size={12} /> Approve</button>
                    <button className="btn-action" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleRejectGroupRequest(req.id)}><X size={12} /> Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── User Management ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0 0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--accent-purple)' }} /> Manage Team Members
            </h3>
            <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem' }} onClick={handleCreateDownline}>
              <Plus size={14} /> Add Member
            </button>
          </div>

          {/* Search bar for team members */}
          <div className="phone-search-wrapper" style={{ marginBottom: '1rem', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="phone-field"
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
              placeholder="Search member by name or phone..."
              value={adminUserSearch}
              onChange={e => setAdminUserSearch(e.target.value)}
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              No members found matching your search.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {filteredUsers.map(u => {
                const count = leads.filter(l => l.refUserPhone === u.phone && l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__').length;
                const matchingCountry = countries.find(c => {
                  const d = c.dial_code.replace(/\D/g, '');
                  return u.phone.startsWith(d);
                });
                const flag = matchingCountry ? matchingCountry.flag : '🌐';
                const firstLetter = u.name ? u.name.charAt(0).toUpperCase() : '?';

                return (
                  <div key={u.phone} className="member-card-fancy" style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '20px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(20px)',
                  }}>
                    {/* Delete button (top right absolute) */}
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.phone)}
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f87171',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      title="Delete Account"
                    >
                      <X size={14} />
                    </button>

                    {/* Card Header (Avatar + Details) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        color: '#fff',
                        boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
                      }}>
                        {firstLetter}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#fff' }}>{u.name}</span>
                          <span style={{ fontSize: '1.1rem' }} title={matchingCountry ? matchingCountry.name : ''}>{flag}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                          <span>+{u.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats / Leads Counter */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      borderRadius: '12px',
                      padding: '0.5rem 0.75rem',
                      marginBottom: '1rem',
                    }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Leads</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-teal)' }}>{count}</span>
                    </div>

                    {/* Permissions Toggles */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleToggleGroupCreation(u.phone)} title="Toggle group creation permission">
                        <div className={`switch-track ${u.canCreateGroup ? 'active' : ''}`}>
                          <div className="switch-thumb" />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: u.canCreateGroup ? 'var(--text-primary)' : 'var(--text-muted)' }}>Groups</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleToggleMemberRegistration(u.phone)} title="Toggle member registration permission">
                        <div className={`switch-track ${u.canRegisterMembers ? 'active' : ''}`}>
                          <div className="switch-thumb" />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: u.canRegisterMembers ? 'var(--text-primary)' : 'var(--text-muted)' }}>Register</span>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                      <button
                        className="btn-outline"
                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', borderRadius: '10px' }}
                        onClick={() => setActiveImpersonatedUser(u)}
                      >
                        <Eye size={12} /> View
                      </button>
                      <button
                        className="btn-outline"
                        style={{
                          flex: 1.2,
                          padding: '0.4rem',
                          fontSize: '0.72rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          borderRadius: '10px',
                          borderColor: u.status === 'active' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(45, 212, 191, 0.4)',
                          color: u.status === 'active' ? '#f87171' : '#2dd4bf'
                        }}
                        onClick={() => handleToggleUserStatus(u.phone)}
                      >
                        {u.status === 'active' ? <UserMinus size={12} /> : <UserPlus size={12} />}
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        className="btn-outline"
                        style={{ flex: 0.8, padding: '0.4rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', borderRadius: '10px' }}
                        onClick={() => { setResetPasswordTarget(u.phone); setResetPasswordValue(''); setResetPasswordMsg(''); }}
                      >
                        <Key size={12} /> Reset
                      </button>
                    </div>

                    {/* Copy link quick badge */}
                    <button
                      type="button"
                      onClick={() => handleCopyRefLink(u.phone)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        position: 'absolute',
                        bottom: '4.25rem',
                        right: '0.75rem',
                        padding: '0.25rem',
                      }}
                      title="Copy Ref Link"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Lead Rotation Groups ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2.5rem 0 0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} style={{ color: 'var(--accent-teal)' }} /> Lead Rotation Groups (Round-Robin)
            </h3>
          </div>

          <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input type="text" className="phone-field" style={{ paddingLeft: '1rem', flex: 1 }} placeholder="New group name (e.g. Meta Ads Team A)" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} required />
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 1.25rem', display: 'flex', gap: '0.25rem', alignItems: 'center', background: 'linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-blue) 100%)' }}>
              <Plus size={16} /> Create
            </button>
          </form>

          {groups.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              No groups yet. Create one above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {groups.map(group => {
                const searchQuery = groupMemberSearch[group.id] || '';
                const searchResults = groupMemberSearchResults[group.id] || [];
                return (
                  <div key={group.id} className="group-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1.25rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.15rem' }}>{group.name}</h4>
                        {group.creatorName && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Users size={11} style={{ color: 'var(--accent-teal)' }} />
                            <span>Created by <strong style={{ color: 'var(--text-primary)' }}>{group.creatorName}</strong></span>
                            <span style={{ color: 'var(--text-muted)' }}>· +{group.createdByPhone}</span>
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => handleDeleteGroup(group.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <X size={16} />
                      </button>
                    </div>

                    {/* Campaign Link */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input
                        type="text"
                        readOnly
                        className="phone-field"
                        style={{
                          paddingLeft: '1rem',
                          fontSize: '0.8rem',
                          background: 'rgba(0,0,0,0.3)',
                          padding: '0.4rem 0.8rem',
                          flex: 1,
                          opacity: group.members.length > 0 ? 1 : 0.4
                        }}
                        value={group.members.length > 0 ? `${window.location.origin}${window.location.pathname}?group=${group.id}` : "Add members to activate group link..."}
                      />
                      <button
                        className={group.members.length > 0 ? "btn-primary" : "btn-outline"}
                        style={{
                          width: 'auto',
                          padding: '0.4rem 0.8rem',
                          opacity: group.members.length > 0 ? 1 : 0.4,
                          cursor: group.members.length > 0 ? 'pointer' : 'not-allowed'
                        }}
                        onClick={() => {
                          if (group.members.length > 0) {
                            handleCopyGroupLink(group.id);
                          }
                        }}
                        disabled={group.members.length === 0}
                        title={group.members.length > 0 ? "Copy Group Link" : "Add members first to enable link copy"}
                      >
                        <Copy size={14} />
                      </button>
                    </div>


                    {/* Group Member Analytics (Admin) */}
                    {group.members.length > 0 && (() => {
                      const followingUpCount = group.members.filter(member => {
                        const memberLeads = leads.filter(l => l.refUserPhone === member.phone && String(l.groupId) === String(group.id) && l.name !== '__wa_log__' && l.name !== '__skip_log__' && l.name !== '__sms_log__');
                        const seenCount = memberLeads.filter(l => l.seen).length;
                        return seenCount > 0;
                      }).length;

                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.6rem 0 1rem', flexWrap: 'wrap', gap: '0.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.5rem 0.75rem' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            Group Analytics: <span style={{ color: 'var(--accent-teal)' }}>{followingUpCount} of {group.members.length} members</span> active
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedGroupAnalytics(group.id)}
                            className="btn-outline"
                            style={{ padding: '0.15rem 0.45rem', fontSize: '0.65rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.02)' }}
                          >
                            <Maximize2 size={10} /> Fully Open View
                          </button>
                        </div>
                      );
                    })()}

                    {/* Current Members */}
                    {group.members.length > 0 && (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Users size={12} style={{ color: 'var(--accent-teal)' }} />
                          <span>Current Members ({group.members.length}):</span>
                        </div>
                        <div className="group-members-grid">
                          {group.members.map(m => (
                            <div key={m.phone} className="group-member-card">
                              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.name}>
                                  {m.name}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                                  +{m.phone}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveMemberFromGroup(group.id, m.phone)}
                                className="member-remove-btn"
                                title={`Remove ${m.name}`}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Phone Search to Add Member */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Search by phone to add member:</div>
                      <div className="phone-search-wrapper">
                        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                          type="tel"
                          className="phone-field"
                          style={{ paddingLeft: '2.25rem', fontSize: '0.82rem' }}
                          placeholder="Type phone number (min 3 digits)"
                          value={searchQuery}
                          onChange={e => handleGroupMemberSearch(group.id, e.target.value)}
                        />
                      </div>
                      {searchResults.length > 0 && (
                        <div className="search-results-dropdown">
                          {searchResults.map(user => {
                            const alreadyMember = group.members.some(m => m.phone === user.phone);
                            return (
                              <div key={user.phone} className="search-result-card">
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>+{user.phone}</div>
                                </div>
                                {alreadyMember ? (
                                  <span className="badge badge-verified">In Group</span>
                                ) : (
                                  <button
                                    className="btn-follow"
                                    onClick={() => {
                                      handleAddMemberToGroup(group.id, user.phone);
                                      setGroupMemberSearch(p => ({ ...p, [group.id]: '' }));
                                      setGroupMemberSearchResults(p => ({ ...p, [group.id]: [] }));
                                    }}
                                  >
                                    <Plus size={13} /> Add
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {searchQuery.length >= 3 && searchResults.length === 0 && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>No users found with that number.</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Master Leads Log ── */}
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '2rem 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--accent-blue)' }} /> Master Leads Capture Log (Global)
          </h3>

          {/* Export Controls (admin) */}
          {actualLeads.length > 0 && (
            <div className="export-controls-card" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '0.875rem 1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Export Mode:</span>
                <label className={`export-mode-btn ${exportMode === 'fullname' ? 'active' : ''}`}>
                  <input type="radio" name="exportModeAdmin" value="fullname" checked={exportMode === 'fullname'} onChange={() => setExportMode('fullname')} style={{ display: 'none' }} />
                  Full Name
                </label>
                <label className={`export-mode-btn ${exportMode === 'suffix' ? 'active' : ''}`}>
                  <input type="radio" name="exportModeAdmin" value="suffix" checked={exportMode === 'suffix'} onChange={() => setExportMode('suffix')} style={{ display: 'none' }} />
                  First Name + Country Code
                </label>
              </div>
            </div>
          )}

          <div className="table-wrapper">
            {actualLeads.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No leads captured yet.</div>
            ) : (
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {actualLeads.map(lead => {
                    const assigned = users.find(u => u.phone === lead.refUserPhone);
                    const leadCountry = countries.find(c => c.code === lead.countryCode);
                    const flag = leadCountry ? leadCountry.flag : '🌐';
                    return (
                      <tr key={lead.id} className={lead.seen ? 'lead-row-seen' : ''}>
                        <td data-label="Lead">
                          <div style={{ fontWeight: '600', opacity: lead.seen ? 0.6 : 1 }}>{lead.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.1rem' }} title={lead.countryName}>{flag}</span>
                            <span>{lead.fullNumber}</span>
                            {lead.exported && <span className="badge badge-exported">Exported</span>}
                            {lead.verified && <span className="badge badge-verified">Verified</span>}
                            {lead.seen && <span className="badge badge-seen">Seen</span>}
                          </div>
                          <div style={{
                            fontSize: '0.68rem',
                            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                            color: 'rgba(255, 255, 255, 0.75)',
                            marginTop: '0.3rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            textTransform: 'lowercase'
                          }}>
                            <Clock size={11} style={{ strokeWidth: 2.5 }} /> {lead.timestamp ? formatLeadDate(lead.timestamp) : ''}
                          </div>
                        </td>
                        <td data-label="Assigned To">
                          <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>{assigned ? assigned.name : 'Admin'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>+{lead.refUserPhone}</div>
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons-group">
                            {(() => {
                              const status = getSwipeStatus();
                              const isLocked = status.currentChannel === 'locked';
                              const isSms = status.currentChannel === 'sms';
                              const isWaDisabled = isLocked || status.cooldownRemaining > 0;
                              let waText = isLocked ? 'Limit' : isSms ? 'SMS' : 'WA';
                              let waTooltip = isSms ? `SMS ${lead.name.split(' ')[0]}` : `WhatsApp ${lead.name.split(' ')[0]}`;

                              if (isLocked) {
                                waTooltip = 'Daily limit of 10 WhatsApp and 20 SMS reached. Try again in 24 hours.';
                              } else if (status.cooldownRemaining > 0) {
                                waText = `${status.cooldownRemaining}s`;
                                waTooltip = `Anti-spam cooldown active: wait ${status.cooldownRemaining} seconds.`;
                              }

                              const btnBg = isLocked 
                                ? 'rgba(239, 68, 68, 0.15)' 
                                : status.cooldownRemaining > 0 
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : isSms
                                    ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                                    : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
                              const btnColor = isLocked 
                                ? '#f87171' 
                                : status.cooldownRemaining > 0 
                                  ? '#f59e0b' 
                                  : '#fff';
                              const btnBorderColor = isLocked 
                                ? 'rgba(239, 68, 68, 0.3)' 
                                : status.cooldownRemaining > 0 
                                  ? 'rgba(245, 158, 11, 0.3)' 
                                  : 'transparent';

                              return (
                                <button
                                  onClick={() => handleLeadAction(lead)}
                                  className="btn-action btn-whatsapp"
                                  disabled={isWaDisabled}
                                  title={waTooltip}
                                  style={{
                                    color: btnColor,
                                    background: btnBg,
                                    borderColor: btnBorderColor,
                                    opacity: 1,
                                    filter: 'none',
                                    fontWeight: '700',
                                    cursor: isWaDisabled ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  {isLocked ? null : isSms ? <MessageSquare size={12} /> : <MessageCircle size={12} />}
                                  {waText}
                                </button>
                              );
                            })()}
                            {!lead.verified && (
                              <button onClick={() => handleVerifyLead(lead)} className="btn-action btn-verify"><Phone size={12} /> Verify</button>
                            )}
                            <button className="btn-action btn-vcard" onClick={() => handleDownloadLeadVCard(lead)}><Download size={12} /> VCF</button>
                            {currentUser?.role === 'admin' && (
                              <button
                                className="btn-action"
                                onClick={() => handleDeleteLead(lead.id)}
                                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                title="Delete Lead"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="admin-actions" style={{ marginTop: '1.5rem' }}>
            {actualLeads.length > 0 && (
              <>
                <button className="btn-outline" style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }} onClick={handleClearAllLeads}>Reset Database</button>
                <button className="btn-outline" onClick={() => handleExportVCF()}>
                  <Download size={16} /> Master VCF ({actualLeads.filter(l => !l.exported).length} new)
                </button>
              </>
            )}
          </div>
        </div>
        {renderOverlays()}
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DEFAULT ROUTE: Visitor Landing Form
  // ════════════════════════════════════════════════════════════════════════════

  // Duplicate detected screen
  if (duplicateData) {
    const dupRef = duplicateReferrerInfo || referrerInfo;
    const dupFirstName = dupRef.name ? dupRef.name.split(' ')[0] : 'your contact';
    return (
      <div className="app-container">
        <div className="success-screen">
          <div className="success-badge" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>Already Registered!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.25rem' }}>
            This phone number has already been registered through this group. No duplicate entry was created.
          </p>
          <div className="save-back-card">
            <h3>Add {dupFirstName} to Your Contacts</h3>
            <p>To make sure you receive follow-up from <strong>{dupFirstName}</strong>, save their number in your phone contacts now.</p>
            <button
              type="button"
              className="google-glow-btn"
              onClick={() => handleSaveContactBack(dupRef.phone)}
            >
              <div className="google-glow-btn-border" />
              <div className="google-glow-btn-inner">
                <UserCheck size={20} /> Save {dupFirstName} to your contacts
              </div>
            </button>
          </div>
        </div>
        <div className="footer-text"><span>Powered by </span><strong style={{ fontWeight: '700', color: 'var(--text-primary)' }}>TONNY'S NETWORK</strong></div>
      </div>
    );
  }

  return (
    <>
      <div className="app-container">
        {isSaved ? (
          /* SUCCESS SCREEN */
          <div className="success-screen">
            <div className="success-badge"><Check size={32} /></div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>Registration Received</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.25rem' }}>
              We have successfully registered your WhatsApp contact details for <strong>{visitorName}</strong> ({selectedCountry.dial_code} {phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber}).
            </p>
            <div className="arrow-pointer-container">
              <ChevronDown size={28} className="animated-arrow-bounce" />
            </div>
            <div className="save-back-card">
              <h3>Final Step: Save Our Contact</h3>
              <p>Save <strong>{referrerFirstName}</strong> to your contact list to verify registry and ensure you receive our official follow-up material.</p>
              <button
                type="button"
                className="google-glow-btn"
                onClick={() => handleSaveContactBack()}
              >
                <div className="google-glow-btn-border" />
                <div className="google-glow-btn-inner">
                  <UserCheck size={20} /> Save {referrerFirstName} to your contacts
                </div>
              </button>
            </div>
          </div>
        ) : isCountingDown ? (
          /* COUNTDOWN / REVIEW SCREEN */
          <div className="countdown-screen" style={{ textAlign: 'center', animation: 'slideIn 0.5s ease forwards' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1rem' }}>Review Your Details</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
              Please make sure your name and WhatsApp number are correct before we register you.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Official Name</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{visitorName}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>WhatsApp Number</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedCountry.dial_code} {phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber}</span>
              </div>
            </div>
            <div style={{ marginBottom: '1.75rem', padding: '0 0.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', textAlign: 'left' }}>
                {isLoading ? 'Registering your contact details...' : <> Registering in <strong style={{ color: 'var(--accent-teal)', fontSize: '1.1rem' }}>{countdown}</strong> seconds...</>}
              </span>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${(countdown / 15) * 100}%`, height: '100%', background: 'linear-gradient(to right, var(--accent-teal), var(--accent-blue))', transition: 'width 1s linear' }} />
              </div>
            </div>
            <button type="button" className="btn-primary" onClick={() => executeSaveLead()} style={{ width: '100%', marginBottom: '0.75rem' }} disabled={isLoading}>
              {isLoading ? <span className="loader" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} /> : 'Confirm & Continue Now'}
            </button>
            <button type="button" className="btn-outline btn-pulse" onClick={() => setIsCountingDown(false)} style={{ width: '100%', borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }} disabled={isLoading}>
              Edit / Correct Number
            </button>
          </div>
        ) : (
          /* ENTRY FORM */
          <>
            <div className="header" style={{ marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Tell us how to contact you</h1>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: '1.3' }}>Provide your name and WhatsApp number so our team can send your training materials.</p>
            </div>
            <form onSubmit={handleSaveLead}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Official Full Name</label>
                <input type="text" className="phone-field" style={{ paddingLeft: '1rem' }} placeholder="Enter your full name" value={visitorName} onChange={e => setVisitorName(e.target.value)} required />
              </div>
              <div className="form-group" ref={dropdownRef} style={{ marginBottom: '1rem' }}>
                <label className="form-label">Country of Residence</label>
                <button type="button" className={`selector-trigger ${isDropdownOpen ? 'active' : ''}`} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <div className="trigger-value"><span className="country-flag">{selectedCountry.flag}</span><span>{selectedCountry.name}</span></div>
                  <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-panel">
                    <div className="search-container">
                      <Search size={18} className="search-icon" />
                      <input type="text" className="search-input" placeholder="Type country name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
                    </div>
                    <div className="country-list">
                      {filteredCountries.length === 0 ? <div className="no-results">No countries found</div> : filteredCountries.map(country => (
                        <button key={country.code} type="button" className="country-option" onClick={() => { setSelectedCountry(country); setIsDropdownOpen(false); setSearchQuery(''); }}>
                          <div className="country-option-info"><span className="country-flag">{country.flag}</span><span>{country.name}</span></div>
                          <span className="country-dial">{country.dial_code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Primary WhatsApp Contact</label>
                <div className="phone-input-wrapper">
                  <div ref={badgeRef} className="phone-dial-badge">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '1px', fontWeight: '600' }}>{selectedCountry.code}</span>
                    <span>{selectedCountry.dial_code}</span>
                  </div>
                  <input type="tel" className="phone-field" style={{ paddingLeft: `${badgeWidth + 24}px`, paddingRight: '2.75rem' }} placeholder="e.g. 712345678" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} required />
                  <div style={{ position: 'absolute', right: '1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ color: '#25D366' }}><path d="M12.012 2C6.48 2 2 6.48 2 12.012c0 1.73.443 3.42 1.285 4.91L2 22l5.22-1.37a9.952 9.952 0 0 0 4.793 1.22c5.53 0 10.01-4.48 10.01-10.012C22.025 6.48 17.543 2 12.012 2zm3.626 14.157c-.206.58-.997 1.097-1.63 1.185-.562.078-1.29.1-2.072-.15-3.056-.99-5.045-4.093-5.198-4.3-.152-.206-1.22-1.625-1.22-3.1s.766-2.203 1.037-2.508c.27-.305.592-.38.79-.38.2 0 .393.003.565.01.178.008.416-.068.65.49.24.576.82 2.01.892 2.155.072.146.12.316.023.51-.097.195-.146.317-.29.49-.146.17-.306.38-.437.51-.146.146-.3.305-.128.6.172.296.767 1.266 1.644 2.046.877.78 1.62 1.02 1.92 1.14.3.122.474.1.65-.1.178-.2.766-.89.972-1.196.206-.305.412-.254.694-.15.282.105 1.79.845 2.1 1 .31.155.517.23.593.36.076.13.076.755-.13 1.335z" /></svg>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.875rem' }} disabled={isLoading || !phoneNumber.trim() || !visitorName.trim()}>
                {isLoading ? <span className="loader" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} /> : <> Next <ArrowRight size={18} /></>}
              </button>
            </form>


          </>
        )}

        <div className="footer-text">
          <span>Powered by </span>
          <strong style={{ fontWeight: '700', color: 'var(--text-primary)' }}>TONNY'S NETWORK</strong>
        </div>
      </div>

      {renderOverlays()}
      <Analytics />
    </>
  );
}

export default App;
