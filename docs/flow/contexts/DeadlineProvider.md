# DeadlineProvider Context Flow

This diagram shows the complete data flow and state management within the DeadlineProvider context, which manages all deadline-related operations in the R-R-Books app.

```mermaid
flowchart TD
    %% Entry Point
    A[App Start] --> B[DeadlineProvider Initialization]
    B --> C[PaceProvider Wrapping]
    C --> D[DeadlineProviderInternal]
    
    %% Data Loading
    D --> E[useGetDeadlines Hook]
    E --> F{Data Loading State}
    F -->|Loading| G[isLoading = true]
    F -->|Error| H[error = Error object]
    F -->|Success| I[deadlines = data array]
    
    %% Data Processing
    I --> J[separateDeadlines Function]
    J --> K[Active Deadlines Array]
    J --> L[Overdue Deadlines Array]
    J --> M[Completed Deadlines Array]
    
    %% Context State
    K --> N[activeCount calculation]
    L --> O[overdueCount calculation]
    M --> P[Context State Ready]
    N --> P
    O --> P
    
    %% Component Usage
    P --> Q[Components Access Context]
    Q --> R{Action Type}
    
    %% Add Deadline Flow
    R -->|Add| S[addDeadline Action]
    S --> T[Validate Deadline Details]
    T --> U[Validate Progress Details]
    U --> V[useAddDeadline Mutation]
    V --> W{Mutation Success?}
    W -->|Success| X[onSuccess Callback]
    W -->|Error| Y[onError Callback]
    X --> Z[Refresh Data]
    Y --> AA[Log Error]
    
    %% Update Deadline Flow
    R -->|Update| BB[updateDeadline Action]
    BB --> CC[Validate Updated Details]
    CC --> DD[useUpdateDeadline Mutation]
    DD --> EE{Mutation Success?}
    EE -->|Success| FF[onSuccess Callback]
    EE -->|Error| GG[onError Callback]
    FF --> Z
    GG --> AA
    
    %% Delete Deadline Flow
    R -->|Delete| HH[deleteDeadline Action]
    HH --> II[useDeleteDeadline Mutation]
    II --> JJ{Mutation Success?}
    JJ -->|Success| KK[onSuccess Callback]
    JJ -->|Error| LL[onError Callback]
    KK --> Z
    LL --> AA
    
    %% Complete Deadline Flow
    R -->|Complete| MM[completeDeadline Action]
    MM --> NN[useCompleteDeadline Mutation]
    NN --> OO{Mutation Success?}
    OO -->|Success| PP[onSuccess Callback]
    OO -->|Error| QQ[onError Callback]
    PP --> Z
    QQ --> AA
    
    %% Set Aside Deadline Flow
    R -->|Set Aside| RR[setAsideDeadline Action]
    RR --> SS[useSetAsideDeadline Mutation]
    SS --> TT{Mutation Success?}
    TT -->|Success| UU[onSuccess Callback]
    TT -->|Error| VV[onError Callback]
    UU --> Z
    VV --> AA
    
    %% Calculations Flow
    R -->|Calculate| WW[getDeadlineCalculations]
    WW --> XX[Calculate Current Progress]
    XX --> YY[Calculate Total Quantity]
    YY --> ZZ[Calculate Remaining]
    ZZ --> AAA[Calculate Progress Percentage]
    AAA --> BBB[Calculate Days Left]
    BBB --> CCC[Calculate Units Per Day]
    CCC --> DDD[Get Pace Data from PaceProvider]
    DDD --> EEE[Map Pace to Urgency Level]
    EEE --> FFF[Generate Status Message]
    FFF --> GGG[Return Calculation Object]
    
    %% Reading Time Calculation
    R -->|Reading Time| HHH[getTotalReadingTimePerDay]
    HHH --> III[Process Active Deadlines]
    III --> JJJ[Sum Reading Requirements]
    JJJ --> KKK[Format Time Display]
    
    %% Format Units Display
    R -->|Format Units| LLL[formatUnitsPerDay]
    LLL --> MMM{Format Type?}
    MMM -->|Audio| NNN[Convert to Hours/Minutes]
    MMM -->|Physical/Ebook| OOO[Use Pages/Unit Format]
    NNN --> PPP[Return Formatted String]
    OOO --> PPP
    
    %% Error Handling
    AA --> QQQ[Console Error Log]
    QQQ --> RRR[Component Error Handling]
    
    %% Data Refresh
    Z --> E
    
    %% Styling
    classDef initNode fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef dataNode fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef actionNode fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef calculationNode fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef errorNode fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef successNode fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class A,B,C,D,E initNode
    class F,G,H,I,J,K,L,M,N,O,P,Q dataNode
    class S,T,U,V,BB,CC,DD,HH,II,MM,NN,RR,SS actionNode
    class WW,XX,YY,ZZ,AAA,BBB,CCC,DDD,EEE,FFF,GGG,HHH,III,JJJ,KKK,LLL,MMM,NNN,OOO calculationNode
    class Y,AA,GG,LL,QQ,VV,QQQ,RRR errorNode
    class X,FF,KK,PP,UU,Z successNode
```

## DeadlineProvider Context Description

### Initialization Flow
1. **Provider Setup**: DeadlineProvider wraps PaceProvider and DeadlineProviderInternal
2. **Data Loading**: useGetDeadlines hook fetches deadline data
3. **State Management**: Loading, error, and success states handled
4. **Data Processing**: Deadlines separated into active, overdue, and completed

### Core Actions
1. **Add Deadline**: Validates details and creates new deadline
2. **Update Deadline**: Modifies existing deadline with validation
3. **Delete Deadline**: Removes deadline from database
4. **Complete Deadline**: Marks deadline as completed and moves to archive
5. **Set Aside Deadline**: Temporarily sets deadline aside

### Calculation Services
1. **Deadline Calculations**: 
   - Progress tracking (current/total/remaining)
   - Time calculations (days left, units per day)
   - Pace integration with PaceProvider
   - Urgency level determination

2. **Reading Time Estimates**:
   - Daily reading time requirements
   - Format-specific calculations
   - Total workload assessment

3. **Display Formatting**:
   - Units per day formatting by format type
   - Time display conversions
   - Progress visualization data

### Data Flow
- **State**: Managed through React Context
- **Mutations**: Database operations via custom hooks
- **Calculations**: Real-time computation based on current data
- **Error Handling**: Comprehensive error logging and callback system
- **Refresh**: Automatic data refresh after successful operations

### Integration
- **PaceProvider**: Provides pace-based calculations and status
- **Custom Hooks**: Database operations and data fetching
- **Utility Libraries**: Progress and deadline calculations
- **Component Usage**: Context consumed throughout app for deadline management 