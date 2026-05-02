# Graph Report - /Users/kika_hub/_KIKA_MAIN/AKAKIKA@/akakika/src  (2026-04-23)

## Corpus Check
- Corpus is ~17,897 words - fits in a single context window. You may not need a graph.

## Summary
- 39 nodes · 39 edges · 2 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Graph Interaction Handlers|Graph Interaction Handlers]]
- [[_COMMUNITY_Input & Phase Events|Input & Phase Events]]

## God Nodes (most connected - your core abstractions)
1. `findNode()` - 4 edges
2. `handlePhaseChange()` - 3 edges
3. `handleWheel()` - 2 edges
4. `handleTouchMove()` - 2 edges
5. `handleMouseMove()` - 2 edges
6. `handleMouseDown()` - 2 edges
7. `handleClick()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 4 - "Graph Interaction Handlers"
Cohesion: 0.5
Nodes (4): findNode(), handleClick(), handleMouseDown(), handleMouseMove()

### Community 5 - "Input & Phase Events"
Cohesion: 0.67
Nodes (3): handlePhaseChange(), handleTouchMove(), handleWheel()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `findNode()` connect `Graph Interaction Handlers` to `Graph Visualization Engine`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `handlePhaseChange()` connect `Input & Phase Events` to `App Shell & Navigation`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._