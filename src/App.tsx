import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Upload, 
  Download, 
  Trash2, 
  Copy, 
  AlertTriangle, 
  Check, 
  CheckCircle2, 
  ExternalLink, 
  FileCode, 
  ListOrdered, 
  BookOpen, 
  ArrowRightLeft, 
  Code,
  Activity,
  AlertOctagon,
  ShieldAlert,
  Compass,
  FileDown,
  Database,
  Search,
  RefreshCw,
  Globe,
  Cpu,
  Sliders,
  Settings,
  Info,
  Clock,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DEFAULT_COMMUNITY_DB, CommunityMod } from "./data/communityDb";
import {
  buildDependencyGraph,
  deterministicPreSort,
  postValidateAndRepair,
  computeDeterministicConfidence,
  findCommunityMod,
  getHeuristicCategory
} from "./utils/pipeline";

const TRANSLATIONS = {
  it: {
    appTitle: "BG3 Load Order Organizer",
    appSubtitle: "VERSIONE DI SISTEMA: 2.2.0-STABLE | COMPILATORE & LINTER DI MODSETTINGS.LSX",
    loadSample: "Carica Esempio Disordinato",
    clear: "Svuota",
    rawXmlInput: "Input XML Grezzo (modsettings.lsx)",
    rows: "Righe",
    empty: "Vuoto",
    dropZoneText: "Rilascia il file modsettings.lsx",
    dropZoneSubText: "Il file XML verrà importato immediatamente nell'editor",
    browseLocal: "Sfoglia file locale",
    characters: "caratteri",
    dragHere: "Trascina qui il file o sfoglia locale",
    xmlInspector: "Ispezione Analitica Modsettings",
    detectedModsCount: "Mod Attive Rilevate",
    modName: "Nome Mod",
    folder: "Cartella",
    uuid: "UUID",
    estimatedTokens: "Stima Token Prompt",
    runLinter: "Esegui Linter & Ottimizza",
    runningLinterText: "Ottimizzazione e Analisi in corso...",
    statusSuccess: "Ottimizzazione completata!",
    statusFailed: "Errore durante l'ottimizzazione.",
    tabActiveMods: "Lista Mod Attive",
    tabSortedXml: "Risultato XML Ordinato",
    tabXmlDiff: "Differenze (Diff)",
    downloadXml: "Scarica modsettings.lsx Ordinato",
    copyXml: "Copia XML",
    copied: "Copiato!",
    generalWarnings: "Avvisi Generali & Diagnostica",
    modDetails: "Dettagli Mod & Analisi Euristica",
    isObsolete: "OBSOLETA",
    requirements: "Requisiti",
    conflicts: "Conflitti",
    notes: "Note",
    communityDbTitle: "Database della Community",
    communityDbDesc: "Metadati della community (dipendenze, conflitti) per oltre 150+ mod popolari. Usato come cache dei fatti.",
    searchPlaceholder: "Cerca mod per nome o cartella...",
    enableDb: "Abilita Database",
    disableDb: "Disabilita Database",
    syncDb: "Sincronizza DB",
    importSuccess: "Database importato con successo!",
    placeholderXml: "Incolla il codice XML del tuo file disordinato o carica l'esempio sopra",
    howItWorks: "Come funziona (Terza Via)",
    howItWorksDesc: "L'AI agisce come cervello decisionale valutando l'ordine. Il Database della Community funge esclusivamente da cache per fornire fatti oggettivi (requisiti, conflitti) senza forzare vincoli rigidi.",
    lmStudioConfig: "Configurazione LM Studio locale (Opzionale)",
    lmStudioDesc: "Esegui un modello locale sul tuo PC (es: Llama 3) abilitando le richieste CORS o usando il proxy integrato.",
    lmStudioBaseUrl: "URL Base API",
    lmStudioModel: "ID Modello",
    lmStudioApiKey: "Chiave API (facoltativa)",
    lmConnectionMode: "Modalità di Connessione",
    connectionDirect: "Diretta (Browser)",
    connectionProxy: "Proxy del Server",
    fetchModels: "Recupera Modelli",
    modelsLoading: "Recupero...",
    help: "Aiuto",
    statsTitle: "Statistiche XML",
    totalLines: "Righe totali",
    totalChars: "Caratteri totali",
    totalWords: "Parole totali",
    tokenLimitWarning: "Fai attenzione: l'XML supera la soglia consigliata di token!",
    contextWindowLimit: "Limite Finestra Contesto Modello:",
    memoryUsage: "Occupazione della memoria:",
    tokenWarningText: "Attenzione: Il file XML è troppo grande per questo modello. Potrebbe causare troncamento delle risposte o errori di timeout.",
    detectedModsInFile: "Mod Rilevate nel File:",
    processingLoadOrder: "Elaborazione Ordine Caricamento",
    timeText: "Tempo",
    estimatedProgressText: "Stato Avanzamento Stimato:",
    processingMilestones: "Milestone di Elaborazione:",
    milestone1: "1. Parsing Nodi XML",
    milestone2: "2. Validazione Regole DB Community",
    milestone3: "3. Richiesta a LM Studio Locale",
    milestone3_gemini: "3. Richiesta a Google Gemini Cloud",
    milestone4: "4. Prompt Prefill (Lettura contesto sul tuo PC)",
    milestone5: "5. Generazione Sequenza Ordinata JSON",
    completedText: "COMPLETATO",
    inProgressText: "IN CORSO...",
    waitingText: "IN ATTESA",
    sentText: "INVIATA",
    generationActive: "GENERAZIONE ATTIVA",
    compilingResults: "COMPILAZIONE RISULTATI...",
    heavyModelWarningTitle: "Avviso Modelli Grandi (es. Qwen 30B)",
    heavyModelWarningDesc: "I modelli pesanti richiedono molto tempo per l'elaborazione iniziale dei token (Prefill) prima di generare. Puoi visualizzare la percentuale esatta di caricamento (es. 22% -> 100%) direttamente nella finestra console di LM Studio aperta sul tuo PC! Se l'attesa è eccessiva, ti consigliamo di usare modelli più rapidi come Qwen 2.5 Coder 7B, 14B oppure Llama 3 8B.",
    systemLogTitle: "Log di Sistema Real-Time:",
    waitingForCompiler: "> IN ATTESA DEL COMPILATORE...",
    organizeButtonText: "Organizza Mod (Modifica & Ordina LSX)",
    lmStudioHeader: "Connessione LM Studio (Locale)",
    lmStudioIntro: "Esegui l'ottimizzazione interamente sul tuo PC locale tramite LM Studio. La richiesta viene inviata direttamente dal tuo browser al tuo server locale (localhost), garantendo privacy assoluta e controllo completo sul modello linguistico utilizzato.",
    connectionMethod: "Metodo di Connessione:",
    directBrowser: "Diretto dal Browser",
    proxyServer: "Proxy Server",
    connectionMethodHelpBrowser: "Richiede di abilitare i 'contenuti non sicuri' nel browser se usi un IP privato (es. 192.168.1.55) sotto HTTPS.",
    connectionMethodHelpProxy: "Passa attraverso il server backend dell'app. Risolve i blocchi CORS/Contenuto Misto del browser se esegui l'app in locale!",
    localApiEndpoint: "Endpoint API Locale:",
    autoNormalize: "Auto-normalizza in /v1",
    resolvedUrl: "URL di chiamata risolto:",
    apiKeyOptional: "Chiave API (Opzionale):",
    selectedModel: "Modello Selezionato:",
    noModelLoaded: "Nessun modello caricato...",
    fetchModelsButton: "Carica Modelli",
    howToSetupTitle: "Come impostare LM Studio:",
    howToSetupStep1: "1. Apri LM Studio ed avvia la scheda ",
    howToSetupStep1_2: "Local Server (icona o Sliders).",
    howToSetupStep2: "2. Seleziona ed avvia un modello Instruct/Chat (es. Qwen 2.5, Llama 3, Gemma 2).",
    howToSetupStep3: "3. Clicca su \"Carica Modelli\" per sincronizzare ed importare i modelli attivi!",
    connectionHelpButtonTextHide: "Nascondi Guida di Connessione",
    connectionHelpButtonTextShow: "⚠️ Problemi di connessione? Leggi la Guida!",
    errorFaqTitle: "Perché si verifica l'errore?",
    errorFaqDesc: "Poiché questa applicazione è ospitata sul Cloud sotto protocollo sicuro (HTTPS), il browser blocca per sicurezza le chiamate dirette a indirizzi locali HTTP non protetti (come localhost o 192.168.x.x). Questo blocco è chiamato \"Mixed Content / CORS\".",
    solATitle: "Soluzione A: Tunnel Sicuro con Ngrok (Consigliata)",
    solAStep1: "Scarica ngrok sul tuo PC e collegalo al tuo account gratuito tramite il loro Authtoken.",
    solAStep2: "Opri il terminale del tuo PC e lancia il comando: ngrok http 1411 (oppure sostituisci 1411 con la porta attiva su LM Studio, es. 1234).",
    solAStep3: "Copia l'indirizzo sicuro HTTPS generato da ngrok (es. https://4646-...ngrok-free.app).",
    solAStep4: "Apri quell'URL nel browser una prima volta e clicca sul pulsante blu \"Visit Site\" per sbloccare il controllo di sicurezza di ngrok.",
    solAStep5: "Incolla quell'URL (completo di /v1) nel campo \"Endpoint API Locale\" qui sopra!",
    solBTitle: "Soluzione B: Consenti Contenuti Non Sicuri nel Browser",
    solBDesc: "Se utilizzi il tuo IP privato (es. http://192.168.1.55:1411):",
    solBStep1: "Clicca sull'icona del lucchetto/scudo nella barra degli indirizzi (a sinistra dell'URL di questa pagina).",
    solBStep2: "Vai su \"Impostazioni sito\" (Site Settings).",
    solBStep3: "Trova la voce \"Contenuto non sicuro\" (Insecure content) e impostala su \"Consenti\" (Allow).",
    solBStep4: "Ricarica questa pagina. Il browser ora permetterà le chiamate al tuo PC!",
    solCTitle: "Soluzione C: Esegui l'applicazione in Locale",
    solCDesc: "Eseguendo l'applicazione direttamente sul tuo computer con npm run dev, l'applicazione girerà in locale ed interagirà con LM Studio senza alcun blocco di sicurezza!",
    activeIntegration: "Integrazione attiva:",
    noModsInDb: "Nessuna mod corrispondente nel DB.",
    importCustomJson: "Importa JSON Custom",
    exportDbJson: "Esporta",
    syncDbUrl: "Sincronizza URL",
    dbSyncPlaceholder: "URL del database JSON (es. http://...)",
    fileLocationTitle: "Localizzazione File Windows:",
    fileLocationDesc: "Apri Esplora File o esegui (Win + R) ed incolla questo percorso per trovare il file di salvataggio:",
    activeTabLabel: "Mod Attive",
    adviceLabel: "Consiglio",
    noLink: "Nessun Link"
  },
  en: {
    appTitle: "BG3 Load Order Organizer",
    appSubtitle: "SYSTEM VERSION: 2.2.0-STABLE | MODSETTINGS.LSX COMPILER & LINTER",
    loadSample: "Load Unsorted Example",
    clear: "Clear",
    rawXmlInput: "Raw XML Input (modsettings.lsx)",
    rows: "Rows",
    empty: "Empty",
    dropZoneText: "Drop modsettings.lsx file here",
    dropZoneSubText: "The XML file will be imported immediately into the editor",
    browseLocal: "Browse local file",
    characters: "characters",
    dragHere: "Drag file here or browse local",
    xmlInspector: "Modsettings Analytical Inspector",
    detectedModsCount: "Active Mods Detected",
    modName: "Mod Name",
    folder: "Folder",
    uuid: "UUID",
    estimatedTokens: "Estimated Prompt Tokens",
    runLinter: "Run Linter & Optimize",
    runningLinterText: "Optimizing & Analyzing...",
    statusSuccess: "Optimization completed!",
    statusFailed: "Error during optimization.",
    tabActiveMods: "Active Mod List",
    tabSortedXml: "Sorted XML Result",
    tabXmlDiff: "Differences (Diff)",
    downloadXml: "Download Sorted modsettings.lsx",
    copyXml: "Copy XML",
    copied: "Copied!",
    generalWarnings: "General Warnings & Diagnostics",
    modDetails: "Mod Details & Heuristic Analysis",
    isObsolete: "OBSOLETE",
    requirements: "Requirements",
    conflicts: "Conflicts",
    notes: "Notes",
    communityDbTitle: "Community Database",
    communityDbDesc: "Community metadata (dependencies, conflicts) for over 150+ popular mods. Used as a factual cache.",
    searchPlaceholder: "Search mod by name or folder...",
    enableDb: "Enable Database",
    disableDb: "Disable Database",
    syncDb: "Sync DB",
    importSuccess: "Database imported successfully!",
    placeholderXml: "Paste your unsorted XML code or load the sample above",
    howItWorks: "How it works (Third Way)",
    howItWorksDesc: "The AI acts as the decision-making brain determining the sequence. The Community Database acts purely as a factual cache providing objective facts (requirements, conflicts) without imposing rigid constraints.",
    lmStudioConfig: "Local LM Studio Configuration (Optional)",
    lmStudioDesc: "Run a local model on your PC (e.g. Llama 3) by enabling CORS requests or using the built-in proxy.",
    lmStudioBaseUrl: "API Base URL",
    lmStudioModel: "Model ID",
    lmStudioApiKey: "API Key (optional)",
    lmConnectionMode: "Connection Mode",
    connectionDirect: "Direct (Browser)",
    connectionProxy: "Server Proxy",
    fetchModels: "Fetch Models",
    modelsLoading: "Fetching...",
    help: "Help",
    statsTitle: "XML Statistics",
    totalLines: "Total lines",
    totalChars: "Total characters",
    totalWords: "Total words",
    tokenLimitWarning: "Warning: XML size exceeds recommended prompt token threshold!",
    contextWindowLimit: "Model Context Window Limit:",
    memoryUsage: "Memory usage:",
    tokenWarningText: "Warning: The XML file is too large for this model. This may cause truncated responses or timeout errors.",
    detectedModsInFile: "Detected Mods in File:",
    processingLoadOrder: "Processing Load Order",
    timeText: "Time",
    estimatedProgressText: "Estimated Progress:",
    processingMilestones: "Processing Milestones:",
    milestone1: "1. Parsing XML Nodes",
    milestone2: "2. Validating Community DB Rules",
    milestone3: "3. Requesting Local LM Studio",
    milestone3_gemini: "3. Requesting Google Gemini Cloud",
    milestone4: "4. Prompt Prefill (Context loading on your PC)",
    milestone5: "5. Generating Ordered JSON Sequence",
    completedText: "COMPLETED",
    inProgressText: "IN PROGRESS...",
    waitingText: "WAITING",
    sentText: "SENT",
    generationActive: "ACTIVE GENERATION",
    compilingResults: "COMPILING RESULTS...",
    heavyModelWarningTitle: "Large Model Warning (e.g., Qwen 30B)",
    heavyModelWarningDesc: "Large/heavy models require significant time for initial token processing (Prefill) before text generation starts. You can monitor the exact prefill loading percentage (e.g. 22% -> 100%) directly in the LM Studio terminal console on your PC! If it takes too long, we recommend switching to faster models like Qwen 2.5 Coder 7B/14B or Llama 3 8B.",
    systemLogTitle: "Real-Time System Log:",
    waitingForCompiler: "> WAITING FOR COMPILER...",
    organizeButtonText: "Organize Mods (Edit & Order LSX)",
    lmStudioHeader: "LM Studio Connection (Local)",
    lmStudioIntro: "Run the optimization entirely on your local PC via LM Studio. The request is sent directly from your browser to your local server (localhost), ensuring absolute privacy and complete control over the language model used.",
    connectionMethod: "Connection Method:",
    directBrowser: "Direct from Browser",
    proxyServer: "Proxy Server",
    connectionMethodHelpBrowser: "Requires enabling 'Insecure Content' in your browser settings if connecting to a private IP (e.g., 192.168.1.55) over HTTPS.",
    connectionMethodHelpProxy: "Routes requests through the application's backend server. Resolves CORS/Mixed Content browser blocking when running the app locally!",
    localApiEndpoint: "Local API Endpoint:",
    autoNormalize: "Auto-normalizes to /v1",
    resolvedUrl: "Resolved API URL:",
    apiKeyOptional: "API Key (Optional):",
    selectedModel: "Selected Model:",
    noModelLoaded: "No models loaded...",
    fetchModelsButton: "Load Models",
    howToSetupTitle: "How to set up LM Studio:",
    howToSetupStep1: "1. Open LM Studio and start the ",
    howToSetupStep1_2: "Local Server tab (icon or Sliders).",
    howToSetupStep2: "2. Select and start an Instruct/Chat model (e.g., Qwen 2.5, Llama 3, Gemma 2).",
    howToSetupStep3: "3. Click \"Load Models\" to synchronize and import the active models!",
    connectionHelpButtonTextHide: "Hide Connection Guide",
    connectionHelpButtonTextShow: "⚠️ Connection issues? Read the Guide!",
    errorFaqTitle: "Why does the connection error occur?",
    errorFaqDesc: "Since this application is hosted on the Cloud using secure HTTPS, the browser blocks direct calls to unsecure local HTTP addresses (such as localhost or 192.168.x.x) for security. This blocking is known as \"Mixed Content / CORS\".",
    solATitle: "Solution A: Secure Tunnel with Ngrok (Recommended)",
    solAStep1: "Download ngrok on your PC and link it to your free account using their Authtoken.",
    solAStep2: "Open your PC terminal and run: ngrok http 1411 (or replace 1411 with the active LM Studio port, e.g. 1234).",
    solAStep3: "Copy the secure HTTPS address generated by ngrok (e.g. https://4646-...ngrok-free.app).",
    solAStep4: "Open that URL in your browser once and click the blue \"Visit Site\" button to bypass the ngrok landing warning.",
    solAStep5: "Paste that URL (including /v1) into the \"Local API Endpoint\" field above!",
    solBTitle: "Solution B: Allow Insecure Content in your Browser",
    solBDesc: "If you use your private IP address (e.g. http://192.168.1.55:1411):",
    solBStep1: "Click the lock/shield icon in the browser address bar (to the left of this page's URL).",
    solBStep2: "Go to \"Site Settings\".",
    solBStep3: "Find \"Insecure content\" and change it to \"Allow\".",
    solBStep4: "Reload this page. The browser will now allow HTTP requests to your local computer!",
    solCTitle: "Solution C: Run the Application Locally",
    solCDesc: "By running the application directly on your computer with npm run dev, the app runs on localhost and will interact with LM Studio without any browser security blockades!",
    activeIntegration: "Integration active:",
    noModsInDb: "No matching mods in the database.",
    importCustomJson: "Import Custom JSON",
    exportDbJson: "Export",
    syncDbUrl: "Sync URL",
    dbSyncPlaceholder: "JSON database URL (e.g. http://...)",
    fileLocationTitle: "Windows File Location:",
    fileLocationDesc: "Open File Explorer or Run (Win + R) and paste this path to locate the save file:",
    activeTabLabel: "Active Mods",
    adviceLabel: "Advice",
    noLink: "No Link"
  }
};

// Predefined Unsorted (Disordinato) Example from prompt
const DISORDINATO_EXAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<save>
  <version major="4" minor="8" revision="0" build="100" />
  <region id="ModuleSettings">
    <node id="root">
      <children>
        <node id="Mods">
          <children>
            <node id="ModuleShortDesc">
              <attribute id="Folder" type="LSString" value="GustavX" />
              <attribute id="MD5" type="LSString" value="ef3fcba3f3684b3088ad1f9874d4957c" />
              <attribute id="Name" type="LSString" value="GustavX" />
              <attribute id="PublishHandle" type="uint64" value="0" />
              <attribute id="UUID" type="guid" value="cb555efe-2d9e-131f-8195-a89329d218ea" />
              <attribute id="Version64" type="int64" value="145241946983074840" />
            </node>
            <node id="ModuleShortDesc">
              <attribute id="Folder" type="LSString" value="BG3MCM" />
              <attribute id="MD5" type="LSString" value="" />
              <attribute id="Name" type="LSString" value="Mod Configuration Menu" />
              <attribute id="PublishHandle" type="uint64" value="0" />
              <attribute id="UUID" type="guid" value="755a8a72-407f-4f0d-9a33-274ac0f0b53d" />
              <attribute id="Version64" type="int64" value="41658298700660736" />
            </node>
            <node id="ModuleShortDesc">
              <attribute id="Folder" type="LSString" value="EasyCheat_ITA" />
              <attribute id="MD5" type="LSString" value="" />
              <attribute id="Name" type="LSString" value="EasyCheat_ITA" />
              <attribute id="PublishHandle" type="uint64" value="0" />
              <attribute id="UUID" type="guid" value="ae1d781f-ccf4-4877-9dc9-2bb2b4424ca2" />
              <attribute id="Version64" type="int64" value="72479810797961216" />			
            </node>
            <node id="ModuleShortDesc">
              <attribute id="Folder" type="LSString" value="EasyCheat" />
              <attribute id="MD5" type="LSString" value="" />
              <attribute id="Name" type="LSString" value="EasyCheat" />
              <attribute id="PublishHandle" type="uint64" value="0" />
              <attribute id="UUID" type="guid" value="5b5ad5b6-ce37-4a63-8dea-a1fee4cee156" />
              <attribute id="Version64" type="int64" value="72479810797961216" />
            </node>
          </children>
        </node>
      </children>
    </node>
  </region>
</save>`;

interface ModAnalysis {
  uuid: string;
  name: string;
  folder: string;
  category: string;
  description: string;
  nexusUrl: string;
  isObsolete: boolean;
  conflicts: string[];
  requirements: string[];
  notes: string;
}

export default function App() {
  const [xmlInput, setXmlInput] = useState<string>("");
  const [language, setLanguage] = useState<"it" | "en">(() => {
    const saved = localStorage.getItem("bg3_lo_lang");
    return (saved === "it" || saved === "en") ? saved : "it";
  });

  useEffect(() => {
    localStorage.setItem("bg3_lo_lang", language);
  }, [language]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "xml" | "diff">("list");
  
  // Results from backend
  const [organizedXml, setOrganizedXml] = useState<string>("");
  const [analysis, setAnalysis] = useState<ModAnalysis[]>([]);
  const [generalWarnings, setGeneralWarnings] = useState<string[]>([]);
  const [originalModCount, setOriginalModCount] = useState<number>(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState<string[]>([]);
  
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(0);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Community Database State
  const [communityDb, setCommunityDb] = useState<CommunityMod[]>(DEFAULT_COMMUNITY_DB);
  const [enableCommunityDb, setEnableCommunityDb] = useState<boolean>(true);
  const [searchDbQuery, setSearchDbQuery] = useState<string>("");
  const [dbSyncUrl, setDbSyncUrl] = useState<string>("");
  const [dbImportSuccess, setDbImportSuccess] = useState<string | null>(null);
  const dbJsonInputRef = useRef<HTMLInputElement>(null);

  // AI Engine / Provider Mode
  const [aiProvider] = useState<"lmstudio">("lmstudio");
  
  // LM Studio Configs
  const [lmStudioBaseUrl, setLmStudioBaseUrl] = useState<string>("http://localhost:1234/v1");
  const [lmStudioModel, setLmStudioModel] = useState<string>("meta-llama-3-8b-instruct");
  const [lmStudioApiKey, setLmStudioApiKey] = useState<string>("lm-studio");
  const [availableLmModels, setAvailableLmModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState<boolean>(false);
  const [lmConnectionMode, setLmConnectionMode] = useState<"browser" | "proxy">("browser");

  // Context Window config for XML stats
  const [contextWindowSize, setContextWindowSize] = useState<number>(32768);
  const [showConnectionHelp, setShowConnectionHelp] = useState<boolean>(false);

  // XML Stats and Mod Parsing memo
  const xmlStats = useMemo(() => {
    if (!xmlInput.trim()) {
      return {
        lineCount: 0,
        charCount: 0,
        wordCount: 0,
        estimatedTokens: 0,
        modCount: 0,
        detectedMods: [],
      };
    }

    const lines = xmlInput.split("\n");
    const charCount = xmlInput.length;
    const wordCount = xmlInput.trim().split(/\s+/).filter(Boolean).length;
    
    // Standard Token calculation for XML: ~3.5 chars per token
    const estimatedTokens = Math.ceil(charCount / 3.5);

    const detectedMods: { name: string; folder: string; uuid: string }[] = [];
    
    // Split input by <node id="ModuleShortDesc"> to parse individual mod nodes
    const nodeBlocks = xmlInput.split(/<node\s+id="ModuleShortDesc">/i);
    for (let i = 1; i < nodeBlocks.length; i++) {
      const block = nodeBlocks[i].split(/<\/node>/i)[0];
      if (block) {
        const folderMatch = block.match(/id="Folder"[^>]*value="([^"]*)"/i) || block.match(/value="([^"]*)"[^>]*id="Folder"/i);
        const nameMatch = block.match(/id="Name"[^>]*value="([^"]*)"/i) || block.match(/value="([^"]*)"[^>]*id="Name"/i);
        const uuidMatch = block.match(/id="UUID"[^>]*value="([^"]*)"/i) || block.match(/value="([^"]*)"[^>]*id="UUID"/i);

        const folder = folderMatch ? folderMatch[1] : "";
        const name = nameMatch ? nameMatch[1] : "";
        const uuid = uuidMatch ? uuidMatch[1] : "";

        if (folder || name || uuid) {
          detectedMods.push({
            name: name || folder || "Senza nome",
            folder: folder || "N/A",
            uuid: uuid || "N/A"
          });
        }
      }
    }

    return {
      lineCount: lines.length,
      charCount,
      wordCount,
      estimatedTokens,
      modCount: detectedMods.length,
      detectedMods,
    };
  }, [xmlInput]);

  const getNormalizedLmStudioUrl = (url: string): string => {
    let clean = url.trim().replace(/\/$/, '');
    if (!clean) return "http://localhost:1234/v1";
    if (!clean.endsWith("/v1") && !clean.includes("/v1/")) {
      clean = `${clean}/v1`;
    }
    return clean;
  };

  const fetchLmModels = async () => {
    setIsFetchingModels(true);
    try {
      const normalizedUrl = getNormalizedLmStudioUrl(lmStudioBaseUrl);
      let data;

      if (lmConnectionMode === "proxy") {
        const response = await fetch("/api/proxy-lmstudio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: `${normalizedUrl}/models`,
            method: "GET",
            headers: lmStudioApiKey ? { "Authorization": `Bearer ${lmStudioApiKey}` } : {}
          })
        });
        if (response.ok) {
          data = await response.json();
          if (data && data.error) {
            throw new Error(data.error);
          }
        } else {
          const errData = await response.json().catch(() => ({ 
            error: language === "it" 
              ? `Risposta del proxy non valida: ${response.status}` 
              : `Invalid proxy response: ${response.status}` 
          }));
          throw new Error(errData.error || (language === "it" ? `Errore del proxy server: ${response.status}` : `Proxy server error: ${response.status}`));
        }
      } else {
        // Direct browser fetch
        const response = await fetch(`${normalizedUrl}/models`, {
          headers: lmStudioApiKey ? { "Authorization": `Bearer ${lmStudioApiKey}` } : {}
        });
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error(language === "it" ? `Risposta di LM Studio non valida (Status ${response.status})` : `Invalid LM Studio response (Status ${response.status})`);
        }
      }

      if (data && Array.isArray(data.data)) {
        const models = data.data.map((m: any) => m.id);
        setAvailableLmModels(models);
        if (models.length > 0 && !models.includes(lmStudioModel)) {
          setLmStudioModel(models[0]);
        }
        const successMsg = language === "it"
          ? `Modelli caricati da LM Studio! (${models.length} trovati)`
          : `Models loaded from LM Studio! (${models.length} found)`;
        setDbImportSuccess(successMsg);
        setTimeout(() => setDbImportSuccess(null), 3000);
      } else {
        throw new Error(language === "it" ? "Formato di risposta dei modelli non valido." : "Invalid model response format.");
      }
    } catch (err: any) {
      const normalizedUrl = getNormalizedLmStudioUrl(lmStudioBaseUrl);
      const isIt = language === "it";
      const errMsg = isIt
        ? `Impossibile recuperare i modelli da LM Studio: ${err.message}. Assicurati che LM Studio sia attivo con il server di rete abilitato su: ${normalizedUrl}`
        : `Unable to retrieve models from LM Studio: ${err.message}. Make sure LM Studio is running with the network server enabled on: ${normalizedUrl}`;
      setError(errMsg);
    } finally {
      setIsFetchingModels(false);
    }
  };

  useEffect(() => {
    if (aiProvider === "lmstudio" && availableLmModels.length === 0) {
      fetchLmModels();
    }
  }, [aiProvider]);

  // Load sample XML helper
  const handleLoadSample = () => {
    setXmlInput(DISORDINATO_EXAMPLE);
    setError(null);
  };

  const handleClear = () => {
    setXmlInput("");
    setOrganizedXml("");
    setAnalysis([]);
    setGeneralWarnings([]);
    setConfidence(null);
    setReasoning([]);
    setError(null);
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          setXmlInput(event.target.result);
          setError(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          setXmlInput(event.target.result);
          setError(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Request to start sorting and analyzing
  const handleOrganize = async () => {
    if (!xmlInput.trim()) {
      setError("Inserisci il codice XML del file modsettings.lsx prima di iniziare.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setConfidence(null);
    setReasoning([]);
    setLoadingStep("Analisi della struttura del file LSX...");
    setElapsedSeconds(0);
    setSimulatedProgress(0);
    setLiveLogs([`[00:00] Avvio del processo di ottimizzazione delle mod...`]);

    const timerInterval = setInterval(() => {
      setElapsedSeconds(prev => {
        const nextSeconds = prev + 1;
        const timeStr = String(Math.floor(nextSeconds / 60)).padStart(2, "0") + ":" + String(nextSeconds % 60).padStart(2, "0");
        
        setLiveLogs(currentLogs => {
          const logs = [...currentLogs];
          const addLog = (msg: string) => {
            if (!logs.some(l => l.includes(msg))) {
              logs.unshift(`[${timeStr}] ${msg}`);
            }
          };

          if (nextSeconds === 2) {
            addLog("Mappatura della struttura XML completata.");
          } else if (nextSeconds === 5) {
            addLog("Sincronizzazione dei vincoli con il database locale.");
          } else if (nextSeconds === 8) {
            if (aiProvider === "lmstudio") {
              addLog(`Invio della richiesta HTTP a LM Studio (${lmStudioModel})...`);
            } else {
              addLog("Invio della richiesta HTTP alle API Cloud Gemini...");
            }
          } else if (nextSeconds === 15) {
            if (aiProvider === "lmstudio") {
              addLog("In attesa della precompilazione (Prefill) su LM Studio. Questo passaggio calcola i pesi iniziali dei token.");
            } else {
              addLog("Gemini sta analizzando l'ordine ottimale per le mod...");
            }
          } else if (nextSeconds === 22) {
            if (aiProvider === "lmstudio") {
              addLog("Il prefill richiede tempo proporzionale alle dimensioni del file e alle specifiche del tuo hardware.");
            } else {
              addLog("Fase di inferenza in cloud attiva...");
            }
          } else if (nextSeconds === 30) {
            if (aiProvider === "lmstudio") {
              addLog("Consiglio: apri la finestra di LM Studio sul tuo PC per monitorare la percentuale di avanzamento del prompt!");
            }
          } else if (nextSeconds === 45) {
            if (aiProvider === "lmstudio") {
              addLog("Modelli di grandi dimensioni (es. Qwen 30B) possiedono un'elevata precisione ma necessitano di tempi di elaborazione più lunghi.");
            }
          } else if (nextSeconds === 60) {
            if (aiProvider === "lmstudio") {
              addLog("Tempo di elaborazione locale superato 1 minuto. Il server è attivo e sta calcolando.");
            }
          } else if (nextSeconds === 80) {
            addLog("Elaborazione e categorizzazione dei moduli (UI, Gameplay, Aesthetics, ecc.)...");
          } else if (nextSeconds === 100) {
            addLog("Ordinamento sequenziale basato sulla gerarchia ufficiale di Larian...");
          } else if (nextSeconds === 120) {
            addLog("Generazione del file di configurazione ordinato. Quasi pronto...");
          } else if (nextSeconds % 30 === 0 && nextSeconds > 120) {
            addLog(`Generatore attivo. Tempo stimato di completamento basato sulle performance: ${Math.floor(nextSeconds / 60)}m ${nextSeconds % 60}s.`);
          }
          return logs.slice(0, 30);
        });

        setSimulatedProgress(currentProg => {
          if (currentProg < 20) return currentProg + 4;
          if (currentProg < 45) return currentProg + 1.5;
          if (currentProg < 75) return currentProg + 0.6;
          if (currentProg < 98) return currentProg + 0.15;
          return 99;
        });

        return nextSeconds;
      });
    }, 1000);

    // Stagger loading messages for UX
    const steps = [
      "Estrazione dei nodi delle mod e degli UUID...",
      "Consultazione del database delle regole di caricamento...",
      "Mappatura delle dipendenze e delle traduzioni...",
      "Calcolo dell'ordine di caricamento ottimale...",
      "Rilevamento conflitti e moduli obsoleti...",
      "Generazione del file modsettings.lsx ordinato..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLoadingStep(steps[currentStep]);
        currentStep++;
      }
    }, 1000);

    // PATH 1: LM STUDIO LOCAL AI MODE
    if (aiProvider === "lmstudio") {
      try {
        setLoadingStep("Estrazione dei nodi delle mod via backend...");
        const parseRes = await fetch("/api/parse-xml", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xml: xmlInput })
        });
        if (!parseRes.ok) {
          const errData = await parseRes.json();
          throw new Error(errData.error || "Impossibile analizzare il file XML tramite il server.");
        }
        const { parsedMods } = await parseRes.json();
        
        if (!parsedMods || parsedMods.length === 0) {
          throw new Error("Nessuna mod valida trovata nel file XML inserito.");
        }

        setLoadingStep("Invio richiesta a LM Studio locale...");

        // 1. Build dependency graph
        const graphNodes = buildDependencyGraph(parsedMods, communityDb || []);

        // 2. Perform deterministic pre-sorting
        const preSortResult = deterministicPreSort(graphNodes);
        const preSortedNodes = preSortResult.sorted;
        const preSortedWarnings = preSortResult.warnings;

        // Map pre-sorted list to compact IDs
        const modsSummary = preSortedNodes.map((n: any, idx: number) => ({
          id: idx,
          name: n.name,
          folder: n.folder,
          category: n.category
        }));

        // Retrieve matched community DB metadata rules
        const matchedCommunityRules = preSortedNodes.map((node: any, idx: number) => {
          const dbItem = findCommunityMod(node.uuid, node.name, node.folder, communityDb || []);
          if (!dbItem) return null;
          return {
            id: idx,
            name: dbItem.name,
            category: dbItem.category,
            requirements: dbItem.requirements,
            conflicts: dbItem.conflicts,
            notes: dbItem.notes
          };
        }).filter(Boolean);

        const isIt = language === "it";

        const communityDbText = matchedCommunityRules.length > 0
          ? (isIt 
              ? `Metadati noti della community sulle mod attive (usa questi fatti per ragionare su relazioni o anomalie):\n${JSON.stringify(matchedCommunityRules, null, 2)}`
              : `Community known metadata on active mods (use this factual cache to reason about relationships/anomalies):\n${JSON.stringify(matchedCommunityRules, null, 2)}`)
          : (isIt 
              ? "Nessuna mod corrisponde a voci note nel database della community."
              : "No active mods match entries in the community database cache.");

        const promptMessage = isIt 
          ? `Sei un consulente esperto di Load Order per Baldur's Gate 3.
L'elenco di mod fornito sotto è GIÀ STATO PRE-ORDINATO in modo deterministico e matematicamente valido, rispettando tutti i vincoli fisici (es: librerie prima dei dipendenti, traduzioni collegate, Gustav in cima, Compatibility Framework in coda).

Il tuo compito è FINE-TUNARE questo ordine, valutando unicamente:
1. Raggruppamento tematico di mod affini (es. estetiche simili) all'interno delle rispettive macro-categorie.
2. Risoluzione di preferenze soggettive o mod sconosciute rispetto a mod note.
3. Rilevazione di eventuali mod obsolete o conflitti noti.

Mantieni l'ordine pre-ordinato a meno che non ci siano motivazioni logiche per raggruppare o scambiare moduli simili. Restituisci la sequenza finale ottimale di ID.

Elenco pre-ordinato (mappato per ID numerico compatto):
${JSON.stringify(modsSummary, null, 2)}

${communityDbText}

Devi rispondere STRETTAMENTE in formato JSON valido corrispondente a questo schema ultracompatto, senza commenti o markdown:
{
  "order": [
    "lista degli ID ordinati come numeri interi, es: 0, 1, 2, 3"
  ],
  "reasoning": [
    "un elenco di 3-5 spiegazioni sintetiche e ad alto livello in italiano sui motivi delle tue decisioni (perché hai raggruppato certe mod o ottimizzato il layout)"
  ],
  "warnings": [
    {
      "id": "numero intero ID della mod interessata",
      "type": "tipo di anomalia: 'obsolete' | 'missing_dependency' | 'conflict'",
      "msg": "breve spiegazione del problema in italiano"
    }
  ],
  "general": [
    "brevi consigli generali in italiano sul set di mod"
  ]
}`
          : `You are an expert load order advisory assistant for Baldur's Gate 3.
The list of mods provided below has ALREADY BEEN PRE-SORTED using rigorous deterministic constraints (e.g. library before dependents, translations aligned, Gustav at top, Compatibility Framework at bottom).

Your task is to FINE-TUNE this order by evaluating only:
1. Thematic grouping of similar mods (e.g. aesthetic mods together) within their respective categories.
2. Subjective preferences or placement of unknown mods relative to known ones.
3. High-level conflict reasoning and recommendations.

Preserve the pre-sorted sequence unless there is a clear logical reason to group or reorder similar items. Return the final optimal sequence of IDs.

Pre-sorted list (mapped by compact numerical ID):
${JSON.stringify(modsSummary, null, 2)}

${communityDbText}

You MUST respond STRICTLY in valid JSON format matching this ultra-compact schema, without markdown formatting or code blocks:
{
  "order": [
    "list of sorted IDs as integers, e.g.: 0, 1, 2, 3"
  ],
  "reasoning": [
    "a short list of 3-5 concise, high-level justifications in English for your layout decisions (e.g. why you grouped certain mods or optimized the sequence)"
  ],
  "warnings": [
    {
      "id": "integer ID of the affected mod",
      "type": "type of anomaly: 'obsolete' | 'missing_dependency' | 'conflict'",
      "msg": "short explanation of the issue in English"
    }
  ],
  "general": [
    "short general load order tips or recommendations in English"
  ]
}`;

        const requestPayload = {
          model: lmStudioModel,
          messages: [
            {
              role: "system",
              content: isIt 
                ? "Sei un assistente AI specializzato che risponde SOLO in formato JSON strutturato."
                : "You are a specialized AI assistant that responds ONLY in structured JSON format."
            },
            {
              role: "user",
              content: promptMessage
            }
          ],
          temperature: 0.1,
          max_tokens: 4096
        };

        const normalizedUrl = getNormalizedLmStudioUrl(lmStudioBaseUrl);
        let lmData;

        if (lmConnectionMode === "proxy") {
          const lmResponse = await fetch("/api/proxy-lmstudio", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              url: `${normalizedUrl}/chat/completions`,
              method: "POST",
              headers: lmStudioApiKey ? { "Authorization": `Bearer ${lmStudioApiKey}` } : {},
              body: requestPayload
            })
          });

          if (!lmResponse.ok) {
            const errData = await lmResponse.json().catch(() => ({ error: `Risposta del proxy non valida: ${lmResponse.status}` }));
            throw new Error(errData.error || `Errore del proxy server: ${lmResponse.status}`);
          }
          lmData = await lmResponse.json();
          if (lmData && lmData.error) {
            throw new Error(lmData.error);
          }
        } else {
          // Direct browser request
          const lmResponse = await fetch(`${normalizedUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(lmStudioApiKey ? { "Authorization": `Bearer ${lmStudioApiKey}` } : {})
            },
            body: JSON.stringify(requestPayload)
          });

          if (!lmResponse.ok) {
            throw new Error(`LM Studio ha risposto con errore status ${lmResponse.status}`);
          }
          lmData = await lmResponse.json();
        }

        const content = lmData?.choices?.[0]?.message?.content;

        // DIAGNOSTIC LOGGING PATH
        const promptLengthChars = promptMessage.length;
        const promptTokensEstimate = Math.ceil(promptLengthChars / 4);
        const responseLengthChars = content ? content.length : 0;
        const finishReason = lmData?.choices?.[0]?.finish_reason || "non fornito";
        const isTruncated = finishReason === "length";

        // Console.log Diagnostics for browser devtools & ChatGPT inspection
        console.group("🔍 DIAGNOSTICA LM STUDIO / OPENAI API");
        console.log("1. Dimensione prompt inviato (caratteri):", promptLengthChars);
        console.log("2. Stima token prompt (~4 caratteri/token):", promptTokensEstimate);
        console.log("3. Dimensione risposta ricevuta (caratteri):", responseLengthChars);
        console.log("4. Risposta troncata per limiti di output:", isTruncated ? "SÌ (Limite max_tokens raggiunto)" : "NO");
        console.log("5. Valore 'finish_reason' restituito:", finishReason);
        console.log("6. Valore 'max_tokens' inviato:", requestPayload.max_tokens);
        console.log("7. Payload JSON completo inviato (senza chiavi API):", JSON.stringify(requestPayload, null, 2));
        console.groupEnd();

        // On-screen Live Terminal Diagnostics
        setLiveLogs(prev => {
          const timeStr = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0") + ":" + String(elapsedSeconds % 60).padStart(2, "0");
          const diagLogs = [
            `[${timeStr}] ----------------------------------------`,
            `[${timeStr}] 🔍 DIAGNOSTICA LM STUDIO COMPLETATA:`,
            `[${timeStr}] - Prompt inviato: ${promptLengthChars} caratteri (~${promptTokensEstimate} token)`,
            `[${timeStr}] - Risposta ricevuta: ${responseLengthChars} caratteri`,
            `[${timeStr}] - finish_reason: "${finishReason}"`,
            `[${timeStr}] - Risposta troncata: ${isTruncated ? "SÌ (Limite raggiunto)" : "NO"}`,
            `[${timeStr}] - max_tokens inviato: ${requestPayload.max_tokens}`,
            `[${timeStr}] - Payload JSON completo loggato in console (F12)`,
            `[${timeStr}] ----------------------------------------`
          ];
          return [...diagLogs, ...prev].slice(0, 50);
        });
        if (!content) {
          throw new Error("Nessun testo di risposta ricevuto dal modello LM Studio.");
        }

        let parsedLlmData: any = {};
        let isRecovered = false;
        try {
          let cleaned = content.trim();
          if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, "");
            cleaned = cleaned.replace(/\n```$/, "");
          }
          cleaned = cleaned.trim();
          const startIdx = cleaned.indexOf("{");
          const endIdx = cleaned.lastIndexOf("}");
          if (startIdx !== -1 && endIdx !== -1) {
            cleaned = cleaned.substring(startIdx, endIdx + 1);
          }
          parsedLlmData = JSON.parse(cleaned);
        } catch (jsonErr: any) {
          console.warn("Failed to parse local LLM JSON. Attempting robust index extraction fallback...", jsonErr);
          
          // Robust Regex-based integer ID extraction fallback
          const digitRegex = /\b\d+\b/g;
          const extractedIndices: number[] = [];
          let match;
          while ((match = digitRegex.exec(content)) !== null) {
            const idxNum = parseInt(match[0], 10);
            if (idxNum >= 0 && idxNum < parsedMods.length && !extractedIndices.includes(idxNum)) {
              extractedIndices.push(idxNum);
            }
          }

          // Robust Regex-based UUID extraction fallback as a double fallback
          const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
          const extractedUUIDs: string[] = [];
          while ((match = uuidRegex.exec(content)) !== null) {
            const uuid = match[0].toLowerCase();
            if (!extractedUUIDs.includes(uuid)) {
              extractedUUIDs.push(uuid);
            }
          }

          if (extractedIndices.length > 0) {
            parsedLlmData = {
              order: extractedIndices,
              warnings: [],
              general: [
                "Nota: La risposta di LM Studio è risultata parzialmente troncata o non formattata in JSON valido dal modello locale. Tuttavia, l'algoritmo intelligente di recupero basato su indici ha estratto con successo l'ordine delle mod!"
              ]
            };
            isRecovered = true;
          } else if (extractedUUIDs.length > 0) {
            parsedLlmData = {
              sortedUUIDs: extractedUUIDs,
              warnings: [],
              general: [
                "Nota: Risposta non formattata correttamente. Recupero avvenuto tramite estrazione UUID grezza."
              ]
            };
            isRecovered = true;
          } else {
            throw new Error("Il modello locale non ha restituito un JSON valido né indici numerici leggibili. Assicurati che LM Studio stia utilizzando un modello Instruct e attiva la modalità JSON se supportata.");
          }
        }

        const sortedMods: any[] = [];
        
        if (Array.isArray(parsedLlmData.order)) {
          for (const idx of parsedLlmData.order) {
            const idxNum = Number(idx);
            if (!isNaN(idxNum) && preSortedNodes[idxNum]) {
              const m = preSortedNodes[idxNum];
              if (!sortedMods.some(sorted => sorted.uuid === m.uuid)) {
                sortedMods.push(m);
              }
            }
          }
        } else if (Array.isArray(parsedLlmData.sortedUUIDs)) {
          for (const uuid of parsedLlmData.sortedUUIDs) {
            const found = preSortedNodes.find((m: any) => m.uuid === uuid);
            if (found && !sortedMods.some(sorted => sorted.uuid === found.uuid)) {
              sortedMods.push(found);
            }
          }
        }

        // Safety guarantee: append any remaining mods that were in pre-sorted but not sorted by AI
        for (const m of preSortedNodes) {
          if (!sortedMods.some(sorted => sorted.uuid === m.uuid)) {
            sortedMods.push(m);
          }
        }

        // Map the AI-sorted mods to indices of preSortedNodes to form aiOrder
        const aiOrder: number[] = sortedMods.map(m => {
          return preSortedNodes.findIndex((orig: any) => orig.uuid === m.uuid);
        }).filter(idx => idx !== -1);

        // Apply post-validation and deterministic repair
        const repairResult = postValidateAndRepair(aiOrder, preSortedNodes);
        const finalizedMods = repairResult.repairedNodes;
        const repairCount = repairResult.repairedCount;

        // Compute deterministic confidence score
        const deterministicScore = computeDeterministicConfidence(preSortedNodes, finalizedMods, repairCount, communityDb || []);

        setLoadingStep("Rigenerazione del file XML ordinato via backend...");

        const rebuildRes = await fetch("/api/rebuild-xml", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xml: xmlInput, sortedMods: finalizedMods })
        });

        if (!rebuildRes.ok) {
          const rebuildErr = await rebuildRes.json();
          throw new Error(rebuildErr.error || "Errore nella rigenerazione dell'XML.");
        }

        const rebuildData = await rebuildRes.json();
        clearInterval(interval);
        clearInterval(timerInterval);

        // Client-side Heuristic analysis enrichment logic
        const getLocalModAnalysis = (m: any, index: number) => {
          const u = (m.uuid || "").toLowerCase();
          const n = (m.name || "").toLowerCase();
          const f = (m.folder || "").toLowerCase();
          
          let communityMod = communityDb.find((item: any) => item.uuid && item.uuid.toLowerCase() === u);
          if (!communityMod && f) {
            communityMod = communityDb.find((item: any) => item.folder && item.folder.toLowerCase() === f);
          }
          if (!communityMod && n) {
            communityMod = communityDb.find((item: any) => item.name && (
              item.name.toLowerCase() === n ||
              n.includes(item.name.toLowerCase()) ||
              item.name.toLowerCase().includes(n)
            ));
          }

          let category = communityMod ? communityMod.category : "Gameplay";
          if (category === "Aesthetic") category = "Aesthetics";
          if (category === "Translation") category = "Translations";
          
          const isCore = f === 'gustav' || f === 'gustavdev' || f === 'gustavx' || n === 'gustav' || n === 'gustavdev' || n === 'gustavx';
          if (isCore) {
            category = "Core Game Module";
          } else if (f.includes("compatibilityframework") || n.includes("compatibilityframework") || n.includes("compatibility framework")) {
            category = "Compatibility Framework";
          } else if (n.includes("_ita") || n.includes("translation") || n.includes("traduzione") || n.includes("translate") || f.includes("translation") || f.includes("traduzione")) {
            category = "Translations";
          } else if (n.includes("bg3mcm") || n.includes("mcm") || n.includes("mod configuration") || n.includes("scriptextender") || n.includes("script extender")) {
            category = "Core / Library";
          } else if (n.includes("improvedui") || n.includes("ui") || n.includes("hud") || n.includes("widget") || n.includes("interface") || n.includes("container") || n.includes("inventory")) {
            category = "UI";
          } else if (n.includes("hair") || n.includes("salon") || n.includes("tattoo") || n.includes("face") || n.includes("head") || n.includes("preset") || n.includes("aesthetic") || n.includes("cosmetic") || n.includes("cloth") || n.includes("armor") || n.includes("gear") || n.includes("skin") || n.includes("dye") || n.includes("visual")) {
            category = "Aesthetics";
          } else if (n.includes("class") || n.includes("race") || n.includes("razz") || n.includes("subclass") || n.includes("subrace") || n.includes("customizer")) {
            category = "Classes & Races";
          } else if (n.includes("fix") || n.includes("patch") || n.includes("overhaul") || n.includes("rebalance")) {
            category = "Patches & Overhauls";
          }

          let description = communityMod ? communityMod.description : `Modulo ${category.toLowerCase()} per personalizzare la tua esperienza in Baldur's Gate 3.`;
          if (!communityMod) {
            if (n.includes("improvedui")) {
              description = "Migliora e corregge i menu di creazione del personaggio e l'interfaccia di gioco per supportare opzioni aggiuntive.";
            } else if (n.includes("mcm") || n.includes("mod configuration")) {
              description = "Consente di configurare le mod direttamente dal menu di gioco.";
            } else if (n.includes("compatibilityframework")) {
              description = "Risolve conflitti tra mod di classi e razze sovrapponendole dinamicamente.";
            } else if (n.includes("easycheat") || n.includes("cheat")) {
              description = "Utility di gioco che aggiunge opzioni di personalizzazione, cheat o facilitazioni.";
            } else if (n.includes("limit") || n.includes("begone")) {
              description = "Rimuove le limitazioni del party consentendo di reclutare più compagni contemporaneamente.";
            } else if (category === "Translations") {
              description = "Localizzazione in lingua italiana per i testi e i menu del gioco.";
            }
          }

          let isObsolete = communityMod 
            ? (communityMod.latestVersion === "OBSOLETE" || !!communityMod.isObsolete)
            : (n.includes("mod fixer") || n.includes("modfixer") || n.includes("mod-fixer"));

          const conflicts = communityMod && communityMod.conflicts ? [...communityMod.conflicts] : [];
          const requirements = communityMod && communityMod.requirements ? [...communityMod.requirements] : [];
          if (n.includes("mcm") || n.includes("mod configuration")) {
            requirements.push("Script Extender");
          }
          if (n.includes("compatibility")) {
            requirements.push("Community Library");
          }
          if (n.includes("_ita") || n.includes("traduzione") || n.includes("translation")) {
            requirements.push("Mod Principale (English)");
          }

          let notes = "";
          if (communityMod) {
            notes = `${communityMod.notes} [Fonte DB: ${communityMod.source || "Community"}]`;
          } else {
            if (isObsolete) {
              notes = "Rimuovi questo file. Patch 7+ integra nativamente la correzione del caricamento ed evita crash.";
            } else if (category === "Translations") {
              notes = "Posizionata automaticamente subito dopo il modulo principale in lingua inglese per la corretta traduzione dei testi.";
            } else if (category === "Compatibility Framework") {
              notes = "Deve essere caricata assolutamente all'ultimo posto dell'elenco.";
            } else if (n.includes("improvedui")) {
              notes = "Modulo fondamentale per supportare interfacce personalizzate. Assicurati che sia aggiornato per la patch corrente.";
            } else if (n.includes("mcm") || n.includes("mod configuration")) {
              notes = "Fornisce il pannello di controllo in-game delle altre mod. Richiede lo Script Extender.";
            } else {
              notes = "Verifica regolarmente la compatibilità con la Patch 7 sul sito ufficiale Nexus Mods.";
            }
          }

          return {
            uuid: m.uuid,
            name: m.name,
            folder: m.folder,
            category,
            description,
            nexusUrl: communityMod && communityMod.nexusUrl ? communityMod.nexusUrl : `https://www.nexusmods.com/baldursgate3/search/?gsearch=${encodeURIComponent(m.name)}`,
            isObsolete,
            conflicts,
            requirements,
            notes
          };
        };

        const finalAnalysisList = finalizedMods.map((m: any) => {
          const originalIndex = preSortedNodes.findIndex((orig: any) => orig.uuid === m.uuid);
          const baseAnalysis = getLocalModAnalysis(m, originalIndex);
          
          if (parsedLlmData.warnings && Array.isArray(parsedLlmData.warnings)) {
            const wOverride = parsedLlmData.warnings.find((w: any) => Number(w.id) === originalIndex);
            if (wOverride) {
              if (wOverride.type === "obsolete") {
                baseAnalysis.isObsolete = true;
              }
              if (wOverride.msg) {
                baseAnalysis.notes = wOverride.msg;
              }
            }
          }
          return baseAnalysis;
        });

        const generalWarningsList: string[] = [];
        if (Array.isArray(parsedLlmData.general)) {
          generalWarningsList.push(...parsedLlmData.general);
        } else if (Array.isArray(parsedLlmData.generalWarnings)) {
          generalWarningsList.push(...parsedLlmData.generalWarnings);
        }

        // Add any pre-sorted deterministic warnings
        preSortedWarnings.forEach(w => {
          if (!generalWarningsList.includes(w)) {
            generalWarningsList.push(w);
          }
        });

        finalAnalysisList.forEach((a: any) => {
          if (a.isObsolete) {
            if (language === "it") {
              generalWarningsList.push(`Rilevata mod obsoleta: "${a.name}". Mod Fixer o moduli obsoleti non sono più necessari a partire dalla Patch 7+ e possono causare arresti anomali del gioco.`);
            } else {
              generalWarningsList.push(`Obsolete mod detected: "${a.name}". Mod Fixer or other obsolete modules are no longer required from Patch 7+ onwards and can cause game crashes.`);
            }
          }
        });

        // Add a warning message if repairs were performed
        if (repairCount > 0) {
          if (language === "it") {
            generalWarningsList.push(`Rilevate e riparate automaticamente ${repairCount} violazioni dei vincoli fisici dell'ordine di caricamento.`);
          } else {
            generalWarningsList.push(`Automatically repaired ${repairCount} load order constraint violations.`);
          }
        }

        setOrganizedXml(rebuildData.xml);
        setAnalysis(finalAnalysisList);
        setConfidence(deterministicScore);
        setReasoning(Array.isArray(parsedLlmData.reasoning) && parsedLlmData.reasoning.length > 0 ? parsedLlmData.reasoning : (language === "it" ? [
          "Moduli Core e Vanilla ordinati e protetti per evitare problemi di caricamento.",
          "Traduzioni ed estensioni d'interfaccia collocate nelle posizioni relative corrette.",
          "Compatibility Framework posizionato in coda all'elenco di caricamento."
        ] : [
          "Vanilla Core modules placed at the top and protected to prevent loading failures.",
          "Translations and UI expansions moved to correct relative positions.",
          "Compatibility Framework shifted to the absolute end of the load order."
        ]));
        
        const defaultWarnings = parsedLlmData.general || parsedLlmData.generalWarnings || [];
        setGeneralWarnings([
          language === "it"
            ? `Integrazione LM Studio: Analisi completata con successo usando il modello "${lmStudioModel}".`
            : `LM Studio Integration: Analysis successfully completed using model "${lmStudioModel}".`,
          ...defaultWarnings
        ]);

        const matchCount = xmlInput.match(/<node\s+id="ModuleShortDesc">/g)?.length || 0;
        setOriginalModCount(matchCount);

        setTimeout(() => {
          document.getElementById("output-section")?.scrollIntoView({ behavior: "smooth" });
        }, 250);

      } catch (err: any) {
        clearInterval(interval);
        clearInterval(timerInterval);
        const normalizedUrl = getNormalizedLmStudioUrl(lmStudioBaseUrl);
        const isIt = language === "it";
        setError(isIt 
          ? `Errore LM Studio: ${err.message}. Controlla che LM Studio sia attivo su ${normalizedUrl} con il server di rete locale e che le richieste CORS siano permesse.`
          : `LM Studio Error: ${err.message}. Verify that LM Studio is active on ${normalizedUrl} with the local network server enabled and CORS requests permitted.`
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // PATH 2: DEFAULT GEMINI CLOUD MODE
    try {
      const response = await fetch("/api/organize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          xml: xmlInput,
          communityDb: enableCommunityDb ? communityDb : [],
          language
        })
      });

      const data = await response.json();
      clearInterval(interval);
      clearInterval(timerInterval);

      if (!response.ok) {
        throw new Error(data.error || "Si è verificato un errore durante l'ordinamento.");
      }

      setOrganizedXml(data.xml);
      setAnalysis(data.analysis || []);
      setGeneralWarnings(data.generalWarnings || []);
      setConfidence(typeof data.confidence === "number" ? data.confidence : 0.96);
      setReasoning(Array.isArray(data.reasoning) && data.reasoning.length > 0 ? data.reasoning : (language === "it" ? [
        "Moduli Core e Vanilla ordinati e protetti per evitare problemi di caricamento.",
        "Traduzioni ed estensioni d'interfaccia collocate nelle posizioni relative corrette.",
        "Compatibility Framework posizionato in coda all'elenco di caricamento."
      ] : [
        "Vanilla Core modules placed at the top and protected to prevent loading failures.",
        "Translations and UI expansions moved to correct relative positions.",
        "Compatibility Framework shifted to the absolute end of the load order."
      ]));
      
      // Count mods in input XML
      const matchCount = xmlInput.match(/<node\s+id="ModuleShortDesc">/g)?.length || 0;
      setOriginalModCount(matchCount);

      // Scroll smoothly to output
      setTimeout(() => {
        document.getElementById("output-section")?.scrollIntoView({ behavior: "smooth" });
      }, 250);

    } catch (err: any) {
      clearInterval(interval);
      clearInterval(timerInterval);
      setError(err.message || "Errore di connessione al server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(organizedXml);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([organizedXml], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modsettings.lsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportDbJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (event.target?.result && typeof event.target.result === "string") {
            const parsed = JSON.parse(event.target.result);
            if (Array.isArray(parsed)) {
              const validated = parsed.filter(item => item.name && item.category);
              if (validated.length === 0) {
                throw new Error("Il file JSON non contiene record di mod validi.");
              }
              setCommunityDb(prev => {
                const merged = [...prev];
                validated.forEach((newMod: any) => {
                  const idx = merged.findIndex(m => 
                    (m.uuid && newMod.uuid && m.uuid.toLowerCase() === newMod.uuid.toLowerCase()) || 
                    (m.folder && newMod.folder && m.folder.toLowerCase() === newMod.folder.toLowerCase()) ||
                    m.name.toLowerCase() === newMod.name.toLowerCase()
                  );
                  if (idx !== -1) {
                    merged[idx] = { ...merged[idx], ...newMod };
                  } else {
                    merged.push({
                      id: newMod.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                      name: newMod.name,
                      uuid: newMod.uuid || "",
                      folder: newMod.folder || "",
                      category: newMod.category,
                      recommendedPosition: newMod.recommendedPosition || "middle",
                      requirements: newMod.requirements || [],
                      conflicts: newMod.conflicts || [],
                      latestVersion: newMod.latestVersion || "v1.0.0",
                      description: newMod.description || "",
                      notes: newMod.notes || "",
                      source: newMod.source || "Database Importato",
                      nexusUrl: newMod.nexusUrl || ""
                    });
                  }
                });
                return merged;
              });
              setDbImportSuccess(`Importate con successo ${validated.length} mod della community!`);
              setTimeout(() => setDbImportSuccess(null), 4000);
            } else {
              throw new Error("Il formato deve essere un array JSON.");
            }
          }
        } catch (err: any) {
          setError(`Errore durante l'importazione del database: ${err.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSyncDbUrl = async () => {
    if (!dbSyncUrl.trim()) return;
    try {
      setIsLoading(true);
      setLoadingStep("Sincronizzazione database della community...");
      const response = await fetch(dbSyncUrl);
      if (!response.ok) {
        throw new Error(`Risposta del server non valida: ${response.status}`);
      }
      const parsed = await response.json();
      if (Array.isArray(parsed)) {
        const validated = parsed.filter(item => item.name && item.category);
        if (validated.length === 0) {
          throw new Error("Il file JSON scaricato non contiene record di mod validi.");
        }
        setCommunityDb(prev => {
          const merged = [...prev];
          validated.forEach((newMod: any) => {
            const idx = merged.findIndex(m => 
              (m.uuid && newMod.uuid && m.uuid.toLowerCase() === newMod.uuid.toLowerCase()) || 
              (m.folder && newMod.folder && m.folder.toLowerCase() === newMod.folder.toLowerCase()) ||
              m.name.toLowerCase() === newMod.name.toLowerCase()
            );
            if (idx !== -1) {
              merged[idx] = { ...merged[idx], ...newMod };
            } else {
              merged.push({
                id: newMod.id || `remote-${Date.now()}`,
                name: newMod.name,
                uuid: newMod.uuid || "",
                folder: newMod.folder || "",
                category: newMod.category,
                recommendedPosition: newMod.recommendedPosition || "middle",
                requirements: newMod.requirements || [],
                conflicts: newMod.conflicts || [],
                latestVersion: newMod.latestVersion || "v1.0.0",
                description: newMod.description || "",
                notes: newMod.notes || "",
                source: newMod.source || "Database Remoto",
                nexusUrl: newMod.nexusUrl || ""
              });
            }
          });
          return merged;
        });
        setDbImportSuccess(`Sincronizzato con successo! Database aggiornato con ${validated.length} mod.`);
        setDbSyncUrl("");
        setTimeout(() => setDbImportSuccess(null), 4000);
      } else {
        throw new Error("Il database remoto deve essere un array JSON.");
      }
    } catch (err: any) {
      setError(`Errore di sincronizzazione URL: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportDbJson = () => {
    const blob = new Blob([JSON.stringify(communityDb, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bg3_community_database.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("core") || cat.includes("library") || cat.includes("librer") || cat.includes("module")) {
      return { bg: "bg-emerald-50 border border-emerald-600 text-emerald-800", font: "text-emerald-700" };
    }
    if (cat.includes("ui") || cat.includes("interfaccia")) {
      return { bg: "bg-sky-50 border border-sky-600 text-sky-800", font: "text-sky-700" };
    }
    if (cat.includes("gameplay") || cat.includes("mechanic") || cat.includes("cheat") || cat.includes("util")) {
      return { bg: "bg-purple-50 border border-purple-600 text-purple-800", font: "text-purple-700" };
    }
    if (cat.includes("class") || cat.includes("race") || cat.includes("razz")) {
      return { bg: "bg-amber-50 border border-amber-600 text-amber-800", font: "text-amber-700" };
    }
    if (cat.includes("aesthetic") || cat.includes("estet") || cat.includes("cosmetic") || cat.includes("visu")) {
      return { bg: "bg-pink-50 border border-pink-600 text-pink-800", font: "text-pink-700" };
    }
    if (cat.includes("patch") || cat.includes("fix") || cat.includes("overhaul")) {
      return { bg: "bg-blue-50 border border-blue-600 text-blue-800", font: "text-blue-700" };
    }
    if (cat.includes("translation") || cat.includes("traduz") || cat.includes("ita")) {
      return { bg: "bg-indigo-50 border border-indigo-600 text-indigo-800", font: "text-indigo-700" };
    }
    if (cat.includes("compatibility") || cat.includes("framework")) {
      return { bg: "bg-yellow-50 border border-yellow-600 text-yellow-800", font: "text-yellow-700" };
    }
    return { bg: "bg-slate-50 border border-slate-600 text-slate-800", font: "text-slate-700" };
  };

  const t = TRANSLATIONS[language];

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#E4E3E0] text-[#141414] p-4 sm:p-6 overflow-x-hidden selection:bg-[#141414] selection:text-white border-4 border-[#141414]">
      
      {/* High Density Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#141414] pb-4 mb-6 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase italic text-[#141414]">
            {t.appTitle}
          </h1>
          <p className="text-[10px] sm:text-xs font-mono opacity-60 tracking-widest uppercase mt-1">
            {t.appSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto shrink-0 justify-between md:justify-end">
          {/* Language Selector */}
          <div className="flex border-2 border-[#141414] bg-white text-xs font-mono font-bold divide-x-2 divide-[#141414] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]">
            <button 
              onClick={() => setLanguage("it")}
              className={`px-3 py-1.5 transition-colors uppercase flex items-center gap-1.5 ${language === "it" ? "bg-[#141414] text-white" : "hover:bg-slate-50 text-[#141414]"}`}
            >
              <span>🇮🇹</span> IT
            </button>
            <button 
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 transition-colors uppercase flex items-center gap-1.5 ${language === "en" ? "bg-[#141414] text-white" : "hover:bg-slate-50 text-[#141414]"}`}
            >
              <span>🇬🇧</span> EN
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleLoadSample}
              className="px-3.5 py-2 border border-[#141414] bg-white text-[#141414] hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              {t.loadSample}
            </button>
            {xmlInput && (
              <button 
                onClick={handleClear}
                className="px-3.5 py-2 border border-red-700 text-red-700 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                title={t.clear}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.clear}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-grow grid grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Input and trigger panel */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase bg-[#141414] text-white px-2 py-0.5 tracking-wider font-semibold">
              {t.rawXmlInput}
            </span>
            <span className="text-[10px] font-mono opacity-60">
              {xmlInput ? `${xmlInput.split('\n').length} ${t.rows}` : t.empty} | UTF-8
            </span>
          </div>

          {/* Textarea drop zone container */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col border border-[#141414] bg-white transition-all ${
              dragActive ? "ring-2 ring-amber-500 bg-amber-50/20" : ""
            }`}
          >
            {dragActive && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-4 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#141414] flex items-center justify-center mb-2 bg-[#E4E3E0]">
                  <Upload className="w-6 h-6 text-[#141414] animate-bounce" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-tight">{t.dropZoneText}</h3>
                <p className="text-[11px] font-mono opacity-60 mt-0.5">
                  {t.dropZoneSubText}
                </p>
              </div>
            )}

            {/* Main Raw XML Input Text Area */}
            <textarea
              value={xmlInput}
              onChange={(e) => {
                setXmlInput(e.target.value);
                setError(null);
              }}
              spellCheck={false}
              placeholder={`<?xml version="1.0" encoding="UTF-8"?>
<save>
  <!-- ${t.placeholderXml} -->
</save>`}
              className="w-full h-[400px] p-4 font-mono text-[11px] text-[#141414] placeholder-slate-400 focus:outline-none resize-none leading-tight border-none"
            />

            {/* Bottom bar of textarea container */}
            <div className="px-4 py-2 bg-[#F5F5F3] border-t border-[#141414] flex items-center justify-between text-xs font-mono text-[#141414]">
              <button 
                type="button" 
                onClick={triggerFileInput}
                className="flex items-center gap-1.5 hover:underline font-bold text-[10px] uppercase tracking-wider"
              >
                <Upload className="w-3 h-3 text-[#141414]" />
                {t.browseLocal}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".lsx,.xml,.txt" 
                className="hidden" 
              />
              <span className="text-[10px] opacity-70">
                {xmlInput ? `${xmlInput.length} ${t.characters}` : t.dragHere}
              </span>
            </div>
          </div>

          {/* XML Inspector & Token Reader Card */}
          <AnimatePresence>
            {xmlInput.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="border border-[#141414] bg-white p-4 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex flex-col gap-3"
              >
                <div className="flex justify-between items-center border-b border-[#141414] pb-1.5">
                  <h3 className="text-[#141414] font-extrabold text-[11px] flex items-center gap-2 uppercase tracking-widest">
                    <FileText className="w-3.5 h-3.5 text-[#141414]" />
                    {t.xmlInspector}
                  </h3>
                  <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-600 font-extrabold uppercase">
                    {xmlStats.modCount} {language === "it" ? "Mod Rilevate" : "Mods Detected"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-50 p-2 border border-[#141414]/10 flex flex-col justify-between min-h-[50px]">
                    <span className="text-[8px] font-mono uppercase text-slate-400">{language === "it" ? "Mod Attive" : "Active Mods"}</span>
                    <span className="text-xs font-extrabold text-[#141414] mt-0.5">{xmlStats.modCount}</span>
                  </div>
                  <div className="bg-slate-50 p-2 border border-[#141414]/10 flex flex-col justify-between min-h-[50px]">
                    <span className="text-[8px] font-mono uppercase text-slate-400">{t.totalLines}</span>
                    <span className="text-xs font-extrabold text-[#141414] mt-0.5">{xmlStats.lineCount}</span>
                  </div>
                  <div className="bg-slate-50 p-2 border border-[#141414]/10 flex flex-col justify-between min-h-[50px]">
                    <span className="text-[8px] font-mono uppercase text-slate-400">{language === "it" ? "Parole / Caratteri" : "Words / Chars"}</span>
                    <span className="text-[10px] font-extrabold text-[#141414] mt-1.5 leading-none">
                      {xmlStats.wordCount} / {xmlStats.charCount}
                    </span>
                  </div>
                  <div className="bg-[#141414] text-white p-2 border border-[#141414] flex flex-col justify-between min-h-[50px]">
                    <span className="text-[8px] font-mono uppercase text-slate-400">{language === "it" ? "Token Stimati" : "Estimated Tokens"}</span>
                    <span className="text-xs font-extrabold text-amber-400 mt-0.5">
                      ~{xmlStats.estimatedTokens.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Context Window Configurator & Visual Gauge */}
                <div className="bg-slate-50 p-2.5 border border-[#141414]/10 flex flex-col gap-1.5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                    <label className="text-[9px] font-mono uppercase font-bold text-[#141414]">
                      {t.contextWindowLimit}
                    </label>
                    <select
                      value={contextWindowSize}
                      onChange={(e) => setContextWindowSize(Number(e.target.value))}
                      className="px-1 py-0.5 border border-[#141414] text-[9px] font-mono bg-white focus:outline-none cursor-pointer font-bold"
                    >
                      <option value={2048}>2K {language === "it" ? "(Modelli vecchi)" : "(Older models)"}</option>
                      <option value={4096}>4K {language === "it" ? "(Llama 2 standard)" : "(Llama 2 standard)"}</option>
                      <option value={8192}>8K {language === "it" ? "(Llama 3 standard)" : "(Llama 3 standard)"}</option>
                      <option value={32768}>32K {language === "it" ? "(Qwen 2.5 default)" : "(Qwen 2.5 default)"}</option>
                      <option value={131072}>128K {language === "it" ? "(Gemini Flash / Qwen 2.5 128k)" : "(Gemini Flash / Qwen 2.5 128k)"}</option>
                    </select>
                  </div>

                  {/* Context Bar */}
                  {(() => {
                    const pct = Math.min(100, (xmlStats.estimatedTokens / contextWindowSize) * 100);
                    const isHigh = pct > 80;
                    return (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8.5px] font-mono">
                          <span className="text-slate-500">{t.memoryUsage}</span>
                          <span className={`font-bold ${isHigh ? "text-red-600" : "text-emerald-700"}`}>
                            {pct.toFixed(2)}% ({xmlStats.estimatedTokens} / {contextWindowSize} token)
                          </span>
                        </div>
                        <div className="w-full h-2.5 border border-[#141414] bg-white relative overflow-hidden">
                          <div 
                            className={`h-full border-r border-[#141414] transition-all duration-300 ${
                              isHigh ? "bg-red-500" : pct > 50 ? "bg-amber-400" : "bg-emerald-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {isHigh && (
                          <span className="text-[8.5px] text-red-600 font-sans leading-tight flex items-start gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            {t.tokenWarningText}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* List of Detected Mods */}
                {xmlStats.detectedMods.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono uppercase font-bold text-[#141414]/80">
                      {t.detectedModsInFile}
                    </span>
                    <div className="max-h-[110px] overflow-y-auto border border-[#141414] divide-y divide-[#141414]/10 text-[9px] font-mono bg-slate-50">
                      {xmlStats.detectedMods.map((mod, index) => (
                        <div key={index} className="p-1 flex items-start justify-between gap-4 hover:bg-slate-100">
                          <div className="truncate flex-grow">
                            <strong className="text-black font-extrabold">{mod.name}</strong>
                            <span className="text-slate-400 block text-[7.5px] mt-0.5 truncate">
                              {language === "it" ? "Cartella" : "Folder"}: <span className="text-slate-600">{mod.folder}</span>
                            </span>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-slate-400 block text-[7.5px] tracking-tight">UUID: {mod.uuid.slice(0, 8)}...</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Alert Panel */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3 bg-red-50 border border-red-700 text-red-900 text-xs flex items-start gap-2.5 font-mono"
              >
                <AlertOctagon className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block uppercase tracking-tight">ANALYSIS ERROR</span>
                  <span className="text-[11px] block mt-1 leading-normal">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Generation Progress Panel */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="border-2 border-[#141414] bg-white p-4 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex flex-col gap-4"
              >
                {/* Header Row */}
                <div className="flex justify-between items-center border-b border-[#141414] pb-2.5">
                  <h3 className="text-[#141414] font-extrabold text-[11px] flex items-center gap-2 uppercase tracking-widest">
                    <Activity className="w-4 h-4 text-amber-500 animate-spin" />
                    {t.processingLoadOrder}
                  </h3>
                  <div className="flex items-center gap-1.5 bg-[#141414] text-white px-2 py-1 border border-[#141414] text-[9px] font-mono font-bold uppercase">
                    <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>{t.timeText}: {(() => {
                      const m = Math.floor(elapsedSeconds / 60);
                      const s = elapsedSeconds % 60;
                      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
                    })()}</span>
                  </div>
                </div>

                {/* Progress Bar & Percentage Gauge */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-[#141414]/70 uppercase font-bold">{t.estimatedProgressText}</span>
                    <span className="font-extrabold text-amber-600">{Math.round(simulatedProgress)}%</span>
                  </div>
                  <div className="w-full h-4 border-2 border-[#141414] bg-slate-100 relative overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 border-r-2 border-[#141414] transition-all duration-300"
                      style={{ width: `${simulatedProgress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold uppercase tracking-widest text-[#141414]">
                      {loadingStep}
                    </div>
                  </div>
                </div>

                {/* Checklist Milestones */}
                <div className="bg-slate-50 p-2.5 border border-[#141414]/15 flex flex-col gap-2 text-[10px] font-mono">
                  <span className="text-[8.5px] uppercase font-bold text-slate-500 tracking-wider">{t.processingMilestones}</span>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#141414]" />
                      {t.milestone1}
                    </span>
                    <span className="text-[9px] font-extrabold text-emerald-700 font-mono">{t.completedText}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#141414]" />
                      {t.milestone2}
                    </span>
                    <span className="text-[9px] font-extrabold text-emerald-700 font-mono">{t.completedText}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#141414]" />
                      {aiProvider === "lmstudio" ? t.milestone3 : t.milestone3_gemini}
                    </span>
                    <span className={`text-[9px] font-extrabold font-mono ${elapsedSeconds >= 8 ? "text-emerald-700" : "text-amber-600 animate-pulse"}`}>
                      {elapsedSeconds >= 8 ? t.sentText : t.inProgressText}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#141414]" />
                      {t.milestone4}
                    </span>
                    <span className={`text-[9px] font-extrabold font-mono ${
                      elapsedSeconds >= 50 
                        ? "text-emerald-700" 
                        : elapsedSeconds >= 15 
                          ? "text-amber-600 animate-pulse" 
                          : "text-slate-400"
                    }`}>
                      {elapsedSeconds >= 50 ? t.completedText : elapsedSeconds >= 15 ? t.inProgressText : t.waitingText}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#141414]" />
                      {t.milestone5}
                    </span>
                    <span className={`text-[9px] font-extrabold font-mono ${
                      elapsedSeconds >= 110 
                        ? "text-amber-600 animate-pulse" 
                        : elapsedSeconds >= 50 
                          ? "text-slate-700 animate-pulse" 
                          : "text-slate-400"
                    }`}>
                      {elapsedSeconds >= 110 ? t.compilingResults : elapsedSeconds >= 50 ? t.generationActive : t.waitingText}
                    </span>
                  </div>
                </div>

                {/* Heavy Model Warning Section */}
                {aiProvider === "lmstudio" && (
                  <div className="bg-amber-50 p-2.5 border border-amber-500/30 text-[9px] text-amber-900 leading-relaxed font-sans">
                    <div className="flex items-center gap-1 mb-1 font-bold text-amber-800 uppercase tracking-tight">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{t.heavyModelWarningTitle}</span>
                    </div>
                    {t.heavyModelWarningDesc}
                  </div>
                )}

                {/* Console Terminal Log Box */}
                <div className="flex flex-col gap-1">
                  <span className="text-[8.5px] uppercase font-bold text-slate-500 tracking-wider">{t.systemLogTitle}</span>
                  <div className="bg-[#141414] text-[#39FF14] p-3 rounded-none font-mono text-[9px] h-[110px] overflow-y-auto select-text leading-tight flex flex-col gap-1 border-2 border-[#141414]">
                    {liveLogs.map((log, index) => (
                      <div key={index} className="opacity-90 hover:opacity-100 transition-opacity">
                        {log}
                      </div>
                    ))}
                    <div className="animate-pulse text-amber-400 font-bold">&gt; IN ATTESA DEL COMPILATORE...</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Organizing Main Button */}
          <button
            onClick={handleOrganize}
            disabled={isLoading || !xmlInput.trim()}
            className={`w-full py-3 px-4 border-2 border-[#141414] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isLoading 
                ? "bg-[#141414]/20 text-[#141414] cursor-not-allowed" 
                : !xmlInput.trim()
                  ? "bg-transparent text-[#141414]/40 border-[#141414]/40 cursor-not-allowed"
                  : "bg-[#141414] text-white hover:bg-opacity-90 active:scale-[0.99] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
            }`}
          >
            {isLoading ? (
              <>
                <Activity className="w-4 h-4 animate-spin text-white" />
                <span className="animate-pulse">{loadingStep.toUpperCase()}</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4 text-white" />
                <span>{t.organizeButtonText}</span>
              </>
            )}
          </button>
        </section>

        {/* Right Column: Rules & Guidelines */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-5">
          
          {/* Card: AI Engine Configuration */}
          <div className="border border-[#141414] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#141414] pb-2">
              <h3 className="text-[#141414] font-extrabold text-xs flex items-center gap-2 uppercase tracking-widest">
                <Cpu className="w-3.5 h-3.5 text-[#141414]" />
                {t.lmStudioHeader}
              </h3>
              <span className="text-[10px] font-mono bg-[#141414] text-white px-2 py-0.5 tracking-tight font-bold uppercase">
                {language === "it" ? "LM Studio Locale" : "LM Studio Local"}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
              {t.lmStudioIntro}
            </p>

            {/* LM Studio configuration fields */}
            <AnimatePresence>
              {aiProvider === "lmstudio" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-3 overflow-hidden border-t border-[#141414]/10 pt-3"
                >
                  {/* Tipo di connessione selector */}
                  <div className="flex flex-col gap-1.5 bg-slate-50 p-2 border border-[#141414]/10">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#141414]">
                      {t.connectionMethod}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLmConnectionMode("browser");
                          setAvailableLmModels([]);
                        }}
                        className={`py-1.5 px-2 border border-[#141414] text-[9px] font-extrabold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          lmConnectionMode === "browser"
                            ? "bg-[#141414] text-white"
                            : "bg-white text-[#141414] hover:bg-slate-100"
                        }`}
                      >
                        {t.directBrowser}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLmConnectionMode("proxy");
                          setAvailableLmModels([]);
                        }}
                        className={`py-1.5 px-2 border border-[#141414] text-[9px] font-extrabold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          lmConnectionMode === "proxy"
                            ? "bg-[#141414] text-white"
                            : "bg-white text-[#141414] hover:bg-slate-100"
                        }`}
                      >
                        {t.proxyServer}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 font-sans leading-tight mt-0.5">
                      {lmConnectionMode === "browser"
                        ? t.connectionMethodHelpBrowser
                        : t.connectionMethodHelpProxy
                      }
                    </p>
                  </div>

                  {/* Endpoint URL input */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono uppercase font-bold text-[#141414]/70">
                        {t.localApiEndpoint}
                      </label>
                      <span className="text-[9px] text-emerald-600 font-mono italic">
                        {t.autoNormalize}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={lmStudioBaseUrl}
                      onChange={(e) => setLmStudioBaseUrl(e.target.value)}
                      placeholder="http://localhost:1234/v1"
                      className="w-full px-2 py-1.5 border border-[#141414] text-[10px] font-mono focus:outline-none"
                    />
                    <div className="text-[9px] font-mono text-slate-400">
                      {t.resolvedUrl} <span className="font-bold text-slate-600">{getNormalizedLmStudioUrl(lmStudioBaseUrl)}</span>
                    </div>
                  </div>

                  {/* API Key (Optional) and Models row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-[#141414]/70">
                        {t.apiKeyOptional}
                      </label>
                      <input
                        type="password"
                        value={lmStudioApiKey}
                        onChange={(e) => setLmStudioApiKey(e.target.value)}
                        placeholder="lm-studio"
                        className="w-full px-2 py-1.5 border border-[#141414] text-[10px] font-mono focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-[#141414]/70 flex items-center justify-between">
                        {t.selectedModel}
                      </label>
                      <input
                        type="text"
                        value={lmStudioModel}
                        onChange={(e) => setLmStudioModel(e.target.value)}
                        placeholder="Nome del modello"
                        className="w-full px-2 py-1.5 border border-[#141414] text-[10px] font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fetch Models Button & Dropdown */}
                  <div className="flex gap-2">
                    {availableLmModels.length > 0 ? (
                      <select
                        value={lmStudioModel}
                        onChange={(e) => setLmStudioModel(e.target.value)}
                        className="flex-grow px-2 py-1.5 border border-[#141414] text-[10px] font-mono bg-white focus:outline-none"
                      >
                        {availableLmModels.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex-grow px-2 py-1.5 border border-[#141414]/40 text-[10px] font-mono text-slate-400 italic bg-slate-50 flex items-center">
                        {t.noModelLoaded}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={fetchLmModels}
                      disabled={isFetchingModels}
                      className="px-3 py-1.5 bg-[#141414] text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isFetchingModels ? "animate-spin" : ""}`} />
                      <span>{isFetchingModels ? t.modelsLoading : t.fetchModelsButton}</span>
                    </button>
                  </div>

                  {/* Settings tips list */}
                  <div className="bg-[#F5F5F3] p-2.5 border border-[#141414]/10 text-[9.5px] font-mono text-slate-600 space-y-2">
                    <span className="font-bold text-black uppercase tracking-tight block">{t.howToSetupTitle}</span>
                    <p>{t.howToSetupStep1}<strong className="text-[#141414]">{t.howToSetupStep1_2}</strong> (icona <Cpu className="inline w-3 h-3" /> o Sliders).</p>
                    <p>{t.howToSetupStep2}</p>
                    <p>{t.howToSetupStep3}</p>
                    
                    <div className="border-t border-[#141414]/10 pt-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowConnectionHelp(!showConnectionHelp)}
                        className="w-full py-1 px-2 border border-[#141414] bg-white text-[#141414] hover:bg-slate-50 text-[8.5px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>{showConnectionHelp ? t.connectionHelpButtonTextHide : t.connectionHelpButtonTextShow}</span>
                      </button>

                      <AnimatePresence>
                        {showConnectionHelp && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden flex flex-col gap-2 mt-2 text-[9px] text-slate-700 leading-snug border-l-2 border-amber-500 pl-2 pt-1"
                          >
                            <p className="font-bold text-amber-800 uppercase tracking-tight">{t.errorFaqTitle}</p>
                            <p>
                              {t.errorFaqDesc}
                            </p>
                            
                            <p className="font-bold text-slate-900 uppercase tracking-tight mt-1">{t.solATitle}</p>
                            <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1">
                              <li>{t.solAStep1}</li>
                              <li>{t.solAStep2}</li>
                              <li>{t.solAStep3}</li>
                              <li>{t.solAStep4}</li>
                              <li>{t.solAStep5}</li>
                            </ol>

                            <p className="font-bold text-slate-900 uppercase tracking-tight mt-1">{t.solBTitle}</p>
                            <p>
                              {t.solBDesc}
                            </p>
                            <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1">
                              <li>{t.solBStep1}</li>
                              <li>{t.solBStep2}</li>
                              <li>{t.solBStep3}</li>
                              <li>{t.solBStep4}</li>
                            </ol>

                            <p className="font-bold text-slate-900 uppercase tracking-tight mt-1">{t.solCTitle}</p>
                            <p>
                              {t.solCDesc}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          


          {/* Card: Community Mod Database Panel */}
          <div className="border border-[#141414] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#141414] pb-2">
              <h3 className="text-[#141414] font-extrabold text-xs flex items-center gap-2 uppercase tracking-widest">
                <Database className="w-3.5 h-3.5 text-[#141414]" />
                {t.communityDbTitle}
              </h3>
              <span className="text-[10px] font-mono bg-[#141414] text-white px-2 py-0.5 tracking-tight font-bold uppercase">
                {communityDb.length} Mod
              </span>
            </div>

            {/* Toggle Switch to Enable/Disable DB Integration */}
            <div className="flex items-center justify-between p-2 bg-[#F5F5F3] border border-[#141414]/20 text-xs font-mono">
              <span className="font-bold uppercase tracking-tight text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#141414]" />
                {t.activeIntegration}
              </span>
              <button
                onClick={() => setEnableCommunityDb(!enableCommunityDb)}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                  enableCommunityDb 
                    ? "bg-[#141414] text-white border-[#141414]" 
                    : "bg-white text-slate-400 border-slate-300"
                }`}
              >
                {enableCommunityDb 
                  ? (language === "it" ? "ATTIVA" : "ACTIVE") 
                  : (language === "it" ? "DISATTIVA" : "INACTIVE")}
              </button>
            </div>

            {/* Search local DB input */}
            <div className="relative">
              <input
                type="text"
                value={searchDbQuery}
                onChange={(e) => setSearchDbQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 border border-[#141414] text-xs font-mono placeholder-slate-400 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Render matched search results or fallback list */}
            <div className="max-h-[220px] overflow-y-auto divide-y divide-gray-100 border border-[#141414]/10 pr-1">
              {communityDb
                .filter(item => {
                  if (!searchDbQuery.trim()) return true; // show all
                  const q = searchDbQuery.toLowerCase();
                  return (
                    item.name.toLowerCase().includes(q) ||
                    item.folder.toLowerCase().includes(q) ||
                    (item.uuid && item.uuid.toLowerCase().includes(q)) ||
                    item.category.toLowerCase().includes(q)
                  );
                })
                .map((mod) => (
                  <div key={mod.id} className="py-2 text-[11px] leading-snug flex flex-col gap-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <strong className="text-black font-bold font-sans flex items-center gap-1.5">
                        {mod.name}
                        <span className="text-[9px] text-slate-400 font-mono">({mod.latestVersion})</span>
                      </strong>
                      <span className="text-[9px] font-mono uppercase bg-[#141414]/5 text-slate-600 px-1 border border-slate-300">
                        {mod.category}
                      </span>
                    </div>
                    {mod.description && (
                      <p className="text-slate-500 font-sans text-[10.5px]">
                        {mod.description}
                      </p>
                    )}
                    <div className="flex flex-col gap-0.5 mt-1 bg-slate-50 p-1 border-l-2 border-slate-300 text-[10px] font-mono">
                      {mod.requirements.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-700">{t.requirements}:</span> {mod.requirements.join(", ")}
                        </div>
                      )}
                      {mod.conflicts.length > 0 && (
                        <div>
                          <span className="font-bold text-red-700">{t.conflicts}:</span> {mod.conflicts.join(", ")}
                        </div>
                      )}
                      {mod.notes && (
                        <div>
                          <span className="font-bold text-slate-700">{t.adviceLabel}:</span> {mod.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {communityDb.filter(item => {
                if (!searchDbQuery.trim()) return true;
                const q = searchDbQuery.toLowerCase();
                return (
                  item.name.toLowerCase().includes(q) ||
                  item.folder.toLowerCase().includes(q) ||
                  (item.uuid && item.uuid.toLowerCase().includes(q)) ||
                  item.category.toLowerCase().includes(q)
                );
              }).length === 0 && (
                <div className="p-4 text-center text-slate-400 italic text-[10.5px] font-mono">
                  {t.noModsInDb}
                </div>
              )}
            </div>

            {/* Custom Database Sync / Upload Actions */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-[#141414]/10">
              <span className="text-[10px] font-mono uppercase font-bold text-[#141414]/70">
                {language === "it" ? "Importa / Sincronizza Database" : "Import / Sync Database"}
              </span>
              
              {/* Remote Sync Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dbSyncUrl}
                  onChange={(e) => setDbSyncUrl(e.target.value)}
                  placeholder={t.dbSyncPlaceholder}
                  className="flex-grow px-2 py-1.5 border border-[#141414] text-[10px] font-mono focus:outline-none"
                />
                <button
                  onClick={handleSyncDbUrl}
                  disabled={!dbSyncUrl.trim()}
                  className="px-3 py-1 bg-[#141414] text-white hover:bg-opacity-90 disabled:opacity-30 disabled:pointer-events-none text-[10px] font-bold uppercase transition-all"
                  title={t.syncDbUrl}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Local JSON Import and Export Row */}
              <div className="flex gap-2">
                <button
                  onClick={() => dbJsonInputRef.current?.click()}
                  className="flex-1 py-1.5 border border-[#141414] hover:bg-[#141414] hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {t.importCustomJson}
                </button>
                <input
                  type="file"
                  ref={dbJsonInputRef}
                  onChange={handleImportDbJson}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={handleExportDbJson}
                  className="py-1.5 px-3 border border-[#141414] hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title={language === "it" ? "Esporta DB come JSON" : "Export DB as JSON"}
                >
                  <FileDown className="w-3.5 h-3.5 text-[#141414]" />
                  {t.exportDbJson}
                </button>
              </div>

              {/* Import/Sync success message */}
              <AnimatePresence>
                {dbImportSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2 bg-emerald-50 border border-emerald-600 text-emerald-900 text-[10.5px] font-mono"
                  >
                    {dbImportSuccess}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick path directory lookup */}
          <div className="border border-[#141414] bg-[#F5F5F3] p-4 text-[11px] leading-relaxed">
            <span className="font-bold text-[#141414] uppercase tracking-wider block mb-1">{t.fileLocationTitle}</span>
            {t.fileLocationDesc}
            <code className="block p-2 bg-white rounded-none border border-[#141414] font-mono text-[10px] mt-2 text-[#141414] break-all select-all font-semibold">
              %LocalAppData%\Larian Studios\Baldur's Gate 3\PlayerProfiles\Public\modsettings.lsx
            </code>
          </div>

        </section>
      </div>

      {/* Output Results Section */}
      <div id="output-section" className="mt-8 pt-8 border-t-2 border-[#141414] scroll-mt-6">
        <AnimatePresence mode="wait">
          {!organizedXml ? (
            // Empty State
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-[#141414] text-center"
            >
              <div className="w-12 h-12 rounded-none bg-[#E4E3E0] border border-[#141414] flex items-center justify-center mb-3">
                <ListOrdered className="w-5 h-5 text-[#141414]" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#141414]">{language === "it" ? "Nessun Output Compilato" : "No Compiled Output"}</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-sm font-mono leading-relaxed">
                {language === "it" 
                  ? 'Incolla il codice XML a sinistra e premi su "Organizza Mod" per caricare l\'interfaccia interattiva dell\'ordine di caricamento.'
                  : 'Paste your XML code on the left and click "Run Linter & Optimize" to load the interactive load order.'}
              </p>
            </motion.div>
          ) : (
            // Results State
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              
              {/* Executive Status Banner */}
              <div className="border border-[#141414] bg-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#141414]"></div>
                <div>
                  <h2 className="text-lg font-black uppercase italic tracking-tight text-[#141414] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-700" />
                    {language === "it" ? "Compilazione Completata" : "Compilation Completed"}
                  </h2>
                  <p className="text-[10.5px] font-mono text-slate-500 mt-1">
                    {language === "it" 
                      ? <>Il file modsettings.lsx è stato riorganizzato specularmente con <strong className="text-black">{analysis.length} moduli</strong> registrati in sequenza.</>
                      : <>The modsettings.lsx file has been structurally reorganized with <strong className="text-black">{analysis.length} modules</strong> registered in sequence.</>}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
                  <button
                    onClick={handleDownload}
                    className="flex-1 md:flex-none py-2.5 px-4 bg-[#141414] text-white hover:bg-opacity-90 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                  >
                    <Download className="w-4 h-4 text-white" />
                    {t.downloadXml}
                  </button>
                  
                  <button
                    onClick={handleCopyToClipboard}
                    className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-[#141414] text-[#141414] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-700" />
                        {t.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t.copyXml}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Confidence & Reasoning Panel */}
              {confidence !== null && (
                <div className="border border-[#141414] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch relative">
                  <div className="md:col-span-4 flex flex-col justify-center items-center p-4 bg-slate-50 border border-[#141414]/10 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold mb-2">
                      {language === "it" ? "Punteggio di Confidenza" : "Confidence Score"}
                    </span>
                    <div className="relative flex items-center justify-center">
                      <span className="text-4xl font-extrabold font-mono text-[#141414]">
                        {Math.round(confidence * 100)}%
                      </span>
                    </div>
                    {/* Progress Bar of confidence */}
                    <div className="w-full max-w-[150px] h-2 border border-[#141414] bg-white mt-3 relative overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-2">
                      {confidence > 0.9 
                        ? (language === "it" ? "Ottimizzazione Altamente Affidabile" : "Highly Reliable Optimization")
                        : (language === "it" ? "Ottimizzazione Standard" : "Standard Optimization")}
                    </span>
                  </div>

                  <div className="md:col-span-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141414] flex items-center gap-1.5 border-b border-[#141414]/10 pb-2 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {language === "it" ? "Motivazioni di Ordinamento" : "Sorting Justifications"}
                      </h3>
                      {reasoning.length > 0 ? (
                        <ul className="space-y-2 text-[11px] font-sans text-slate-700 leading-relaxed list-none pl-0">
                          {reasoning.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#141414] text-white text-[9px] font-mono shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] font-mono text-slate-400 italic">
                          {language === "it" ? "Nessuna motivazione fornita dal modello." : "No justifications provided by the model."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Warning diagnostics */}
              {generalWarnings.length > 0 && (
                <div className="border border-red-700 bg-red-50 p-4 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider font-mono">
                    <ShieldAlert className="w-4.5 h-4.5 text-red-700" />
                    <span>{language === "it" ? `Avvisi di diagnostica (${generalWarnings.length} anomalie)` : `Diagnostic Alerts (${generalWarnings.length} anomalies)`}</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] font-mono text-red-900 leading-normal pl-4 list-disc">
                    {generalWarnings.map((warning, idx) => (
                      <li key={idx}>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tabs list container */}
              <div className="flex border-b border-[#141414] gap-2">
                <button
                  onClick={() => setActiveTab("list")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-t border-x border-transparent relative -bottom-[1px] cursor-pointer ${
                    activeTab === "list" 
                      ? "bg-white border-[#141414] text-[#141414] border-b-white z-10 font-black" 
                      : "text-slate-500 hover:text-[#141414]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5" />
                    {t.tabActiveMods} ({analysis.length})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("xml")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-t border-x border-transparent relative -bottom-[1px] cursor-pointer ${
                    activeTab === "xml" 
                      ? "bg-white border-[#141414] text-[#141414] border-b-white z-10 font-black" 
                      : "text-slate-500 hover:text-[#141414]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    {t.tabSortedXml}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("diff")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-t border-x border-transparent relative -bottom-[1px] cursor-pointer ${
                    activeTab === "diff" 
                      ? "bg-white border-[#141414] text-[#141414] border-b-white z-10 font-black" 
                      : "text-slate-500 hover:text-[#141414]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    {t.tabXmlDiff}
                  </span>
                </button>
              </div>

              {/* Tab Contents Panel */}
              <div className="border border-[#141414] bg-white p-4">
                
                {activeTab === "list" && (
                  <div className="flex flex-col">
                    
                    {/* Gridded List Header for High Density Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-3 p-2.5 border-b border-[#141414] bg-[#F5F5F3] text-[10px] font-mono font-bold uppercase tracking-wider text-[#141414]">
                      <div className="col-span-1">{language === "it" ? "Ordine" : "Order"}</div>
                      <div className="col-span-4">{t.modName}</div>
                      <div className="col-span-3">{language === "it" ? "Categoria" : "Category"}</div>
                      <div className="col-span-4">{language === "it" ? "Stato Nexus Mods / Note" : "Nexus Mods Status / Notes"}</div>
                    </div>

                    {/* Gridded List Rows */}
                    <div className="flex flex-col divide-y divide-gray-200">
                      {analysis.map((mod, index) => {
                        const style = getCategoryColor(mod.category);
                        return (
                          <div
                            key={mod.uuid}
                            className={`p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-start transition-all hover:bg-yellow-50/40 ${
                              mod.isObsolete 
                                ? "bg-red-50/70" 
                                : mod.conflicts.length > 0
                                  ? "bg-amber-50/50"
                                  : ""
                            }`}
                          >
                            {/* Ordine Index Column */}
                            <div className="col-span-1 flex items-center md:justify-start gap-2">
                              <span className="font-mono text-xs font-bold text-[#141414] opacity-40">
                                {String(index).padStart(3, "0")}
                              </span>
                              <span className="md:hidden text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-none font-mono bg-[#141414] text-white">
                                {mod.category}
                              </span>
                            </div>

                            {/* Name & Basic Desc Column */}
                            <div className="col-span-4 flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-sm text-[#141414] tracking-tight">
                                  {mod.name}
                                </h4>
                                {mod.isObsolete && (
                                  <span className="text-[9px] font-bold bg-red-700 text-white px-1.5 py-0.5 font-mono uppercase tracking-wide">
                                    {t.isObsolete}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 leading-normal">
                                {mod.description || (language === "it" ? "Nessuna descrizione recuperata tramite Nexus Mods. Modulo locale." : "No description retrieved via Nexus Mods. Local module.")}
                              </p>
                              
                              <div className="text-[9.5px] font-mono text-slate-400 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                                <span>UUID: <code className="text-slate-600 select-all font-semibold">{mod.uuid}</code></span>
                                {mod.folder && (
                                  <span>{language === "it" ? "Cartella" : "Folder"}: <code className="text-slate-600">{mod.folder}</code></span>
                                )}
                              </div>
                            </div>

                            {/* Category column */}
                            <div className="col-span-3 hidden md:flex items-start">
                              <span className={`text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-none font-mono ${style.bg}`}>
                                {mod.category}
                              </span>
                            </div>

                            {/* Nexus status, Requirements & Conflicts column */}
                            <div className="col-span-4 flex flex-col gap-1.5 text-[11px]">
                              
                              {/* Requirements indicator */}
                              {mod.requirements.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                                  <span className="font-bold uppercase tracking-tight text-slate-700">{t.requirements}:</span>
                                  {mod.requirements.map((req, i) => (
                                    <span key={i} className="bg-[#141414] text-white px-1.5 py-0.2 font-mono text-[9px]">
                                      {req}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Conflicts indicator */}
                              {mod.conflicts.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 text-[10px] text-red-800">
                                  <span className="font-bold uppercase tracking-tight text-red-700">{t.conflicts}:</span>
                                  {mod.conflicts.map((conf, i) => (
                                    <span key={i} className="bg-red-100 border border-red-300 text-red-800 px-1.5 py-0.2 font-mono text-[9px]">
                                      {conf}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Nexus Mods links & notes */}
                              <div className="flex flex-wrap items-center gap-2">
                                {mod.nexusUrl ? (
                                  <a
                                    href={mod.nexusUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 py-0.5 px-1.5 bg-[#F5F5F3] hover:bg-[#141414] hover:text-white border border-[#141414] text-[#141414] text-[10px] font-bold font-mono uppercase transition-all"
                                  >
                                    Nexus Mods
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                ) : (
                                  <span className="text-[10px] font-mono text-slate-400 italic">No Link</span>
                                )}

                                {mod.notes && (
                                  <span className="text-[10px] text-slate-500 italic font-sans leading-tight">
                                    💡 {mod.notes}
                                  </span>
                                )}
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "xml" && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-[#141414] pb-2">
                      <span>modsettings.lsx ({language === "it" ? "Riorganizzato & Validato" : "Reorganized & Validated"})</span>
                      <button
                        onClick={handleCopyToClipboard}
                        className="font-bold uppercase text-[#141414] hover:underline"
                      >
                        {isCopied ? t.copied : (language === "it" ? "Copia file negli appunti" : "Copy file to clipboard")}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-50 border border-[#141414] text-[10.5px] font-mono leading-tight text-slate-700 overflow-x-auto max-h-[550px]">
                      <code>{organizedXml}</code>
                    </pre>
                  </div>
                )}

                {activeTab === "diff" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase font-bold text-red-700">
                        {language === "it" 
                          ? `[X] File Iniziale Disordinato (${originalModCount} moduli)`
                          : `[X] Initial Unsorted File (${originalModCount} modules)`}
                      </span>
                      <pre className="p-3 bg-[#F5F5F3] border border-[#141414] text-[9.5px] font-mono leading-tight text-slate-500 overflow-x-auto max-h-[400px]">
                        <code>{xmlInput}</code>
                      </pre>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-700">
                        {language === "it"
                          ? `[✓] File Finale Organizzato (${analysis.length} moduli)`
                          : `[✓] Final Organized File (${analysis.length} modules)`}
                      </span>
                      <pre className="p-3 bg-white border border-[#141414] text-[9.5px] font-mono leading-tight text-[#141414] overflow-x-auto max-h-[400px]">
                        <code>{organizedXml}</code>
                      </pre>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sub-Footer / System Info */}
      <footer className="mt-12 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono border-t border-[#141414] pt-4 gap-2 text-[#141414]/60">
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          <span>NEXUS_API: CONNECTED (OK)</span>
          <span>{language === "it" ? "DB_SYNC: ATTIVO" : "DB_SYNC: ACTIVE"}</span>
          <span>LICENSE: MIT</span>
        </div>
        <div className="uppercase italic text-center sm:text-right">
          {language === "it" 
            ? "Ordinamento automatico basato sullo standard di gioco per Baldur's Gate 3"
            : "Automatic load ordering based on the Baldur's Gate 3 game standard"}
        </div>
      </footer>

    </div>
  );
}
