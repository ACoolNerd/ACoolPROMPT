# ACoolPROMPT — Video Automation Role

`ACoolPROMPT` owns the structured prompt contracts used by the mortgage and luxury video factories.

## Required Prompt Families
- mortgage program explainer
- mortgage FAQ short
- mortgage process timeline
- mortgage comparison
- loan-officer intro
- 15/30/60/90 second adapters
- 3-minute explainer
- luxury brand film
- luxury product story
- luxury collection launch
- designer trade explainer
- shot-list generator
- B-roll brief generator
- caption generator
- thumbnail brief generator
- disclosure insertion
- multilingual adaptation

## Output Contract
Prompts should return structured JSON/YAML containing:
- source IDs
- claims
- disclosures
- hook
- scenes
- voiceover
- on-screen text
- asset requests
- timing
- CTA
- target aspect ratios
- review flags

## Guardrail
If regulated/current information is missing, emit `REQUIRES_CURRENT_DATA` and do not fabricate a value.

See the master manifest in `ACoolNerd/ACoolECOSYSTEM`.
