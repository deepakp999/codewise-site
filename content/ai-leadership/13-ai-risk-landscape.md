---
title: "The AI Risk Landscape — What Can Go Wrong and How to Prepare"
description: "A comprehensive risk taxonomy for AI in the enterprise — from hallucinations and bias to data leakage and model drift — with practical mitigation approaches."
order: 13
module: "ai-governance"
module_title: "AI Governance, Risk, and Ethics"
tags: ["ai risk", "hallucinations", "ai bias", "data leakage", "model drift"]
prev_slug: "ai-governance-framework"
next_slug: "responsible-ai"
---

# The AI Risk Landscape — What Can Go Wrong and How to Prepare

## What You'll Learn
- The seven categories of AI risk that affect enterprises
- How each risk manifests differently for classical ML vs GenAI
- Practical mitigation approaches for each risk category
- How to assess risk level for AI initiatives

## The Meridian Story

Elena (General Counsel) brought a structured risk briefing to the governance committee. "We need to understand what can go wrong before it does. Not to create fear, but to build appropriate safeguards."

She organized AI risks into seven categories, each with concrete examples relevant to Meridian's planned initiatives. The team found the exercise valuable — several risks they hadn't considered became governance priorities.

## The Seven Risk Categories

### 1. Accuracy and Hallucination Risk

**Classical ML:** Models produce incorrect predictions when data patterns change or edge cases appear. A demand forecasting model might predict normal demand during an unusual event (a supply chain disruption, a competitor's product launch).

**GenAI:** Large language models can generate text that sounds authoritative but is factually incorrect — hallucinations. This is particularly concerning when GenAI outputs are used in customer communications, legal documents, or financial reports.

**Mitigation:** Human review for high-stakes outputs. Confidence scores that flag uncertain predictions. RAG-based grounding in verified data sources for GenAI. Regular accuracy monitoring for deployed models.

### 2. Bias and Fairness Risk

AI models learn patterns from historical data — including historical biases. A hiring model trained on past hiring decisions may replicate existing biases. A lending model may disadvantage certain demographic groups if historical lending data reflects discriminatory patterns.

**Mitigation:** Audit training data for representation and balance. Test model outputs across demographic groups. Use fairness metrics during model development. Establish clear policies for human review of AI-influenced decisions that affect individuals.

### 3. Data Privacy and Leakage Risk

AI systems process large volumes of data, sometimes including sensitive information. Risks include: employee entering confidential data into a public AI tool, AI vendor accessing data beyond what's necessary, training data containing personal information, and model outputs inadvertently revealing private information.

**Mitigation:** Clear data classification policies (what can enter AI systems, what cannot). Approved tool lists with vetted data handling practices. Technical controls like data masking and access logging. Regular audits of data flowing into AI systems.

### 4. Security and Adversarial Risk

AI systems can be targets for malicious actors: prompt injection (manipulating GenAI through crafted inputs), model poisoning (corrupting training data), and unauthorized access to AI systems or their outputs.

**Mitigation:** Security review as part of AI initiative assessment. Input validation and filtering. Access controls on AI systems and their data. Monitoring for unusual usage patterns.

### 5. Model Drift and Reliability Risk

ML models degrade over time as real-world patterns change. A model trained on 2024 customer behavior may perform poorly on 2026 patterns. Without monitoring, this degradation goes unnoticed until business impact becomes visible.

**Mitigation:** Continuous performance monitoring with alerts. Scheduled model retraining. Comparison of model predictions against actual outcomes. Clear thresholds for when a model should be retrained or retired.

### 6. Vendor and Dependency Risk

Organizations using third-party AI tools depend on vendor stability, pricing, and continued service. Risks include: vendor changing terms or pricing, vendor discontinuing a service, vendor being acquired, and inability to migrate away from a vendor.

**Mitigation:** Data portability clauses in contracts. Understanding vendor's model and data practices. Avoiding over-dependence on a single vendor for critical capabilities. Regular vendor review.

### 7. Regulatory and Compliance Risk

AI regulation is evolving globally. The EU AI Act, US executive orders, and industry-specific regulations create compliance obligations for AI users — not just AI builders.

**Mitigation:** Covered in detail in Lesson 15. Key principle: compliance awareness should be part of every AI initiative assessment, not addressed after deployment.

## Risk Assessment for AI Initiatives

Add a risk assessment to the governance review process:

| Risk Category | Low | Medium | High |
|---|---|---|---|
| Accuracy | Internal use, advisory only | Customer-facing, human reviewed | Automated decisions affecting individuals |
| Bias | No individual impact | Affects groups indirectly | Directly influences decisions about people |
| Data privacy | Public data only | Internal data | Personal or confidential data |
| Security | No sensitive systems | Connected to internal systems | Connected to critical systems |
| Model drift | Low-stakes predictions | Revenue-impacting predictions | Safety or compliance-critical |
| Vendor dependency | Multiple alternatives exist | Limited alternatives | Single vendor, critical capability |
| Regulatory | No regulated data or decisions | Industry-regulated data | Directly regulated AI use cases |

Meridian used this matrix to classify their invoice processing initiative as "medium risk" (internal data, vendor dependency, no individual impact) and their eventual demand forecasting expansion as "low to medium risk" (internal data, built in-house, no individual impact).

## What This Means for Your Organization

- Risk assessment should be part of the AI initiative review process (Lesson 12), not a separate exercise. Integrate it into governance.
- The risk profile varies significantly by AI type: GenAI has higher hallucination and data leakage risk; classical ML has higher model drift risk. Assess accordingly.
- Most AI risks are manageable with proportionate safeguards. The goal is informed risk management, not risk elimination.

## Common Mistakes

- **Treating all AI risk as the same** — A meeting summarization tool and an automated lending decision have vastly different risk profiles. Govern proportionally.
- **Focusing only on GenAI risks** — Classical ML risks (model drift, bias in training data, accuracy degradation) are well-documented and equally important.
- **Assessing risk once and never revisiting** — Risk profiles change as AI systems evolve, data changes, and regulations update. Build periodic review into governance.
- **Assuming vendor tools are risk-free** — SaaS AI tools carry vendor dependency, data handling, and compliance risks that require the same governance attention as custom-built AI.

## Key Takeaways

- AI risk spans seven categories: accuracy, bias, data privacy, security, model drift, vendor dependency, and regulatory compliance.
- Risk assessment should be integrated into the governance review process for every AI initiative.
- Classical ML and GenAI have different risk profiles — assess each on its own terms.
- Most risks are manageable with proportionate safeguards. The goal is informed management, not avoidance.

## Next Lesson

Risk management is the defensive side. In Lesson 14, we'll cover the proactive side: **Responsible AI in Practice** — moving beyond ethics statements to concrete practices for fairness, transparency, and human oversight. Including a practical dimension often overlooked: how data quality directly affects AI fairness.
