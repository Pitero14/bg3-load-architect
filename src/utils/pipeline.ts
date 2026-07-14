export interface GraphNode {
  id: number;
  uuid: string;
  name: string;
  folder: string;
  category: string;
  dependencies: string[];
  incompatibilities: string[];
  isObsolete: boolean;
  rawXml: string;
}

// Check if a mod is core BG3 content
export function isCoreMod(folder: string, name: string): boolean {
  const f = (folder || "").toLowerCase();
  const n = (name || "").toLowerCase();
  return f === 'gustav' || f === 'gustavdev' || f === 'gustavx' || n === 'gustav' || n === 'gustavdev' || n === 'gustavx';
}

// Find a mod in the community database
export function findCommunityMod(uuid: string, name: string, folder: string, communityDb: any[]) {
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
}

// Fallback categorization heuristics
export function getHeuristicCategory(folder: string, name: string): string {
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
}

// Find a mod in the list by UUID, folder name, or mod name reference
export function findActiveModByRef(ref: string, activeNodes: GraphNode[]): GraphNode | null {
  const refLower = ref.toLowerCase();
  return activeNodes.find(n => 
    n.uuid.toLowerCase() === refLower ||
    n.folder.toLowerCase() === refLower ||
    n.name.toLowerCase() === refLower ||
    n.name.toLowerCase().includes(refLower)
  ) || null;
}

// Phase 1: Build an internal dependency graph
export function buildDependencyGraph(
  parsedMods: { uuid: string; name: string; folder: string; rawXml: string }[],
  communityDb: any[]
): GraphNode[] {
  return parsedMods.map((m, idx) => {
    const dbItem = findCommunityMod(m.uuid, m.name, m.folder, communityDb);
    
    // Determine category
    let category = dbItem ? dbItem.category : getHeuristicCategory(m.folder, m.name);
    if (category === "Aesthetic") category = "Aesthetics";
    if (category === "Translation") category = "Translations";
    
    if (isCoreMod(m.folder, m.name)) {
      category = "Core Game Module";
    }

    const isObsolete = dbItem 
      ? (dbItem.latestVersion === "OBSOLETE" || !!dbItem.isObsolete)
      : (m.name.toLowerCase().includes("mod fixer") || m.name.toLowerCase().includes("modfixer") || m.name.toLowerCase().includes("mod-fixer"));

    // Extract explicit dependencies
    const dependencies: string[] = [];
    if (dbItem && Array.isArray(dbItem.requirements)) {
      dbItem.requirements.forEach((req: string) => {
        dependencies.push(req);
      });
    }

    // Direct translation relationship:
    const nameLower = m.name.toLowerCase();
    const folderLower = m.folder.toLowerCase();
    const isTranslation = category === "Translations" || nameLower.includes("_ita") || nameLower.includes("translation") || nameLower.includes("traduzione") || nameLower.includes("translate") || folderLower.includes("translation") || folderLower.includes("traduzione");
    
    if (isTranslation) {
      category = "Translations";
      // Find active parent mod (non-translation, whose name matches or is contained)
      let bestParent: string | null = null;
      parsedMods.forEach((other) => {
        if (other.uuid !== m.uuid) {
          const otherNameLower = other.name.toLowerCase();
          const otherFolderLower = other.folder.toLowerCase();
          if (otherNameLower !== "gustav" && otherNameLower !== "gustavdev" && otherNameLower !== "gustavx") {
            if (nameLower.startsWith(otherNameLower) || nameLower.includes(otherNameLower)) {
              bestParent = other.uuid;
            } else if (folderLower.startsWith(otherFolderLower) || folderLower.includes(otherFolderLower)) {
              bestParent = other.uuid;
            }
          }
        }
      });
      if (bestParent) {
        dependencies.push(bestParent);
      }
    }

    // Incompatibilities (conflicts)
    const incompatibilities: string[] = [];
    if (dbItem && Array.isArray(dbItem.conflicts)) {
      dbItem.conflicts.forEach((conf: string) => {
        incompatibilities.push(conf);
      });
    }

    return {
      id: idx,
      uuid: m.uuid,
      name: m.name,
      folder: m.folder,
      category,
      dependencies,
      incompatibilities,
      isObsolete,
      rawXml: m.rawXml
    };
  });
}

// Phase 2: Deterministic Preprocessing
export function deterministicPreSort(nodes: GraphNode[]): { sorted: GraphNode[]; warnings: string[] } {
  const warnings: string[] = [];
  
  // 1. Detect duplicates
  const seenUuids = new Set<string>();
  const uniqueNodes: GraphNode[] = [];
  nodes.forEach(node => {
    if (seenUuids.has(node.uuid)) {
      warnings.push(`Rilevato UUID duplicato per la mod "${node.name}" (${node.uuid}). Rimossa duplicazione per prevenire crash.`);
    } else {
      seenUuids.add(node.uuid);
      uniqueNodes.push(node);
    }
  });

  // 2. Identify missing dependencies
  uniqueNodes.forEach(node => {
    node.dependencies.forEach(dep => {
      if (dep.toLowerCase().includes("script extender") || dep.toLowerCase().includes("scriptextender")) {
        return; 
      }
      const found = findActiveModByRef(dep, uniqueNodes);
      if (!found) {
        warnings.push(`La mod "${node.name}" richiede la dipendenza "${dep}" che non risulta attiva nell'elenco.`);
      }
    });
  });

  // 3. Partitioning by Larian category rules
  const coreMods = uniqueNodes.filter(n => n.category === "Core Game Module");
  const compFrameworkMods = uniqueNodes.filter(n => n.category === "Compatibility Framework");
  
  const standardMods = uniqueNodes.filter(n => 
    n.category !== "Core Game Module" && 
    n.category !== "Compatibility Framework" && 
    n.category !== "Translations"
  );
  
  const translationMods = uniqueNodes.filter(n => n.category === "Translations");

  const categoryPriority: Record<string, number> = {
    "Core / Library": 1,
    "UI": 2,
    "Gameplay": 3,
    "Classes & Races": 4,
    "Aesthetics": 5,
    "Patches & Overhauls": 6
  };

  // Sort standard mods by category priority
  standardMods.sort((a, b) => {
    const prioA = categoryPriority[a.category] || 99;
    const prioB = categoryPriority[b.category] || 99;
    if (prioA !== prioB) return prioA - prioB;
    return a.id - b.id;
  });

  // Topologically sort standard mods to resolve "library before dependent"
  let changed = true;
  let passes = 0;
  const maxPasses = standardMods.length * 2;
  const swappedPairs = new Set<string>();
  
  while (changed && passes < maxPasses) {
    changed = false;
    passes++;
    for (let i = 0; i < standardMods.length; i++) {
      const current = standardMods[i];
      for (const dep of current.dependencies) {
        if (dep.toLowerCase().includes("script extender") || dep.toLowerCase().includes("scriptextender")) {
          continue;
        }
        const depNode = findActiveModByRef(dep, standardMods);
        if (depNode) {
          const depIdx = standardMods.indexOf(depNode);
          if (depIdx > i) {
            const reverseKey = `${current.uuid}->${depNode.uuid}`;
            if (swappedPairs.has(reverseKey)) {
              const cycleWarning = `Rilevato ciclo di dipendenze (conflitto): "${current.name}" e "${depNode.name}" si richiedono a vicenda.`;
              if (!warnings.includes(cycleWarning)) {
                warnings.push(cycleWarning);
              }
              continue;
            }
            swappedPairs.add(`${depNode.uuid}->${current.uuid}`);
            standardMods.splice(depIdx, 1);
            standardMods.splice(i, 0, depNode);
            changed = true;
            break;
          }
        }
      }
      if (changed) break;
    }
  }

  // Identify translations without an active parent
  translationMods.forEach(trans => {
    let parentFound = false;
    for (const dep of trans.dependencies) {
      const pNode = findActiveModByRef(dep, uniqueNodes);
      if (pNode) {
        parentFound = true;
        break;
      }
    }
    if (!parentFound) {
      const transNameLower = trans.name.toLowerCase();
      for (let i = 0; i < uniqueNodes.length; i++) {
        const candidateName = uniqueNodes[i].name.toLowerCase();
        if (candidateName !== "gustav" && candidateName !== "gustavdev" && candidateName !== "gustavx" && uniqueNodes[i].category !== "Translations") {
          if (transNameLower.startsWith(candidateName) || transNameLower.includes(candidateName)) {
            parentFound = true;
            break;
          }
        }
      }
    }
    if (!parentFound) {
      warnings.push(`La mod di traduzione "${trans.name}" non sembra avere la corrispondente mod originale attiva nell'elenco.`);
    }
  });

  // Combine Core and Standard
  const sortedList: GraphNode[] = [...coreMods, ...standardMods];

  // Insert translations immediately after parent
  const unusedTranslations: GraphNode[] = [];
  translationMods.forEach(trans => {
    let parentIdx = -1;
    for (const dep of trans.dependencies) {
      const pNode = findActiveModByRef(dep, sortedList);
      if (pNode) {
        parentIdx = sortedList.indexOf(pNode);
        break;
      }
    }
    
    if (parentIdx === -1) {
      const transNameLower = trans.name.toLowerCase();
      for (let i = 0; i < sortedList.length; i++) {
        const candidateName = sortedList[i].name.toLowerCase();
        if (candidateName !== "gustav" && candidateName !== "gustavdev" && candidateName !== "gustavx") {
          if (transNameLower.startsWith(candidateName) || transNameLower.includes(candidateName)) {
            parentIdx = i;
            break;
          }
        }
      }
    }

    if (parentIdx !== -1) {
      sortedList.splice(parentIdx + 1, 0, trans);
    } else {
      unusedTranslations.push(trans);
    }
  });

  if (unusedTranslations.length > 0) {
    sortedList.push(...unusedTranslations);
  }

  // Append Compatibility Framework at the absolute end
  sortedList.push(...compFrameworkMods);

  return {
    sorted: sortedList,
    warnings
  };
}

// Phase 4: Post-validation & Auto-Repair
export function postValidateAndRepair(
  aiOrder: number[],
  originalNodes: GraphNode[]
): {
  repairedNodes: GraphNode[];
  repairedCount: number;
  warnings: string[];
} {
  const warnings: string[] = [];
  let repairedCount = 0;

  // 1. Initial ID sanitation (ensure each original mod exists exactly once with no duplicates)
  const cleanedOrder: number[] = [];
  const seenIds = new Set<number>();
  
  if (Array.isArray(aiOrder)) {
    aiOrder.forEach(idVal => {
      const id = Number(idVal);
      if (!isNaN(id) && id >= 0 && id < originalNodes.length && !seenIds.has(id)) {
        cleanedOrder.push(id);
        seenIds.add(id);
      } else {
        repairedCount++;
      }
    });
  }

  // Append any missing IDs
  originalNodes.forEach(node => {
    if (!seenIds.has(node.id)) {
      cleanedOrder.push(node.id);
      seenIds.add(node.id);
      repairedCount++;
    }
  });

  // Map back to full node objects
  let nodesList = cleanedOrder.map(id => ({ ...originalNodes[id] }));

  // 2. Enforce Core Game Modules at the very top
  const coreMods = nodesList.filter(n => n.category === "Core Game Module");
  const nonCoreMods = nodesList.filter(n => n.category !== "Core Game Module");
  
  let firstNonCoreIdx = nodesList.findIndex(n => n.category !== "Core Game Module");
  if (firstNonCoreIdx !== -1) {
    for (let i = firstNonCoreIdx; i < nodesList.length; i++) {
      if (nodesList[i].category === "Core Game Module") {
        repairedCount++;
        break;
      }
    }
  }
  nodesList = [...coreMods, ...nonCoreMods];

  // 3. Separate Compatibility Framework (must be absolute bottom)
  const compFrameworkMods = nodesList.filter(n => n.category === "Compatibility Framework");
  const remainingMods = nodesList.filter(n => n.category !== "Compatibility Framework");
  
  let cfOutOfPlace = false;
  for (let i = 0; i < nodesList.length; i++) {
    if (nodesList[i].category === "Compatibility Framework") {
      if (i < nodesList.length - compFrameworkMods.length) {
        cfOutOfPlace = true;
        break;
      }
    }
  }
  if (cfOutOfPlace) {
    repairedCount++;
  }
  nodesList = [...remainingMods, ...compFrameworkMods];

  // 4. Enforce dependency order topologically
  let changed = true;
  let passes = 0;
  const maxPasses = nodesList.length * 2;
  const postSwappedPairs = new Set<string>();
  
  while (changed && passes < maxPasses) {
    changed = false;
    passes++;
    for (let i = 0; i < nodesList.length; i++) {
      const current = nodesList[i];
      if (current.category === "Core Game Module" || current.category === "Compatibility Framework") {
        continue;
      }
      
      for (const dep of current.dependencies) {
        if (dep.toLowerCase().includes("script extender") || dep.toLowerCase().includes("scriptextender")) {
          continue;
        }
        
        const depNode = findActiveModByRef(dep, nodesList);
        if (depNode) {
          const depIdx = nodesList.indexOf(depNode);
          if (depIdx > i) {
            const reverseKey = `${current.uuid}->${depNode.uuid}`;
            if (postSwappedPairs.has(reverseKey)) {
              const cycleWarning = `Rilevato ciclo di dipendenze (conflitto): "${current.name}" e "${depNode.name}" si richiedono a vicenda.`;
              if (!warnings.includes(cycleWarning)) {
                warnings.push(cycleWarning);
              }
              continue;
            }
            
            postSwappedPairs.add(`${depNode.uuid}->${current.uuid}`);
            nodesList.splice(depIdx, 1);
            const currentIdx = nodesList.indexOf(current);
            nodesList.splice(currentIdx, 0, depNode);
            repairedCount++;
            changed = true;
            warnings.push(`Correzione post-AI: Dipendenza "${depNode.name}" ricollocata prima di "${current.name}" per soddisfare i vincoli fisici.`);
            break;
          }
        }
      }
      if (changed) break;
    }
  }

  // 5. Enforce Translations immediately after their parent mod
  const translations = nodesList.filter(n => n.category === "Translations");
  const listWithoutTranslations = nodesList.filter(n => n.category !== "Translations");

  const finalNodesList: GraphNode[] = [...listWithoutTranslations];
  
  translations.forEach(trans => {
    let parentIdx = -1;
    for (const dep of trans.dependencies) {
      const pNode = findActiveModByRef(dep, finalNodesList);
      if (pNode) {
        parentIdx = finalNodesList.indexOf(pNode);
        break;
      }
    }
    
    if (parentIdx === -1) {
      const transNameLower = trans.name.toLowerCase();
      for (let i = 0; i < finalNodesList.length; i++) {
        const candidateName = finalNodesList[i].name.toLowerCase();
        if (candidateName !== "gustav" && candidateName !== "gustavdev" && candidateName !== "gustavx") {
          if (transNameLower.startsWith(candidateName) || transNameLower.includes(candidateName)) {
            parentIdx = i;
            break;
          }
        }
      }
    }

    if (parentIdx !== -1) {
      const currentIdxInOriginal = nodesList.indexOf(trans);
      const parentIdxInOriginal = nodesList.findIndex(n => n.uuid === finalNodesList[parentIdx].uuid);
      
      let allBetweenAreTranslations = true;
      if (currentIdxInOriginal > parentIdxInOriginal) {
        for (let idx = parentIdxInOriginal + 1; idx < currentIdxInOriginal; idx++) {
          if (nodesList[idx].category !== "Translations") {
            allBetweenAreTranslations = false;
            break;
          }
        }
      } else {
        allBetweenAreTranslations = false;
      }
      
      if (!allBetweenAreTranslations) {
        repairedCount++;
        warnings.push(`Correzione post-AI: Traduzione "${trans.name}" riposizionata immediatamente dopo la mod principale "${finalNodesList[parentIdx].name}".`);
      }
      finalNodesList.splice(parentIdx + 1, 0, trans);
    } else {
      // Put before Compatibility Framework
      const cfStartIdx = finalNodesList.findIndex(n => n.category === "Compatibility Framework");
      if (cfStartIdx !== -1) {
        finalNodesList.splice(cfStartIdx, 0, trans);
      } else {
        finalNodesList.push(trans);
      }
    }
  });

  return {
    repairedNodes: finalNodesList,
    repairedCount,
    warnings
  };
}

// Phase 5: Local Deterministic Confidence Score
export function computeDeterministicConfidence(
  originalNodes: GraphNode[],
  repairedNodes: GraphNode[],
  repairedCount: number,
  communityDb: any[]
): number {
  let score = 1.0;

  // 1. Repaired adjustments penalty
  const repairPenalty = Math.min(repairedCount * 0.05, 0.35);
  score -= repairPenalty;

  // 2. Unknown mods penalty
  let unknownCount = 0;
  originalNodes.forEach(node => {
    const dbItem = findCommunityMod(node.uuid, node.name, node.folder, communityDb);
    if (!dbItem && node.category !== "Core Game Module") {
      unknownCount++;
    }
  });
  const unknownPenalty = originalNodes.length > 0 ? Math.min((unknownCount / originalNodes.length) * 0.20, 0.20) : 0;
  score -= unknownPenalty;

  // 3. Missing dependencies penalty
  let missingDepCount = 0;
  originalNodes.forEach(node => {
    node.dependencies.forEach(dep => {
      if (dep.toLowerCase().includes("script extender") || dep.toLowerCase().includes("scriptextender")) {
        return;
      }
      const found = findActiveModByRef(dep, originalNodes);
      if (!found) {
        missingDepCount++;
      }
    });
  });
  const missingDepPenalty = Math.min(missingDepCount * 0.08, 0.20);
  score -= missingDepPenalty;

  // 4. Conflicts penalty
  let conflictCount = 0;
  originalNodes.forEach(node => {
    node.incompatibilities.forEach(conf => {
      const conflictingNode = findActiveModByRef(conf, originalNodes);
      if (conflictingNode) {
        conflictCount++;
      }
    });
  });
  const conflictPenalty = Math.min(conflictCount * 0.10, 0.20);
  score -= conflictPenalty;

  return Math.max(0.4, Math.min(score, 1.0));
}
