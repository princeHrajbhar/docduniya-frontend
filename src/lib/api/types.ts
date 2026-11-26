/**
 * Response shapes of docduniya-backend (/api/v1), written from its services.
 * Only the fields the frontend reads are listed; the API may return more.
 */

export type Page<T> = { items: T[]; nextCursor?: string };
export type CommandResult = { id: string; version: number };

export type HumanName = {
  display: string;
  given?: string;
  middle?: string;
  family?: string;
  prefix?: string;
};
export type Contact = { kind: "PHONE" | "EMAIL"; value: string; use: "PERSONAL" | "WORK" | "EMERGENCY" };
export type Address = {
  use: "HOME" | "WORK" | "MAILING" | "TEMPORARY";
  line1: string;
  line2?: string;
  locality?: string;
  city: string;
  district?: string;
  stateCode: string;
  postalCode: string;
  countryCode?: "IN";
};
export type Concept = { text: string; codings?: Array<{ system: string; code: string; display: string }> };

// ── Auth ───────────────────────────────────────────────────────────────────

export type CurrentUser = {
  userId: string;
  email: string;
  role: string;
  isVerified: boolean;
  mustChangePassword: boolean;
  permissions: string[];
};
export type LoginResult =
  | { accessToken: string; mfaRequired?: undefined }
  | { mfaRequired: true; challengeToken: string; expiresAt: string };
export type AuthSession = {
  id: string;
  userAgent?: string;
  ip?: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  current?: boolean;
};
export type MfaStatus = {
  enrolled: boolean;
  pending: boolean;
  activatedAt?: string;
  recoveryCodesRemaining: number;
  enforcedForAdministrators: boolean;
};

// ── Identity ───────────────────────────────────────────────────────────────

export type Sex = "FEMALE" | "MALE" | "OTHER" | "UNKNOWN";
export type PatientSummary = { id: string; name: HumanName; status: string; version: number };
export type Patient = {
  id: string;
  name: HumanName;
  birthDate?: string;
  administrativeSex: Sex;
  preferredLanguage: string;
  addresses: Address[];
  contacts: Contact[];
  emergencyContacts: Array<{ name: HumanName; relation: string; phone: string }>;
  status: string;
  version: number;
};
export type Practitioner = {
  id: string;
  name: HumanName;
  profession: string;
  birthDate?: string;
  contacts: Contact[];
  residentialAddresses: Address[];
  languages: string[];
  status: string;
  version: number;
};
export type DoctorVerificationStatus = "UNVERIFIED" | "IN_REVIEW" | "VERIFIED" | "SUSPENDED";
export type DoctorProfile = {
  id: string;
  slug: string;
  publicName: string;
  bio: string;
  specialtyIds: string[];
  careerStartDate?: string;
  verificationStatus: DoctorVerificationStatus;
  verificationCaseId?: string;
  verifiedUntil?: string;
  profilePublished: boolean;
  version: number;
};
export type Specialty = { id: string; code: string; name: string };
export type Qualification = {
  id: string;
  kind: string;
  qualificationName: string;
  institutionName: string;
  awardYear?: number;
  completionDate?: string;
  status: "DECLARED" | "VERIFIED" | "SUSPENDED" | "EXPIRED" | "REJECTED";
  version: number;
};
export type ProfessionalRegistration = {
  id: string;
  authority: string;
  jurisdiction: string;
  registrationNumberNormalized: string;
  issuedOn?: string;
  expiresOn?: string;
  status: "DECLARED" | "VERIFIED" | "SUSPENDED" | "EXPIRED" | "REJECTED";
  version: number;
};
export type Affiliation = {
  id: string;
  doctorId: string;
  organizationId: string;
  facilityId: string;
  title: string;
  department: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "ENDED" | "REJECTED";
  invitationExpiresAt?: string;
  version: number;
};
export type Membership = {
  id: string;
  organizationId: string;
  status: string;
  facilityScope: "ALL" | "SELECTED";
  facilityIds: string[];
  validFrom?: string;
  validUntil?: string;
  invitationExpiresAt?: string;
  version: number;
};
export type Organization = { id: string; displayName: string; legalName?: string; status: string; version: number };
export type VerificationCase = {
  id: string;
  doctorId?: string;
  organizationId?: string;
  status: string;
  createdAt?: string;
  decisionAt?: string;
  validUntil?: string;
  reason?: string;
  version: number;
};
export type DoctorVerificationDetail = VerificationCase & {
  identitySnapshot: { name: HumanName; birthDate?: string };
  profileSnapshot: { publicName: string; bio: string; specialtyIds: string[] };
  registrationSnapshot: {
    authority: string;
    jurisdiction: string;
    registrationNumberNormalized: string;
    issuedOn?: string;
    expiresOn?: string;
    evidenceReference: string;
  };
  qualificationSnapshots: Array<{
    kind: string;
    qualificationName: string;
    institutionName: string;
    awardYear?: number;
    evidenceReference: string;
  }>;
  declaration: string;
};

// ── Discovery and booking ──────────────────────────────────────────────────

export type ConsultMode = "IN_PERSON" | "VIDEO" | "AUDIO";
export type PaymentPolicy = "PAY_AT_PROVIDER" | "PREPAY" | "FREE";
export type PublicDoctorListing = {
  id: string;
  doctorId: string;
  slug: string;
  publicName: string;
  bio: string;
  organization: { id: string; name: string };
  facility: {
    id: string;
    name: string;
    kind: string;
    address?: Partial<Address>;
    contacts: Array<{ kind: string; value: string }>;
  };
  title: string;
  department: string;
  specialties: Specialty[];
  qualifications: Array<{ name: string; institution: string; awardYear?: number }>;
  languages: string[];
  bookable: boolean;
  offerings: Array<{
    id: string;
    name: string;
    mode: ConsultMode;
    durationMinutes: number;
    paymentPolicy: PaymentPolicy;
    price?: { totalMinor: number; currency: string };
  }>;
  rating?: { average: number; count: number };
};
export type PublicReview = {
  id: string;
  rating: number;
  text?: string;
  author: string;
  createdAt: string;
  providerReply?: { text: string; at: string };
};
export type Price = { id: string; amountMinor: number; taxMinor: number; totalMinor: number; currency: string };
export type CancellationPolicy = { [key: string]: unknown };
export type PublicOffering = {
  id: string;
  version: number;
  name: string;
  mode: ConsultMode;
  durationMinutes: number;
  paymentPolicy: PaymentPolicy;
  cancellationPolicy: CancellationPolicy;
  price: Price;
  doctor: { id: string; name: string };
  facility: { id: string; name: string };
  organization: { id: string; name: string };
};
export type Availability = {
  offeringId: string;
  offeringVersion: number;
  price: Price;
  timezone: string;
  slots: Array<{ startAt: string; endAt: string; available: boolean }>;
};
export type AppointmentStatus =
  | "HELD"
  | "CONFIRMED"
  | "EXPIRED"
  | "CANCELLED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DISCONTINUED"
  | "NO_SHOW";
export type Appointment = {
  id: string;
  bookingNumber?: string;
  organizationId: string;
  facilityId: string;
  patientId: string;
  doctorId: string;
  offeringId: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  holdExpiresAt?: string;
  offering: { name: string; mode: ConsultMode; durationMinutes: number };
  price: { amountMinor: number; taxMinor: number; totalMinor: number; currency: string };
  paymentPolicy: PaymentPolicy;
  cancellationPolicy?: CancellationPolicy;
  reasonForVisit?: string;
  requiresReassignment?: boolean;
  refundRequired?: boolean;
  reason?: string;
  version: number;
};
export type PaymentIntent = {
  id: string;
  status: "CREATED" | "ORDER_PENDING" | "READY" | "SUCCEEDED" | "CANCELLED" | "RECONCILE";
  outcome?: string;
  amountMinor: number;
  currency: string;
  appointmentId?: string;
  expiresAt?: string;
  checkout?: { provider: "RAZORPAY"; keyId: string; orderId: string };
  version: number;
};

// ── Records ────────────────────────────────────────────────────────────────

export type PrescriptionItem = {
  id: string;
  lineNumber: number;
  medication: { name: string; form: string; strength?: string };
  dosage: Array<{
    doseValue?: unknown;
    doseUnit?: string;
    route: string;
    frequencyPerDay?: number;
    timesOfDay?: string[];
    asNeeded?: boolean;
    durationDays?: number;
    instructions: string;
  }>;
  quantity: { value: number; unit: string };
  refillsAllowed?: number;
  instructions?: string;
  status: string;
  fulfillmentStatus?: string;
};
export type Prescription = {
  id: string;
  number?: string;
  issuedAt?: string;
  validUntil?: string;
  status: string;
  patientSnapshot?: { name: string; birthDate?: string };
  prescriberSnapshot?: {
    name: string;
    registrationNumber?: string;
    registrationAuthority?: string;
    facilityName?: string;
  };
  items: PrescriptionItem[];
};
export type ClinicalNote = {
  id: string;
  noteType: string;
  status: string;
  signedAt?: string;
  sections: { history?: string; examination?: string; assessment?: string; plan?: string };
};
export type Allergy = {
  id: string;
  substance: Concept;
  category: string;
  clinicalStatus: string;
  criticality: string;
  reactions?: Array<{ manifestation?: Concept; severity?: string; [key: string]: unknown }>;
  note?: string;
};
export type Condition = {
  id: string;
  code: Concept;
  clinicalStatus: string;
  verificationStatus: string;
  severity?: string;
  onset?: string;
  note?: string;
};
export type Immunization = { id: string; vaccine: Concept; status: string; occurrenceAt: string; doseText?: string };
export type Visit = {
  id: string;
  provider?: string;
  startedAt?: string;
  endedAt?: string;
  mode?: string;
  type?: string;
  status: string;
};
export type PatientRecords = {
  asOf: string;
  prescriptions: Prescription[];
  notes: ClinicalNote[];
  allergies: Allergy[];
  conditions: Condition[];
  immunizations: Immunization[];
  visits: Visit[];
};
export type DiagnosticReport = {
  id: string;
  reportNumber?: string;
  critical?: boolean;
  code?: Concept;
  status: string;
  issuedAt?: string;
  conclusion?: string;
  results: Array<{
    id: string;
    code: Concept;
    valueType: string;
    valueQuantity?: { value?: unknown; unit?: string };
    valueText?: string;
    valueCode?: Concept;
    valueBoolean?: boolean;
    interpretation?: "NORMAL" | "LOW" | "HIGH" | "CRITICAL_LOW" | "CRITICAL_HIGH" | "ABNORMAL";
    referenceRange?: { low?: unknown; high?: unknown; unit?: string; text?: string };
  }>;
};
export type DocumentCategory = "CLINICAL_REPORT" | "PRESCRIPTION" | "CREDENTIAL" | "IDENTITY" | "CONSENT" | "OTHER";
export type PatientDocument = {
  id: string;
  custody: "PATIENT" | "ORGANIZATION" | "USER";
  organizationId?: string;
  category: DocumentCategory;
  title: string;
  status: string;
  rejectionReason?: string;
  releasedToPatientAt?: string;
  createdAt: string;
  version: number;
};
export type UploadIntent = CommandResult & {
  status: string;
  upload: { method: "PUT"; url: string; headers: Record<string, string>; expiresAt: string };
};

// ── Engagement ─────────────────────────────────────────────────────────────

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  source?: string;
  sentAt?: string;
  readAt?: string;
};
export type SupportTicket = {
  id: string;
  category: string;
  subject: string;
  description: string;
  status: "OPEN" | "ASSIGNED" | "WAITING" | "RESOLVED" | "CLOSED";
  priority?: string;
  dueAt?: string;
  replies: Array<{ role: string; body: string; at: string }>;
  resolution?: string;
  version: number;
};
export type ModerationReview = { id: string; doctorId: string; rating: number; text?: string; createdAt: string; version: number };

// ── Platform administration ────────────────────────────────────────────────

export type PlatformUser = {
  _id?: string;
  id?: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  lockedUntil?: string;
  createdAt: string;
};
export type PlatformRole = { _id?: string; id?: string; slug: string; name: string; permissions: string[] };
export type OutboxHealth = { pending: number; failed: number; oldestPendingAgeSeconds: number };
export type FailedEvent = {
  id: string;
  eventId: string;
  type: string;
  aggregateType: string;
  aggregateId: string;
  attempts: number;
  occurredAt: string;
};
export type PatientRegistration = {
  id: string;
  patientId: string;
  mrn: string;
  primaryFacilityId: string;
  demographicSnapshot?: { name?: HumanName };
  status: string;
  version: number;
};
