# Medical Document Types HealthLens Users Might Scan

Catalog of paper documents a patient or caregiver might photograph. Use it as the input to an LLM that generates more synthetic samples.

**Already written (16):** 4 discharge summaries, 4 prescription labels/notes, 4 bills/EOBs, 4 lab reports. See `samples/`. The categories below include those four plus many more.

---

## Instructions for the generating LLM

Generate one realistic, **fully fictional** document per request, in plain text, as it would appear printed on paper.

1. **Fake data only.** Invent every patient, doctor, facility, MRN, member ID and address. Use `555-01xx` phone numbers and `.example` domains. Never use real people or real facilities.
2. **Write like the real thing**, not like a patient-friendly handout. Use the jargon, abbreviations (`PRN`, `BID`, `NPO`, `s/p`, `HD#3`), codes, tables and legal boilerplate that the real document type has.
3. **Include the "what to do" content** a patient must act on: medication changes, deadlines, follow-ups, warning signs, amounts owed. HealthLens must find and highlight these.
4. **Vary the details:** age, condition, urgency, length, tone and layout, including different facilities, insurers and formats.
5. **Include at least 2 traps** per document so the AI has something to catch. Examples: a medication that was stopped, a dose that changed, an abnormal value, a deadline, an "IS NOT A BILL" notice, an allergy.
6. **Put the layout in plain text.** Use monospace columns for tables and ALL-CAPS section labels. For handwritten or messy types, say so in a header line.
7. **Length:** 150 to 450 words, one printed page.
8. **Tag each file** with a header comment: `<!-- type: ... | difficulty: easy|medium|hard | reading-level: ... -->` (strip it before rendering to PDF).

---

## 1. Hospital and visit documents

| Type | What it contains | Jargon and traps | Key patient actions |
|---|---|---|---|
| Discharge summary | Diagnosis, hospital course, discharge meds, follow-up | Abbreviations, NEW/CONTINUE/STOP meds | Take meds, book follow-ups, know when to call 911 |
| Discharge instructions (post-surgery) | Wound care, activity limits, pain control | WBAT, PRN, DVT prophylaxis | Wound care, restrictions, red-flag symptoms |
| Emergency room visit summary | Chief complaint, tests done, impression, disposition | "Rule out", "impression", "disposition" | Follow up with PCP, return precautions |
| Urgent care visit note | Short exam summary, diagnosis, Rx | "Self-limiting", "supportive care" | Meds, rest, when to return |
| After-visit summary (AVS) | Visit recap, med list, orders, next appt | Updated vs. unchanged meds | Check med changes, schedule tests |
| Clinic progress note (SOAP) | Subjective/Objective/Assessment/Plan | `A/P`, `RTC 3 mo`, `d/c`, `r/o` | Plan items, labs to get |
| Operative / procedure report | What surgeons did, findings, complications | Anatomical and surgical terms | Usually informational; post-op plan |
| Hospital transfer summary | Reason for transfer, active issues, meds | `s/p`, `hx`, `c/w` | For the caregiver to hand to the next facility |
| Observation / "outpatient status" notice (MOON) | Tells patient they were not formally admitted | Billing consequences | Understand coverage differences |
| Against-medical-advice (AMA) form | Patient leaves despite advice | Legal consent language | Risks, how to return |
| Hospice or palliative care plan | Comfort goals, meds, contacts | "Comfort measures", "DNR" | Who to call, med schedule |
| Maternity discharge (mother) | Delivery type, recovery, warning signs | `C-section`, `lochia`, `postpartum` | Bleeding and infection signs, checkups |
| Newborn discharge | Feeding, jaundice, screening results, vaccines | Bilirubin, newborn screen | Pediatric visit, feeding schedule |

## 2. Medication documents

| Type | Contents | Traps | Actions |
|---|---|---|---|
| Pharmacy label (bottle) | Drug, strength, sig, qty, refills | "Take with food", warnings, expiration | Dose, timing |
| Prescription (paper script) | Drug, sig, dispense, refills, signature | `qHS`, `BID`, `PRN`, Rx abbreviations | Take to pharmacy |
| Handwritten prescription note | Messy shorthand | Hard OCR, abbreviations | Same |
| Pharmacy information sheet (stapled leaflet) | Uses, side effects, interactions | Long, dense warnings | What to avoid, when to call |
| Medication list / reconciliation | All current meds | NEW, CHANGED, STOPPED | Update the pill box |
| Medication schedule / pill chart | Times and doses | Complex multi-drug timing | Daily routine |
| Prior-authorization denial letter | Insurer won't cover a drug | Appeal rights, deadlines | Appeal, ask for an alternative |
| Controlled-substance agreement | Opioid contract | Legal terms, drug testing | Rules to follow |
| Insulin dosing sheet / sliding scale | Dose per glucose range | Math-heavy | Correct dose |
| Anticoagulant (warfarin) dosing calendar | INR, daily dose by day | Dose changes weekly | Take correct dose each day |
| Drug recall notice | Lot numbers, stop-use advice | Lot matching | Check bottle, contact pharmacy |
| Vaccine record / immunization card | Vaccines and dates | Lot numbers, abbreviations (`DTaP`, `MMR`) | Which are due |

## 3. Lab and imaging documents

| Type | Contents | Traps | Actions |
|---|---|---|---|
| CBC | Blood counts | H/L flags | Follow-up with doctor |
| Basic / comprehensive metabolic panel | Kidney, electrolytes, glucose | Critical values, K+ | Urgent callback |
| Lipid panel | Cholesterol | LDL targets | Diet, statin talk |
| HbA1c / diabetes labs | Glucose control | Ranges for pre/diabetes | Meds, diet |
| Thyroid panel | TSH, T4 | Subclinical values | Follow-up |
| Urinalysis | Dipstick, microscopy | Unfamiliar terms | Culture follow-up |
| Pathology / biopsy report | Tissue findings | "Benign", "malignant", margins, grade | Oncology referral; highly sensitive |
| Radiology report (X-ray, CT, MRI, US) | Findings, impression | "Unremarkable", "incidental", "recommend follow-up" | Follow-up imaging, specialist |
| Mammogram result letter | BI-RADS category | Callback / dense breast notice | Repeat imaging |
| Cardiology: ECG / echo / stress test report | EF %, rhythm | `EF 55%`, "sinus rhythm" | Follow-up |
| Genetic / carrier test report | Variants, risk | "VUS", "pathogenic" | Genetic counseling |
| Allergy test results | Skin/blood IgE | Wheal sizes | Avoidance |
| COVID / flu / strep test | Positive/negative | Isolation guidance | Isolation, meds |
| Sleep study report | AHI, oxygen levels | Severity categories | CPAP |
| Pregnancy / prenatal screening | NT scan, quad screen | Risk ratios (`1:250`) | Further testing |

## 4. Insurance and billing documents

| Type | Contents | Traps | Actions |
|---|---|---|---|
| Hospital bill / patient statement | Itemized charges, adjustments, balance | Rev codes, "contractual adjustment" | Pay, appeal, or ask for aid |
| Explanation of Benefits (EOB) | Allowed vs. billed, patient share | "THIS IS NOT A BILL" | Wait for the real bill |
| Medicare Summary Notice (MSN) | Quarterly claims | Part A/B terms | Check for fraud |
| Itemized bill | Every CPT/HCPCS line | Duplicate or upcoded lines | Dispute errors |
| Past-due / collections notice | Late fees, deadlines | Threats, credit reporting | Payment plan, dispute |
| Financial assistance / charity-care application | Income forms | Eligibility thresholds | Apply before deadline |
| Insurance denial letter | Denied claim | Appeal rights, 180-day deadlines | File appeal |
| Pre-authorization approval | Approved procedures | Valid dates, limits | Schedule within window |
| No Surprises Act / Good Faith Estimate | Expected charges | Out-of-network disclosures | Compare to real bill |
| Insurance card + plan summary (SBC) | Deductible, copay, OOP max | Terms | Know your costs |
| Medical-equipment (DME) invoice | Walker, CPAP, etc. | Rental vs. purchase | Pay, returns |
| Ambulance bill | Mileage, base fee | Out-of-network surprises | Appeal |
| Flexible spending / HSA claim form | Receipts | Eligibility | Submit claim |
| Disability / FMLA paperwork | Work leave forms | Legal terms | Employer deadlines |

## 5. Appointments, referrals, and administrative

| Type | Contents | Traps | Actions |
|---|---|---|---|
| Appointment reminder card / letter | Date, time, location, prep | Fasting, arrive early | Show up prepared |
| Referral letter | Specialist, reason, validity | Expiration dates | Book appointment |
| Pre-procedure instructions | NPO, hold meds, arrival time | Which meds to stop | Strictly follow |
| Colonoscopy prep instructions | Diet, laxative timing | Multi-step timeline | Follow the schedule |
| Patient intake / medical history form | Questions to fill out | Jargon in checkboxes | Fill in |
| Consent for surgery / treatment | Risks, signatures | Legal language | Understand before signing |
| HIPAA privacy notice | Rights explanation | Long legalese | Mostly informational |
| Advance directive / living will / POLST | End-of-life wishes | Legal, emotional | Choose, sign, share |
| Work / school excuse note | Dates away | Return-to-work limits | Give to employer |
| Home health or physical-therapy plan | Exercises, frequency | Medical-exercise terms | Daily routine |
| Test-results letter (normal) | "Your results are normal" | Fine print | Often none |
| Test-results letter (callback) | "Please call us" | Alarming but vague | Call, book visit |

## 6. Condition-specific patient paperwork

| Type | Contents |
|---|---|
| Diabetes care plan | Glucose targets, insulin, hypoglycemia rules |
| Heart failure daily-weight chart | Weigh daily, call if +3 lb |
| Asthma / COPD action plan | Green/yellow/red zone steps |
| Anticoagulation clinic note | INR result, new warfarin dose |
| Chemotherapy / radiation schedule | Cycle dates, side-effect management, fever rules |
| Dialysis schedule and diet | Fluid and potassium limits |
| Pregnancy prenatal visit summary | Weeks, fundal height, next test |
| Wound care sheet | Dressing changes, infection signs |
| Cast or splint care | Keep dry, swelling, circulation checks |
| Concussion return-to-play form | Stage-by-stage rules |
| Mental-health visit summary / safety plan | Triggers, contacts, crisis number |
| Allergy / anaphylaxis action plan | EpiPen steps |
| Pediatric growth chart and vaccine schedule | Percentiles, due dates |
| Dietary plan (renal, cardiac, diabetic) | Allowed and avoided foods |
| Dental treatment plan / estimate | Procedure codes, cost split |
| Vision / eyeglass prescription | OD/OS, sphere, cylinder, axis |
| Hearing test (audiogram) | dB loss by frequency |

---

## Variations to request (to broaden coverage)

- **Reading level:** simple, standard, very dense/legal.
- **Document state:** clean print, faxed (noisy), photocopied, handwritten, crumpled, partially cut off.
- **Language:** English, English with some Spanish, a fully Spanish document (ESL users), bilingual hospital forms.
- **Urgency:** routine, time-sensitive (deadline in 7 days), critical (needs a call today).
- **Length:** a one-line pharmacy label up to a two-page discharge.
- **Complication:** several conditions or meds at once, conflicting instructions, a doctor's correction.
- **Accessibility edge cases:** very small print, all-caps blocks, tables with no labels, text on a colored background.

## Suggested priority for the demo

1. Discharge instructions, in three variants (surgery, chronic disease, short ER visit)
2. Pharmacy label and prescription
3. Lab results, one with a critical flag
4. EOB and bill (the "THIS IS NOT A BILL" trap is a strong demo moment)
5. Radiology or pathology report, to show handling of sensitive and uncertain wording
