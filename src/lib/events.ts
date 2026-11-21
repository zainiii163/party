/**
 * Client-side event fired immediately after a successful RSVP submission.
 *
 * Both the RSVP form and the polls live on the homepage. The polls' vote
 * eligibility is derived from a signed cookie that only exists after RSVP,
 * but the server-rendered value is captured at page load. Dispatching this
 * event lets on-page features unlock without a full reload.
 *
 * This only changes UI state. The vote API independently re-verifies the
 * signed participant cookie, so dispatching the event cannot grant access.
 */
export const RSVP_SUCCESS_EVENT = "cwr:rsvp-success";
