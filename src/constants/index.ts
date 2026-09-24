export const APP_NAME = "UniOrbi Auth Empire";
export const APP_TAGLINE = "Your Identity. Your Rules. Your Empire.";
export const APP_VERSION = "v3.0.0";
export const COMPANY_NAME = "ESOneWorld";
export const VISION_TAGLINE = "It's a Global Family Platform";

export const CONTACT_EMAILS = [
  { label: "Admin",          email: "admin@uniorbi.com" },
  { label: "Dr. Irfan",      email: "admin@drirfan.online" },
  { label: "IQMail",         email: "admin@iqmail.online" },
  { label: "EUni",           email: "admin@euni.site" },
  { label: "WhatsApp Family",email: "whatsappfamily@drirfan.online" },
  { label: "UNI",            email: "uni@euni.site" },
  { label: "UNI News",       email: "uninews@euni.site" },
  { label: "SWO",            email: "swo@euni.site" },
  { label: "SWO Gmail",      email: "uni.smartworldorder@gmail.com" },
  { label: "Dr. Gmail",      email: "dr.mirfan5577@gmail.com" },
];
export const CONTACT_PHONE = "+92300-4737757";

export const AUTH_METHOD_INFO = {
  otp:      { label: "OTP",           description: "Time-based & event-based one-time passwords",          icon: "Hash",        color: "#dc2626" },
  password: { label: "Password",      description: "Traditional AES-256 encrypted password vault",         icon: "Lock",        color: "#8b5cf6" },
  smartpin: { label: "Smart PIN",     description: "4–6 digit animated PIN pad with lockout protection",   icon: "Grid3x3",     color: "#f59e0b" },
  unicode:  { label: "Unicode Word",  description: "Any word — Mango, Pakistan, Book — as secret key",     icon: "Type",        color: "#10b981" },
  passkey:  { label: "Passkey",       description: "Biometric, Screen Lock, or Facial Recognition",        icon: "Fingerprint", color: "#06b6d4" },
};

export const PASSKEY_TYPES = {
  biometric: { label: "Biometric / Fingerprint", icon: "Fingerprint", color: "#dc2626" },
  screenlock:{ label: "Screen Lock Pattern",     icon: "Lock",        color: "#8b5cf6" },
  facial:    { label: "Facial Recognition",      icon: "ScanFace",    color: "#f59e0b" },
  hardware:  { label: "Hardware Security Key",   icon: "KeyRound",    color: "#10b981" },
};

export const BACKEND_TYPES = [
  { id:"supabase",  label:"Supabase",    color:"#3ecf8e", logo:"🟢" },
  { id:"firebase",  label:"Firebase",    color:"#ffa611", logo:"🔥" },
  { id:"auth0",     label:"Auth0",       color:"#eb5424", logo:"🔐" },
  { id:"okta",      label:"Okta",        color:"#007dc1", logo:"🔵" },
  { id:"cognito",   label:"AWS Cognito", color:"#ff9900", logo:"☁️" },
  { id:"custom",    label:"Custom API",  color:"#8b5cf6", logo:"⚡" },
];

export const APP_CATEGORIES = [
  "Social Media", "Banking", "Email", "Shopping", "Work",
  "Entertainment", "Education", "Health", "Travel", "Other"
];

export const SECURITY_SCORE_THRESHOLDS = {
  critical: 40, low: 60, medium: 75, high: 85, excellent: 95,
};

export const NAV_LINKS = [
  { path: "/dashboard",        label: "Dashboard",       icon: "LayoutDashboard" },
  { path: "/totp",             label: "TOTP / 2FA",      icon: "Key"             },
  { path: "/security",         label: "Security Center", icon: "Scan"            },
  { path: "/auth-setup",       label: "Auth Setup",      icon: "Settings2"       },
  { path: "/passkeys",         label: "Passkeys",        icon: "Fingerprint"     },
  { path: "/password-manager", label: "Password Manager",icon: "Lock"            },
  { path: "/backup",           label: "Backup & PIN",    icon: "KeyRound"        },
  { path: "/sync-settings",    label: "Auto Sync",       icon: "RefreshCw"       },
  { path: "/connected-apps",   label: "Connected Apps",  icon: "Grid2x2"         },
  { path: "/backends",         label: "Backend Hub",     icon: "Server"          },
  { path: "/legal",            label: "Legal",           icon: "Scale"           },
  { path: "/vision",           label: "Vision & Mission",icon: "Globe"           },
  { path: "/about",            label: "About Us",        icon: "Users"           },
];
