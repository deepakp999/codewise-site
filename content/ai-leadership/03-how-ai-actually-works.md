---
title: "How AI Actually Works — A Leader's Mental Model"
description: "Build an intuitive understanding of how machine learning and large language models work — no math, just the mental models you need for sound business decisions."
order: 3
module: "ai-literacy"
module_title: "AI Literacy for Every Leader"
tags: ["how ai works", "machine learning basics", "llm explained", "ai for executives", "mental model"]
prev_slug: "the-full-ai-toolkit"
next_slug: "ai-business-models"
---

# How AI Actually Works — A Leader's Mental Model

## What You'll Learn
- How classical ML learns from data (the pattern-matching mental model)
- How large language models generate text (the next-word-prediction mental model)
- Key concepts leaders encounter: training data, fine-tuning, RAG, hallucinations
- The practical implications of each concept for business decisions

## The Meridian Story

After the AI toolkit session, David (CFO) pulled Priya (CTO) aside. "I understand what AI can do now. But I don't understand how it does it. When a vendor tells me their model has '97% accuracy' or that we need to 'fine-tune a foundation model,' I don't know how to evaluate those claims."

Priya offered a working session — not to teach David to code, but to give him the mental models he needed to ask informed questions. "You don't need to understand calculus to evaluate a financial model," she said. "And you don't need to understand neural network architecture to evaluate an AI proposal. But you do need the right intuition."

This lesson provides that intuition.

## How Classical ML Works — The Pattern-Matching Model

Classical ML learns from examples. The process has three phases:

**Phase 1: Training**

You give the system historical data with known outcomes. For example, Meridian's fraud detection model was trained on five years of expense reports — each labeled as "legitimate" or "fraudulent" by the finance team.

The model examines thousands of examples and finds patterns: fraudulent expenses tend to be submitted on Fridays, tend to be just below approval thresholds, tend to come from certain expense categories, and tend to have round numbers.

Think of it like an experienced auditor who has reviewed 50,000 expense reports. They develop instincts — patterns they can't always articulate but can consistently recognize.

**Phase 2: Testing**

Before deployment, the model is tested on data it has never seen. If it correctly identifies 95% of known fraud cases while flagging only 2% of legitimate expenses, the team has a measure of performance.

This is where the "97% accuracy" claims come from. Leaders should ask: Accuracy on what data? Over what time period? What are the consequences of the 3% it gets wrong?

**Phase 3: Inference (Production)**

The model is deployed. New expense reports flow in, and the model scores each one: "82% likely legitimate" or "94% likely fraudulent." Human reviewers focus their attention on high-risk items.

The key insight: **ML doesn't understand expenses or fraud. It recognizes statistical patterns in data.** If the patterns change — if a new type of fraud emerges that doesn't match historical patterns — the model will miss it until it's retrained with new examples.

### What Leaders Should Take Away

- ML models are only as good as the data they're trained on. Historical data with biases produces biased models.
- "Accuracy" is not a single number — ask about false positives (flagging legitimate items) and false negatives (missing real issues).
- Models need ongoing monitoring and retraining. A model trained on 2022 data may not perform well on 2026 patterns.

## How Large Language Models Work — The Next-Word Model

LLMs (GPT, Claude, Gemini, Llama) work on a fundamentally different principle from classical ML. Understanding this difference helps leaders set appropriate expectations.

**The core mechanism:** An LLM predicts the most likely next word (or token) in a sequence. It does this billions of times, word by word, to produce paragraphs, essays, code, and conversations.

An analogy: imagine reading every book, article, website, and conversation transcript ever written — billions of documents. After absorbing all that text, you develop an extraordinary intuition for how language works: what typically follows what, how arguments are structured, how code is written, how different topics connect.

That's what an LLM has — a vast statistical model of language patterns, trained on enormous amounts of text. When you give it a prompt, it generates a response by predicting what text would most plausibly follow, word by word.

**What this means in practice:**
- LLMs are remarkably good at generating fluent, contextually appropriate text
- They can summarize, translate, explain, draft, and transform text with impressive quality
- They don't "know" things the way a database does — they generate plausible text based on patterns
- They can produce text that sounds authoritative but is factually incorrect (hallucinations)

### Key Concepts Leaders Encounter

**Training data** — The text an LLM was trained on. This determines what it "knows." If a topic wasn't well-represented in training data, the model will be weaker on it. Enterprise-specific knowledge (your company's products, policies, processes) is almost certainly not in a general LLM's training data.

**Fine-tuning** — Additional training on a specific dataset to specialize a model. For example, fine-tuning a general LLM on medical literature produces a model that's stronger at medical tasks. Fine-tuning requires data, compute resources, and ML expertise.

**RAG (Retrieval-Augmented Generation)** — Instead of relying solely on what the LLM learned during training, RAG retrieves relevant documents from your data sources and includes them in the prompt. The LLM then generates answers based on your actual documents. This is often more practical than fine-tuning for enterprise use cases — it's faster to implement, easier to update, and keeps your data current.

**Hallucinations** — When an LLM generates text that sounds confident and plausible but is factually incorrect. This happens because the model is predicting likely text, not verifying facts. For high-stakes business use cases (legal, financial, medical), hallucination risk requires careful mitigation — human review, fact-checking pipelines, or RAG-based grounding in verified sources.

**Tokens** — LLMs process text in chunks called tokens (roughly 3–4 characters). This matters because LLM pricing is per token, and context windows (how much text the model can consider at once) are measured in tokens. When a vendor quotes pricing or context limits, they're talking about tokens.

## The Key Difference for Business Decisions

| | Classical ML | Generative AI (LLMs) |
|---|---|---|
| **Learns from** | Your historical data | Vast public text corpus |
| **Produces** | Predictions and scores | New text, code, images |
| **Strength** | Precision on specific tasks | Flexibility across many tasks |
| **Data requirement** | Needs your labeled data | Works out-of-the-box, enhanced with your data via RAG |
| **Customization** | Train a custom model | Fine-tune or use RAG |
| **Risk** | Model drift, biased training data | Hallucinations, data leakage |
| **ROI timeline** | Proven, faster for defined use cases | Still maturing for enterprise |
| **Examples** | Fraud detection, demand forecasting | Document drafting, summarization |

The practical implication: **when a vendor proposes an AI solution, ask which type of AI it uses.** The answer shapes everything — data requirements, accuracy expectations, risk profile, and cost.

## What This Means for Your Organization

- When evaluating an AI vendor: ask whether their solution uses classical ML (trained on your data) or GenAI (leveraging a general model). The answer determines data requirements and accuracy expectations.
- When considering GenAI for high-stakes use cases: understand the hallucination risk and ask what mitigation is in place (RAG, human review, confidence scores).
- When someone proposes "fine-tuning a model": ask what data will be used, how much it costs, and whether RAG might achieve the same goal more simply.

## Common Mistakes

- **Expecting LLMs to be factual databases** — LLMs generate plausible text, not verified facts. For any use case where accuracy matters, pair LLMs with retrieval systems (RAG) and human review.
- **Assuming "AI" means one type of technology** — A fraud detection model and a ChatGPT deployment are fundamentally different technologies with different requirements. Evaluate each on its own terms.
- **Ignoring the training data question** — For classical ML, the most important question is "what data was this trained on?" For LLMs, the most important question is "how will we ground this in our data?" In both cases, data quality is the determining factor.
- **Overcomplicating the technical understanding** — You don't need to understand backpropagation or transformer architecture. The mental models in this lesson — "pattern matching from data" for ML, "next-word prediction from vast text" for LLMs — are sufficient for sound business decisions.

## Key Takeaways

- Classical ML learns patterns from YOUR historical data and makes predictions. LLMs learn language patterns from vast public text and generate new content.
- Both types of AI are only as good as their data — historical data quality for ML, retrieval and grounding for LLMs.
- Key concepts for leaders: training data, fine-tuning, RAG, hallucinations, and tokens. These come up in every AI vendor conversation and investment decision.
- The right level of technical understanding for a leader is enough to ask informed questions and evaluate proposals — not enough to build models.

## Next Lesson

We know what AI is and how it works. Now let's connect it to business value. In Lesson 4, we'll explore **how AI creates business value** across four dimensions — revenue, cost, risk, and customer experience — with concrete examples mapped to each type of AI capability.
