# Main Navigation Flow

This diagram shows the primary navigation paths through the R-R-Books app, focusing on the most common user journeys.

```mermaid
flowchart TD
    %% App Entry
    A[App Launch] --> B{User Authenticated?}
    
    %% Authentication
    B -->|No| C[Sign In Screen]
    B -->|Yes| D[Home Screen]
    
    %% Sign In Options
    C --> E[Email/Password]
    C --> F[Google OAuth]
    C --> G[Apple OAuth]
    C --> H[Sign Up Link]
    
    %% Sign Up
    H --> I[Sign Up Screen]
    I --> J[Email Verification]
    J --> K[Verification Code]
    K --> D
    
    %% Authentication Success
    E --> D
    F --> D
    G --> D
    
    %% Main App Navigation
    D --> L[Home with Tabs]
    L --> M[Active Reads Tab]
    L --> N[Overdue Reads Tab]
    L --> O[Settings Tab]
    L --> P[Add New Deadline]
    
    %% Deadline Management
    M --> Q[View Active Deadlines]
    N --> R[View Overdue Deadlines]
    Q --> S[Deadline Card]
    R --> S
    S --> T[Deadline Details View]
    
    %% Add New Deadline
    P --> U[Step 1: Book Details]
    U --> V[Step 2: Set Deadline]
    V --> W[Save Deadline]
    W --> D
    
    %% Deadline Actions
    T --> X[Edit Deadline]
    T --> Y[Update Progress]
    T --> Z[Mark Complete]
    T --> AA[Delete Deadline]
    
    %% Settings Navigation
    O --> BB[Settings Screen]
    BB --> CC[User Profile]
    BB --> DD[Reading Stats]
    BB --> EE[Archives]
    BB --> FF[Sign Out]
    
    %% Settings Actions
    CC --> GG[Edit Profile]
    DD --> HH[View Analytics]
    EE --> II[View Completed]
    FF --> JJ[Confirm Sign Out]
    JJ --> C
    
    %% Return Paths
    X --> T
    Y --> T
    Z --> D
    AA --> D
    GG --> BB
    HH --> BB
    II --> BB
    
    %% Styling
    classDef authNode fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef mainNode fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef deadlineNode fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef settingsNode fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class A,B,C,D,E,F,G,H,I,J,K authNode
    class L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,AA mainNode
    class BB,CC,DD,EE,FF,GG,HH,II,JJ settingsNode
```

## Key Navigation Paths

### Authentication Flow
- **Sign In**: Multiple authentication methods (email/password, Google, Apple)
- **Sign Up**: Email verification required for new accounts
- **Auto-redirect**: Authenticated users go directly to home screen

### Main App Features
- **Home Screen**: Tabbed interface with Active/Overdue reads
- **Deadline Management**: View, add, edit, and manage reading deadlines
- **Settings**: User profile, stats, archives, and app settings

### Common User Journeys
1. **Add New Book**: Two-step form process
2. **Track Progress**: Update reading progress on existing deadlines
3. **View Analytics**: Access reading statistics and charts
4. **Manage Library**: View completed books in archives

This simplified flow focuses on the core user experience and most common navigation patterns. 