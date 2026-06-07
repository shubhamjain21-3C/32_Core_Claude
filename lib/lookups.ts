// ── 3C Core — Lookup fetchers for ref_* tables ───────────────────────────────
// All dropdowns and role pickers must use these instead of hardcoded arrays.
// Results are cached per-request via unstable_cache (Next.js 14 App Router).
// Lookup IDs are resolved with lookupId() before inserting status/type values.

import { createAdminClient } from '@/lib/supabase'
import type { LookupRow } from '@/types/database'

type LookupTable =
  | 'ref_portal_roles'
  | 'ref_property_types'
  | 'ref_property_status'
  | 'ref_tenancy_status'
  | 'ref_furnished_types'
  | 'ref_letting_status'
  | 'ref_report_types'
  | 'ref_report_status'
  | 'ref_condition_levels'
  | 'ref_room_types'
  | 'ref_item_types'
  | 'ref_entity_types'
  | 'ref_media_types'
  | 'ref_service_types'
  | 'ref_service_status'
  | 'ref_chat_roles'

// ── Generic fetcher — reads active rows ordered by sort_order ─────────────────
async function fetchLookup(table: LookupTable): Promise<LookupRow[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from(table)
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) {
    console.error(`[lookups] Failed to fetch ${table}:`, error.message)
    return []
  }
  return (data ?? []) as LookupRow[]
}

// ── Named fetchers ────────────────────────────────────────────────────────────
export const getPortalRoles      = () => fetchLookup('ref_portal_roles')
export const getPropertyTypes    = () => fetchLookup('ref_property_types')
export const getPropertyStatuses = () => fetchLookup('ref_property_status')
export const getTenancyStatuses  = () => fetchLookup('ref_tenancy_status')
export const getFurnishedTypes   = () => fetchLookup('ref_furnished_types')
export const getLettingStatuses  = () => fetchLookup('ref_letting_status')
export const getReportTypes      = () => fetchLookup('ref_report_types')
export const getReportStatuses   = () => fetchLookup('ref_report_status')
export const getConditionLevels  = () => fetchLookup('ref_condition_levels')
export const getRoomTypes        = () => fetchLookup('ref_room_types')
export const getItemTypes        = () => fetchLookup('ref_item_types')
export const getEntityTypes      = () => fetchLookup('ref_entity_types')
export const getMediaTypes       = () => fetchLookup('ref_media_types')
export const getServiceTypes     = () => fetchLookup('ref_service_types')
export const getServiceStatuses  = () => fetchLookup('ref_service_status')
export const getChatRoles        = () => fetchLookup('ref_chat_roles')

// ── lookupId — resolves a code to its integer id ──────────────────────────────
// Use before inserting: e.g. status_id = await lookupId('ref_report_status','draft')
export async function lookupId(table: LookupTable, code: string): Promise<number | null> {
  const rows = await fetchLookup(table)
  const match = rows.find(r => r.code === code)
  if (!match) {
    console.warn(`[lookups] Code "${code}" not found in ${table}`)
    return null
  }
  return match.id
}

// ── lookupCode — resolves an id back to its code ──────────────────────────────
export async function lookupCode(table: LookupTable, id: number): Promise<string | null> {
  const rows = await fetchLookup(table)
  return rows.find(r => r.id === id)?.code ?? null
}

// ── lookupLabel — resolves an id to its display label ─────────────────────────
export async function lookupLabel(table: LookupTable, id: number): Promise<string | null> {
  const rows = await fetchLookup(table)
  return rows.find(r => r.id === id)?.label ?? null
}

// ── Client-side helpers (for use in 'use client' components via API) ──────────
// Call /api/lookups?table=ref_portal_roles from client components.
// The API route handles caching and returns the same shape.
export async function fetchLookupClient(table: LookupTable): Promise<LookupRow[]> {
  const res = await fetch(`/api/lookups?table=${table}`, { next: { revalidate: 300 } })
  if (!res.ok) return []
  return res.json()
}
