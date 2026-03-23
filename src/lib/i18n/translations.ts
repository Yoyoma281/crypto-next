export type Locale = "en" | "he" | "ar" | "ru" | "es" | "fr" | "zh";
export type Direction = "ltr" | "rtl";
export const RTL_LOCALES: Locale[] = ["he", "ar"];

export interface T {
  nav: {
    markets: string;
    exchange: string;
    portfolio: string;
    watchlist: string;
    history: string;
    leaderboard: string;
    news: string;
    settings: string;
    more: string;
    login: string;
    signup: string;
  };
  stats: {
    coins: string;
    marketCap: string;
    volume24h: string;
    btcDominance: string;
  };
  trading: {
    buy: string;
    sell: string;
    price: string;
    amount: string;
    total: string;
    balance: string;
    orderBook: string;
    recentTrades: string;
    news: string;
    high24h: string;
    low24h: string;
    volume24h: string;
    placeOrder: string;
    available: string;
    market: string;
    limit: string;
    signingIn: string;
    priceUsdt: string;
    qty: string;
    spread: string;
    time: string;
    estTotal: string;
    processing: string;
    networkError: string;
    orderFilled: string;
    signUpToTrade: string;
    getVirtualFunds: string;
    signUpFree: string;
    logIn: string;
  };
  auth: {
    username: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    welcomeBack: string;
    loginSubtitle: string;
    createAccount: string;
    signupSubtitle: string;
    signIn: string;
    signUp: string;
    signingIn: string;
    creatingAccount: string;
    noAccount: string;
    signUpFree: string;
    hasAccount: string;
    signInLink: string;
    accountCreated: string;
    redirectingLogin: string;
    virtualBalance: string;
    redirectingMarkets: string;
    invalidCredentials: string;
    loginFailed: string;
    networkError: string;
  };
  portfolio: {
    title: string;
    subtitle: string;
    signIn: string;
    signInSubtitle: string;
    couldNotLoad: string;
    totalValue: string;
    holdingsPlusCash: string;
    totalPnl: string;
    vsStart: string;
    holdingsValue: string;
    availableBalance: string;
    assets: string;
    activePositions: string;
    live: string;
    connecting: string;
    disconnected: string;
    colRank: string;
    colAsset: string;
    colHoldings: string;
    colCurrentValue: string;
    colAvgBuy: string;
    colPnl: string;
  };
  news: {
    title: string;
    poweredBy: string;
    latest: string;
    hot: string;
    rising: string;
    bullish: string;
    bearish: string;
    filterPlaceholder: string;
    noNews: string;
    tryDifferent: string;
    trending: string;
  };
  history: {
    title: string;
    subtitle: string;
    signIn: string;
    signInSubtitle: string;
    noTrades: string;
    goToExchange: string;
    firstTrade: string;
    date: string;
    pair: string;
    type: string;
    price: string;
    amountUsdt: string;
    quantity: string;
    showing: string;
  };
  leaderboard: {
    title: string;
    subtitle: string;
    signIn: string;
    signInSubtitle: string;
    noUsers: string;
    rank: string;
    trader: string;
    portfolioValue: string;
    vsStart: string;
    share: string;
    footer: string;
  };
  settings: {
    title: string;
    subtitle: string;
    signIn: string;
    signInSubtitle: string;
    changePassword: string;
    changePasswordDesc: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    reEnter: string;
    noMatch: string;
    updated: string;
    somethingWrong: string;
    networkError: string;
    updating: string;
    updatePassword: string;
    resetPortfolio: string;
    resetDesc: string;
    resetWarning: string;
    resetting: string;
    reset: string;
    confirmReset: string;
    cancel: string;
    account: string;
    accountDetails: string;
    startingBalance: string;
    trading: string;
    tradingDesc: string;
    dataSource: string;
    dataSourceDesc: string;
  };
  watchlist: {
    title: string;
    subtitle: string;
    signIn: string;
    signInSubtitle: string;
    synced: string;
    browseMarkets: string;
    coinSingular: string;
    coinPlural: string;
    watched: string;
    starCoins: string;
    markets: string;
    or: string;
    exchange: string;
    addThem: string;
  };
  coin: {
    loading: string;
    couldNotLoad: string;
    geckoNote: string;
    rank: string;
    pricePerformance: string;
    change24h: string;
    change7d: string;
    change30d: string;
    high24h: string;
    low24h: string;
    ath: string;
    atl: string;
    marketStats: string;
    marketCap: string;
    volume24h: string;
    circulatingSupply: string;
    totalSupply: string;
    maxSupply: string;
    launchDate: string;
    algorithm: string;
    links: string;
    github: string;
    reddit: string;
    overview: string;
    trade: string;
  };
  sidebar: {
    paperTrader: string;
    notSignedIn: string;
    signIn: string;
    register: string;
    signOut: string;
    market: string;
    account: string;
  };
  footer: {
    tagline: string;
    platform: string;
    learn: string;
    legal: string;
    privacyPolicy: string;
    terms: string;
    cookies: string;
    whatIsBitcoin: string;
    whatIsEthereum: string;
    howToTrade: string;
    allRightsReserved: string;
    dataProvided: string;
  };
  common: {
    loading: string;
    search: string;
    language: string;
    noNews: string;
    mAgo: string;
    hAgo: string;
    dAgo: string;
  };
  home: {
    badge: string;
    heroTitle1: string;
    heroTitle2: string;
    heroTitle3: string;
    heroDesc: string;
    startTrading: string;
    viewLiveChart: string;
    tradingPairs: string;
    virtualBalance: string;
    dataDelay: string;
    featuresTitle: string;
    featuresSubtitle: string;
    howItWorksTitle: string;
    howItWorksSubtitle: string;
    ctaTitle: string;
    ctaDesc: string;
    getStarted: string;
    liveMarketsTitle: string;
    liveMarketsDesc: string;
    f1Title: string;
    f1Desc: string;
    f2Title: string;
    f2Desc: string;
    f3Title: string;
    f3Desc: string;
    f4Title: string;
    f4Desc: string;
    s1Title: string;
    s1Desc: string;
    s2Title: string;
    s2Desc: string;
    s3Title: string;
    s3Desc: string;
    s4Title: string;
    s4Desc: string;
  };
  markets: {
    allCoins: string;
    favorites: string;
    live: string;
    connecting: string;
    disconnected: string;
    showing: string;
    of: string;
    coins: string;
    page: string;
    prev: string;
    next: string;
    colName: string;
    colPrice: string;
    col24hChange: string;
    col24hPct: string;
    colAvgPrice: string;
    colPrevClose: string;
    col7dChart: string;
    colTrade: string;
  };
}

const en: T = {
  nav: {
    markets: "Markets",
    exchange: "Exchange",
    portfolio: "Wallet & Assets",
    watchlist: "Watchlist",
    history: "History",
    leaderboard: "Leaderboard",
    news: "News",
    settings: "Settings",
    more: "More",
    login: "Login",
    signup: "Sign Up",
  },
  stats: {
    coins: "Coins",
    marketCap: "Mkt Cap",
    volume24h: "24h Vol",
    btcDominance: "BTC Dom",
  },
  trading: {
    buy: "Buy",
    sell: "Sell",
    price: "Price",
    amount: "Amount",
    total: "Total",
    balance: "Balance",
    orderBook: "Order Book",
    recentTrades: "Recent Trades",
    news: "News",
    high24h: "24h High",
    low24h: "24h Low",
    volume24h: "24h Volume",
    placeOrder: "Place Order",
    available: "Available",
    market: "Market",
    limit: "Limit",
    signingIn: "Signing in…",
    priceUsdt: "Price (USDT)",
    qty: "Qty",
    spread: "Spread",
    time: "Time",
    estTotal: "Est. Total",
    processing: "Processing…",
    networkError: "Network error",
    orderFilled: "order filled!",
    signUpToTrade: "Sign up to start trading",
    getVirtualFunds: "Get $1,000 USDT in virtual funds instantly.",
    signUpFree: "Sign Up Free",
    logIn: "Log In",
  },
  auth: {
    username: "Username",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot password?",
    welcomeBack: "Welcome back",
    loginSubtitle: "Sign in to your CrySer account",
    createAccount: "Create your account",
    signupSubtitle: "Start with $1,000 in virtual funds — free forever",
    signIn: "Sign In",
    signUp: "Create Account",
    signingIn: "Signing in…",
    creatingAccount: "Creating account…",
    noAccount: "Don't have an account?",
    signUpFree: "Sign up free",
    hasAccount: "Already have an account?",
    signInLink: "Sign in",
    accountCreated: "Account created!",
    redirectingLogin: "Redirecting to login…",
    virtualBalance: "$1,000 USDT added to your account",
    redirectingMarkets: "Redirecting to markets…",
    invalidCredentials: "Invalid credentials. Please try again.",
    loginFailed: "Login failed. Please check your credentials.",
    networkError: "Network error. Please try again.",
  },
  portfolio: {
    title: "My Portfolio",
    subtitle: "Track your crypto holdings and performance",
    signIn: "Sign in to view your portfolio",
    signInSubtitle:
      "Your holdings, live valuations, and P&L are all waiting for you.",
    couldNotLoad: "Could not load portfolio. Please log in.",
    totalValue: "Total Value",
    holdingsPlusCash: "Holdings + Cash",
    totalPnl: "Total P&L",
    vsStart: "vs $1,000 start",
    holdingsValue: "Holdings Value",
    availableBalance: "Available Balance",
    assets: "Assets",
    activePositions: "active positions",
    live: "Live",
    connecting: "Connecting…",
    disconnected: "Disconnected",
    colRank: "#",
    colAsset: "Asset",
    colHoldings: "Holdings",
    colCurrentValue: "Current Value",
    colAvgBuy: "Avg Buy Price",
    colPnl: "Unrealized P&L",
  },
  news: {
    title: "Crypto News",
    poweredBy: "Powered by CryptoCompare",
    latest: "Latest",
    hot: "Hot",
    rising: "Rising",
    bullish: "Bullish",
    bearish: "Bearish",
    filterPlaceholder: "Filter by coin… BTC",
    noNews: "No news found",
    tryDifferent: "Try a different filter.",
    trending: "Trending",
  },
  history: {
    title: "Trade History",
    subtitle: "All your executed trades — most recent first",
    signIn: "Sign in to view your trade history",
    signInSubtitle: "Every buy and sell you make is logged here.",
    noTrades: "No trades yet. Head to the",
    goToExchange: "Exchange",
    firstTrade: "to place your first trade.",
    date: "Date",
    pair: "Pair",
    type: "Type",
    price: "Price",
    amountUsdt: "Amount (USDT)",
    quantity: "Quantity",
    showing: "Showing up to 200 most recent trades",
  },
  leaderboard: {
    title: "Leaderboard",
    subtitle: "Top 50 traders ranked by total portfolio value",
    signIn: "Sign in to view the leaderboard",
    signInSubtitle: "See how your portfolio stacks up against other traders.",
    noUsers: "No users yet.",
    rank: "Rank",
    trader: "Trader",
    portfolioValue: "Portfolio Value",
    vsStart: "vs. Start",
    share: "Share",
    footer: "All traders start with $1,000 USDT · Updates on page refresh",
  },
  settings: {
    title: "Settings",
    subtitle: "Manage your account",
    signIn: "Sign in to access settings",
    signInSubtitle: "Manage your password and account preferences.",
    changePassword: "Change Password",
    changePasswordDesc: "Update your login password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    reEnter: "Re-enter new password",
    noMatch: "Passwords do not match",
    updated: "Password updated!",
    somethingWrong: "Something went wrong",
    networkError: "Network error — is the server running?",
    updating: "Updating…",
    updatePassword: "Update Password",
    resetPortfolio: "Reset Portfolio",
    resetDesc: "Wipe all holdings and start fresh with $1,000 USDT",
    resetWarning:
      "This will permanently delete all your holdings and trade data. You will start over with $1,000 virtual USDT. This cannot be undone.",
    resetting: "Resetting…",
    reset: "Reset Portfolio",
    confirmReset: "Click again to confirm reset",
    cancel: "Cancel",
    account: "Account",
    accountDetails: "Your account details",
    startingBalance: "Starting balance: ",
    trading: "Trading: ",
    tradingDesc: "Paper trading only — no real money",
    dataSource: "Data source: ",
    dataSourceDesc: "Live Binance prices",
  },
  watchlist: {
    title: "Watchlist",
    subtitle: "Your starred coins — live prices updated in real time",
    signIn: "Sign in to view your watchlist",
    signInSubtitle: "Star coins to track them here with live prices.",
    synced: "Synced",
    browseMarkets: "Browse Markets",
    coinSingular: "coin",
    coinPlural: "coins",
    watched: "watched",
    starCoins: "Star coins on the",
    markets: "Markets",
    or: "or",
    exchange: "Exchange",
    addThem: "page to add them here.",
  },
  coin: {
    loading: "Loading coin data…",
    couldNotLoad: "Could not load data for",
    geckoNote: "CoinGecko may not have this coin mapped, or rate limit hit.",
    rank: "Rank #",
    pricePerformance: "Price Performance",
    change24h: "24h Change",
    change7d: "7d Change",
    change30d: "30d Change",
    high24h: "24h High",
    low24h: "24h Low",
    ath: "All-Time High",
    atl: "All-Time Low",
    marketStats: "Market Stats",
    marketCap: "Market Cap",
    volume24h: "24h Volume",
    circulatingSupply: "Circulating Supply",
    totalSupply: "Total Supply",
    maxSupply: "Max Supply",
    launchDate: "Launch Date",
    algorithm: "Algorithm",
    links: "Links",
    github: "GitHub",
    reddit: "Reddit",
    overview: "Overview",
    trade: "Trade",
  },
  sidebar: {
    paperTrader: "Paper Trader",
    notSignedIn: "Not signed in",
    signIn: "Sign In",
    register: "Register",
    signOut: "Sign Out",
    market: "Market",
    account: "Account",
  },
  footer: {
    tagline:
      "Real-time crypto market data, live trading, and portfolio tracking — all in one place.",
    platform: "Platform",
    learn: "Learn",
    legal: "Legal",
    privacyPolicy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
    whatIsBitcoin: "What is Bitcoin?",
    whatIsEthereum: "What is Ethereum?",
    howToTrade: "How to Trade",
    allRightsReserved: "All rights reserved.",
    dataProvided: "Market data provided by Binance & CoinGecko",
  },
  common: {
    loading: "Loading…",
    search: "Search coins…",
    language: "Language",
    noNews: "No news found.",
    mAgo: "m ago",
    hAgo: "h ago",
    dAgo: "d ago",
  },
  home: {
    badge: "Paper trading — zero risk, 100% real data",
    heroTitle1: "Trade Crypto",
    heroTitle2: "Like a Pro.",
    heroTitle3: "For Free.",
    heroDesc:
      "CrySer is a demo crypto trading platform powered by live Binance data. Practice your strategy with $1,000 in virtual USDT — no deposit, no risk.",
    startTrading: "Start Trading",
    viewLiveChart: "View Live Chart",
    tradingPairs: "Trading Pairs",
    virtualBalance: "Virtual Starting Balance",
    dataDelay: "Data Delay",
    featuresTitle: "Everything you need to practice",
    featuresSubtitle: "Built with real trading tools, zero real money.",
    howItWorksTitle: "How it works",
    howItWorksSubtitle: "Up and trading in under a minute.",
    ctaTitle: "Ready to start trading?",
    ctaDesc: "Create a free account and get $1,000 in virtual funds instantly.",
    getStarted: "Get Started Free",
    liveMarketsTitle: "Live Markets",
    liveMarketsDesc: "Real-time prices from Binance, updated every 3 seconds.",
    f1Title: "Live Market Data",
    f1Desc:
      "Real-time prices, order books, and trade history streamed directly from Binance.",
    f2Title: "Professional Charts",
    f2Desc:
      "TradingView-powered candlestick charts with multiple timeframes — 1m to 1d.",
    f3Title: "$1,000 Virtual Funds",
    f3Desc:
      "Every new account starts with $1,000 USDT in paper money. No real risk, real experience.",
    f4Title: "Portfolio Tracking",
    f4Desc: "Watch your holdings update in real-time as the market moves.",
    s1Title: "Create an account",
    s1Desc: "Sign up free in under 30 seconds.",
    s2Title: "Get $1,000 USDT",
    s2Desc: "Your virtual balance is ready immediately.",
    s3Title: "Browse markets",
    s3Desc: "Explore hundreds of USDT trading pairs.",
    s4Title: "Place your first trade",
    s4Desc: "Buy or sell at live market prices.",
  },
  markets: {
    allCoins: "All Coins",
    favorites: "Favorites",
    live: "Live",
    connecting: "Connecting…",
    disconnected: "Disconnected",
    showing: "Showing",
    of: "of",
    coins: "coins",
    page: "Page",
    prev: "‹ Prev",
    next: "Next ›",
    colName: "Name",
    colPrice: "Price",
    col24hChange: "24h Change",
    col24hPct: "24h %",
    colAvgPrice: "Avg Price",
    colPrevClose: "Prev Close",
    col7dChart: "7d Chart",
    colTrade: "Trade",
  },
};

const he: T = {
  nav: {
    markets: "שווקים",
    exchange: "בורסה",
    portfolio: "ארנק ונכסים",
    watchlist: "מעקב",
    history: "היסטוריה",
    leaderboard: "טבלת מובילים",
    news: "חדשות",
    settings: "הגדרות",
    more: "עוד",
    login: "התחבר",
    signup: "הרשמה",
  },
  stats: {
    coins: "מטבעות",
    marketCap: "שווי שוק",
    volume24h: "נפח 24ש",
    btcDominance: "דומיננטיות BTC",
  },
  trading: {
    buy: "קנה",
    sell: "מכור",
    price: "מחיר",
    amount: "כמות",
    total: 'סה"כ',
    balance: "יתרה",
    orderBook: "ספר פקודות",
    recentTrades: "עסקאות אחרונות",
    news: "חדשות",
    high24h: "שיא 24ש",
    low24h: "שפל 24ש",
    volume24h: "נפח 24ש",
    placeOrder: "בצע פקודה",
    available: "זמין",
    market: "שוק",
    limit: "מחיר מגבלה",
    signingIn: "מתחבר…",
    priceUsdt: "מחיר (USDT)",
    qty: "כמות",
    spread: "ספרד",
    time: "שעה",
    estTotal: 'סה"כ משוער',
    processing: "מעבד…",
    networkError: "שגיאת רשת",
    orderFilled: "פקודה בוצעה!",
    signUpToTrade: "הרשם כדי להתחיל לסחור",
    getVirtualFunds: "קבל $1,000 USDT בכספים וירטואליים מיידית.",
    signUpFree: "הרשם חינם",
    logIn: "התחבר",
  },
  auth: {
    username: "שם משתמש",
    password: "סיסמה",
    confirmPassword: "אימות סיסמה",
    forgotPassword: "שכחת סיסמה?",
    welcomeBack: "ברוך שובך",
    loginSubtitle: "התחבר לחשבון CrySer שלך",
    createAccount: "צור חשבון",
    signupSubtitle: "התחל עם $1,000 בכספים וירטואליים — חינם לצמיתות",
    signIn: "התחבר",
    signUp: "צור חשבון",
    signingIn: "מתחבר…",
    creatingAccount: "יוצר חשבון…",
    noAccount: "אין לך חשבון?",
    signUpFree: "הרשם חינם",
    hasAccount: "יש לך כבר חשבון?",
    signInLink: "התחבר",
    accountCreated: "החשבון נוצר!",
    redirectingLogin: "מועבר להתחברות…",
    virtualBalance: "$1,000 USDT נוספו לחשבונך",
    redirectingMarkets: "מועבר לשווקים…",
    invalidCredentials: "פרטי התחברות שגויים. נסה שוב.",
    loginFailed: "ההתחברות נכשלה. בדוק את פרטיך.",
    networkError: "שגיאת רשת. נסה שוב.",
  },
  portfolio: {
    title: "התיק שלי",
    subtitle: "עקוב אחר אחזקותיך וביצועיך",
    signIn: "התחבר לצפייה בתיק",
    signInSubtitle: "האחזקות, ערכי השוק ורווח/הפסד שלך מחכים לך.",
    couldNotLoad: "לא ניתן לטעון את התיק. אנא התחבר.",
    totalValue: 'סה"כ שווי',
    holdingsPlusCash: "אחזקות + מזומן",
    totalPnl: 'סה"כ רווח/הפסד',
    vsStart: "לעומת תחילת $1,000",
    holdingsValue: "שווי אחזקות",
    availableBalance: "יתרה זמינה",
    assets: "נכסים",
    activePositions: "פוזיציות פעילות",
    live: "חי",
    connecting: "מתחבר…",
    disconnected: "מנותק",
    colRank: "#",
    colAsset: "נכס",
    colHoldings: "אחזקות",
    colCurrentValue: "שווי נוכחי",
    colAvgBuy: "מחיר קנייה ממוצע",
    colPnl: "רווח/הפסד לא ממומש",
  },
  news: {
    title: "חדשות קריפטו",
    poweredBy: "מופעל על ידי CryptoCompare",
    latest: "אחרונים",
    hot: "חם",
    rising: "עולה",
    bullish: "שוורי",
    bearish: "דובי",
    filterPlaceholder: "סנן לפי מטבע… BTC",
    noNews: "לא נמצאו חדשות",
    tryDifferent: "נסה מסנן אחר.",
    trending: "מגמות",
  },
  history: {
    title: "היסטוריית מסחר",
    subtitle: "כל העסקאות שבוצעו — מהאחרון לראשון",
    signIn: "התחבר לצפייה בהיסטוריית המסחר",
    signInSubtitle: "כל קנייה ומכירה שביצעת מתועדת כאן.",
    noTrades: "אין עסקאות עדיין. עבור ל",
    goToExchange: "בורסה",
    firstTrade: "כדי לבצע את העסקה הראשונה שלך.",
    date: "תאריך",
    pair: "זוג",
    type: "סוג",
    price: "מחיר",
    amountUsdt: "כמות (USDT)",
    quantity: "כמות",
    showing: "מציג עד 200 עסקאות אחרונות",
  },
  leaderboard: {
    title: "טבלת מובילים",
    subtitle: "50 הסוחרים המובילים לפי שווי תיק",
    signIn: "התחבר לצפייה בטבלת המובילים",
    signInSubtitle: "בדוק היכן התיק שלך עומד ביחס לסוחרים אחרים.",
    noUsers: "אין משתמשים עדיין.",
    rank: "דירוג",
    trader: "סוחר",
    portfolioValue: "שווי תיק",
    vsStart: "לעומת תחילה",
    share: "שתף",
    footer: "כל הסוחרים מתחילים עם $1,000 USDT · מתעדכן בטעינת עמוד",
  },
  settings: {
    title: "הגדרות",
    subtitle: "ניהול חשבונך",
    signIn: "התחבר לגישה להגדרות",
    signInSubtitle: "נהל את הסיסמה ואפשרויות החשבון שלך.",
    changePassword: "שנה סיסמה",
    changePasswordDesc: "עדכן את סיסמת ההתחברות שלך",
    currentPassword: "סיסמה נוכחית",
    newPassword: "סיסמה חדשה",
    confirmNewPassword: "אימות סיסמה חדשה",
    reEnter: "הזן מחדש סיסמה חדשה",
    noMatch: "הסיסמאות אינן תואמות",
    updated: "הסיסמה עודכנה!",
    somethingWrong: "משהו השתבש",
    networkError: "שגיאת רשת — האם השרת פועל?",
    updating: "מעדכן…",
    updatePassword: "עדכן סיסמה",
    resetPortfolio: "איפוס תיק",
    resetDesc: "מחק את כל האחזקות והתחל מחדש עם $1,000 USDT",
    resetWarning:
      "פעולה זו תמחק לצמיתות את כל האחזקות ונתוני המסחר שלך. תתחיל מחדש עם $1,000 USDT וירטואלי. לא ניתן לבטל פעולה זו.",
    resetting: "מאפס…",
    reset: "אפס תיק",
    confirmReset: "לחץ שוב לאישור האיפוס",
    cancel: "ביטול",
    account: "חשבון",
    accountDetails: "פרטי חשבונך",
    startingBalance: "יתרה התחלתית: ",
    trading: "מסחר: ",
    tradingDesc: "מסחר על נייר בלבד — ללא כסף אמיתי",
    dataSource: "מקור נתונים: ",
    dataSourceDesc: "מחירי Binance חיים",
  },
  watchlist: {
    title: "רשימת מעקב",
    subtitle: "המטבעות המועדפים שלך — מחירים חיים בזמן אמת",
    signIn: "התחבר לצפייה ברשימת המעקב",
    signInSubtitle: "סמן מטבעות כדי לעקוב אחריהם כאן עם מחירים חיים.",
    synced: "מסונכרן",
    browseMarkets: "גלה שווקים",
    coinSingular: "מטבע",
    coinPlural: "מטבעות",
    watched: "במעקב",
    starCoins: "סמן מטבעות ב",
    markets: "שווקים",
    or: "או",
    exchange: "בורסה",
    addThem: "כדי להוסיפם לכאן.",
  },
  coin: {
    loading: "טוען נתוני מטבע…",
    couldNotLoad: "לא ניתן לטעון נתונים עבור",
    geckoNote: "ייתכן ש-CoinGecko אינו מזהה מטבע זה, או שהגעת למגבלת הבקשות.",
    rank: "דירוג #",
    pricePerformance: "ביצועי מחיר",
    change24h: "שינוי 24ש",
    change7d: "שינוי 7י",
    change30d: "שינוי 30י",
    high24h: "שיא 24ש",
    low24h: "שפל 24ש",
    ath: "שיא כל הזמנים",
    atl: "שפל כל הזמנים",
    marketStats: "סטטיסטיקת שוק",
    marketCap: "שווי שוק",
    volume24h: "נפח 24ש",
    circulatingSupply: "היצע במחזור",
    totalSupply: "היצע כולל",
    maxSupply: "היצע מקסימלי",
    launchDate: "תאריך השקה",
    algorithm: "אלגוריתם",
    links: "קישורים",
    github: "GitHub",
    reddit: "Reddit",
    overview: "סקירה",
    trade: "מסחר",
  },
  sidebar: {
    paperTrader: "סוחר נייר",
    notSignedIn: "לא מחובר",
    signIn: "התחבר",
    register: "הרשמה",
    signOut: "יציאה",
    market: "שוק",
    account: "חשבון",
  },
  footer: {
    tagline: "נתוני שוק בזמן אמת, מסחר חי ומעקב אחר תיקים — הכל במקום אחד.",
    platform: "פלטפורמה",
    learn: "למד",
    legal: "משפטי",
    privacyPolicy: "מדיניות פרטיות",
    terms: "תנאי שירות",
    cookies: "מדיניות עוגיות",
    whatIsBitcoin: "מה זה ביטקוין?",
    whatIsEthereum: "מה זה אתריום?",
    howToTrade: "כיצד לסחור",
    allRightsReserved: "כל הזכויות שמורות.",
    dataProvided: "נתוני שוק מסופקים על ידי Binance & CoinGecko",
  },
  common: {
    loading: "טוען…",
    search: "חיפוש מטבעות…",
    language: "שפה",
    noNews: "לא נמצאו חדשות.",
    mAgo: "ד׳",
    hAgo: "ש׳",
    dAgo: "י׳",
  },
  home: {
    badge: "מסחר על נייר — אפס סיכון, 100% נתונים אמיתיים",
    heroTitle1: "סחר בקריפטו",
    heroTitle2: "כמו מקצוען.",
    heroTitle3: "בחינם.",
    heroDesc:
      "CrySer הוא פלטפורמת מסחר קריפטו לדוגמה המופעלת על נתוני Binance חיים. תרגל את האסטרטגיה שלך עם $1,000 USDT וירטואלי — ללא הפקדה, ללא סיכון.",
    startTrading: "התחל לסחור",
    viewLiveChart: "צפה בגרף חי",
    tradingPairs: "זוגות מסחר",
    virtualBalance: "יתרה התחלתית וירטואלית",
    dataDelay: "עיכוב נתונים",
    featuresTitle: "כל מה שצריך כדי להתאמן",
    featuresSubtitle: "בנוי עם כלי מסחר אמיתיים, ללא כסף אמיתי.",
    howItWorksTitle: "איך זה עובד",
    howItWorksSubtitle: "בפחות מדקה כבר סוחרים.",
    ctaTitle: "מוכן להתחיל לסחור?",
    ctaDesc: "צור חשבון חינם וקבל $1,000 בכספים וירטואליים מיידית.",
    getStarted: "התחל חינם",
    liveMarketsTitle: "שווקים חיים",
    liveMarketsDesc: "מחירים בזמן אמת מ-Binance, מתעדכן כל 3 שניות.",
    f1Title: "נתוני שוק חיים",
    f1Desc: "מחירים בזמן אמת, ספרי פקודות והיסטוריית מסחר ישירות מ-Binance.",
    f2Title: "גרפים מקצועיים",
    f2Desc:
      "גרפי נרות מבוססי TradingView עם מסגרות זמן מרובות — מ-1 דקה עד יום.",
    f3Title: "$1,000 כספים וירטואליים",
    f3Desc:
      "כל חשבון חדש מתחיל עם $1,000 USDT בכסף נייר. אפס סיכון, חוויה אמיתית.",
    f4Title: "מעקב תיק",
    f4Desc: "צפה כיצד האחזקות שלך מתעדכנות בזמן אמת עם תנועות השוק.",
    s1Title: "צור חשבון",
    s1Desc: "הרשם חינם תוך פחות מ-30 שניות.",
    s2Title: "קבל $1,000 USDT",
    s2Desc: "היתרה הוירטואלית שלך מוכנה מיידית.",
    s3Title: "גלה שווקים",
    s3Desc: "חקור מאות זוגות מסחר USDT.",
    s4Title: "בצע את העסקה הראשונה",
    s4Desc: "קנה או מכור במחירי שוק חיים.",
  },
  markets: {
    allCoins: "כל המטבעות",
    favorites: "מועדפים",
    live: "חי",
    connecting: "מתחבר…",
    disconnected: "מנותק",
    showing: "מציג",
    of: "מתוך",
    coins: "מטבעות",
    page: "עמוד",
    prev: "‹ הקודם",
    next: "הבא ›",
    colName: "שם",
    colPrice: "מחיר",
    col24hChange: "שינוי 24ש",
    col24hPct: "24ש %",
    colAvgPrice: "מחיר ממוצע",
    colPrevClose: "סגירה קודמת",
    col7dChart: "גרף 7י",
    colTrade: "סחר",
  },
};

const ar: T = {
  nav: {
    markets: "الأسواق",
    exchange: "البورصة",
    portfolio: "المحفظة",
    watchlist: "قائمة المراقبة",
    history: "السجل",
    leaderboard: "لوحة المتصدرين",
    news: "الأخبار",
    settings: "الإعدادات",
    more: "المزيد",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
  },
  stats: {
    coins: "العملات",
    marketCap: "القيمة السوقية",
    volume24h: "حجم 24س",
    btcDominance: "هيمنة BTC",
  },
  trading: {
    buy: "شراء",
    sell: "بيع",
    price: "السعر",
    amount: "الكمية",
    total: "الإجمالي",
    balance: "الرصيد",
    orderBook: "سجل الأوامر",
    recentTrades: "الصفقات الأخيرة",
    news: "الأخبار",
    high24h: "أعلى 24س",
    low24h: "أدنى 24س",
    volume24h: "حجم 24س",
    placeOrder: "تنفيذ الأمر",
    available: "متاح",
    market: "سوق",
    limit: "محدد",
    signingIn: "جارٍ الدخول…",
    priceUsdt: "السعر (USDT)",
    qty: "الكمية",
    spread: "الفارق",
    time: "الوقت",
    estTotal: "الإجمالي التقديري",
    processing: "جارٍ المعالجة…",
    networkError: "خطأ في الشبكة",
    orderFilled: "تم تنفيذ الأمر!",
    signUpToTrade: "سجّل للبدء في التداول",
    getVirtualFunds: "احصل على 1,000$ USDT في أموال افتراضية فوراً.",
    signUpFree: "سجّل مجاناً",
    logIn: "تسجيل الدخول",
  },
  auth: {
    username: "اسم المستخدم",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    welcomeBack: "مرحباً بعودتك",
    loginSubtitle: "سجّل دخولك إلى حساب CrySer",
    createAccount: "إنشاء حساب",
    signupSubtitle: "ابدأ بـ 1,000$ في أموال افتراضية — مجاناً للأبد",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    signingIn: "جارٍ الدخول…",
    creatingAccount: "جارٍ إنشاء الحساب…",
    noAccount: "ليس لديك حساب؟",
    signUpFree: "أنشئ حساباً مجاناً",
    hasAccount: "لديك حساب بالفعل؟",
    signInLink: "تسجيل الدخول",
    accountCreated: "تم إنشاء الحساب!",
    redirectingLogin: "جارٍ التوجيه لتسجيل الدخول…",
    virtualBalance: "تمت إضافة 1,000$ USDT إلى حسابك",
    redirectingMarkets: "جارٍ التوجيه للأسواق…",
    invalidCredentials: "بيانات غير صحيحة. حاول مرة أخرى.",
    loginFailed: "فشل تسجيل الدخول. تحقق من بياناتك.",
    networkError: "خطأ في الشبكة. حاول مرة أخرى.",
  },
  portfolio: {
    title: "محفظتي",
    subtitle: "تتبع أصولك وأدائك",
    signIn: "سجّل الدخول لعرض محفظتك",
    signInSubtitle: "أصولك وتقييماتها وأرباحك/خسائرك في انتظارك.",
    couldNotLoad: "تعذّر تحميل المحفظة. يرجى تسجيل الدخول.",
    totalValue: "إجمالي القيمة",
    holdingsPlusCash: "الأصول + النقد",
    totalPnl: "إجمالي الربح/الخسارة",
    vsStart: "مقارنةً ببداية 1,000$",
    holdingsValue: "قيمة الأصول",
    availableBalance: "الرصيد المتاح",
    assets: "الأصول",
    activePositions: "مراكز نشطة",
    live: "مباشر",
    connecting: "جارٍ الاتصال…",
    disconnected: "غير متصل",
    colRank: "#",
    colAsset: "الأصل",
    colHoldings: "الحيازات",
    colCurrentValue: "القيمة الحالية",
    colAvgBuy: "متوسط سعر الشراء",
    colPnl: "الربح/الخسارة غير المحقق",
  },
  news: {
    title: "أخبار العملات المشفرة",
    poweredBy: "مدعوم من CryptoCompare",
    latest: "أحدث",
    hot: "ساخن",
    rising: "صاعد",
    bullish: "صعودي",
    bearish: "هبوطي",
    filterPlaceholder: "تصفية حسب العملة… BTC",
    noNews: "لم يتم العثور على أخبار",
    tryDifferent: "جرّب فلتراً مختلفاً.",
    trending: "الأكثر رواجاً",
  },
  history: {
    title: "سجل التداول",
    subtitle: "جميع صفقاتك المنفذة — الأحدث أولاً",
    signIn: "سجّل الدخول لعرض سجل التداول",
    signInSubtitle: "كل عملية شراء أو بيع تجريها مسجلة هنا.",
    noTrades: "لا توجد صفقات بعد. انتقل إلى",
    goToExchange: "البورصة",
    firstTrade: "لإجراء أول صفقاتك.",
    date: "التاريخ",
    pair: "الزوج",
    type: "النوع",
    price: "السعر",
    amountUsdt: "الكمية (USDT)",
    quantity: "الكمية",
    showing: "عرض ما يصل إلى 200 صفقة أخيرة",
  },
  leaderboard: {
    title: "لوحة المتصدرين",
    subtitle: "أفضل 50 متداولاً حسب إجمالي قيمة المحفظة",
    signIn: "سجّل الدخول لعرض لوحة المتصدرين",
    signInSubtitle: "اكتشف كيف تقارن محفظتك بمحافظ المتداولين الآخرين.",
    noUsers: "لا يوجد مستخدمون بعد.",
    rank: "المرتبة",
    trader: "المتداول",
    portfolioValue: "قيمة المحفظة",
    vsStart: "مقارنةً بالبداية",
    share: "مشاركة",
    footer: "جميع المتداولين يبدأون بـ 1,000$ USDT · يُحدَّث عند تحديث الصفحة",
  },
  settings: {
    title: "الإعدادات",
    subtitle: "إدارة حسابك",
    signIn: "سجّل الدخول للوصول إلى الإعدادات",
    signInSubtitle: "إدارة كلمة المرور وتفضيلات الحساب.",
    changePassword: "تغيير كلمة المرور",
    changePasswordDesc: "تحديث كلمة مرور تسجيل الدخول",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    reEnter: "أعد إدخال كلمة المرور الجديدة",
    noMatch: "كلمات المرور غير متطابقة",
    updated: "تم تحديث كلمة المرور!",
    somethingWrong: "حدث خطأ ما",
    networkError: "خطأ في الشبكة — هل الخادم يعمل؟",
    updating: "جارٍ التحديث…",
    updatePassword: "تحديث كلمة المرور",
    resetPortfolio: "إعادة تعيين المحفظة",
    resetDesc: "مسح جميع الأصول والبدء من جديد بـ 1,000$ USDT",
    resetWarning:
      "ستحذف هذه العملية جميع أصولك وبيانات التداول نهائياً. ستبدأ من جديد بـ 1,000$ USDT افتراضية. لا يمكن التراجع عن هذا.",
    resetting: "جارٍ الإعادة…",
    reset: "إعادة تعيين المحفظة",
    confirmReset: "انقر مرة أخرى للتأكيد",
    cancel: "إلغاء",
    account: "الحساب",
    accountDetails: "تفاصيل حسابك",
    startingBalance: "الرصيد الأولي: ",
    trading: "التداول: ",
    tradingDesc: "تداول ورقي فقط — بدون أموال حقيقية",
    dataSource: "مصدر البيانات: ",
    dataSourceDesc: "أسعار Binance الحية",
  },
  watchlist: {
    title: "قائمة المراقبة",
    subtitle: "عملاتك المفضلة — أسعار حية في الوقت الفعلي",
    signIn: "سجّل الدخول لعرض قائمة المراقبة",
    signInSubtitle: "أضف النجوم للعملات لتتبعها هنا بأسعار حية.",
    synced: "متزامن",
    browseMarkets: "تصفح الأسواق",
    coinSingular: "عملة",
    coinPlural: "عملات",
    watched: "قيد المراقبة",
    starCoins: "أضف النجوم للعملات في",
    markets: "الأسواق",
    or: "أو",
    exchange: "البورصة",
    addThem: "لإضافتها هنا.",
  },
  coin: {
    loading: "جارٍ تحميل بيانات العملة…",
    couldNotLoad: "تعذّر تحميل البيانات لـ",
    geckoNote:
      "قد لا يتعرف CoinGecko على هذه العملة، أو تم الوصول إلى حد الطلبات.",
    rank: "المرتبة #",
    pricePerformance: "أداء السعر",
    change24h: "تغيير 24س",
    change7d: "تغيير 7أ",
    change30d: "تغيير 30أ",
    high24h: "أعلى 24س",
    low24h: "أدنى 24س",
    ath: "أعلى مستوى على الإطلاق",
    atl: "أدنى مستوى على الإطلاق",
    marketStats: "إحصائيات السوق",
    marketCap: "القيمة السوقية",
    volume24h: "حجم 24س",
    circulatingSupply: "العرض المتداول",
    totalSupply: "إجمالي العرض",
    maxSupply: "الحد الأقصى للعرض",
    launchDate: "تاريخ الإطلاق",
    algorithm: "الخوارزمية",
    links: "الروابط",
    github: "GitHub",
    reddit: "Reddit",
    overview: "نظرة عامة",
    trade: "تداول",
  },
  sidebar: {
    paperTrader: "متداول ورقي",
    notSignedIn: "غير مسجل",
    signIn: "تسجيل الدخول",
    register: "التسجيل",
    signOut: "تسجيل الخروج",
    market: "السوق",
    account: "الحساب",
  },
  footer: {
    tagline:
      "بيانات السوق في الوقت الفعلي، التداول الحي وتتبع المحفظة — كل شيء في مكان واحد.",
    platform: "المنصة",
    learn: "تعلّم",
    legal: "قانوني",
    privacyPolicy: "سياسة الخصوصية",
    terms: "شروط الخدمة",
    cookies: "سياسة ملفات تعريف الارتباط",
    whatIsBitcoin: "ما هو البيتكوين؟",
    whatIsEthereum: "ما هو الإيثيريوم؟",
    howToTrade: "كيفية التداول",
    allRightsReserved: "جميع الحقوق محفوظة.",
    dataProvided: "بيانات السوق مقدمة من Binance & CoinGecko",
  },
  common: {
    loading: "جارٍ التحميل…",
    search: "البحث عن العملات…",
    language: "اللغة",
    noNews: "لا توجد أخبار.",
    mAgo: "د",
    hAgo: "س",
    dAgo: "ي",
  },
  home: {
    badge: "تداول ورقي — صفر مخاطر، 100% بيانات حقيقية",
    heroTitle1: "تداول العملات المشفرة",
    heroTitle2: "كالمحترفين.",
    heroTitle3: "مجاناً.",
    heroDesc:
      "CrySer هي منصة تداول تجريبية للعملات المشفرة تعمل ببيانات Binance الحية. تدرّب على استراتيجيتك بـ 1,000$ USDT افتراضية — بدون إيداع ولا مخاطر.",
    startTrading: "ابدأ التداول",
    viewLiveChart: "عرض الرسم البياني الحي",
    tradingPairs: "أزواج التداول",
    virtualBalance: "الرصيد الافتراضي الأولي",
    dataDelay: "تأخر البيانات",
    featuresTitle: "كل ما تحتاجه للتدريب",
    featuresSubtitle: "مبني بأدوات تداول حقيقية، بدون أموال حقيقية.",
    howItWorksTitle: "كيف يعمل",
    howItWorksSubtitle: "ابدأ التداول في أقل من دقيقة.",
    ctaTitle: "هل أنت مستعد للبدء في التداول؟",
    ctaDesc: "أنشئ حساباً مجانياً واحصل على 1,000$ في أموال افتراضية فوراً.",
    getStarted: "ابدأ مجاناً",
    liveMarketsTitle: "الأسواق الحية",
    liveMarketsDesc: "أسعار فورية من Binance، تتحدث كل 3 ثوانٍ.",
    f1Title: "بيانات السوق الحية",
    f1Desc: "أسعار فورية وسجلات الأوامر وتاريخ التداول مباشرةً من Binance.",
    f2Title: "رسوم بيانية احترافية",
    f2Desc:
      "رسوم شمعية مدعومة بـ TradingView مع أطر زمنية متعددة — من دقيقة إلى يوم.",
    f3Title: "1,000$ أموال افتراضية",
    f3Desc:
      "كل حساب جديد يبدأ بـ 1,000$ USDT ورقية. لا مخاطر حقيقية، تجربة حقيقية.",
    f4Title: "تتبع المحفظة",
    f4Desc: "شاهد أصولك تتحدث في الوقت الفعلي مع تحركات السوق.",
    s1Title: "أنشئ حساباً",
    s1Desc: "سجّل مجاناً في أقل من 30 ثانية.",
    s2Title: "احصل على 1,000$ USDT",
    s2Desc: "رصيدك الافتراضي جاهز فوراً.",
    s3Title: "تصفح الأسواق",
    s3Desc: "استكشف مئات أزواج التداول بـ USDT.",
    s4Title: "أجرِ أول صفقاتك",
    s4Desc: "اشترِ أو بِع بأسعار السوق الحية.",
  },
  markets: {
    allCoins: "جميع العملات",
    favorites: "المفضلة",
    live: "مباشر",
    connecting: "جارٍ الاتصال…",
    disconnected: "غير متصل",
    showing: "عرض",
    of: "من",
    coins: "عملات",
    page: "صفحة",
    prev: "‹ السابق",
    next: "التالي ›",
    colName: "الاسم",
    colPrice: "السعر",
    col24hChange: "تغيير 24س",
    col24hPct: "24س %",
    colAvgPrice: "متوسط السعر",
    colPrevClose: "الإغلاق السابق",
    col7dChart: "رسم 7أ",
    colTrade: "تداول",
  },
};

const ru: T = {
  nav: {
    markets: "Рынки",
    exchange: "Биржа",
    portfolio: "Портфель",
    watchlist: "Избранное",
    history: "История",
    leaderboard: "Рейтинг",
    news: "Новости",
    settings: "Настройки",
    more: "Ещё",
    login: "Войти",
    signup: "Регистрация",
  },
  stats: {
    coins: "Монеты",
    marketCap: "Капитализация",
    volume24h: "Объём 24ч",
    btcDominance: "Доля BTC",
  },
  trading: {
    buy: "Купить",
    sell: "Продать",
    price: "Цена",
    amount: "Количество",
    total: "Итого",
    balance: "Баланс",
    orderBook: "Стакан",
    recentTrades: "Последние сделки",
    news: "Новости",
    high24h: "Макс 24ч",
    low24h: "Мин 24ч",
    volume24h: "Объём 24ч",
    placeOrder: "Разместить ордер",
    available: "Доступно",
    market: "Рыночный",
    limit: "Лимитный",
    signingIn: "Вход…",
    priceUsdt: "Цена (USDT)",
    qty: "Кол-во",
    spread: "Спред",
    time: "Время",
    estTotal: "Примерный итог",
    processing: "Обработка…",
    networkError: "Ошибка сети",
    orderFilled: "Ордер исполнен!",
    signUpToTrade: "Зарегистрируйтесь для начала торговли",
    getVirtualFunds: "Получите $1,000 USDT виртуальных средств мгновенно.",
    signUpFree: "Регистрация",
    logIn: "Войти",
  },
  auth: {
    username: "Имя пользователя",
    password: "Пароль",
    confirmPassword: "Подтвердите пароль",
    forgotPassword: "Забыли пароль?",
    welcomeBack: "С возвращением",
    loginSubtitle: "Войдите в свой аккаунт CrySer",
    createAccount: "Создать аккаунт",
    signupSubtitle: "Начните с $1,000 виртуальных средств — навсегда бесплатно",
    signIn: "Войти",
    signUp: "Создать аккаунт",
    signingIn: "Вход…",
    creatingAccount: "Создание аккаунта…",
    noAccount: "Нет аккаунта?",
    signUpFree: "Зарегистрироваться",
    hasAccount: "Уже есть аккаунт?",
    signInLink: "Войти",
    accountCreated: "Аккаунт создан!",
    redirectingLogin: "Переход к входу…",
    virtualBalance: "$1,000 USDT добавлено на ваш счёт",
    redirectingMarkets: "Переход к рынкам…",
    invalidCredentials: "Неверные данные. Попробуйте снова.",
    loginFailed: "Ошибка входа. Проверьте учётные данные.",
    networkError: "Ошибка сети. Попробуйте снова.",
  },
  portfolio: {
    title: "Мой портфель",
    subtitle: "Отслеживайте активы и эффективность",
    signIn: "Войдите для просмотра портфеля",
    signInSubtitle: "Ваши активы, оценки и P&L ждут вас.",
    couldNotLoad: "Не удалось загрузить портфель. Пожалуйста, войдите.",
    totalValue: "Общая стоимость",
    holdingsPlusCash: "Активы + Кэш",
    totalPnl: "Общий P&L",
    vsStart: "vs $1,000 старт",
    holdingsValue: "Стоимость активов",
    availableBalance: "Доступный баланс",
    assets: "Активы",
    activePositions: "открытых позиций",
    live: "Прямой эфир",
    connecting: "Подключение…",
    disconnected: "Отключено",
    colRank: "#",
    colAsset: "Актив",
    colHoldings: "Количество",
    colCurrentValue: "Текущая стоимость",
    colAvgBuy: "Средняя цена покупки",
    colPnl: "Нереализованный P&L",
  },
  news: {
    title: "Крипто новости",
    poweredBy: "Работает на CryptoCompare",
    latest: "Последние",
    hot: "Горячие",
    rising: "Растущие",
    bullish: "Бычий",
    bearish: "Медвежий",
    filterPlaceholder: "Фильтр по монете… BTC",
    noNews: "Новости не найдены",
    tryDifferent: "Попробуйте другой фильтр.",
    trending: "Тренды",
  },
  history: {
    title: "История торгов",
    subtitle: "Все исполненные сделки — сначала последние",
    signIn: "Войдите для просмотра истории торгов",
    signInSubtitle: "Каждая покупка и продажа записана здесь.",
    noTrades: "Сделок пока нет. Перейдите на",
    goToExchange: "Биржу",
    firstTrade: "чтобы сделать первую сделку.",
    date: "Дата",
    pair: "Пара",
    type: "Тип",
    price: "Цена",
    amountUsdt: "Объём (USDT)",
    quantity: "Количество",
    showing: "Показаны последние 200 сделок",
  },
  leaderboard: {
    title: "Рейтинг",
    subtitle: "Топ-50 трейдеров по стоимости портфеля",
    signIn: "Войдите для просмотра рейтинга",
    signInSubtitle: "Посмотрите, как ваш портфель выглядит на фоне других.",
    noUsers: "Пока нет пользователей.",
    rank: "Место",
    trader: "Трейдер",
    portfolioValue: "Стоимость портфеля",
    vsStart: "vs Старт",
    share: "Поделиться",
    footer:
      "Все трейдеры начинают с $1,000 USDT · Обновляется при перезагрузке",
  },
  settings: {
    title: "Настройки",
    subtitle: "Управление аккаунтом",
    signIn: "Войдите для доступа к настройкам",
    signInSubtitle: "Управляйте паролем и настройками аккаунта.",
    changePassword: "Сменить пароль",
    changePasswordDesc: "Обновите пароль для входа",
    currentPassword: "Текущий пароль",
    newPassword: "Новый пароль",
    confirmNewPassword: "Подтвердите новый пароль",
    reEnter: "Повторите новый пароль",
    noMatch: "Пароли не совпадают",
    updated: "Пароль обновлён!",
    somethingWrong: "Что-то пошло не так",
    networkError: "Ошибка сети — сервер работает?",
    updating: "Обновление…",
    updatePassword: "Обновить пароль",
    resetPortfolio: "Сбросить портфель",
    resetDesc: "Удалить все активы и начать заново с $1,000 USDT",
    resetWarning:
      "Это действие навсегда удалит все ваши активы и историю сделок. Вы начнёте с $1,000 виртуальных USDT. Отменить нельзя.",
    resetting: "Сброс…",
    reset: "Сбросить портфель",
    confirmReset: "Нажмите ещё раз для подтверждения",
    cancel: "Отмена",
    account: "Аккаунт",
    accountDetails: "Данные аккаунта",
    startingBalance: "Начальный баланс: ",
    trading: "Торговля: ",
    tradingDesc: "Только бумажная торговля — без реальных денег",
    dataSource: "Источник данных: ",
    dataSourceDesc: "Цены Binance в реальном времени",
  },
  watchlist: {
    title: "Избранное",
    subtitle: "Ваши монеты — живые цены в реальном времени",
    signIn: "Войдите для просмотра избранного",
    signInSubtitle: "Добавьте монеты в избранное для отслеживания.",
    synced: "Синхронизировано",
    browseMarkets: "К рынкам",
    coinSingular: "монета",
    coinPlural: "монет",
    watched: "отслеживается",
    starCoins: "Добавьте монеты в",
    markets: "Рынки",
    or: "или",
    exchange: "Биржу",
    addThem: "для отображения здесь.",
  },
  coin: {
    loading: "Загрузка данных…",
    couldNotLoad: "Не удалось загрузить данные для",
    geckoNote:
      "CoinGecko может не поддерживать эту монету или достигнут лимит запросов.",
    rank: "Место #",
    pricePerformance: "Динамика цены",
    change24h: "Изм. 24ч",
    change7d: "Изм. 7д",
    change30d: "Изм. 30д",
    high24h: "Макс 24ч",
    low24h: "Мин 24ч",
    ath: "Исторический максимум",
    atl: "Исторический минимум",
    marketStats: "Рыночные данные",
    marketCap: "Капитализация",
    volume24h: "Объём 24ч",
    circulatingSupply: "Оборотное предложение",
    totalSupply: "Общее предложение",
    maxSupply: "Макс предложение",
    launchDate: "Дата запуска",
    algorithm: "Алгоритм",
    links: "Ссылки",
    github: "GitHub",
    reddit: "Reddit",
    overview: "Обзор",
    trade: "Торговля",
  },
  sidebar: {
    paperTrader: "Бумажный трейдер",
    notSignedIn: "Не авторизован",
    signIn: "Войти",
    register: "Регистрация",
    signOut: "Выйти",
    market: "Рынок",
    account: "Аккаунт",
  },
  footer: {
    tagline:
      "Криптоданные в реальном времени, торговля и аналитика портфеля — всё в одном месте.",
    platform: "Платформа",
    learn: "Обучение",
    legal: "Правовые",
    privacyPolicy: "Политика конфиденциальности",
    terms: "Условия использования",
    cookies: "Политика cookies",
    whatIsBitcoin: "Что такое Bitcoin?",
    whatIsEthereum: "Что такое Ethereum?",
    howToTrade: "Как торговать",
    allRightsReserved: "Все права защищены.",
    dataProvided: "Данные предоставлены Binance & CoinGecko",
  },
  common: {
    loading: "Загрузка…",
    search: "Поиск монет…",
    language: "Язык",
    noNews: "Новости не найдены.",
    mAgo: "м",
    hAgo: "ч",
    dAgo: "д",
  },
  home: {
    badge: "Бумажная торговля — нулевой риск, 100% реальные данные",
    heroTitle1: "Торгуй криптой",
    heroTitle2: "Как профи.",
    heroTitle3: "Бесплатно.",
    heroDesc:
      "CrySer — демо-платформа для торговли криптовалютой на живых данных Binance. Тренируй стратегию с $1,000 виртуальных USDT — без депозита и риска.",
    startTrading: "Начать торговлю",
    viewLiveChart: "Смотреть график",
    tradingPairs: "Торговых пар",
    virtualBalance: "Стартовый виртуальный баланс",
    dataDelay: "Задержка данных",
    featuresTitle: "Всё для практики",
    featuresSubtitle: "Реальные инструменты, никакого реального риска.",
    howItWorksTitle: "Как это работает",
    howItWorksSubtitle: "Начни торговать за минуту.",
    ctaTitle: "Готов начать торговать?",
    ctaDesc:
      "Создай бесплатный аккаунт и получи $1,000 виртуальных средств мгновенно.",
    getStarted: "Начать бесплатно",
    liveMarketsTitle: "Живые рынки",
    liveMarketsDesc:
      "Цены в реальном времени от Binance, обновление каждые 3 секунды.",
    f1Title: "Живые данные рынка",
    f1Desc:
      "Цены, стакан и история сделок напрямую из Binance в реальном времени.",
    f2Title: "Профессиональные графики",
    f2Desc:
      "Свечные графики на базе TradingView с несколькими таймфреймами — от 1 мин до 1 дня.",
    f3Title: "$1,000 виртуальных средств",
    f3Desc:
      "Каждый новый аккаунт получает $1,000 USDT бумажных денег. Никакого реального риска.",
    f4Title: "Отслеживание портфеля",
    f4Desc:
      "Наблюдай, как активы обновляются в реальном времени вместе с рынком.",
    s1Title: "Создай аккаунт",
    s1Desc: "Бесплатная регистрация за 30 секунд.",
    s2Title: "Получи $1,000 USDT",
    s2Desc: "Виртуальный баланс доступен сразу.",
    s3Title: "Изучи рынки",
    s3Desc: "Сотни торговых пар USDT.",
    s4Title: "Сделай первую сделку",
    s4Desc: "Покупай или продавай по рыночным ценам.",
  },
  markets: {
    allCoins: "Все монеты",
    favorites: "Избранное",
    live: "Прямой эфир",
    connecting: "Подключение…",
    disconnected: "Отключено",
    showing: "Показано",
    of: "из",
    coins: "монет",
    page: "Страница",
    prev: "‹ Назад",
    next: "Вперёд ›",
    colName: "Название",
    colPrice: "Цена",
    col24hChange: "Изм. 24ч",
    col24hPct: "24ч %",
    colAvgPrice: "Средняя цена",
    colPrevClose: "Закрытие",
    col7dChart: "График 7д",
    colTrade: "Торговля",
  },
};

const es: T = {
  nav: {
    markets: "Mercados",
    exchange: "Bolsa",
    portfolio: "Monedero & Activos",
    watchlist: "Seguimiento",
    history: "Historial",
    leaderboard: "Clasificación",
    news: "Noticias",
    settings: "Configuración",
    more: "Más",
    login: "Iniciar sesión",
    signup: "Registrarse",
  },
  stats: {
    coins: "Monedas",
    marketCap: "Cap. mercado",
    volume24h: "Vol. 24h",
    btcDominance: "Dom. BTC",
  },
  trading: {
    buy: "Comprar",
    sell: "Vender",
    price: "Precio",
    amount: "Cantidad",
    total: "Total",
    balance: "Saldo",
    orderBook: "Libro de órdenes",
    recentTrades: "Operaciones recientes",
    news: "Noticias",
    high24h: "Máx 24h",
    low24h: "Mín 24h",
    volume24h: "Vol 24h",
    placeOrder: "Colocar orden",
    available: "Disponible",
    market: "Mercado",
    limit: "Límite",
    signingIn: "Iniciando sesión…",
    priceUsdt: "Precio (USDT)",
    qty: "Cant.",
    spread: "Diferencial",
    time: "Hora",
    estTotal: "Total estimado",
    processing: "Procesando…",
    networkError: "Error de red",
    orderFilled: "¡Orden ejecutada!",
    signUpToTrade: "Regístrate para empezar a operar",
    getVirtualFunds: "Obtén $1,000 USDT en fondos virtuales al instante.",
    signUpFree: "Registrarse gratis",
    logIn: "Iniciar sesión",
  },
  auth: {
    username: "Usuario",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    welcomeBack: "Bienvenido de nuevo",
    loginSubtitle: "Inicia sesión en tu cuenta CrySer",
    createAccount: "Crea tu cuenta",
    signupSubtitle:
      "Empieza con $1,000 en fondos virtuales — gratis para siempre",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    signingIn: "Iniciando sesión…",
    creatingAccount: "Creando cuenta…",
    noAccount: "¿No tienes cuenta?",
    signUpFree: "Regístrate gratis",
    hasAccount: "¿Ya tienes cuenta?",
    signInLink: "Inicia sesión",
    accountCreated: "¡Cuenta creada!",
    redirectingLogin: "Redirigiendo al inicio de sesión…",
    virtualBalance: "$1,000 USDT añadidos a tu cuenta",
    redirectingMarkets: "Redirigiendo a los mercados…",
    invalidCredentials: "Credenciales inválidas. Inténtalo de nuevo.",
    loginFailed: "Inicio de sesión fallido. Verifica tus credenciales.",
    networkError: "Error de red. Inténtalo de nuevo.",
  },
  portfolio: {
    title: "Mi Cartera",
    subtitle: "Rastrea tus criptoactivos y rendimiento",
    signIn: "Inicia sesión para ver tu cartera",
    signInSubtitle: "Tus activos, valuaciones en vivo y P&L te esperan.",
    couldNotLoad: "No se pudo cargar la cartera. Por favor inicia sesión.",
    totalValue: "Valor total",
    holdingsPlusCash: "Activos + Efectivo",
    totalPnl: "P&L total",
    vsStart: "vs $1,000 inicio",
    holdingsValue: "Valor de activos",
    availableBalance: "Saldo disponible",
    assets: "Activos",
    activePositions: "posiciones activas",
    live: "En vivo",
    connecting: "Conectando…",
    disconnected: "Desconectado",
    colRank: "#",
    colAsset: "Activo",
    colHoldings: "Cantidad",
    colCurrentValue: "Valor actual",
    colAvgBuy: "Precio promedio de compra",
    colPnl: "P&L no realizado",
  },
  news: {
    title: "Noticias cripto",
    poweredBy: "Impulsado por CryptoCompare",
    latest: "Últimas",
    hot: "Calientes",
    rising: "En alza",
    bullish: "Alcista",
    bearish: "Bajista",
    filterPlaceholder: "Filtrar por moneda… BTC",
    noNews: "No se encontraron noticias",
    tryDifferent: "Prueba otro filtro.",
    trending: "Tendencias",
  },
  history: {
    title: "Historial de operaciones",
    subtitle: "Todas tus operaciones ejecutadas — las más recientes primero",
    signIn: "Inicia sesión para ver tu historial",
    signInSubtitle: "Cada compra y venta que realizas queda registrada aquí.",
    noTrades: "Sin operaciones aún. Ve a la",
    goToExchange: "Bolsa",
    firstTrade: "para realizar tu primera operación.",
    date: "Fecha",
    pair: "Par",
    type: "Tipo",
    price: "Precio",
    amountUsdt: "Importe (USDT)",
    quantity: "Cantidad",
    showing: "Mostrando hasta 200 operaciones recientes",
  },
  leaderboard: {
    title: "Clasificación",
    subtitle: "Top 50 traders clasificados por valor total de cartera",
    signIn: "Inicia sesión para ver la clasificación",
    signInSubtitle:
      "Descubre cómo se compara tu cartera con la de otros traders.",
    noUsers: "Aún no hay usuarios.",
    rank: "Puesto",
    trader: "Trader",
    portfolioValue: "Valor de cartera",
    vsStart: "vs. Inicio",
    share: "Compartir",
    footer:
      "Todos los traders empiezan con $1,000 USDT · Se actualiza al recargar",
  },
  settings: {
    title: "Configuración",
    subtitle: "Gestiona tu cuenta",
    signIn: "Inicia sesión para acceder a la configuración",
    signInSubtitle: "Gestiona tu contraseña y preferencias de cuenta.",
    changePassword: "Cambiar contraseña",
    changePasswordDesc: "Actualiza tu contraseña de inicio de sesión",
    currentPassword: "Contraseña actual",
    newPassword: "Nueva contraseña",
    confirmNewPassword: "Confirmar nueva contraseña",
    reEnter: "Vuelve a introducir la nueva contraseña",
    noMatch: "Las contraseñas no coinciden",
    updated: "¡Contraseña actualizada!",
    somethingWrong: "Algo salió mal",
    networkError: "Error de red — ¿está el servidor funcionando?",
    updating: "Actualizando…",
    updatePassword: "Actualizar contraseña",
    resetPortfolio: "Restablecer cartera",
    resetDesc: "Eliminar todos los activos y empezar de nuevo con $1,000 USDT",
    resetWarning:
      "Esto eliminará permanentemente todos tus activos y datos de operaciones. Empezarás de nuevo con $1,000 USDT virtuales. Esto no se puede deshacer.",
    resetting: "Restableciendo…",
    reset: "Restablecer cartera",
    confirmReset: "Haz clic de nuevo para confirmar",
    cancel: "Cancelar",
    account: "Cuenta",
    accountDetails: "Detalles de tu cuenta",
    startingBalance: "Saldo inicial: ",
    trading: "Operativa: ",
    tradingDesc: "Solo operativa simulada — sin dinero real",
    dataSource: "Fuente de datos: ",
    dataSourceDesc: "Precios en vivo de Binance",
  },
  watchlist: {
    title: "Seguimiento",
    subtitle:
      "Tus monedas favoritas — precios en vivo actualizados en tiempo real",
    signIn: "Inicia sesión para ver tu lista de seguimiento",
    signInSubtitle: "Marca monedas para seguirlas aquí con precios en vivo.",
    synced: "Sincronizado",
    browseMarkets: "Ver mercados",
    coinSingular: "moneda",
    coinPlural: "monedas",
    watched: "seguidas",
    starCoins: "Marca monedas en",
    markets: "Mercados",
    or: "o",
    exchange: "Bolsa",
    addThem: "para añadirlas aquí.",
  },
  coin: {
    loading: "Cargando datos…",
    couldNotLoad: "No se pudieron cargar los datos de",
    geckoNote:
      "CoinGecko puede no tener esta moneda mapeada, o se alcanzó el límite de solicitudes.",
    rank: "Posición #",
    pricePerformance: "Rendimiento del precio",
    change24h: "Cambio 24h",
    change7d: "Cambio 7d",
    change30d: "Cambio 30d",
    high24h: "Máx 24h",
    low24h: "Mín 24h",
    ath: "Máximo histórico",
    atl: "Mínimo histórico",
    marketStats: "Estadísticas de mercado",
    marketCap: "Cap. de mercado",
    volume24h: "Volumen 24h",
    circulatingSupply: "Suministro circulante",
    totalSupply: "Suministro total",
    maxSupply: "Suministro máximo",
    launchDate: "Fecha de lanzamiento",
    algorithm: "Algoritmo",
    links: "Enlaces",
    github: "GitHub",
    reddit: "Reddit",
    overview: "Resumen",
    trade: "Operar",
  },
  sidebar: {
    paperTrader: "Operador simulado",
    notSignedIn: "No autenticado",
    signIn: "Iniciar sesión",
    register: "Registrarse",
    signOut: "Cerrar sesión",
    market: "Mercado",
    account: "Cuenta",
  },
  footer: {
    tagline:
      "Datos de mercado en tiempo real, trading en vivo y seguimiento de cartera — todo en un solo lugar.",
    platform: "Plataforma",
    learn: "Aprende",
    legal: "Legal",
    privacyPolicy: "Política de privacidad",
    terms: "Términos de servicio",
    cookies: "Política de cookies",
    whatIsBitcoin: "¿Qué es Bitcoin?",
    whatIsEthereum: "¿Qué es Ethereum?",
    howToTrade: "Cómo operar",
    allRightsReserved: "Todos los derechos reservados.",
    dataProvided: "Datos de mercado proporcionados por Binance & CoinGecko",
  },
  common: {
    loading: "Cargando…",
    search: "Buscar monedas…",
    language: "Idioma",
    noNews: "No se encontraron noticias.",
    mAgo: "min",
    hAgo: "h",
    dAgo: "d",
  },
  home: {
    badge: "Trading simulado — cero riesgo, 100% datos reales",
    heroTitle1: "Opera en crypto",
    heroTitle2: "Como un pro.",
    heroTitle3: "Gratis.",
    heroDesc:
      "CrySer es una plataforma de trading demo impulsada por datos en vivo de Binance. Practica tu estrategia con $1,000 en USDT virtual — sin depósito ni riesgo.",
    startTrading: "Empezar a operar",
    viewLiveChart: "Ver gráfico en vivo",
    tradingPairs: "Pares de trading",
    virtualBalance: "Balance virtual inicial",
    dataDelay: "Retardo de datos",
    featuresTitle: "Todo lo que necesitas para practicar",
    featuresSubtitle: "Herramientas reales de trading, sin dinero real.",
    howItWorksTitle: "Cómo funciona",
    howItWorksSubtitle: "Listo para operar en menos de un minuto.",
    ctaTitle: "¿Listo para empezar a operar?",
    ctaDesc:
      "Crea una cuenta gratis y obtén $1,000 en fondos virtuales al instante.",
    getStarted: "Empezar gratis",
    liveMarketsTitle: "Mercados en vivo",
    liveMarketsDesc:
      "Precios en tiempo real de Binance, actualizados cada 3 segundos.",
    f1Title: "Datos de mercado en vivo",
    f1Desc:
      "Precios en tiempo real, libros de órdenes e historial de operaciones desde Binance.",
    f2Title: "Gráficos profesionales",
    f2Desc:
      "Gráficos de velas con tecnología TradingView y múltiples marcos temporales — de 1m a 1d.",
    f3Title: "$1,000 en fondos virtuales",
    f3Desc:
      "Cada cuenta nueva comienza con $1,000 USDT en dinero simulado. Sin riesgo real, experiencia real.",
    f4Title: "Seguimiento de cartera",
    f4Desc:
      "Observa cómo tus activos se actualizan en tiempo real con el mercado.",
    s1Title: "Crea una cuenta",
    s1Desc: "Regístrate gratis en menos de 30 segundos.",
    s2Title: "Obtén $1,000 USDT",
    s2Desc: "Tu saldo virtual está listo de inmediato.",
    s3Title: "Explora los mercados",
    s3Desc: "Cientos de pares de trading en USDT.",
    s4Title: "Coloca tu primera operación",
    s4Desc: "Compra o vende a precios de mercado en vivo.",
  },
  markets: {
    allCoins: "Todas las monedas",
    favorites: "Favoritos",
    live: "En vivo",
    connecting: "Conectando…",
    disconnected: "Desconectado",
    showing: "Mostrando",
    of: "de",
    coins: "monedas",
    page: "Página",
    prev: "‹ Anterior",
    next: "Siguiente ›",
    colName: "Nombre",
    colPrice: "Precio",
    col24hChange: "Cambio 24h",
    col24hPct: "24h %",
    colAvgPrice: "Precio medio",
    colPrevClose: "Cierre anterior",
    col7dChart: "Gráfico 7d",
    colTrade: "Operar",
  },
};

const fr: T = {
  nav: {
    markets: "Marchés",
    exchange: "Bourse",
    portfolio: "Portefeuille & Actifs",
    watchlist: "Surveillance",
    history: "Historique",
    leaderboard: "Classement",
    news: "Actualités",
    settings: "Paramètres",
    more: "Plus",
    login: "Connexion",
    signup: "S'inscrire",
  },
  stats: {
    coins: "Cryptos",
    marketCap: "Cap. marché",
    volume24h: "Vol. 24h",
    btcDominance: "Dom. BTC",
  },
  trading: {
    buy: "Acheter",
    sell: "Vendre",
    price: "Prix",
    amount: "Montant",
    total: "Total",
    balance: "Solde",
    orderBook: "Carnet d'ordres",
    recentTrades: "Transactions récentes",
    news: "Actualités",
    high24h: "Haut 24h",
    low24h: "Bas 24h",
    volume24h: "Vol 24h",
    placeOrder: "Passer un ordre",
    available: "Disponible",
    market: "Marché",
    limit: "Limité",
    signingIn: "Connexion…",
    priceUsdt: "Prix (USDT)",
    qty: "Qté",
    spread: "Écart",
    time: "Heure",
    estTotal: "Total estimé",
    processing: "Traitement…",
    networkError: "Erreur réseau",
    orderFilled: "Ordre exécuté !",
    signUpToTrade: "Inscrivez-vous pour commencer à trader",
    getVirtualFunds: "Obtenez 1 000 $ USDT en fonds virtuels instantanément.",
    signUpFree: "S'inscrire gratuitement",
    logIn: "Se connecter",
  },
  auth: {
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    welcomeBack: "Bon retour",
    loginSubtitle: "Connectez-vous à votre compte CrySer",
    createAccount: "Créer votre compte",
    signupSubtitle:
      "Commencez avec 1 000 $ en fonds virtuels — gratuit pour toujours",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    signingIn: "Connexion…",
    creatingAccount: "Création du compte…",
    noAccount: "Pas de compte ?",
    signUpFree: "S'inscrire gratuitement",
    hasAccount: "Déjà un compte ?",
    signInLink: "Se connecter",
    accountCreated: "Compte créé !",
    redirectingLogin: "Redirection vers la connexion…",
    virtualBalance: "1 000 $ USDT ajoutés à votre compte",
    redirectingMarkets: "Redirection vers les marchés…",
    invalidCredentials: "Identifiants invalides. Réessayez.",
    loginFailed: "Échec de la connexion. Vérifiez vos identifiants.",
    networkError: "Erreur réseau. Réessayez.",
  },
  portfolio: {
    title: "Mon Portefeuille",
    subtitle: "Suivez vos avoirs crypto et vos performances",
    signIn: "Connectez-vous pour voir votre portefeuille",
    signInSubtitle: "Vos avoirs, valorisations et P&L vous attendent.",
    couldNotLoad:
      "Impossible de charger le portefeuille. Veuillez vous connecter.",
    totalValue: "Valeur totale",
    holdingsPlusCash: "Avoirs + Liquidités",
    totalPnl: "P&L total",
    vsStart: "vs 1 000 $ départ",
    holdingsValue: "Valeur des avoirs",
    availableBalance: "Solde disponible",
    assets: "Actifs",
    activePositions: "positions actives",
    live: "Direct",
    connecting: "Connexion…",
    disconnected: "Déconnecté",
    colRank: "#",
    colAsset: "Actif",
    colHoldings: "Quantité",
    colCurrentValue: "Valeur actuelle",
    colAvgBuy: "Prix d'achat moyen",
    colPnl: "P&L non réalisé",
  },
  news: {
    title: "Actualités crypto",
    poweredBy: "Propulsé par CryptoCompare",
    latest: "Dernières",
    hot: "Chaudes",
    rising: "En hausse",
    bullish: "Haussier",
    bearish: "Baissier",
    filterPlaceholder: "Filtrer par monnaie… BTC",
    noNews: "Aucune actualité trouvée",
    tryDifferent: "Essayez un autre filtre.",
    trending: "Tendances",
  },
  history: {
    title: "Historique des transactions",
    subtitle:
      "Toutes vos transactions exécutées — les plus récentes en premier",
    signIn: "Connectez-vous pour voir l'historique",
    signInSubtitle:
      "Chaque achat et vente que vous effectuez est consigné ici.",
    noTrades: "Pas encore de transactions. Rendez-vous à la",
    goToExchange: "Bourse",
    firstTrade: "pour passer votre première transaction.",
    date: "Date",
    pair: "Paire",
    type: "Type",
    price: "Prix",
    amountUsdt: "Montant (USDT)",
    quantity: "Quantité",
    showing: "Affichage des 200 transactions les plus récentes",
  },
  leaderboard: {
    title: "Classement",
    subtitle: "Top 50 traders classés par valeur totale du portefeuille",
    signIn: "Connectez-vous pour voir le classement",
    signInSubtitle:
      "Découvrez comment votre portefeuille se compare aux autres traders.",
    noUsers: "Pas encore d'utilisateurs.",
    rank: "Rang",
    trader: "Trader",
    portfolioValue: "Valeur du portefeuille",
    vsStart: "vs. Départ",
    share: "Partager",
    footer:
      "Tous les traders démarrent avec 1 000 $ USDT · Mis à jour au rechargement",
  },
  settings: {
    title: "Paramètres",
    subtitle: "Gérez votre compte",
    signIn: "Connectez-vous pour accéder aux paramètres",
    signInSubtitle: "Gérez votre mot de passe et vos préférences de compte.",
    changePassword: "Changer de mot de passe",
    changePasswordDesc: "Mettez à jour votre mot de passe de connexion",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmNewPassword: "Confirmer le nouveau mot de passe",
    reEnter: "Ressaisissez le nouveau mot de passe",
    noMatch: "Les mots de passe ne correspondent pas",
    updated: "Mot de passe mis à jour !",
    somethingWrong: "Une erreur s'est produite",
    networkError: "Erreur réseau — le serveur est-il en marche ?",
    updating: "Mise à jour…",
    updatePassword: "Mettre à jour le mot de passe",
    resetPortfolio: "Réinitialiser le portefeuille",
    resetDesc: "Effacer tous les avoirs et repartir à zéro avec 1 000 $ USDT",
    resetWarning:
      "Cela supprimera définitivement tous vos avoirs et données de transactions. Vous recommencerez avec 1 000 $ USDT virtuels. Cette action est irréversible.",
    resetting: "Réinitialisation…",
    reset: "Réinitialiser le portefeuille",
    confirmReset: "Cliquez à nouveau pour confirmer",
    cancel: "Annuler",
    account: "Compte",
    accountDetails: "Détails de votre compte",
    startingBalance: "Solde de départ : ",
    trading: "Trading : ",
    tradingDesc: "Trading simulé uniquement — sans argent réel",
    dataSource: "Source des données : ",
    dataSourceDesc: "Prix en direct de Binance",
  },
  watchlist: {
    title: "Surveillance",
    subtitle: "Vos cryptos favorites — prix en direct mis à jour en temps réel",
    signIn: "Connectez-vous pour voir votre liste de surveillance",
    signInSubtitle:
      "Marquez des cryptos pour les suivre ici avec des prix en direct.",
    synced: "Synchronisé",
    browseMarkets: "Parcourir les marchés",
    coinSingular: "crypto",
    coinPlural: "cryptos",
    watched: "surveillées",
    starCoins: "Marquez des cryptos dans",
    markets: "Marchés",
    or: "ou",
    exchange: "Bourse",
    addThem: "pour les ajouter ici.",
  },
  coin: {
    loading: "Chargement des données…",
    couldNotLoad: "Impossible de charger les données pour",
    geckoNote:
      "CoinGecko peut ne pas avoir cette monnaie ou la limite de requêtes est atteinte.",
    rank: "Rang #",
    pricePerformance: "Performance du prix",
    change24h: "Var. 24h",
    change7d: "Var. 7j",
    change30d: "Var. 30j",
    high24h: "Haut 24h",
    low24h: "Bas 24h",
    ath: "Sommet historique",
    atl: "Plancher historique",
    marketStats: "Statistiques de marché",
    marketCap: "Cap. de marché",
    volume24h: "Vol. 24h",
    circulatingSupply: "Offre en circulation",
    totalSupply: "Offre totale",
    maxSupply: "Offre maximale",
    launchDate: "Date de lancement",
    algorithm: "Algorithme",
    links: "Liens",
    github: "GitHub",
    reddit: "Reddit",
    overview: "Aperçu",
    trade: "Trader",
  },
  sidebar: {
    paperTrader: "Trader simulé",
    notSignedIn: "Non connecté",
    signIn: "Se connecter",
    register: "S'inscrire",
    signOut: "Se déconnecter",
    market: "Marché",
    account: "Compte",
  },
  footer: {
    tagline:
      "Données de marché en temps réel, trading en direct et suivi de portefeuille — le tout en un seul endroit.",
    platform: "Plateforme",
    learn: "Apprendre",
    legal: "Mentions légales",
    privacyPolicy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    cookies: "Politique de cookies",
    whatIsBitcoin: "Qu'est-ce que Bitcoin ?",
    whatIsEthereum: "Qu'est-ce qu'Ethereum ?",
    howToTrade: "Comment trader",
    allRightsReserved: "Tous droits réservés.",
    dataProvided: "Données de marché fournies par Binance & CoinGecko",
  },
  common: {
    loading: "Chargement…",
    search: "Rechercher des cryptos…",
    language: "Langue",
    noNews: "Aucune actualité trouvée.",
    mAgo: "min",
    hAgo: "h",
    dAgo: "j",
  },
  home: {
    badge: "Trading simulé — zéro risque, 100% données réelles",
    heroTitle1: "Tradez la crypto",
    heroTitle2: "Comme un pro.",
    heroTitle3: "Gratuitement.",
    heroDesc:
      "CrySer est une plateforme de trading crypto démo alimentée par les données en direct de Binance. Entraînez-vous avec 1 000 $ en USDT virtuel — sans dépôt ni risque.",
    startTrading: "Commencer à trader",
    viewLiveChart: "Voir le graphique en direct",
    tradingPairs: "Paires de trading",
    virtualBalance: "Solde virtuel de départ",
    dataDelay: "Délai des données",
    featuresTitle: "Tout ce dont vous avez besoin pour pratiquer",
    featuresSubtitle: "De vrais outils de trading, sans argent réel.",
    howItWorksTitle: "Comment ça marche",
    howItWorksSubtitle: "Prêt à trader en moins d'une minute.",
    ctaTitle: "Prêt à commencer à trader ?",
    ctaDesc:
      "Créez un compte gratuit et obtenez 1 000 $ en fonds virtuels instantanément.",
    getStarted: "Commencer gratuitement",
    liveMarketsTitle: "Marchés en direct",
    liveMarketsDesc:
      "Prix en temps réel de Binance, mis à jour toutes les 3 secondes.",
    f1Title: "Données de marché en direct",
    f1Desc:
      "Prix en temps réel, carnets d'ordres et historique des transactions depuis Binance.",
    f2Title: "Graphiques professionnels",
    f2Desc:
      "Graphiques en chandeliers TradingView avec plusieurs horizons temporels — de 1m à 1j.",
    f3Title: "1 000 $ de fonds virtuels",
    f3Desc:
      "Chaque nouveau compte commence avec 1 000 $ USDT en argent fictif. Zéro risque, expérience réelle.",
    f4Title: "Suivi de portefeuille",
    f4Desc:
      "Regardez vos avoirs se mettre à jour en temps réel avec le marché.",
    s1Title: "Créer un compte",
    s1Desc: "Inscription gratuite en moins de 30 secondes.",
    s2Title: "Obtenir 1 000 $ USDT",
    s2Desc: "Votre solde virtuel est disponible immédiatement.",
    s3Title: "Explorer les marchés",
    s3Desc: "Des centaines de paires de trading USDT.",
    s4Title: "Passer votre premier ordre",
    s4Desc: "Achetez ou vendez aux prix du marché en direct.",
  },
  markets: {
    allCoins: "Toutes les cryptos",
    favorites: "Favoris",
    live: "Direct",
    connecting: "Connexion…",
    disconnected: "Déconnecté",
    showing: "Affichage",
    of: "sur",
    coins: "cryptos",
    page: "Page",
    prev: "‹ Préc.",
    next: "Suiv. ›",
    colName: "Nom",
    colPrice: "Prix",
    col24hChange: "Var. 24h",
    col24hPct: "24h %",
    colAvgPrice: "Prix moyen",
    colPrevClose: "Clôture préc.",
    col7dChart: "Graph. 7j",
    colTrade: "Trader",
  },
};

const zh: T = {
  nav: {
    markets: "市场",
    exchange: "交易所",
    portfolio: "钱包 & 资产",
    watchlist: "自选",
    history: "历史",
    leaderboard: "排行榜",
    news: "新闻",
    settings: "设置",
    more: "更多",
    login: "登录",
    signup: "注册",
  },
  stats: {
    coins: "币种",
    marketCap: "市值",
    volume24h: "24h量",
    btcDominance: "BTC占比",
  },
  trading: {
    buy: "买入",
    sell: "卖出",
    price: "价格",
    amount: "数量",
    total: "总计",
    balance: "余额",
    orderBook: "订单簿",
    recentTrades: "最近成交",
    news: "新闻",
    high24h: "24h最高",
    low24h: "24h最低",
    volume24h: "24h成交量",
    placeOrder: "下单",
    available: "可用",
    market: "市价",
    limit: "限价",
    signingIn: "登录中…",
    priceUsdt: "价格 (USDT)",
    qty: "数量",
    spread: "价差",
    time: "时间",
    estTotal: "预计总额",
    processing: "处理中…",
    networkError: "网络错误",
    orderFilled: "订单已成交！",
    signUpToTrade: "注册开始交易",
    getVirtualFunds: "立即获得 $1,000 USDT 虚拟资金。",
    signUpFree: "免费注册",
    logIn: "登录",
  },
  auth: {
    username: "用户名",
    password: "密码",
    confirmPassword: "确认密码",
    forgotPassword: "忘记密码？",
    welcomeBack: "欢迎回来",
    loginSubtitle: "登录您的 CrySer 账户",
    createAccount: "创建账户",
    signupSubtitle: "从 $1,000 虚拟资金开始 — 永久免费",
    signIn: "登录",
    signUp: "创建账户",
    signingIn: "登录中…",
    creatingAccount: "创建账户中…",
    noAccount: "没有账户？",
    signUpFree: "免费注册",
    hasAccount: "已有账户？",
    signInLink: "登录",
    accountCreated: "账户已创建！",
    redirectingLogin: "正在跳转到登录页…",
    virtualBalance: "$1,000 USDT 已添加到您的账户",
    redirectingMarkets: "正在跳转到市场…",
    invalidCredentials: "凭据无效，请重试。",
    loginFailed: "登录失败，请检查您的凭据。",
    networkError: "网络错误，请重试。",
  },
  portfolio: {
    title: "我的投资组合",
    subtitle: "跟踪您的加密资产和表现",
    signIn: "登录以查看您的投资组合",
    signInSubtitle: "您的持仓、实时估值和盈亏正在等您。",
    couldNotLoad: "无法加载投资组合。请登录。",
    totalValue: "总价值",
    holdingsPlusCash: "持仓 + 现金",
    totalPnl: "总盈亏",
    vsStart: "vs $1,000 起始",
    holdingsValue: "持仓价值",
    availableBalance: "可用余额",
    assets: "资产",
    activePositions: "个活跃持仓",
    live: "实时",
    connecting: "连接中…",
    disconnected: "已断开",
    colRank: "#",
    colAsset: "资产",
    colHoldings: "持仓量",
    colCurrentValue: "当前价值",
    colAvgBuy: "平均买入价",
    colPnl: "未实现盈亏",
  },
  news: {
    title: "加密货币新闻",
    poweredBy: "由 CryptoCompare 提供支持",
    latest: "最新",
    hot: "热门",
    rising: "上涨",
    bullish: "看涨",
    bearish: "看跌",
    filterPlaceholder: "按币种筛选… BTC",
    noNews: "未找到新闻",
    tryDifferent: "尝试其他筛选。",
    trending: "趋势",
  },
  history: {
    title: "交易历史",
    subtitle: "所有已执行的交易 — 最新优先",
    signIn: "登录以查看交易历史",
    signInSubtitle: "您的每一笔买入和卖出都记录在这里。",
    noTrades: "暂无交易记录。前往",
    goToExchange: "交易所",
    firstTrade: "进行您的第一笔交易。",
    date: "日期",
    pair: "交易对",
    type: "类型",
    price: "价格",
    amountUsdt: "金额 (USDT)",
    quantity: "数量",
    showing: "显示最近 200 笔交易",
  },
  leaderboard: {
    title: "排行榜",
    subtitle: "按投资组合总价值排名的前 50 名交易员",
    signIn: "登录以查看排行榜",
    signInSubtitle: "查看您的投资组合与其他交易员的比较。",
    noUsers: "暂无用户。",
    rank: "排名",
    trader: "交易员",
    portfolioValue: "投资组合价值",
    vsStart: "vs. 起始",
    share: "分享",
    footer: "所有交易员从 $1,000 USDT 开始 · 刷新页面更新",
  },
  settings: {
    title: "设置",
    subtitle: "管理您的账户",
    signIn: "登录以访问设置",
    signInSubtitle: "管理您的密码和账户偏好。",
    changePassword: "更改密码",
    changePasswordDesc: "更新您的登录密码",
    currentPassword: "当前密码",
    newPassword: "新密码",
    confirmNewPassword: "确认新密码",
    reEnter: "重新输入新密码",
    noMatch: "密码不匹配",
    updated: "密码已更新！",
    somethingWrong: "出了点问题",
    networkError: "网络错误 — 服务器是否正在运行？",
    updating: "更新中…",
    updatePassword: "更新密码",
    resetPortfolio: "重置投资组合",
    resetDesc: "清除所有持仓，以 $1,000 USDT 重新开始",
    resetWarning:
      "这将永久删除您所有的持仓和交易数据。您将以 $1,000 虚拟 USDT 重新开始。此操作无法撤销。",
    resetting: "重置中…",
    reset: "重置投资组合",
    confirmReset: "再次点击确认重置",
    cancel: "取消",
    account: "账户",
    accountDetails: "您的账户详情",
    startingBalance: "起始余额：",
    trading: "交易：",
    tradingDesc: "仅限模拟交易 — 无真实资金",
    dataSource: "数据来源：",
    dataSourceDesc: "实时 Binance 价格",
  },
  watchlist: {
    title: "自选",
    subtitle: "您收藏的币种 — 实时更新的价格",
    signIn: "登录以查看您的自选列表",
    signInSubtitle: "收藏币种以在此处跟踪其实时价格。",
    synced: "已同步",
    browseMarkets: "浏览市场",
    coinSingular: "个币种",
    coinPlural: "个币种",
    watched: "已关注",
    starCoins: "在",
    markets: "市场",
    or: "或",
    exchange: "交易所",
    addThem: "页面收藏币种以添加到此处。",
  },
  coin: {
    loading: "加载币种数据中…",
    couldNotLoad: "无法加载数据：",
    geckoNote: "CoinGecko 可能未映射此币种，或已达到请求限制。",
    rank: "排名 #",
    pricePerformance: "价格表现",
    change24h: "24h变动",
    change7d: "7d变动",
    change30d: "30d变动",
    high24h: "24h最高",
    low24h: "24h最低",
    ath: "历史最高价",
    atl: "历史最低价",
    marketStats: "市场统计",
    marketCap: "市值",
    volume24h: "24h交易量",
    circulatingSupply: "流通供应量",
    totalSupply: "总供应量",
    maxSupply: "最大供应量",
    launchDate: "上线日期",
    algorithm: "算法",
    links: "链接",
    github: "GitHub",
    reddit: "Reddit",
    overview: "概览",
    trade: "交易",
  },
  sidebar: {
    paperTrader: "模拟交易者",
    notSignedIn: "未登录",
    signIn: "登录",
    register: "注册",
    signOut: "退出登录",
    market: "市场",
    account: "账户",
  },
  footer: {
    tagline: "实时加密货币市场数据、实时交易和投资组合追踪 — 一站式服务。",
    platform: "平台",
    learn: "学习",
    legal: "法律",
    privacyPolicy: "隐私政策",
    terms: "服务条款",
    cookies: "Cookie政策",
    whatIsBitcoin: "什么是比特币？",
    whatIsEthereum: "什么是以太坊？",
    howToTrade: "如何交易",
    allRightsReserved: "保留所有权利。",
    dataProvided: "市场数据由 Binance & CoinGecko 提供",
  },
  common: {
    loading: "加载中…",
    search: "搜索币种…",
    language: "语言",
    noNews: "未找到新闻。",
    mAgo: "分钟前",
    hAgo: "小时前",
    dAgo: "天前",
  },
  home: {
    badge: "模拟交易 — 零风险，100% 真实数据",
    heroTitle1: "交易加密货币",
    heroTitle2: "像专业人士一样。",
    heroTitle3: "免费。",
    heroDesc:
      "CrySer 是一个由 Binance 实时数据驱动的加密货币模拟交易平台。用 $1,000 虚拟 USDT 练习您的策略 — 无需存款，无风险。",
    startTrading: "开始交易",
    viewLiveChart: "查看实时图表",
    tradingPairs: "交易对",
    virtualBalance: "虚拟起始余额",
    dataDelay: "数据延迟",
    featuresTitle: "练习所需的一切",
    featuresSubtitle: "真实交易工具，零真实资金。",
    howItWorksTitle: "如何运作",
    howItWorksSubtitle: "不到一分钟即可开始交易。",
    ctaTitle: "准备好开始交易了吗？",
    ctaDesc: "创建免费账户，立即获得 $1,000 虚拟资金。",
    getStarted: "免费开始",
    liveMarketsTitle: "实时市场",
    liveMarketsDesc: "来自 Binance 的实时价格，每 3 秒更新一次。",
    f1Title: "实时市场数据",
    f1Desc: "直接来自 Binance 的实时价格、订单簿和交易历史。",
    f2Title: "专业图表",
    f2Desc: "由 TradingView 提供支持的多时间框架K线图 — 从1分钟到1天。",
    f3Title: "$1,000 虚拟资金",
    f3Desc: "每个新账户从 $1,000 USDT 纸质资金开始。零真实风险，真实体验。",
    f4Title: "投资组合追踪",
    f4Desc: "随市场动态实时查看持仓更新。",
    s1Title: "创建账户",
    s1Desc: "30秒内免费注册。",
    s2Title: "获得 $1,000 USDT",
    s2Desc: "您的虚拟余额立即可用。",
    s3Title: "浏览市场",
    s3Desc: "探索数百个 USDT 交易对。",
    s4Title: "完成第一笔交易",
    s4Desc: "以实时市场价格买入或卖出。",
  },
  markets: {
    allCoins: "全部币种",
    favorites: "自选",
    live: "实时",
    connecting: "连接中…",
    disconnected: "已断开",
    showing: "显示",
    of: "共",
    coins: "个币种",
    page: "第",
    prev: "‹ 上一页",
    next: "下一页 ›",
    colName: "名称",
    colPrice: "价格",
    col24hChange: "24h涨跌",
    col24hPct: "24h%",
    colAvgPrice: "均价",
    colPrevClose: "前收盘价",
    col7dChart: "7日图",
    colTrade: "交易",
  },
};

export const translations: Record<Locale, T> = { en, he, ar, ru, es, fr, zh };

export const LOCALE_META: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇺🇸" },
  he: { label: "עברית", flag: "🇮🇱" },
  ar: { label: "العربية", flag: "🇸🇦" },
  ru: { label: "Русский", flag: "🇷🇺" },
  es: { label: "Español", flag: "🇪🇸" },
  fr: { label: "Français", flag: "🇫🇷" },
  zh: { label: "中文", flag: "🇨🇳" },
};
