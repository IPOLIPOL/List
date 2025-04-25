# List
https://ipolipol.github.io/List/

```mermaid

flowchart TD
    %% --- User Interface Layer ---
    subgraph User Interface
        A[Home Page] --> B[Project Selector]
        B --> C{Project Exists?}
        C -->|Yes| D[Project Table View]
        C -->|No| E[Not Found Message]
        D --> F[Add New Entry]
        D --> G[Edit Entry]
        D --> H[Delete Entry]
        D --> I[Filter/Sort View]
        D --> J[Export Data]
        F --> K[Entry Form]
        K --> L[Save Entry]
    end

    %% --- Data Layer ---
    subgraph Data Layer
        M[(LocalStorage)] --- N[Project Registry]
        M --- O[Project Data]
        N <--> B
        O <--> D
        L --> U[Entry Manager]
        H --> U
        G --> U
        U --> O
        J <-- O
    end

    %% --- Components / Modules ---
    subgraph Components
        P[Project Registry Manager]
        Q[Data Entry Form]
        R[Table Renderer]
        S[Filter/Sort Engine]
        T[Export Module]

        P <--> N
        Q <--> K
        Q --> L
        R <--> D
        R --> F
        R --> G
        R --> H
        S <--> I
        T <--> J
    end

    %% --- Connections Between UI and Components ---
    B --> P

