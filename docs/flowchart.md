flowchart TD

%% ========================
%% USER JOURNEY
%% ========================

U1[User Opens Website] --> U2[DNS / Domain]
U2 --> U3[GitHub Pages Hosting]

U3 --> U4{React Available?}

U4 -->|Yes| U5[React App index.html]
U4 -->|Fallback| U6[Non-React Static Site]

U5 --> U7[App Initialization]
U7 --> U8[Skeleton Loader]
U8 --> U9[Main Interface]

U9 --> U10[Navigation Menu]

U10 --> U11[Social Links]
U10 --> U12[Discord Bots]
U10 --> U13[Projects]
U10 --> U14[Art Gallery]
U10 --> U15[Commissions]
U10 --> U16[Privacy Policy]

U9 --> U17{Protected Content?}

U17 -->|Yes| U18[Login Modal]
U18 --> U19[Credentials Entered]
U19 --> U20[Auth Request]

U17 -->|Guest Allowed| U21[Guest Access Granted]

%% ========================
%% WORKER / SECURITY LAYER
%% ========================

U20 --> W1[Cloudflare Worker API]

W1 --> W2{Bot Detection}
W2 -->|Blocked Bot| W3[Access Denied]
W2 -->|Valid User| W4[Auth Validation]

W4 --> W5[Session Approved]
W5 --> U9

%% ========================
%% FRONTEND ARCHITECTURE
%% ========================

subgraph Frontend Architecture
    F1[React App]
    F1 --> F2[Components]
    F2 --> F3[Navigation.jsx]
    F2 --> F4[ContentSections.jsx]
    F2 --> F5[LoginModal.jsx]
    F2 --> F6[Footer.jsx]
    F2 --> F7[Skeleton Components]

    F1 --> F8[Hooks]
    F8 --> F9[useDelayedLoad]
    F8 --> F10[Custom Hooks]

    F1 --> F11[Assets]
    F11 --> F12[Images]
    F11 --> F13[Styles]
    F11 --> F14[Data Files]
end

U5 --> F1

%% ========================
%% SYSTEM ARCHITECTURE
%% ========================

subgraph System Architecture
    S1[User Browser]
    S1 --> S2[GitHub Pages CDN]
    S2 --> S3[Static React Build]
    S3 --> S4[Client Rendering]

    S1 --> S5[Cloudflare Edge]
    S5 --> S6[Worker Runtime]
end

W1 --> S6

%% ========================
%% CI/CD PIPELINE
%% ========================

subgraph CI/CD Pipeline
    C1[Developer]
    C1 --> C2[Local Development]
    C2 --> C3[Git Commit]
    C3 --> C4[GitHub Repository]

    C4 --> C5[GitHub Actions Trigger]

    C5 --> C6[Install Dependencies]
    C6 --> C7[Build with Vite]
    C7 --> C8[Generate Static Files]

    C8 --> C9[Deploy to GitHub Pages]
end

C9 --> U3

%% ========================
%% FALLBACK SITE
%% ========================

subgraph Legacy System
    L1[Non-React HTML]
    L2[before-react-script.js]
    L3[Shared styles.css]
end

U6 --> L1
L1 --> L2
L1 --> L3
