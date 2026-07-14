import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  buildDependencyGraph,
  deterministicPreSort,
  postValidateAndRepair,
  computeDeterministicConfidence,
  findCommunityMod,
  isCoreMod,
  getHeuristicCategory
} from "./src/utils/pipeline";

dotenv.config();

// Robust helper to extract an attribute from raw XML of a single node
function extractAttribute(nodeXml: string, attributeId: string): string {
  const regex = new RegExp(`id="${attributeId}"[^>]*?value="([^"]*?)"`, 'i');
  let match = nodeXml.match(regex);
  if (!match) {
    const reverseRegex = new RegExp(`value="([^"]*?)"[^>]*?id="${attributeId}"`, 'i');
    match = nodeXml.match(reverseRegex);
  }
  return match ? match[1] : '';
}

// Extract mods from XML
function parseMods(xmlText: string) {
  const mods: { uuid: string; name: string; folder: string; rawXml: string }[] = [];
  // Standard regex to find each ModuleShortDesc node block
  const nodeRegex = /<node\s+id="ModuleShortDesc">([\s\S]*?)<\/node>/g;
  let match;
  while ((match = nodeRegex.exec(xmlText)) !== null) {
    const rawXml = match[0];
    const uuid = extractAttribute(rawXml, "UUID");
    const name = extractAttribute(rawXml, "Name");
    const folder = extractAttribute(rawXml, "Folder");
    if (uuid) {
      // Avoid duplicate UUIDs in parsing
      if (!mods.some(m => m.uuid === uuid)) {
        mods.push({ uuid, name, folder, rawXml });
      }
    }
  }
  return mods;
}

// Rebuild final XML output
function rebuildLsx(
  originalXml: string,
  sortedMods: { uuid: string; name: string; folder: string; rawXml: string }[]
): string {
  const versionMatch = originalXml.match(/<version\s+[^>]*?\/>/);
  const versionTag = versionMatch ? versionMatch[0] : '<version major="4" minor="8" revision="0" build="100" />';

  // Non-core mods are put into the load sequence of ModOrder
  const nonCoreMods = sortedMods.filter(m => !isCoreMod(m.folder, m.name));
  
  const modOrderEntries = nonCoreMods.map(m => `            <node id="Module">
              <attribute id="UUID" type="guid" value="${m.uuid}" />
            </node>`).join('\n');

  // Format and indent each node cleanly
  const modsEntries = sortedMods.map(m => {
    const trimmed = m.rawXml.trim();
    const lines = trimmed.split('\n');
    return lines.map((line, i) => {
      if (i === 0) return `            ${line.trim()}`;
      if (line.trim() === '</node>') return `            ${line.trim()}`;
      return `              ${line.trim()}`;
    }).join('\n');
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<save>
  ${versionTag}
  <region id="ModuleSettings">
    <node id="root">
      <children>
        <node id="ModOrder">
          <children>
${modOrderEntries}
          </children>
        </node>
        <node id="Mods">
          <children>
${modsEntries}
          </children>
        </node>
      </children>
    </node>
  </region>
</save>
`;
}

// Heuristic High-Precision Offline Fallback Organizer & Analyzer
function localOrganize(
  parsedMods: { uuid: string; name: string; folder: string; rawXml: string }[],
  communityDb: any[] = []
) {
  const analysis: any[] = [];
  const warnings: string[] = [
    "Nota: L'organizzatore ha attivato con successo il motore euristico locale per ordinare e analizzare la tua lista in totale sicurezza (Gemini API Offline/Quota Limit)."
  ];

  // Helper to find a mod in the community database
  const findCommunityMod = (uuid: string, name: string, folder: string) => {
    if (!communityDb || !Array.isArray(communityDb)) return null;
    const u = (uuid || "").toLowerCase();
    const n = (name || "").toLowerCase();
    const f = (folder || "").toLowerCase();

    // 1. Match by UUID
    let match = communityDb.find(item => item.uuid && item.uuid.toLowerCase() === u);
    // 2. Match by Folder
    if (!match && f) {
      match = communityDb.find(item => item.folder && item.folder.toLowerCase() === f);
    }
    // 3. Match by name
    if (!match && n) {
      match = communityDb.find(item => item.name && (
        item.name.toLowerCase() === n || 
        n.includes(item.name.toLowerCase()) || 
        item.name.toLowerCase().includes(n)
      ));
    }
    return match;
  };

  const getCategory = (folder: string, name: string): string => {
    if (isCoreMod(folder, name)) return "Core Game Module";
    const f = (folder || "").toLowerCase();
    const n = (name || "").toLowerCase();
    
    if (f.includes("compatibilityframework") || n.includes("compatibilityframework") || n.includes("compatibility framework")) {
      return "Compatibility Framework";
    }
    if (n.includes("_ita") || n.includes("translation") || n.includes("traduzione") || n.includes("translate") || f.includes("translation") || f.includes("traduzione")) {
      return "Translations";
    }
    if (n.includes("bg3mcm") || n.includes("mcm") || n.includes("mod configuration") || n.includes("scriptextender") || n.includes("script extender")) {
      return "Core / Library";
    }
    if (n.includes("improvedui") || n.includes("ui") || n.includes("hud") || n.includes("widget") || n.includes("interface") || n.includes("container") || n.includes("inventory")) {
      return "UI";
    }
    if (n.includes("hair") || n.includes("salon") || n.includes("tattoo") || n.includes("face") || n.includes("head") || n.includes("preset") || n.includes("aesthetic") || n.includes("cosmetic") || n.includes("cloth") || n.includes("armor") || n.includes("gear") || n.includes("skin") || n.includes("dye") || n.includes("visual")) {
      return "Aesthetics";
    }
    if (n.includes("class") || n.includes("race") || n.includes("razz") || n.includes("subclass") || n.includes("subrace") || n.includes("customizer")) {
      return "Classes & Races";
    }
    if (n.includes("fix") || n.includes("patch") || n.includes("overhaul") || n.includes("rebalance")) {
      return "Patches & Overhauls";
    }
    if (n.includes("cheat") || n.includes("easy") || n.includes("limit") || n.includes("begone") || n.includes("spell") || n.includes("feat") || n.includes("level") || n.includes("gameplay") || n.includes("rule") || n.includes("mechanic") || n.includes("xp") || n.includes("gold") || n.includes("weight")) {
      return "Gameplay";
    }
    return "Gameplay";
  };

  const getNotes = (name: string, category: string, isObsolete: boolean): string => {
    const n = name.toLowerCase();
    if (isObsolete) {
      return "Rimuovi questo file. Patch 7+ integra nativamente la correzione del caricamento ed evita crash.";
    }
    if (category === "Translations") {
      return "Posizionata automaticamente subito dopo il modulo principale in lingua inglese per la corretta traduzione dei testi.";
    }
    if (category === "Compatibility Framework") {
      return "Deve essere caricata assolutamente all'ultimo posto dell'elenco.";
    }
    if (n.includes("improvedui")) {
      return "Modulo fondamentale per supportare interfacce personalizzate. Assicurati che sia aggiornato per la patch corrente.";
    }
    if (n.includes("mcm") || n.includes("mod configuration")) {
      return "Fornisce il pannello di controllo in-game delle altre mod. Richiede Script Extender.";
    }
    return "Verifica regolarmente la compatibilità con la Patch 7 sul sito ufficiale Nexus Mods.";
  };

  const getRequirements = (name: string): string[] => {
    const n = name.toLowerCase();
    const reqs: string[] = [];
    if (n.includes("mcm") || n.includes("mod configuration")) {
      reqs.push("Script Extender");
    }
    if (n.includes("compatibility")) {
      reqs.push("Community Library");
    }
    if (n.includes("_ita") || n.includes("traduzione") || n.includes("translation")) {
      reqs.push("Mod Principale (English)");
    }
    return reqs;
  };

  parsedMods.forEach(m => {
    const communityMod = findCommunityMod(m.uuid, m.name, m.folder);
    
    let category = communityMod ? communityMod.category : getCategory(m.folder, m.name);
    // Standardize aesthetic / translation category naming
    if (category === "Aesthetic") category = "Aesthetics";
    if (category === "Translation") category = "Translations";
    
    const n = m.name.toLowerCase();
    let isObsolete = communityMod 
      ? (communityMod.latestVersion === "OBSOLETE" || !!communityMod.isObsolete) 
      : (n.includes("mod fixer") || n.includes("modfixer") || n.includes("mod-fixer"));

    if (isObsolete) {
      warnings.push(`Rilevata mod obsoleta: "${m.name}". Mod Fixer o moduli obsoleti non sono più necessari a partire dalla Patch 7+ e possono causare arresti anomali del gioco.`);
    }

    if (category === "Core Game Module" && !isCoreMod(m.folder, m.name)) {
      warnings.push(`Il modulo ${m.name} è stato classificato come Vanilla ma potrebbe essere esterno.`);
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

    const requirements = communityMod && communityMod.requirements ? communityMod.requirements : getRequirements(m.name);
    const notes = communityMod 
      ? `${communityMod.notes} [Fonte DB: ${communityMod.source || "Community"}]` 
      : getNotes(m.name, category, isObsolete);
    
    const conflicts = communityMod && communityMod.conflicts ? [...communityMod.conflicts] : [];

    analysis.push({
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
    });
  });

  const uuids = parsedMods.map(m => m.uuid);
  const duplicates = uuids.filter((item, index) => uuids.indexOf(item) !== index);
  if (duplicates.length > 0) {
    warnings.push(`Rilevati UUID duplicati nel file caricato: ${Array.from(new Set(duplicates)).join(", ")}. Verranno rimossi per evitare crash.`);
  }

  const hasMCM = parsedMods.some(m => m.name.toLowerCase().includes("mcm") || m.name.toLowerCase().includes("mod configuration"));
  if (hasMCM) {
    warnings.push("La lista contiene il pannello MCM. Assicurati di aver installato Norbyte Script Extender.");
  }

  const categoryOrder = [
    "Core Game Module",
    "Core / Library",
    "UI",
    "Gameplay",
    "Classes & Races",
    "Aesthetics",
    "Patches & Overhauls",
    "Translations",
    "Compatibility Framework"
  ];

  const grouped: { [key: string]: typeof parsedMods } = {};
  categoryOrder.forEach(cat => {
    grouped[cat] = [];
  });

  parsedMods.forEach(m => {
    // Find category from our matched array or get normal category
    const anaObj = analysis.find(a => a.uuid === m.uuid);
    const cat = anaObj ? anaObj.category : getCategory(m.folder, m.name);
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
    grouped[cat].push(m);
  });

  let sortedList: typeof parsedMods = [];
  categoryOrder.forEach(cat => {
    if (cat !== "Translations") {
      sortedList.push(...grouped[cat]);
    }
  });

  const translations = grouped["Translations"] || [];
  const unusedTranslations: typeof parsedMods = [];

  translations.forEach(trans => {
    const transName = trans.name.toLowerCase();
    let matchedIndex = -1;
    for (let i = 0; i < sortedList.length; i++) {
      const candidateName = sortedList[i].name.toLowerCase();
      if (candidateName !== "gustavx" && candidateName !== "gustavdev" && transName.startsWith(candidateName)) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex !== -1) {
      sortedList.splice(matchedIndex + 1, 0, trans);
    } else {
      unusedTranslations.push(trans);
    }
  });

  if (unusedTranslations.length > 0) {
    let compIndex = sortedList.findIndex(m => {
      const anaObj = analysis.find(a => a.uuid === m.uuid);
      return anaObj && anaObj.category === "Compatibility Framework";
    });
    if (compIndex !== -1) {
      sortedList.splice(compIndex, 0, ...unusedTranslations);
    } else {
      sortedList.push(...unusedTranslations);
    }
  }

  const finalSorted: typeof parsedMods = [];
  const coreGameMods = sortedList.filter(m => isCoreMod(m.folder, m.name));
  const otherMods = sortedList.filter(m => !isCoreMod(m.folder, m.name));
  
  finalSorted.push(...coreGameMods);
  finalSorted.push(...otherMods);

  // Cross-reference any custom conflicts from the community database or overlapping names
  analysis.forEach(a => {
    const aName = a.name.toLowerCase();
    if (a.category !== "Translations" && a.category !== "Core Game Module") {
      const overlapping = analysis.filter(other => 
        other.uuid !== a.uuid && 
        other.category === a.category && 
        (other.name.toLowerCase().includes(aName) || aName.includes(other.name.toLowerCase())) &&
        other.category !== "Translations"
      );
      overlapping.forEach(o => {
        if (!a.conflicts.includes(o.name)) {
          a.conflicts.push(o.name);
        }
      });
    }
  });

  const sortedAnalysis = finalSorted.map(m => analysis.find(a => a.uuid === m.uuid)).filter(Boolean);

  return {
    sortedMods: finalSorted,
    analysis: sortedAnalysis,
    generalWarnings: warnings
  };
}

// Enrich a pre-sorted list of mods with analysis data, keeping their exact order
function enrichSortedModsAnalysis(
  sortedMods: { uuid: string; name: string; folder: string; rawXml: string }[],
  communityDb: any[] = []
) {
  const analysis: any[] = [];
  
  const findCommunityMod = (uuid: string, name: string, folder: string) => {
    if (!communityDb || !Array.isArray(communityDb)) return null;
    const u = (uuid || "").toLowerCase();
    const n = (name || "").toLowerCase();
    const f = (folder || "").toLowerCase();

    let match = communityDb.find(item => item.uuid && item.uuid.toLowerCase() === u);
    if (!match && f) {
      match = communityDb.find(item => item.folder && item.folder.toLowerCase() === f);
    }
    if (!match && n) {
      match = communityDb.find(item => item.name && (
        item.name.toLowerCase() === n || 
        n.includes(item.name.toLowerCase()) || 
        item.name.toLowerCase().includes(n)
      ));
    }
    return match;
  };

  const getCategory = (folder: string, name: string): string => {
    if (isCoreMod(folder, name)) return "Core Game Module";
    const f = (folder || "").toLowerCase();
    const n = (name || "").toLowerCase();
    
    if (f.includes("compatibilityframework") || n.includes("compatibilityframework") || n.includes("compatibility framework")) {
      return "Compatibility Framework";
    }
    if (n.includes("_ita") || n.includes("translation") || n.includes("traduzione") || n.includes("translate") || f.includes("translation") || f.includes("traduzione")) {
      return "Translations";
    }
    if (n.includes("bg3mcm") || n.includes("mcm") || n.includes("mod configuration") || n.includes("scriptextender") || n.includes("script extender")) {
      return "Core / Library";
    }
    if (n.includes("improvedui") || n.includes("ui") || n.includes("hud") || n.includes("widget") || n.includes("interface") || n.includes("container") || n.includes("inventory")) {
      return "UI";
    }
    if (n.includes("hair") || n.includes("salon") || n.includes("tattoo") || n.includes("face") || n.includes("head") || n.includes("preset") || n.includes("aesthetic") || n.includes("cosmetic") || n.includes("cloth") || n.includes("armor") || n.includes("gear") || n.includes("skin") || n.includes("dye") || n.includes("visual")) {
      return "Aesthetics";
    }
    if (n.includes("class") || n.includes("race") || n.includes("razz") || n.includes("subclass") || n.includes("subrace") || n.includes("customizer")) {
      return "Classes & Races";
    }
    if (n.includes("fix") || n.includes("patch") || n.includes("overhaul") || n.includes("rebalance")) {
      return "Patches & Overhauls";
    }
    return "Gameplay";
  };

  sortedMods.forEach(m => {
    const communityMod = findCommunityMod(m.uuid, m.name, m.folder);
    let category = communityMod ? communityMod.category : getCategory(m.folder, m.name);
    if (category === "Aesthetic") category = "Aesthetics";
    if (category === "Translation") category = "Translations";

    const n = m.name.toLowerCase();
    const isObsolete = communityMod 
      ? (communityMod.latestVersion === "OBSOLETE" || !!communityMod.isObsolete) 
      : (n.includes("mod fixer") || n.includes("modfixer") || n.includes("mod-fixer"));

    let description = communityMod ? communityMod.description : `Modulo ${category.toLowerCase()} per personalizzare la tua esperienza in Baldur's Gate 3.`;
    if (!communityMod) {
      if (n.includes("improvedui")) {
        description = "Migliora e corregge i menu di creazione del personaggio e l'interfaccia di gioco per supportare opzioni aggiuntive.";
      } else if (n.includes("mcm") || n.includes("mod configuration")) {
        description = "Consente di configurare le mod direttamente dal menu di gioco.";
      } else if (n.includes("compatibilityframework")) {
        description = "Risolve conflitti tra mod di classi e razze sovrapponendole dinamicamente.";
      }
    }

    const conflicts = communityMod && communityMod.conflicts ? [...communityMod.conflicts] : [];
    const requirements = communityMod && communityMod.requirements ? [...communityMod.requirements] : [];
    const notes = communityMod 
      ? `${communityMod.notes} [Fonte DB: ${communityMod.source || "Community"}]` 
      : isObsolete ? "Rimuovi questo file. Patch 7+ integra nativamente la correzione del caricamento." : "Verifica compatibilità su Nexus.";

    analysis.push({
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
    });
  });

  return analysis;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API: Organize Mods
  app.post("/api/organize", async (req, res) => {
    try {
      const { xml, communityDb, language = "it" } = req.body;
      if (!xml || typeof xml !== "string") {
        return res.status(400).json({ error: "Il codice XML inserito non è valido o è vuoto." });
      }

      // Parse current list of mods
      const parsedMods = parseMods(xml);
      if (parsedMods.length === 0) {
        return res.status(400).json({ 
          error: "Nessuna mod valida rilevata nell'XML. Assicurati di inserire il codice di un file modsettings.lsx valido di Baldur's Gate 3." 
        });
      }

      // 1. Phase 1: Build the internal dependency graph
      const graphNodes = buildDependencyGraph(parsedMods, communityDb || []);

      // 2. Phase 2: Perform deterministic pre-sorting
      const preSortResult = deterministicPreSort(graphNodes);
      const preSortedNodes = preSortResult.sorted;
      const preSortedWarnings = preSortResult.warnings;

      // Try to optimize with Gemini first if API key is present
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          const isIt = language === "it";

          // 3. Phase 3 & 7: Reduce AI responsibility & Optimize Prompt
          // Prepare list of mods using compact index numbering from the pre-sorted list
          const modsSummary = preSortedNodes.map((n, idx) => ({
            id: idx,
            name: n.name,
            folder: n.folder,
            category: n.category
          }));

          // Prepare matched metadata for active mods only (future scalability Phase 8)
          const matchedCommunityRules = preSortedNodes.map((node, idx) => {
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

          const communityDbText = matchedCommunityRules.length > 0
            ? (isIt 
                ? `Metadati noti della community sulle mod attive (usa questi fatti per ragionare su relazioni o anomalie):\n${JSON.stringify(matchedCommunityRules, null, 2)}`
                : `Community known metadata on active mods (use this factual cache to reason about relationships/anomalies):\n${JSON.stringify(matchedCommunityRules, null, 2)}`)
            : (isIt 
                ? "Nessuna mod corrisponde a voci note nel database della community."
                : "No active mods match entries in the community database cache.");

          // Compact prompt focusing solely on advisory reasoning
          const prompt = isIt 
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

          // Call Gemini
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  order: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: "Lista degli ID delle mod ordinati in sequenza ottimale fine-tuned."
                  },
                  reasoning: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Da 3 a 5 spiegazioni sintetiche di alto livello delle decisioni."
                  },
                  warnings: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.INTEGER },
                        type: { type: Type.STRING },
                        msg: { type: Type.STRING }
                      },
                      required: ["id", "type", "msg"]
                    }
                  },
                  general: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Consigli o note generali."
                  }
                },
                required: ["order", "reasoning", "warnings", "general"]
              }
            }
          });

          const responseText = response.text || "";
          const data = JSON.parse(responseText.trim());

          // 4. Phase 4: Post-validation & Auto-Repair on AI returned order
          const repairResult = postValidateAndRepair(data.order, preSortedNodes);
          const repairedNodes = repairResult.repairedNodes;
          const repairedCount = repairResult.repairedCount;
          const repairWarnings = repairResult.warnings;

          // 5. Phase 5: Local Deterministic Confidence Score
          const computedConfidence = computeDeterministicConfidence(
            graphNodes,
            repairedNodes,
            repairedCount,
            communityDb || []
          );

          // Build sorted XML
          const sortedXml = rebuildLsx(xml, repairedNodes);

          // Enrich sorted mods with analysis data
          const enrichedAnalysis = enrichSortedModsAnalysis(repairedNodes, communityDb || []);

          // Process AI warning overrides
          if (Array.isArray(data.warnings)) {
            data.warnings.forEach((wOverride: any) => {
              const preSortedIdx = Number(wOverride.id);
              if (!isNaN(preSortedIdx) && preSortedNodes[preSortedIdx]) {
                const targetUuid = preSortedNodes[preSortedIdx].uuid;
                const anaObj = enrichedAnalysis.find(a => a.uuid === targetUuid);
                if (anaObj) {
                  if (wOverride.type === "obsolete") {
                    anaObj.isObsolete = true;
                  }
                  if (wOverride.msg) {
                    anaObj.notes = wOverride.msg;
                  }
                }
              }
            });
          }

          // Gather all warning lines
          const warningsList: string[] = [];
          
          // Add pre-sort warnings
          preSortedWarnings.forEach(w => warningsList.push(w));
          
          // Add repair warnings
          repairWarnings.forEach(w => warningsList.push(w));

          // Add general advice from AI
          if (Array.isArray(data.general)) {
            data.general.forEach((g: string) => warningsList.push(g));
          }

          enrichedAnalysis.forEach(a => {
            if (a.isObsolete) {
              if (language === "it") {
                warningsList.push(`Mod obsoleta rilevata: "${a.name}". Rimuovi questa mod per evitare crash.`);
              } else {
                warningsList.push(`Obsolete mod detected: "${a.name}". Remove this mod to prevent crashes.`);
              }
            }
          });

          return res.json({
            xml: sortedXml,
            analysis: enrichedAnalysis,
            generalWarnings: Array.from(new Set(warningsList)),
            confidence: computedConfidence,
            reasoning: Array.isArray(data.reasoning) ? data.reasoning : []
          });

        } catch (geminiError: any) {
          console.warn("Gemini API call failed. Falling back to high-precision local sorting:", geminiError);
        }
      } else {
        console.warn("GEMINI_API_KEY is not defined. Using local fallback.");
      }

      // LOCAL DETERMINISTIC HEURISTIC (used as fallback or offline mode)
      const computedConfidence = computeDeterministicConfidence(graphNodes, preSortedNodes, 0, communityDb || []);
      const sortedXml = rebuildLsx(xml, preSortedNodes);
      const enrichedAnalysis = enrichSortedModsAnalysis(preSortedNodes, communityDb || []);

      const warningsList: string[] = [...preSortedWarnings];
      enrichedAnalysis.forEach(a => {
        if (a.isObsolete) {
          if (language === "it") {
            warningsList.push(`Mod obsoleta rilevata: "${a.name}". Rimuovi questa mod per evitare crash.`);
          } else {
            warningsList.push(`Obsolete mod detected: "${a.name}". Remove this mod to prevent crashes.`);
          }
        }
      });

      return res.json({
        xml: sortedXml,
        analysis: enrichedAnalysis,
        generalWarnings: Array.from(new Set(warningsList)),
        confidence: computedConfidence,
        reasoning: language === "it" ? [
          "Moduli Core e Vanilla ordinati e bloccati in cima alla lista.",
          "Dipendenze topologiche e relazioni libreria-modulo applicate matematicamente.",
          "Traduzioni collocate immediatamente dopo i moduli principali associati.",
          "Moduli di compatibilità avanzata (es. Compatibility Framework) spostati alla fine assoluta."
        ] : [
          "Core game and library modules sorted and pinned to the top.",
          "Topological dependencies and library-module relations mathematically applied.",
          "Translation files moved immediately after their parent mod dependencies.",
          "Late-loaders (like Compatibility Framework) shifted to the absolute bottom."
        ]
      });

    } catch (error: any) {
      console.error("Error organizing load order:", error);
      res.status(500).json({ 
        error: error.message || "Si è verificato un errore interno nel server durante l'analisi." 
      });
    }
  });

  // API: Parse XML only
  app.post("/api/parse-xml", (req, res) => {
    try {
      const { xml } = req.body;
      if (!xml || typeof xml !== "string") {
        return res.status(400).json({ error: "Il codice XML inserito non è valido o è vuoto." });
      }
      const parsedMods = parseMods(xml);
      return res.json({ parsedMods });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Errore durante l'analisi XML." });
    }
  });

  // API: Rebuild XML only
  app.post("/api/rebuild-xml", (req, res) => {
    try {
      const { xml, sortedMods } = req.body;
      if (!xml || typeof xml !== "string" || !Array.isArray(sortedMods)) {
        return res.status(400).json({ error: "Parametri non validi." });
      }
      const rebuiltXml = rebuildLsx(xml, sortedMods);
      return res.json({ xml: rebuiltXml });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Errore durante la rigenerazione XML." });
    }
  });

  // API: Proxy for LM Studio to bypass browser CORS & Mixed Content issues
  app.post("/api/proxy-lmstudio", async (req, res) => {
    try {
      const { url, method, headers, body } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "URL non valido per il proxy." });
      }

      const isCompletions = url.includes("/chat/completions");
      const controller = new AbortController();
      // Wait up to 60 minutes (3,600,000ms) for completions, 30 seconds for list of models
      // Large models like Qwen 30B running on local hardware need significant time for prefill on large files
      const timeoutId = setTimeout(() => controller.abort(), isCompletions ? 3600000 : 30000);

      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(headers || {})
      };

      const response = await fetch(url, {
        method: method || "GET",
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = { rawText: responseText };
      }

      return res.status(response.status).json(responseJson);
    } catch (error: any) {
      console.error("LM Studio Proxy Error:", error);
      const isTimeout = error.name === "AbortError" || error.message?.includes("aborted");
      return res.status(502).json({
        error: isTimeout 
          ? "La richiesta al server LM Studio locale è andata in timeout. I modelli di grandi dimensioni come Qwen 30B richiedono molto tempo per l'elaborazione iniziale (prefill) del file XML. Assicurati che il modello non sia bloccato o prova a usare un modello più veloce (es. Qwen 2.5 Coder 7B o 14B, oppure Llama 3 8B)."
          : `Impossibile raggiungere il server locale: ${error.message}. Se l'applicazione è in esecuzione nel Cloud, ricorda che i server Cloud non possono accedere direttamente a indirizzi IP privati (come 192.168.x.x o localhost). Per risolvere questo problema nell'anteprima cloud, disabilita il blocco 'Insecure Content' del browser o esegui l'app in locale!`
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const baseDir = process.env.ELECTRON_APP_PATH || process.cwd();
    const distPath = path.join(baseDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
