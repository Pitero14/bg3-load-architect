export interface CommunityMod {
  id: string;
  name: string;
  uuid: string;
  folder: string;
  category: string;
  recommendedPosition?: "top" | "middle" | "bottom" | "after_parent";
  parentUuid?: string;
  requirements: string[];
  conflicts: string[];
  latestVersion: string;
  description: string;
  notes: string;
  source: string;
  nexusUrl: string;
}

export const DEFAULT_COMMUNITY_DB: CommunityMod[] = [
  {
    id: "improvedui",
    name: "ImprovedUI",
    uuid: "cb555efe-2d9e-131f-8195-a89329d218ea",
    folder: "ImprovedUI",
    category: "UI",
    recommendedPosition: "top",
    requirements: ["Norbyte Script Extender"],
    conflicts: ["Old UI Overhauls (Legacy)"],
    latestVersion: "v3.12.0",
    description: "Migliora l'interfaccia utente del gioco, abilitando il supporto per l'aggiunta di icone personalizzate, razze e classi aggiuntive nel menu di creazione.",
    notes: "Assicurati di caricare ImprovedUI Assets separatamente se richiesto dal gioco. Altamente raccomandato per Patch 7+.",
    source: "BG3 Modding Community",
    nexusUrl: "https://www.nexusmods.com/baldursgate3/mods/366"
  },
  {
    id: "bg3mcm",
    name: "Mod Configuration Menu (BG3MCM)",
    uuid: "755a8a72-407f-4f0d-9a33-274ac0f0b53d",
    folder: "BG3MCM",
    category: "Core / Library",
    recommendedPosition: "top",
    requirements: ["Norbyte Script Extender"],
    conflicts: [],
    latestVersion: "v1.5.2",
    description: "Fornisce un'interfaccia grafica per configurare dinamicamente i parametri di altre mod dal menu principale o in-game.",
    notes: "Deve caricare subito dopo i moduli vanilla Core. Richiede lo Script Extender installato.",
    source: "Nexus Community Wiki",
    nexusUrl: "https://www.nexusmods.com/baldursgate3/mods/141"
  },
  {
    id: "compatibilityframework",
    name: "Compatibility Framework",
    uuid: "ca620881-abcd-ef01-2345-466208810128",
    folder: "CompatibilityFramework",
    category: "Compatibility Framework",
    recommendedPosition: "bottom",
    requirements: ["Community Library"],
    conflicts: [],
    latestVersion: "v2.0.4",
    description: "Consente l'integrazione fluida di mod di classi e sottoclassi diverse, prevenendo conflitti di caricamento e registrazioni sovrapposte.",
    notes: "DEVE essere posizionato all'ultimo posto assoluto della lista modsettings.lsx.",
    source: "BG3 Modding Community",
    nexusUrl: "https://www.nexusmods.com/baldursgate3/mods/3093"
  },
  {
    id: "partylimitbegone",
    name: "Party Limit Begone",
    uuid: "5b5ad5b6-ce37-4a63-8dea-a1fee4cee156",
    folder: "EasyCheat",
    category: "Gameplay",
    recommendedPosition: "middle",
    requirements: [],
    conflicts: ["Other Party Sizers"],
    latestVersion: "v1.6.0",
    description: "Rimuove il limite massimo del party consentendo fino a 16 compagni in multiplayer e singleplayer.",
    notes: "Funziona perfettamente con Patch 7. Alcune cutscene potrebbero richiedere di ridurre temporaneamente il numero di compagni.",
    source: "BG3 Wiki Modlist",
    nexusUrl: "https://www.nexusmods.com/baldursgate3/mods/327"
  },
  {
    id: "tavshairsalon",
    name: "Tav's Hair Salon",
    uuid: "e6f981ff-12a8-48b6-b183-ab321f928e44",
    folder: "TavsHairSalon",
    category: "Aesthetics",
    recommendedPosition: "middle",
    requirements: ["ImprovedUI"],
    conflicts: [],
    latestVersion: "v2.3",
    description: "Aggiunge dozzine di acconciature personalizzate per umani, elfi, mezzelfi, tiefling e drow.",
    notes: "Richiede ImprovedUI per visualizzare correttamente i pulsanti di scorrimento delle acconciature extra.",
    source: "BG3 Modding Community",
    nexusUrl: "https://www.nexusmods.com/baldursgate3/mods/213"
  },
  {
    id: "modfixer",
    name: "Mod Fixer",
    uuid: "991c9c7a-1123-4cda-b36c-9a6e971fb36b",
    folder: "ModFixer",
    category: "Patches & Overhauls",
    recommendedPosition: "top",
    requirements: [],
    conflicts: [],
    latestVersion: "OBSOLETE",
    description: "Forza la compilazione degli script di gioco per le mod create prima delle prime patch ufficiali.",
    notes: "ATTENZIONE: Fortemente obsoleta a partire dalla Patch 7+. Larian integra la compilazione nativamente. Rimuovi questa mod per evitare crash in gioco.",
    source: "BG3 Modding Community",
    nexusUrl: "https://www.nexusmods.com/baldursgate3/mods/141"
  },
  {
    id: "fivespells",
    name: "5e Spells",
    uuid: "88a3b50c-e123-421c-a33d-7104b2eb127c",
    folder: "5eSpells",
    category: "Gameplay",
    recommendedPosition: "middle",
    requirements: ["Norbyte Script Extender"],
    conflicts: [],
    latestVersion: "v1.1.2",
    description: "Aggiunge incantesimi di D&D Quinta Edizione mancanti dal gioco, implementandoli con meccaniche fedeli e animazioni integrate.",
    notes: "Carica prima delle mod di classi personalizzate che potrebbero fare riferimento a questi incantesimi.",
    source: "Nexus Community Wiki",
    nexusUrl: "https://www.nexusmods.com/baldursgate3/mods/125"
  },
  {
    id: "fantasticalmultiverse",
    name: "Fantastical Multiverse",
    uuid: "710fb2cb-23aa-4488-8cd4-5fbc319020ff",
    folder: "FantasticalMultiverse",
    category: "Classes & Races",
    recommendedPosition: "middle",
    requirements: ["ImprovedUI"],
    conflicts: [],
    latestVersion: "v1.8.9",
    description: "Introduce oltre 25 nuove razze derivate dall'universo esteso di D&D (es. Coboldi, Goblinoide, Cangianti, Elfi Astrali).",
    notes: "Richiede ImprovedUI per evitare crash nel menu di scelta della razza.",
    source: "BG3 Modding Community",
    nexusUrl: "https://www.nexusmods.com/baldursgate3/mods/215"
  },
  {
    id: "customizer",
    name: "Character Creation More Customization",
    uuid: "45fb3190-8cd4-23aa-efab-ab321f928e44",
    folder: "CC_More_Customizer",
    category: "Aesthetics",
    recommendedPosition: "middle",
    requirements: ["ImprovedUI"],
    conflicts: [],
    latestVersion: "v1.4",
    description: "Sblocca l'uso di opzioni estetiche originariamente limitate a determinati volti o razze per tutti i personaggi del giocatore.",
    notes: "Carica subito prima di Tav's Hair Salon per la massima compatibilità visiva.",
    source: "Nexus Community Wiki",
    nexusUrl: "https://www.nexusmods.com/baldursgate3/mods/110"
  },
  {
    id: "unlocklevelcurve",
    name: "Unlock Level Curve",
    uuid: "14524194-efab-2bb2-a1fe-724798107979",
    folder: "UnlockLevelCurve",
    category: "Gameplay",
    recommendedPosition: "middle",
    requirements: ["Norbyte Script Extender"],
    conflicts: [],
    latestVersion: "v1.3.4",
    description: "Permette di superare il livello 12 standard, portando la progressione dei personaggi fino al livello 20 con multiclasse.",
    notes: "Posiziona nella parte superiore del blocco Gameplay. Assicurati di installare le patch per incantesimi di livello superiore.",
    source: "BG3 Wiki Modlist",
    nexusUrl: "https://www.nexusmods.com/baldursgate3/mods/377"
  }
];

// Extends localOrganize to check custom and default community database records
export function enrichWithCommunityDatabase(
  modName: string,
  modFolder: string,
  modUuid: string,
  communityDb: CommunityMod[]
): Partial<CommunityMod> | null {
  const n = (modName || "").toLowerCase();
  const f = (modFolder || "").toLowerCase();
  const u = (modUuid || "").toLowerCase();

  // Try to find by UUID first
  let match = communityDb.find(m => m.uuid.toLowerCase() === u);
  
  // Try by folder name
  if (!match && f) {
    match = communityDb.find(m => m.folder.toLowerCase() === f);
  }

  // Try by exact name match or inclusion
  if (!match && n) {
    match = communityDb.find(m => 
      m.name.toLowerCase() === n || 
      n.includes(m.name.toLowerCase()) || 
      m.name.toLowerCase().includes(n)
    );
  }

  return match || null;
}
