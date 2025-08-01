# R-R-Books App Flow Diagram

This diagram shows the complete navigation flow of the R-R-Books app, starting from the authentication screens and following through all the main user journeys.

```mermaid
flowchart TD
    %% App Entry Point
    A[App Launch] --> B{Is User Signed In?}
    
    %% Authentication Flow
    B -->|No| C[Sign In Screen]
    B -->|Yes| D[Main App - Home Screen]
    
    %% Sign In Options
    C --> E{Sign In Method}
    E -->|Email/Password| F[Email/Password Form]
    E -->|Google OAuth| G[Google Sign In]
    E -->|Apple OAuth| H[Apple Sign In]
    
    %% Sign In Process
    F --> I{Valid Credentials?}
    I -->|No| J[Show Error Message]
    J --> F
    I -->|Yes| D
    
    G --> K{Google Auth Success?}
    K -->|No| L[Show Error Message]
    L --> C
    K -->|Yes| D
    
    H --> M{Apple Auth Success?}
    M -->|No| N[Show Error Message]
    N --> C
    M -->|Yes| D
    
    %% Sign Up Flow
    C --> O[Sign Up Link]
    O --> P[Sign Up Screen]
    P --> Q{Sign Up Method}
    Q -->|Email/Password| R[Email/Password Sign Up Form]
    Q -->|Google OAuth| G
    Q -->|Apple OAuth| H
    
    R --> S[Email Verification Required]
    S --> T[Verification Code Input]
    T --> U{Valid Code?}
    U -->|No| V[Show Error Message]
    V --> T
    U -->|Yes| D
    
    %% Main App Navigation
    D --> W[Home Screen with Tabs]
    W --> X[Active Reads Tab]
    W --> Y[Overdue Reads Tab]
    W --> Z[Settings Tab]
    
    %% Home Screen Actions
    X --> AA[View Active Deadlines]
    Y --> BB[View Overdue Deadlines]
    Z --> CC[Settings Screen]
    
    %% Deadline Management
    AA --> DD[Deadline Card]
    BB --> DD
    DD --> EE[View Deadline Details]
    EE --> FF[Deadline View Screen]
    
    %% Add New Deadline
    W --> GG[Add New Deadline Button]
    GG --> HH[New Deadline Form - Step 1]
    HH --> II[Book Details Form]
    II --> JJ[Format Selection]
    JJ --> KK[Source Selection]
    KK --> LL[Continue to Step 2]
    LL --> MM[Set Deadline Form]
    MM --> NN[Deadline Date Selection]
    NN --> OO[Priority Selection]
    OO --> PP[Add Book Button]
    PP --> QQ{Form Valid?}
    QQ -->|No| RR[Show Validation Errors]
    RR --> MM
    QQ -->|Yes| SS[Save Deadline]
    SS --> TT[Show Success Toast]
    TT --> D
    
    %% Deadline View Actions
    FF --> UU[Edit Deadline]
    FF --> VV[Update Progress]
    FF --> WW[Mark as Complete]
    FF --> XX[Delete Deadline]
    
    UU --> YY[Edit Deadline Form]
    YY --> ZZ[Save Changes]
    ZZ --> FF
    
    VV --> AAA[Progress Update Form]
    AAA --> BBB[Save Progress]
    BBB --> FF
    
    WW --> CCC[Confirm Completion]
    CCC --> DDD[Move to Archive]
    DDD --> D
    
    XX --> EEE[Confirm Deletion]
    EEE --> FFF[Delete from Database]
    FFF --> D
    
    %% Settings Navigation
    CC --> GGG[User Profile]
    CC --> HHH[Reading Stats]
    CC --> III[Archives]
    CC --> JJJ[Notifications]
    CC --> KKK[Appearance]
    CC --> LLL[Sign Out]
    
    %% Settings Actions
    GGG --> MMM[Edit Profile Form]
    HHH --> NNN[Stats Screen]
    III --> OOO[Archives Screen]
    JJJ --> PPP[Notifications Settings]
    KKK --> QQQ[Theme Switcher]
    LLL --> RRR[Confirm Sign Out]
    RRR --> SSS[Sign Out User]
    SSS --> C
    
    %% Stats and Archives
    NNN --> TTT[Reading Charts]
    NNN --> UUU[Progress Analytics]
    OOO --> VVV[Completed Deadlines]
    OOO --> WWW[View Archived Details]
    
    %% Error Handling
    SSS --> XXX[Session Cleared]
    XXX --> C
    
    %% Styling
    classDef authNode fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef mainNode fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef deadlineNode fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef settingsNode fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef errorNode fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z authNode
    class AA,BB,DD,EE,FF,GG,HH,II,JJ,KK,LL,MM,NN,OO,PP,QQ,RR,SS,TT,UU,VV,WW,XX,YY,ZZ,AAA,BBB,CCC,DDD,EEE,FFF deadlineNode
    class CC,GGG,HHH,III,JJJ,KKK,LLL,MMM,NNN,OOO,PPP,QQQ,RRR,SSS,TTT,UUU,VVV,WWW,XXX settingsNode
    class J,L,N,V,RR errorNode
```

## Flow Description

### Authentication Flow
1. **App Launch**: The app starts and checks if the user is already signed in
2. **Sign In Options**: Users can sign in via email/password, Google OAuth, or Apple OAuth
3. **Sign Up Process**: New users can create accounts with email verification
4. **Error Handling**: Invalid credentials or failed OAuth attempts return to sign-in

### Main App Navigation
1. **Home Screen**: Features two main tabs - Active Reads and Overdue Reads
2. **Deadline Management**: Users can view, add, edit, and manage reading deadlines
3. **Settings**: Access to user profile, stats, archives, and app settings

### Deadline Workflow
1. **Add New Deadline**: Two-step form process for creating reading deadlines
2. **View Deadlines**: Detailed view with progress tracking and charts
3. **Manage Deadlines**: Edit, update progress, complete, or delete deadlines

### Settings & Features
1. **User Profile**: Edit user information and preferences
2. **Reading Stats**: View analytics and progress charts
3. **Archives**: Access completed reading deadlines
4. **App Settings**: Notifications, appearance, and sign out options

This flow diagram represents the complete user journey through the R-R-Books app, from initial authentication to all major features and interactions. 