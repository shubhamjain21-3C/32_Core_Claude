// ── 3C Core — Supabase Database Types (v2, schema 020) ───────────────────────
// Auto-maintained. Matches 020_finalised_schema_with_lookups.sql exactly.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ── Lookup row (shared shape for all ref_* tables) ────────────────────────────
export interface LookupRow {
  id:          number
  code:        string
  label:       string
  description: string | null
  sort_order:  number
  is_active:   boolean
  flags:       Json
  created_at:  string
}

// ── ref_* tables (all share LookupRow) ───────────────────────────────────────
export type RefPortalRole      = LookupRow
export type RefPropertyType    = LookupRow
export type RefPropertyStatus  = LookupRow
export type RefTenancyStatus   = LookupRow
export type RefFurnishedType   = LookupRow
export type RefLettingStatus   = LookupRow
export type RefReportType      = LookupRow
export type RefReportStatus    = LookupRow
export type RefConditionLevel  = LookupRow
export type RefRoomType        = LookupRow
export type RefItemType        = LookupRow
export type RefEntityType      = LookupRow
export type RefMediaType       = LookupRow
export type RefServiceType     = LookupRow
export type RefServiceStatus   = LookupRow
export type RefChatRole        = LookupRow

// ── Core table row types ──────────────────────────────────────────────────────

export interface DbUser {
  User_id:        string        // uuid
  FirstName:      string
  MiddleName:     string | null
  Lastname:       string
  Email:          string
  Phone:          string | null
  Company:        string | null
  portal_role_id: number | null // FK → ref_portal_roles.id
  avatar_url:     string | null
  created_at:     string
  updated_at:     string
}

export interface DbProperty {
  Property_Id:      string        // uuid PK
  User_id:          string        // FK → users
  address_line1:    string
  address_line2:    string | null
  city:             string
  postcode:         string
  country:          string
  property_type_id: number | null // FK → ref_property_types
  bedrooms:         number
  bathrooms:        number
  monthly_rent:     number | null
  status_id:        number | null // FK → ref_property_status
  created_at:       string
  updated_at:       string
}

export interface DbPropertyTenancy {
  Tenant_id:   string        // uuid PK
  property_id: string        // FK → properties
  User_id:     string        // FK → users (the tenant)
  start_date:  string
  end_date:    string | null
  rent_amount: number
  status_id:   number | null // FK → ref_tenancy_status
  created_at:  string
}

export interface DbPropertyLetting {
  Letting_Id:         string        // uuid PK
  property_id:        string        // FK → properties
  User_Id:            string | null // FK → users (agent)
  asking_rent:        number | null
  available_from:     string | null
  description:        string | null
  furnished_id:       number | null // FK → ref_furnished_types
  min_tenancy_months: number | null
  status_id:          number | null // FK → ref_letting_status
  created_at:         string
}

export interface DbInventoryReport {
  InventoryReport_id:  string        // uuid PK
  property_id:         string        // FK → properties
  report_type_id:      number        // FK → ref_report_types NOT NULL
  User_Id:             string | null // FK → users (creator)
  tenant_id:           string | null // FK → users
  status_id:           number | null // FK → ref_report_status
  ai_generated:        boolean
  overall_condition_id:number | null // FK → ref_condition_levels
  clerk_notes:         string | null
  ai_summary:          string | null
  signed_at:           string | null
  signed_by_tenant:    boolean
  signed_by_manager:   boolean
  pdf_url:             string | null
  retain_until:        string | null
  created_at:          string
  updated_at:          string
}

export interface DbInventoryRoom {
  InventoryRoom_Id:   string        // uuid PK
  InventoryReport_id: string        // FK → inventory_reports
  room_name:          string
  room_type_id:       number | null // FK → ref_room_types
  condition_id:       number | null // FK → ref_condition_levels
  clerk_notes:        string | null
  ai_description:     string | null
  sort_order:         number
}

export interface DbInventoryItem {
  InventoryItem_id: string        // uuid PK
  room_id:          string        // FK → inventory_rooms
  item_type_id:     number | null // FK → ref_item_types
  item_label:       string | null
  quantity:         number
  condition_id:     number | null // FK → ref_condition_levels
  clerk_notes:      string | null
  ai_description:   string | null
  sort_order:       number
}

export interface DbMedia {
  Media_id:       string        // uuid PK
  entity_type_id: number        // FK → ref_entity_types NOT NULL
  entity_id:      string        // uuid of referenced entity
  storage_path:   string
  public_url:     string
  media_type_id:  number | null // FK → ref_media_types
  caption:        string | null
  ai_analysis:    string | null
  User_Id:        string | null // FK → users
  auto_delete_at: string | null
  created_at:     string
}

export interface DbService {
  Service_Id:      string        // uuid PK
  property_id:     string | null // FK → properties
  User_id:         string        // FK → users
  service_type_id: number | null // FK → ref_service_types
  status_id:       number | null // FK → ref_service_status
  start_date:      string
  end_date:        string | null
  notes:           string | null
  created_at:      string
}

export interface DbChatConversation {
  id:         string        // uuid PK
  user_id:    string | null // FK → users (nullable = anonymous)
  session_id: string
  created_at: string
}

export interface DbChatMessage {
  id:               string        // uuid PK
  conversation_id:  string        // FK → chat_conversations
  role_id:          number        // FK → ref_chat_roles NOT NULL
  content:          string
  navigation_links: Json | null   // [{label, href}]
  created_at:       string
}

// ── Database shape for createClient<Database>() ───────────────────────────────
export interface Database {
  public: {
    Tables: {
      ref_portal_roles:     { Row: RefPortalRole;     Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_property_types:   { Row: RefPropertyType;   Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_property_status:  { Row: RefPropertyStatus; Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_tenancy_status:   { Row: RefTenancyStatus;  Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_furnished_types:  { Row: RefFurnishedType;  Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_letting_status:   { Row: RefLettingStatus;  Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_report_types:     { Row: RefReportType;     Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_report_status:    { Row: RefReportStatus;   Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_condition_levels: { Row: RefConditionLevel; Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_room_types:       { Row: RefRoomType;       Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_item_types:       { Row: RefItemType;       Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_entity_types:     { Row: RefEntityType;     Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_media_types:      { Row: RefMediaType;      Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_service_types:    { Row: RefServiceType;    Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_service_status:   { Row: RefServiceStatus;  Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      ref_chat_roles:       { Row: RefChatRole;       Insert: Partial<LookupRow>; Update: Partial<LookupRow> }
      users:                { Row: DbUser;             Insert: Partial<DbUser>;    Update: Partial<DbUser>    }
      properties:           { Row: DbProperty;         Insert: Omit<DbProperty, 'Property_Id'|'created_at'|'updated_at'>; Update: Partial<DbProperty> }
      property_tenancies:   { Row: DbPropertyTenancy;  Insert: Omit<DbPropertyTenancy, 'Tenant_id'|'created_at'>;        Update: Partial<DbPropertyTenancy> }
      property_lettings:    { Row: DbPropertyLetting;  Insert: Omit<DbPropertyLetting, 'Letting_Id'|'created_at'>;       Update: Partial<DbPropertyLetting> }
      inventory_reports:    { Row: DbInventoryReport;  Insert: Omit<DbInventoryReport, 'InventoryReport_id'|'created_at'|'updated_at'>; Update: Partial<DbInventoryReport> }
      inventory_rooms:      { Row: DbInventoryRoom;    Insert: Omit<DbInventoryRoom, 'InventoryRoom_Id'>;                 Update: Partial<DbInventoryRoom> }
      inventory_items:      { Row: DbInventoryItem;    Insert: Omit<DbInventoryItem, 'InventoryItem_id'>;                 Update: Partial<DbInventoryItem> }
      media:                { Row: DbMedia;             Insert: Omit<DbMedia, 'Media_id'|'created_at'>;                   Update: Partial<DbMedia> }
      services:             { Row: DbService;           Insert: Omit<DbService, 'Service_Id'|'created_at'>;               Update: Partial<DbService> }
      chat_conversations:   { Row: DbChatConversation;  Insert: Omit<DbChatConversation, 'id'|'created_at'>;              Update: Partial<DbChatConversation> }
      chat_messages:        { Row: DbChatMessage;       Insert: Omit<DbChatMessage, 'id'|'created_at'>;                   Update: Partial<DbChatMessage> }
    }
    Views:   Record<string, never>
    Functions: Record<string, never>
    Enums:   Record<string, never>
  }
}
