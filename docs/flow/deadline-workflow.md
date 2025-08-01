# Deadline Management Workflow

This diagram shows the detailed workflow for managing reading deadlines in the R-R-Books app.

```mermaid
flowchart TD
    %% Starting Point
    A[Home Screen] --> B[Add New Deadline Button]
    A --> C[Existing Deadline Card]
    
    %% Add New Deadline Flow
    B --> D[New Deadline Form - Step 1]
    D --> E[Book Title Input]
    E --> F[Book Author Input]
    F --> G[Format Selection]
    G --> H{Format Type?}
    
    H -->|Physical/Ebook| I[Total Pages Input]
    H -->|Audio| J[Total Minutes Input]
    
    I --> K[Source Selection]
    J --> K
    K --> L{Source Type?}
    L -->|ARC| M[ARC Source]
    L -->|Library| N[Library Source]
    L -->|Personal| O[Personal Source]
    
    M --> P[Continue to Step 2]
    N --> P
    O --> P
    
    %% Step 2 - Deadline Setting
    P --> Q[Set Deadline Form]
    Q --> R[Deadline Date Picker]
    R --> S[Priority Selection]
    S --> T{Priority Level?}
    T -->|Flexible| U[Flexible Deadline]
    T -->|Strict| V[Strict Deadline]
    
    U --> W[Pace Estimate Calculation]
    V --> W
    W --> X[Add Book Button]
    X --> Y{Form Validation}
    Y -->|Invalid| Z[Show Validation Errors]
    Z --> Q
    Y -->|Valid| AA[Save Deadline]
    AA --> BB[Show Success Toast]
    BB --> CC[Return to Home]
    
    %% Existing Deadline Management
    C --> DD[Deadline Details View]
    DD --> EE[Reading Progress Display]
    EE --> FF[Progress Charts]
    FF --> GG[Book Information]
    GG --> HH[Action Buttons]
    
    %% Deadline Actions
    HH --> II[Edit Deadline]
    HH --> JJ[Update Progress]
    HH --> KK[Mark as Complete]
    HH --> LL[Delete Deadline]
    
    %% Edit Flow
    II --> MM[Edit Form]
    MM --> NN[Modify Book Details]
    NN --> OO[Modify Deadline]
    OO --> PP[Save Changes]
    PP --> DD
    
    %% Progress Update Flow
    JJ --> QQ[Progress Update Form]
    QQ --> RR[Current Progress Input]
    RR --> SS{Format Type?}
    SS -->|Physical/Ebook| TT[Pages Read Input]
    SS -->|Audio| UU[Minutes Listened Input]
    
    TT --> VV[Save Progress]
    UU --> VV
    VV --> WW[Update Progress Bar]
    WW --> DD
    
    %% Completion Flow
    KK --> XX[Confirm Completion]
    XX --> YY{Confirmed?}
    YY -->|No| DD
    YY -->|Yes| ZZ[Move to Archive]
    ZZ --> AAA[Update Statistics]
    AAA --> CC
    
    %% Deletion Flow
    LL --> BBB[Confirm Deletion]
    BBB --> CCC{Confirmed?}
    CCC -->|No| DD
    CCC -->|Yes| DDD[Delete from Database]
    DDD --> CC
    
    %% Error Handling
    Y --> EEE[Validation Error]
    EEE --> FFF[Show Error Message]
    FFF --> D
    
    %% Styling
    classDef formNode fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef actionNode fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef decisionNode fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef errorNode fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class A,B,C,D,E,F,G,I,J,K,M,N,O,P,Q,R,S,U,V,W,X,AA,BB,CC formNode
    class DD,EE,FF,GG,HH,II,JJ,KK,LL,MM,NN,OO,PP,QQ,RR,TT,UU,VV,WW,XX,YY,ZZ,AAA,BBB,CCC,DDD actionNode
    class H,L,T,Y,SS,YY,CCC decisionNode
    class Z,EEE,FFF errorNode
```

## Deadline Workflow Description

### Adding New Deadlines
1. **Step 1 - Book Details**:
   - Book title and author
   - Format selection (Physical, Ebook, Audio)
   - Total quantity (pages or minutes)
   - Source selection (ARC, Library, Personal)

2. **Step 2 - Deadline Setting**:
   - Deadline date selection
   - Priority level (Flexible/Strict)
   - Pace estimate calculation
   - Form validation and submission

### Managing Existing Deadlines
1. **View Details**: Complete deadline information with progress
2. **Edit Deadline**: Modify book details or deadline date
3. **Update Progress**: Track reading progress by format
4. **Mark Complete**: Move finished books to archive
5. **Delete Deadline**: Remove unwanted deadlines

### Progress Tracking
- **Physical/Ebook**: Track pages read
- **Audio**: Track minutes listened
- **Visual Progress**: Progress bars and charts
- **Pace Calculation**: Automatic reading pace estimates

### Error Handling
- **Form Validation**: Real-time validation feedback
- **Confirmation Dialogs**: For destructive actions
- **Success Feedback**: Toast notifications for completed actions

This workflow ensures users can effectively manage their reading deadlines with proper validation and user feedback throughout the process. 