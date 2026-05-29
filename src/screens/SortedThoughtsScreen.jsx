// SortedThoughtsScreen: displays brain dump thoughts auto-sorted into three categories
// TOMORROW (green border), LATER (purple border), NOT YOUR PROBLEM TONIGHT (dimmed)
// Supports drag and drop between buckets and within buckets via @hello-pangea/dnd
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useSession } from "../context/SessionContext";
import { categorizeThoughts } from "../utils/categorizeThoughts";
import styles from "./SortedThoughtsScreen.module.css";

// Hamburger grip handle for each thought card
function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="1.5">
      <circle cx="5" cy="4" r="1" fill="#6B7280" stroke="none" />
      <circle cx="11" cy="4" r="1" fill="#6B7280" stroke="none" />
      <circle cx="5" cy="8" r="1" fill="#6B7280" stroke="none" />
      <circle cx="11" cy="8" r="1" fill="#6B7280" stroke="none" />
      <circle cx="5" cy="12" r="1" fill="#6B7280" stroke="none" />
      <circle cx="11" cy="12" r="1" fill="#6B7280" stroke="none" />
    </svg>
  );
}

// Bucket config: id, label, CSS class for card styling and title colour
const BUCKETS = [
  { id: "tomorrow", label: "TOMORROW", titleClass: "titleTomorrow", cardClass: "tomorrow" },
  { id: "later", label: "LATER", titleClass: "titleLater", cardClass: "later" },
  { id: "notYourProblem", label: "NOT YOUR PROBLEM TONIGHT", titleClass: "titleNotYourProblem", cardClass: "notYourProblem" },
];

// Generate a stable unique id for each thought
let idCounter = 0;
function makeId() {
  return `thought-${++idCounter}-${Date.now()}`;
}

// Reorder helper: move item within a list or between lists
function reorder(state, source, destination) {
  const srcId = source.droppableId;
  const destId = destination.droppableId;
  const srcIndex = source.index;
  const destIndex = destination.index;

  // Clone all lists
  const result = {};
  for (const key of Object.keys(state)) {
    result[key] = [...state[key]];
  }

  if (srcId === destId) {
    // Reorder within the same bucket
    const [moved] = result[srcId].splice(srcIndex, 1);
    result[srcId].splice(destIndex, 0, moved);
  } else {
    // Move between buckets
    const [moved] = result[srcId].splice(srcIndex, 1);
    result[destId].splice(destIndex, 0, moved);
  }

  return result;
}

export default function SortedThoughtsScreen() {
  const navigate = useNavigate();
  const { brainDumpText, setCategorisedThoughts } = useSession();

  // Initialise buckets from categorisation, with stable IDs
  const [buckets, setBuckets] = useState(() => {
    const { tomorrow, later, notYourProblem } = categorizeThoughts(brainDumpText);
    return {
      tomorrow: tomorrow.map((text) => ({ id: makeId(), text })),
      later: later.map((text) => ({ id: makeId(), text })),
      notYourProblem: notYourProblem.map((text) => ({ id: makeId(), text })),
    };
  });

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    setBuckets((prev) => reorder(prev, result.source, result.destination));
  }, []);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Your thoughts, sorted.</h1>
        <p className={styles.hint}>Drag to move between buckets</p>

        {BUCKETS.map((bucket) => (
          <div className={styles.section} key={bucket.id}>
            <h2 className={`${styles.sectionTitle} ${styles[bucket.titleClass]}`}>
              {bucket.label}
            </h2>
            <Droppable droppableId={bucket.id}>
              {(provided, snapshot) => (
                <div
                  className={styles.cards}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {buckets[bucket.id].length === 0 && !snapshot.isDraggingOver && (
                    <p className={styles.empty}>No thoughts here</p>
                  )}
                  {buckets[bucket.id].map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          className={`${styles.card} ${styles[bucket.cardClass]}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.85 : 1,
                          }}
                        >
                          <span className={styles.cardText}>{item.text}</span>
                          <GripIcon />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}

        <button className={styles.button} onClick={() => {
          setCategorisedThoughts({
            tomorrow: buckets.tomorrow.map((t) => t.text),
            later: buckets.later.map((t) => t.text),
            notYourProblem: buckets.notYourProblem.map((t) => t.text),
          });
          navigate("/completion");
        }}>
          I'm done with these
        </button>
      </div>
    </DragDropContext>
  );
}