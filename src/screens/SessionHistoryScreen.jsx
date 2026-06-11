// SessionHistoryScreen: shows real past session history fetched from the backend,
// with expandable cards, grouped thought buckets, and drag-and-drop inside expanded sessions
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "../lib/supabase";
import { useSession } from "../context/SessionContext";
import styles from "./SessionHistoryScreen.module.css";

// Stable unique ID generator
let _id = 0;
const uid = () => `s${++_id}`;
const SESSION_LIMIT = 6;

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

// Small trash icon for delete button
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
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

// Format ISO date string to a friendly display format
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  // Show "Just now" / "X mins ago" / "X hours ago" for today
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;

  // Otherwise show a date string
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Transform API session into the shape the UI expects
function mapSession(apiSession) {
  const thoughts = {
    tomorrow: (apiSession.bucket_tomorrow || []).map((text) => ({ id: uid(), text })),
    later: (apiSession.bucket_later || []).map((text) => ({ id: uid(), text })),
    notYourProblem: (apiSession.bucket_not_your_problem || []).map((text) => ({ id: uid(), text })),
  };
  return {
    id: apiSession.id,
    date: formatDate(apiSession.created_at),
    thoughts,
  };
}

export default function SessionHistoryScreen() {
  const navigate = useNavigate();
  const { resetSession, session, setUser, setSession } = useSession();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Fetch real sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/sessions/list", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) throw new Error("Failed to load sessions");

        const data = await res.json();
        setSessions((data.sessions || []).map(mapSession));
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate("/");
  };

  const handleNewSession = () => {
    resetSession();
    navigate("/brain-dump");
  };

  // Delete a session from Supabase and local state
  const handleDelete = async (sessionId, event) => {
    event.stopPropagation();
    try { await supabase.from("sessions").delete().eq("id", sessionId); } catch { /* silent */ }
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
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
        const sess = { ...updated[expandedIndex] };
        const thoughts = {
          tomorrow: [...sess.thoughts.tomorrow],
          later: [...sess.thoughts.later],
          notYourProblem: [...sess.thoughts.notYourProblem],
        };

        if (srcBucket === destBucket) {
          const [moved] = thoughts[srcBucket].splice(source.index, 1);
          thoughts[srcBucket].splice(destination.index, 0, moved);
        } else {
          const [moved] = thoughts[srcBucket].splice(source.index, 1);
          thoughts[destBucket].splice(destination.index, 0, moved);
        }

        sess.thoughts = thoughts;
        updated[expandedIndex] = sess;
        return updated;
      });
    },
    [expandedIndex]
  );

  const visibleSessions = showAll ? sessions : sessions.slice(0, SESSION_LIMIT);
  const hasMore = sessions.length > SESSION_LIMIT;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Your sessions</h1>
        <div className={styles.badge}>
          <span className={styles.moonEmoji}>🌙</span>
          <span className={styles.nightsPill}>{sessions.length} night{sessions.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {loading && (
        <div className={styles.sessions}>
          <p style={{ color: "#6B7280", fontSize: "14px", textAlign: "center", marginTop: "48px" }}>
            Loading your sessions...
          </p>
        </div>
      )}

      {!loading && fetchError && (
        <div className={styles.sessions}>
          <p style={{ color: "#EF4444", fontSize: "14px", textAlign: "center", marginTop: "48px" }}>
            Couldn't load sessions — try again later.
          </p>
        </div>
      )}

      {!loading && !fetchError && sessions.length === 0 && (
        <div className={styles.sessions}>
          <p style={{ color: "#6B7280", fontSize: "14px", textAlign: "center", marginTop: "48px" }}>
            No sessions yet. Dump your first thoughts!
          </p>
        </div>
      )}

      {!loading && !fetchError && sessions.length > 0 && (
        <div className={styles.sessions}>
          {visibleSessions.map((sess, i) => {
            const counts = bucketCounts(sess.thoughts);
            const isExpanded = expandedIndex === i;

            return (
              <div key={sess.id || i} className={`${styles.card} ${isExpanded ? styles.cardExpanded : ""}`}>
                {/* Card header — always visible, clickable */}
                <div className={styles.cardHeader} onClick={() => toggleExpand(i)}>
                  <div className={styles.cardLeft}>
                    <span className={styles.date}>{sess.date}</span>
                    <span className={styles.count}>
                      {counts.total} thought{counts.total !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className={styles.cardRight}>
                    <span className={styles.pillTomorrow}>{counts.tomorrow} tmrw</span>
                    <span className={styles.pillLater}>{counts.later} later</span>
                    <span className={styles.deleteBtn} onClick={(e) => handleDelete(sess.id, e)} title="Delete session"><TrashIcon /></span>
                    <Chevron expanded={isExpanded} />
                  </div>
                </div>

                {/* Expanded content — grouped buckets with drag-and-drop */}
                {isExpanded && (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div className={styles.expandedContent}>
                      {BUCKETS.map((bucket) => {
                        const items = sess.thoughts[bucket.key];
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
          {hasMore && !showAll && <span className={styles.viewMore} onClick={() => setShowAll(true)}>View more ({sessions.length - SESSION_LIMIT} more)</span>}
        </div>
      )}

      <div className={styles.footerSection}>
        <button className={styles.button} onClick={handleNewSession}>
          + New Session
        </button>
        <button className={styles.buttonOutline} onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}