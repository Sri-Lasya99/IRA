import re
import logging
from datetime import datetime
from typing import List, Optional, Tuple
from app.models.schemas import (
    HistoricalMemory, 
    ResolutionHistoryEntry, 
    ChronologicalFixItem, 
    TemporalReasoning,
    IncidentCreate
)

logger = logging.getLogger("incident_agent.temporal")

def _parse_timestamp(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    cleaned = date_str.strip()
    # Try ISO format
    try:
        iso_clean = cleaned.replace("Z", "+00:00") if "Z" in cleaned else cleaned
        return datetime.fromisoformat(iso_clean)
    except Exception:
        pass
    
    # Try common formats like "Jan 2026", "January 2026", "2026-01-14"
    for fmt in ("%b %Y", "%B %Y", "%Y-%m-%d", "%d %b %Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(cleaned, fmt)
        except Exception:
            continue
    return None

def build_resolution_history(memories: List[HistoricalMemory]) -> List[ResolutionHistoryEntry]:
    """
    Construct a strictly chronological resolution history from retrieved Hindsight memories.
    Uses real dates, real fixes, and real recorded outcomes. Never fabricates entries.
    """
    if not memories:
        return []

    # Pair each memory with its parsed date (or None)
    paired = []
    for idx, mem in enumerate(memories):
        dt = _parse_timestamp(mem.date or mem.timestamp)
        paired.append((dt, idx, mem))

    # Sort chronologically (oldest first, newest last; unparsed dates retain relative order)
    paired.sort(key=lambda x: (x[0] is None, x[0] or datetime.min, x[1]))

    entries: List[ResolutionHistoryEntry] = []
    seen_ids = set()

    for dt, _, mem in paired:
        inc_id = mem.incident_id or mem.id or "INC-HIST-UNKNOWN"
        if inc_id in seen_ids:
            continue
        seen_ids.add(inc_id)

        # Date display: prefer date_display, then dt formatted, then raw date or "Date unrecorded"
        if mem.date_display:
            date_display = mem.date_display
        elif dt:
            date_display = dt.strftime("%b %Y")
        elif mem.date:
            date_display = mem.date[:10]
        else:
            date_display = "Date unrecorded"

        # Build chronological fix list
        fixes: List[ChronologicalFixItem] = []

        # 1. Successful fixes
        if mem.successful_fixes:
            for fix in mem.successful_fixes:
                clean_fix = fix.strip().lstrip("✓").lstrip("-").strip()
                if clean_fix:
                    fixes.append(ChronologicalFixItem(action=clean_fix, status="worked"))
        elif mem.resolution:
            status = "worked" if mem.outcome else "unrecorded"
            fixes.append(ChronologicalFixItem(action=mem.resolution.strip(), status=status))

        # 2. Failed fixes
        if mem.failed_fixes:
            for fix in mem.failed_fixes:
                clean_fix = fix.strip().lstrip("✕").lstrip("x").lstrip("-").strip()
                if clean_fix:
                    fixes.append(ChronologicalFixItem(action=clean_fix, status="failed"))

        # System changes from metadata or content
        system_changes = None
        if mem.content:
            m_dep = re.search(r"(?:Recent Deployment/Change|Recent Deployment):\s*([^\n\r]+)", mem.content, re.IGNORECASE)
            if m_dep and m_dep.group(1).strip() and m_dep.group(1).strip().lower() != "none reported":
                system_changes = m_dep.group(1).strip()

        entries.append(ResolutionHistoryEntry(
            incident_id=inc_id,
            date_display=date_display,
            title=mem.title,
            service=mem.service,
            fixes=fixes,
            system_changes=system_changes,
            outcome=mem.outcome
        ))

    return entries


def synthesize_temporal_reasoning(
    incident: IncidentCreate,
    resolution_history: List[ResolutionHistoryEntry],
    hindsight_enabled: bool = True
) -> TemporalReasoning:
    """
    Synthesize temporal reasoning comparing how solutions evolved over time.
    Guarantees:
    - Never says 'the old solution is outdated'.
    - Keeps older successful solutions as possible alternatives.
    - Evaluates recency together with similarity, outcome, and system changes.
    """
    if not hindsight_enabled:
        return TemporalReasoning(
            has_sufficient_history=False,
            resolution_history=[],
            temporal_insight="Temporal reasoning is disabled because Hindsight memory is turned OFF.",
            recommended_approach="Reasoning is based strictly on live incident telemetry facts.",
            alternative_historical_approach=None,
            why="Hindsight memory was not queried for this run.",
            status_notice="Hindsight memory is disabled (OFF)."
        )

    if not resolution_history:
        return TemporalReasoning(
            has_sufficient_history=False,
            resolution_history=[],
            temporal_insight="No matching historical incidents were found in organizational memory.",
            recommended_approach="Formulate initial diagnostic hypothesis directly from observed symptoms.",
            alternative_historical_approach=None,
            why="Insufficient historical precedents to evaluate temporal evolution.",
            status_notice="No relevant historical precedents found in Hindsight bank."
        )

    if len(resolution_history) == 1:
        single = resolution_history[0]
        worked_fixes = [f.action for f in single.fixes if f.status == "worked"]
        rec = worked_fixes[0] if worked_fixes else "Follow verified resolution from historical record"
        return TemporalReasoning(
            has_sufficient_history=False,
            resolution_history=resolution_history,
            temporal_insight=f"A single historical precedent ({single.incident_id}) was retrieved from organizational memory. Temporal comparison requires multiple incidents over time to observe solution progression.",
            recommended_approach=rec,
            alternative_historical_approach=None,
            why=f"Verified in {single.incident_id} ({single.date_display or 'recorded postmortem'}).",
            status_notice="Single historical incident retrieved; multiple incidents required for temporal evolution comparison."
        )

    # We have 2 or more historical incidents chronologically ordered
    oldest = resolution_history[0]
    newest = resolution_history[-1]

    oldest_worked = [f.action for f in oldest.fixes if f.status == "worked"]
    newest_worked = [f.action for f in newest.fixes if f.status == "worked"]
    newest_failed = [f.action for f in newest.fixes if f.status == "failed"]

    # Check if a fix from older incidents failed in the newest incident
    solution_evolved = False
    failed_prior_solution = None
    if newest_failed and oldest_worked:
        for old_fix in oldest_worked:
            # Substring or keyword match
            old_words = set(re.findall(r"\b\w{4,}\b", old_fix.lower()))
            for new_fail in newest_failed:
                fail_words = set(re.findall(r"\b\w{4,}\b", new_fail.lower()))
                if len(old_words.intersection(fail_words)) >= 2:
                    solution_evolved = True
                    failed_prior_solution = old_fix
                    break

    # Build Insight
    if solution_evolved and failed_prior_solution:
        insight = (
            f"'{failed_prior_solution}' demonstrated repeated historical success in earlier incidents ({oldest.date_display}), "
            f"but failed in the most recent comparable incident ({newest.date_display}). "
            f"'{newest_worked[0] if newest_worked else 'Tuned multi-factor mitigation'}' succeeded more recently and has stronger recent evidence. "
            f"The older fix remains a viable alternative if preconditions allow."
        )
        rec = newest_worked[0] if newest_worked else "Apply latest verified mitigation"
        alt = oldest_worked[0] if oldest_worked else None
        why = (
            f"{newest.date_display} evidence indicates {newest.system_changes or 'increased system complexity'} rendered single-factor mitigation insufficient. "
            f"The newer combined fix addresses stalled states, while the older fix provides a valid baseline capacity adjustment."
        )
    else:
        # Both worked or incrementally scaled
        insight = (
            f"Historical resolutions for {incident.service} have evolved across {len(resolution_history)} recorded incidents from {oldest.date_display} to {newest.date_display}. "
            f"Earlier fixes established baseline remediations ('{oldest_worked[0] if oldest_worked else 'Capacity increase'}'), while recent postmortems "
            f"refined the approach with comprehensive parameter tuning ('{newest_worked[0] if newest_worked else 'Enhanced mitigation'}')."
        )
        rec = newest_worked[0] if newest_worked else (oldest_worked[0] if oldest_worked else "Inspect connection metrics")
        alt = oldest_worked[0] if (oldest_worked and oldest_worked[0] != rec) else None
        why = (
            f"The recommended approach reflects the most recent verified incident ({newest.incident_id} in {newest.date_display}), "
            f"while earlier successful solutions ({oldest.incident_id} in {oldest.date_display}) remain viable alternative approaches."
        )

    return TemporalReasoning(
        has_sufficient_history=True,
        resolution_history=resolution_history,
        temporal_insight=insight,
        recommended_approach=rec,
        alternative_historical_approach=alt,
        why=why,
        status_notice=None
    )
