// SessionHistoryScreen: shows past session history with expandable cards,
// grouped thought buckets, and drag-and-drop inside expanded sessions
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useSession } from "../context/SessionContext";
import styles from "./SessionHistoryScreen.module.css";

// Stable unique ID generator
let _id = 0;
const uid = () => `s${++_id}`;

// Mock session data with actual thought arrays per bucket
const initialSessions = [
  {
    date: "Tonight",
    thoughts: {
      tomorrow: [
        { id: uid(), text: "Buy groceries for tomorrow" },
        { id: uid(), text: "Call dentist to reschedule" },
        { id: uid(), text: "Finish the report draft" },
      ],
      later: [
        { id: uid(), text: "Read that book everyone mentioned" },
        { id: uid(), text: "Look into yoga classes nearby" },
      ],
      notYourProblem: [
        { id: uid(), text: "What if the presentation goes badly?" },
        { id: uid(), text: "Am I even good enough for this role?" },
      ],
    },
  },
  {
    date: "Wed 26 Mar",
    thoughts: {
      tomorrow: [
        { id: uid(), text: "Email Sarah about the project" },
        { id: uid(), text: "Schedule car service" },
        { id: uid(), text: "Pick up prescription" },
        { id: uid(), text: "Review budget spreadsheet" },
        { id: uid(), text: "Send birthday card to mum" },
      ],
      later: [
        { id: uid(), text: "Organise the garage" },
        { id: uid(), text: "Research holiday destinations" },
        { id: uid(), text: "Update LinkedIn profile" },
        { id: uid(), text: "Fix the leaky tap" },
      ],
      notYourProblem: [
        { id: uid(), text: "What if I never figure out my career?" },
        { id: uid(), text: "Am I spending enough time with friends?" },
        { id: uid(), text: "What if something bad happens to the dog?" },
      ],
    },
  },
  {
    date: "Tue 25 Mar",
    thoughts: {
      tomorrow: [
        { id: uid(), text: "Submit the expense report" },
        { id: uid(), text: "Buy a new phone charger" },
      ],
      later: [
        { id: uid(), text: "Clean out the fridge" },
        { id: uid(), text: "Watch that documentary" },
      ],
      notYourProblem: [
        { id: uid(), text: "What if they didn't like my idea?" },
      ],
    },
  },
  {
    date: "Mon 24 Mar",
    thoughts: {
      tomorrow: [
        { id: uid(), text: "Prepare meeting agenda" },
        { id: uid(), text: "Return library books" },
        { id: uid(), text: "Order new running shoes" },
        { id: uid(), text: "Text Jake about Saturday" },
      ],
      later: [
        { id: uid(), text: "Learn to make sourdough" },
        { id: uid(), text: "Back up the laptop" },
        { id: uid(), text: "Sort through old photos" },
      ],
      notYourProblem: [
        { id: uid(), text: "Am I falling behind everyone else?" },
        { id: uid(), text: "What if I made the wrong decision?" },
      ],
    },
  },
];

// Bucket display config
const BUCKETS = [
  { key: "tomorrow", label: "TOMORROW", color: "#22C55E" },
  { key: "later", label: "LATER", color: "#7C3AED" },
  { key: "notYourProblem", label: "NOT YOUR PROBLEM TONIGHT", color: "#6B7280" },
];

// Chevron icon
function Chevron({ expanded }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#6B7280"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
    >
      <path d="M4 6 L8 10 L12 6" />
    </svg>
  );
}

// Count thoughts per bucket
function bucketCounts(thoughts) {
  return {
    tomorrow: thoughts.tomorrow.length,
    later: thoughts.later.length,
    notYourProblem: thoughts.notYourProblem.length,
    total: thoughts.tomorrow.length + thoughts.later.length + thoughts.notYourProblem.length,
  };
}

export default function SessionHistoryScreen() {
  const navigate = useNavigate();
  const { resetSession } = useSession();
  const [sessions, setSessions] = useState(initialSessions);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleNewSession = () => {
    resetSession();
    navigate("/brain-dump");
  };

  const toggleExpand = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  // Drag-and-drop handler for expanded session buckets
  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination || expandedIndex === null) return;
      const { source, destination } = result;
      const srcBucket = source.droppableId;
      const destBucket = destination.droppableId;

      setSessions((prev) => {
        const updated = [...prev];
        const session = { ...updated[expandedIndex] };
        const thoughts = {
          tomorrow: [...session.thoughts.tomorrow],
          later: [...session.thoughts.later],
          notYourProblem: [...session.thoughts.notYourProblem],
        };

        if (srcBucket === destBucket) {
          // Reorder within same bucket
          const [moved] = thoughts[srcBucket].splice(source.index, 1);
          thoughts[srcBucket].splice(destination.index, 0, moved);
        } else {
          // Move between buckets
          const [moved] = thoughts[srcBucket].splice(source.index, 1);
          thoughts[destBucket].splice(destination.index, 0, moved);
        }

        session.thoughts = thoughts;
        updated[expandedIndex] = session;
        return updated;
      });
    },
    [expandedIndex]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Your sessions</h1>
        <div className={styles.badge}>
          <span className={styles.moonEmoji}>🌙</span>
          <span className={styles.nightsPill}>7 nights</span>
        </div>
      </div>

      <div className={styles.sessions}>
        {sessions.map((session, i) => {
          const counts = bucketCounts(session.thoughts);
          const isExpanded = expandedIndex === i;

          return (
            <div key={i} className={`${styles.card} ${isExpanded ? styles.cardExpanded : ""}`}>
              {/* Card header — always visible, clickable */}
              <div className={styles.cardHeader} onClick={() => toggleExpand(i)}>
                <div className={styles.cardLeft}>
                  <span className={styles.date}>{session.date}</span>
                  <span className={styles.count}>
                    {counts.total} thought{counts.total !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className={styles.cardRight}>
                  <span className={styles.pillTomorrow}>{counts.tomorrow} tmrw</span>
                  <span className={styles.pillLater}>{counts.later} later</span>
                  <Chevron expanded={isExpanded} />
                </div>
              </div>

              {/* Expanded content — grouped buckets with drag-and-drop */}
              {isExpanded && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className={styles.expandedContent}>
                    {BUCKETS.map((bucket) => {
                      const items = session.thoughts[bucket.key];
                      return (
                        <div key={bucket.key} className={styles.bucketSection}>
                          <h3
                            className={styles.bucketTitle}
                            style={{ color: bucket.color }}
                          >
                            {bucket.label}
                          </h3>
                          <Droppable droppableId={bucket.key}>
                            {(provided, snapshot) => (
                              <div
                                className={styles.bucketCards}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                {items.length === 0 && !snapshot.isDraggingOver && (
                                  <p className={styles.bucketEmpty}>No thoughts here</p>
                                )}
                                {items.map((item, idx) => (
                                  <Draggable
                                    key={item.id}
                                    draggableId={item.id}
                                    index={idx}
                                  >
                                    {(prov, snap) => (
                                      <div
                                        className={styles.thoughtCard}
                                        ref={prov.innerRef}
                                        {...prov.draggableProps}
                                        {...prov.dragHandleProps}
                                        style={{
                                          ...prov.draggableProps.style,
                                          opacity: snap.isDragging ? 0.8 : 1,
                                          borderLeft: `2px solid ${bucket.color}`,
                                        }}
                                      >
                                        <span className={styles.thoughtText}>
                                          {item.text}
                                        </span>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      );
                    })}
                  </div>
                </DragDropContext>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.footerSection}>
        <p className={styles.localOnly}>Local only &middot; No account needed</p>
        <button className={styles.button} onClick={handleNewSession}>
          + New Session
        </button>
      </div>
    </div>
  );
}