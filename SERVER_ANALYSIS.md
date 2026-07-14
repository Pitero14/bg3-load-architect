# Server.ts Analysis Report

## Function List

### 1. `isCoreMod`
- **Purpose**: Helper function to check if a mod is core BG3 content by examining folder and name
- **Approximate line range**: L10-14
- **Dependencies**: None
- **Which endpoint calls it**: Used in `parseMods`, `rebuildLsx`, and `localOrganize`
- **Type**: Utility
- **Estimated extraction difficulty**: Easy

### 2. `extractAttribute`
- **Purpose**: Robust helper to extract an attribute from raw XML of a single node
- **Approximate line range**: L17-25
- **Dependencies**: None
- **Which endpoint calls it**: Used in `parseMods`
- **Type**: Utility
- **Estimated extraction difficulty**: Easy

### 3. `parseMods`
- **Purpose**: Extract mods from XML by parsing ModuleShortDesc nodes
- **Approximate line range**: L28-46
- **Dependencies**: `extractAttribute`, `isCoreMod`
- **Which endpoint calls it**: Called in `/api/organize` and `/api/parse-xml` endpoints
- **Type**: XML processing
- **Estimated extraction difficulty**: Easy

### 4. `rebuildLsx`
- **Purpose**: Rebuild final XML output with properly ordered mods
- **Approximate line range**: L49-95
- **Dependencies**: `isCoreMod`
- **Which endpoint calls it**: Called in `/api/organize` and `/api/rebuild-xml` endpoints
- **Type**: XML processing
- **Estimated extraction difficulty**: Medium

### 5. `localOrganize`
- **Purpose**: Heuristic High-Precision Offline Fallback Organizer & Analyzer
- **Approximate line range**: L98-367
- **Dependencies**: `isCoreMod`, `extractAttribute`, `parseMods`, `rebuildLsx`
- **Which endpoint calls it**: Called in `/api/organize` endpoint as fallback
- **Type**: Business logic
- **Estimated extraction difficulty**: Hard

### 6. `startServer`
- **Purpose**: Main server startup function that sets up Express routes and handles API endpoints
- **Approximate line range**: L369-681
- **Dependencies**: All other functions, express, dotenv, vite, GoogleGenAI
- **Which endpoint calls it**: Called at the end of file to start the server
- **Type**: HTTP layer
- **Estimated extraction difficulty**: Hard

### 7. `findCommunityMod`
- **Purpose**: Helper function to find a mod in the community database by UUID, folder, or name
- **Approximate line range**: L108-129
- **Dependencies**: None
- **Which endpoint calls it**: Used within `localOrganize` function
- **Type**: Utility
- **Estimated extraction difficulty**: Easy

### 8. `getCategory`
- **Purpose**: Determine the category of a mod based on folder and name
- **Approximate line range**: L131-161
- **Dependencies**: `isCoreMod`
- **Which endpoint calls it**: Used within `localOrganize` function
- **Type**: Business logic
- **Estimated extraction difficulty**: Medium

### 9. `getNotes`
- **Purpose**: Generate notes for a mod based on its name, category, and obsolescence status
- **Approximate line range**: L163-181
- **Dependencies**: None
- **Which endpoint calls it**: Used within `localOrganize` function
- **Type**: Business logic
- **Estimated extraction difficulty**: Medium

### 10. `getRequirements`
- **Purpose**: Determine the requirements for a mod based on its name
- **Approximate line range**: L183-196
- **Dependencies**: None
- **Which endpoint calls it**: Used within `localOrganize` function
- **Type**: Business logic
- **Estimated extraction difficulty**: Medium

## Summary Table

| Function Name | Purpose | Type | Extraction Difficulty |
|---------------|---------|------|---------------------|
| isCoreMod | Check if mod is core BG3 content | Utility | Easy |
| extractAttribute | Extract XML attribute value | Utility | Easy |
| parseMods | Parse mods from XML text | XML processing | Easy |
| rebuildLsx | Rebuild XML with sorted mods | XML processing | Medium |
| localOrganize | Offline organizer and analyzer | Business logic | Hard |
| startServer | Server startup and API setup | HTTP layer | Hard |
| findCommunityMod | Find mod in community database | Utility | Easy |
| getCategory | Determine mod category | Business logic | Medium |
| getNotes | Generate mod notes | Business logic | Medium |
| getRequirements | Determine mod requirements | Business logic | Medium |