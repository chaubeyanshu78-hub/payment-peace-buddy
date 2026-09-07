# UPI Shield

give me a proper documentation and ppt format step by step , this topic is " UPI-Shield: Contextual Digital Payment

Scam & Coercion Detector

The Real-World Context (In Simple Words): Scammers use psychological tricks

like "electricity disconnection" to steal money via UPI, making traditional 2FA

ineffective.

The Core Problem: Users willingly authorize fraudulent transactions under duress

or deception.

Why This Problem Matters: Millions of digital payment users in India are vulnerable to

social-urgency deception where traditional 2FA and MPIN checks fail because the user

willingly authorizes the transaction under duress or deception.

Your Exact 4-Hour Mission (What to Build):

● 1. Interface to ingest SMS, WhatsApp, or payment notes.

● 2. NLP engine to detect urgency markers and unauthorized authority claims.

● 3. Output a Threat Meter and bilingual (English/Hindi) safety warnings.

Recommended Tech Stack & Free Resources: Python (FastAPI/Streamlit),

Hugging Face zero-shot classifiers, Gemini free tier, Google Translate.

4-Hour MVP Deliverable: End-to-end web application that processes message text, flags

deceptive triggers, and outputs bilingual safety cards.

Expected 60–90 Second Live Demo: Paste a scam message about a "verification

refund"; the tool must flag it as High Risk and show the Hindi translation.

Organizer & Judging Notes:

● Team Size: 2–3 members (accessible to solo developers).

● Estimated Feasibility: Very High (~2 hours build, 2 hours polish).

● Judging Focus: Accuracy of scam trigger identification, explanation clarity for

non-technical users.

● What to Reject as Incomplete: Trivial string equality matching (e.g., if "pin" in text)

without generalizable heuristics or semantic analysis.

● Bonus Features: Parsing raw UPI intent strings (upi://pay?pa=...); OCR extraction

from uploaded mobile screenshots."                                                                                             build documentetion and project or back and

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4ded6048-72b4-40ab-a03c-d3c75c45b81a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
