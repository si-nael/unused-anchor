# Research Operations

## Purpose

This project should treat logs and memory as part of the research apparatus, not as incidental notes.

## Required Records

Maintain the following documents continuously:

- [../idea-log.md](../idea-log.md): raw ideas, reframings, and speculative branches
- [../decision-log.md](../decision-log.md): commitments, rationale, and consequences
- [../work-log.md](../work-log.md): concrete actions taken
- [../research/question-log.md](../research/question-log.md): unresolved research questions and status
- [../research/hypothesis-log.md](../research/hypothesis-log.md): falsifiable claims, evidence, and planned checks

## Update Rules

Update the logs whenever one of the following happens:

- a new foundational question appears
- a new hypothesis becomes sharp enough to test
- an architectural or mathematical commitment is made
- a significant implementation step is completed
- an old assumption is rejected or narrowed

## Separation of Concerns

Use each record for one kind of information only.

- Idea log: possible directions, speculative concepts, reframings
- Question log: unanswered problems that should remain visible
- Hypothesis log: claims that could be disconfirmed
- Decision log: choices that constrain future work
- Work log: what was actually done

## Memory Discipline

Repository memory should store durable facts that will matter across future sessions, such as:

- the core project framing
- the current build strategy
- the names and purpose of the canonical logs
- stable architectural vocabulary

Session-specific thoughts should stay out of repository memory unless they become durable project facts.

## Consistency Discipline

When discussing contradictions, always classify the issue before logging it:

- formal contradiction: the world specification entails incompatible statements
- simulation contradiction: the engine produces mutually incompatible states or transitions
- epistemic contradiction: an observer cannot reconcile evidence within its current model class
- narrative contradiction: the story layer conflicts with the operational world layer

## Practical Rule

If a conversation changes the project's core question, scope, or vocabulary, update both the relevant log and repository memory before closing the session.
