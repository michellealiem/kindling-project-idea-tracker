# Agent Memory Architecture Reference

> Source: [@rohit4verse](https://x.com/rohit4verse) thread on building agents that never forget
> Saved: 2026-01-18

## The Core Problem

Standard approaches fail at scale:
- **Chat history**: Fills context window after ~10 exchanges, then truncates and forgets
- **Vector embeddings**: After 500+ entries, retrieval returns conflicting fragments from different time periods
- **Key insight**: Embeddings measure *similarity*, not *truth*

## Mental Model

**Memory is infrastructure, not a feature.**

Treat agents like operating systems:
- **Process Management**: Track concurrent tasks
- **Memory Management**: Allocate, update, and free knowledge
- **I/O Management**: Interface with tools and users

You need both:
- "RAM" - fast, volatile context for current conversation
- "Hard drive" - persistent, indexed knowledge that survives sessions

---

## Short-Term Memory: Checkpointing

Every agent operates as a state machine. A checkpoint is a snapshot of the entire state.

**Capabilities:**
- **Determinism**: Replay any conversation
- **Recoverability**: Resume exactly where you left off
- **Debuggability**: Rewind to inspect agent's "thoughts"

```python
# Use Postgres-backed checkpointers in production
from langgraph.checkpoint.postgres import PostgresSaver

checkpointer = PostgresSaver(conn_string)
graph = workflow.compile(checkpointer=checkpointer)
```

---

## Long-Term Memory Architecture A: File-Based Memory

Best for: Assistants, therapists, companions (narrative coherence)

### Three-Layer Hierarchy

| Layer | Purpose | Example |
|-------|---------|---------|
| **Resources** | Raw data, immutable, timestamped | Conversation transcripts |
| **Items** | Atomic facts extracted from resources | "User prefers Python" |
| **Categories** | Evolving summaries | `work_preferences.md` |

### Write Path: Active Memorization

```python
class FileBasedMemory:
    def memorize(self, conversation_text, user_id):
        # 1. Save raw input (traceability)
        resource_id = self.save_resource(user_id, conversation_text)

        # 2. Extract atomic facts
        items = self.extract_items(conversation_text)

        # 3. Batch by category (efficiency)
        updates_by_category = {}
        for item in items:
            cat = self.classify_item(item)
            updates_by_category.setdefault(cat, []).append(item['content'])
            self.save_item(user_id, cat, item, resource_id)

        # 4. Evolve summaries (handles contradictions automatically)
        for category, new_memories in updates_by_category.items():
            existing = self.load_category(user_id, category)
            updated = self.evolve_summary(existing, new_memories)
            self.save_category(user_id, category, updated)

    def evolve_summary(self, existing, new_memories):
        """LLM rewrites profile, replacing outdated info"""
        prompt = f"""You are a Memory Synchronization Specialist.

        ## Original Profile
        {existing or "No existing profile."}

        ## New Memory Items
        {chr(10).join(f"- {m}" for m in new_memories)}

        # Task
        1. Update: If items conflict, overwrite old facts
        2. Add: If items are new, append logically
        3. Output: Return ONLY the updated markdown profile."""
        return llm.invoke(prompt)
```

### Read Path: Tiered Retrieval

```python
class FileBasedRetrieval:
    def retrieve(self, query, user_id):
        # 1. Select relevant categories (not all)
        all_cats = self.list_categories(user_id)
        relevant = self.select_relevant_categories(query, all_cats)

        # 2. Load summaries
        summaries = {cat: self.load_category(user_id, cat) for cat in relevant}

        # 3. Check if sufficient
        if self.is_sufficient(query, summaries):
            return summaries

        # 4. Drill down: Items -> Resources
        search_query = self.generate_search_query(query, summaries)
        items = self.search_items(user_id, search_query)
        return items or self.search_resources(user_id, search_query)
```

---

## Long-Term Memory Architecture B: Context-Graph Memory

Best for: CRM, research, precise systems (complex relationships)

### Hybrid Structure

- **Vector store**: Discovery (surface related text)
- **Knowledge graph**: Precision (subject-predicate-object facts)

### Conflict Resolution

```python
class GraphMemory:
    def add_memory(self, user_id, text):
        # Extract entities and relationships
        entities = self.extract_entities(text)

        for entity in entities:
            existing = self.graph.find_node(entity['name'])

            if existing:
                # Check for conflicts
                conflicts = self.find_conflicts(existing, entity)
                for conflict in conflicts:
                    # Archive old, make new active
                    self.graph.archive_edge(conflict['edge_id'])
                    self.graph.add_edge(
                        entity['name'],
                        conflict['new_value'],
                        conflict['relationship'],
                        metadata={'supersedes': conflict['edge_id']}
                    )
            else:
                self.graph.add_node(entity)
```

### Hybrid Retrieval

Run parallel searches, merge results:
1. **Vector Search**: Semantically similar conversations
2. **Graph Traversal**: Connected entities

---

## Memory Maintenance (Critical!)

**"Never forget" means "remember what matters"** - without decay, agents become confused, slow, and expensive.

### Maintenance Schedule

| Frequency | Task | Purpose |
|-----------|------|---------|
| **Nightly** | Consolidation | Merge redundant memories, promote frequently-accessed |
| **Weekly** | Summarization | Compress old items, prune 90-day untouched memories |
| **Monthly** | Re-indexing | Rebuild embeddings, adjust graph edges, archive 180-day unused |

```python
class MemoryMaintenance:
    def run_nightly_consolidation(self, user_id):
        recent = self.get_memories_since(user_id, hours=24)
        duplicates = self.find_duplicates(recent)
        for group in duplicates:
            self.replace_memories(group, self.merge_memories(group))

        for memory in self.get_high_access_memories(user_id):
            self.increase_priority(memory)

    def run_weekly_summarization(self, user_id):
        old = self.get_memories_older_than(user_id, days=30)
        for category, memories in self.group_by_category(old).items():
            self.save_summary(user_id, category, self.create_summary(memories))
            self.archive_old_items(memories)

        self.archive_memories(self.get_memories_not_accessed(user_id, days=90))
```

---

## Retrieval at Inference Time

Don't rely solely on vector similarity. Work backwards from context window constraints.

```python
class MemoryRetrieval:
    def retrieve_for_inference(self, user_message, user_id, max_tokens=2000):
        # 1. Generate optimized search query
        search_query = self.generate_query(user_message)

        # 2. Semantic search (candidates, not answers)
        candidates = self.vector_store.search(search_query, user_id, top_k=20)

        # 3. Relevance filtering (>0.7 threshold)
        relevant = [(self.calculate_relevance(c, user_message), c)
                    for c in candidates
                    if self.calculate_relevance(c, user_message) > 0.7]

        # 4. Time decay ranking
        ranked = []
        for score, memory in relevant:
            age_days = (now() - memory.timestamp).days
            time_decay = 1.0 / (1.0 + (age_days / 30))
            ranked.append((score * time_decay, memory))
        ranked.sort(reverse=True, key=lambda x: x[0])

        # 5. Assemble within token budget
        selected, token_count = [], 0
        for score, memory in ranked:
            tokens = self.count_tokens(memory.text)
            if token_count + tokens > max_tokens:
                break
            selected.append(memory)
            token_count += tokens

        return self.format_memory_context(selected)
```

---

## Five Critical Mistakes to Avoid

| Mistake | Problem | Solution |
|---------|---------|----------|
| **Storing raw conversations** | Noisy, polluted memory | Extract facts, not transcripts |
| **Blind embedding usage** | "Love job" and "hate job" embed similarly | Add resolution logic |
| **No memory decay** | Drowns in irrelevant past | Implement maintenance cron jobs |
| **No write rules** | Agent writes junk | Define explicit rules for what to remember |
| **Treating memory as chat history** | Ephemeral, not structured | Build structured knowledge representation |

---

## Key Takeaways

1. **Memory is infrastructure** - requires the same care as database design
2. **Two proven architectures**: File-based (narrative) vs Graph-based (relational)
3. **Decay is essential** - without pruning, systems rot
4. **Time matters** - recent memories should generally beat old ones
5. **Structure > Storage** - storage is cheap, structure transforms stateless LLMs into persistent agents

---

## Relevance to Kindling/PAIA

This architecture could enhance:
- **PAIA memory files**: Use the 3-layer hierarchy (Resources → Items → Categories)
- **Theme extraction**: Apply the "evolve_summary" pattern for recurring themes
- **Learnings consolidation**: Weekly summarization of insights
- **Conflict resolution**: Handle contradictory learnings over time
