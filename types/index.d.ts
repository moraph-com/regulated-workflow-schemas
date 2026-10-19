/* Generated from schemas/ by scripts/build-types.mjs. Do not edit by hand: run npm run types. */
export type { VendorRiskReview } from "./vendor-risk-review.js";
export type { PatientSafetyIncident } from "./patient-safety-incident.js";
export type { PermitApplication } from "./permit-application.js";
export type { BoardAction } from "./board-action.js";

import type { VendorRiskReview, PatientSafetyIncident, PermitApplication, BoardAction } from "./index.js";
/** Any record in one of this package's formats. */
export type AnyRecord = VendorRiskReview | PatientSafetyIncident | PermitApplication | BoardAction;
