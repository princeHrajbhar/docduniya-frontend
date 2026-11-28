"use client";
import { useState, type FormEvent } from "react";
import { operations } from "@/lib/workspace/contract";
import { useReadQuery, useCommandMutation } from "@/lib/store/store";
type Conversation = {
  id: string;
  subject: string;
  kind: string;
  unread: boolean;
  status: string;
};
type Thread = {
  conversation: Conversation;
  messages: { sequence: number; side: string; body: string; sentAt: string }[];
};
function operationId(path: string, method = "GET") {
  const op = operations.find((o) => o.path === path && o.method === method);
  if (!op) throw new Error("Messaging contract unavailable");
  return op.id;
}
export function Messages({
  area,
  context,
}: {
  area: string;
  context: Record<string, string>;
}) {
  const provider = area !== "patient";
  const prefix = provider
    ? "/organizations/{organizationId}"
    : "/patients/{patientId}";
  const threadPath = provider
    ? "/organizations/{organizationId}/conversations/{conversationId}/messages"
    : "/conversations/{conversationId}/messages";
  const [kind, setKind] = useState("CARE");
  const [selected, setSelected] = useState("");
  const [newThread, setNewThread] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pendingKey, setPendingKey] = useState<{
    payload: string;
    key: string;
  }>();
  const ready = Boolean(provider ? context.organizationId : context.patientId);
  const inbox = useReadQuery(
    {
      operationId: operationId(`${prefix}/conversations`),
      path: context,
      query: provider ? { kind, status: "OPEN", limit: 25 } : {},
    },
    { skip: !ready, pollingInterval: 30000, skipPollingIfUnfocused: true },
  );
  const thread = useReadQuery(
    {
      operationId: operationId(threadPath),
      path: { ...context, conversationId: selected },
    },
    {
      skip: !selected || !ready,
      pollingInterval: 15000,
      skipPollingIfUnfocused: true,
    },
  );
  const [send, sending] = useCommandMutation();
  const items =
    (inbox.data?.data as { items?: Conversation[] } | undefined)?.items || [];
  const detail = thread.currentData?.data as Thread | undefined;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const payload = newThread
      ? {
          subject,
          body,
          kind,
          documentIds: [],
          ...(provider
            ? { patientId: context.patientId }
            : { organizationId: context.organizationId }),
        }
      : { body, documentIds: [] };
    const fingerprint = JSON.stringify({ payload, selected, newThread });
    const key =
      pendingKey?.payload === fingerprint
        ? pendingKey.key
        : crypto.randomUUID();
    setPendingKey({ payload: fingerprint, key });
    try {
      const response = await send({
        operationId: operationId(
          newThread ? `${prefix}/conversations` : threadPath,
          "POST",
        ),
        path: { ...context, conversationId: selected },
        body: payload,
        key,
      }).unwrap();
      if (newThread) setSelected((response.data as { id: string }).id);
      setNewThread(false);
      setBody("");
      setSubject("");
      setPendingKey(undefined);
    } catch (failure) {
      setError(
        (failure as { data?: { message?: string } }).data?.message ||
          "Message could not be sent. You can retry safely.",
      );
    }
  }
  return (
    <section className="ws-operation">
      <div className="ws-section-title">
        <div>
          <h2>Messages</h2>
          <p>Conversations with your care team and front desk.</p>
        </div>
        <button
          className="ws-secondary"
          onClick={() => {
            setNewThread(true);
            setSelected("");
          }}
        >
          New conversation
        </button>
      </div>
      {!ready && (
        <p className="ws-empty">
          Choose your {provider ? "organization" : "patient profile"} above to
          view messages.
        </p>
      )}
      {provider && (
        <label>
          Inbox{" "}
          <select
            className="ws-input"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setSelected("");
            }}
          >
            <option value="CARE">Care team</option>
            <option value="ADMINISTRATIVE">Front desk</option>
          </select>
        </label>
      )}
      {inbox.isFetching && <p role="status">Loading conversations…</p>}
      {inbox.isError && (
        <p className="ws-alert" role="alert">
          Unable to load conversations. Check your selected organization and
          permissions.
        </p>
      )}
      <div className="ws-chat">
        <aside>
          {items.map((item) => (
            <button
              className="ws-thread"
              aria-pressed={selected === item.id}
              key={item.id}
              onClick={() => {
                setSelected(item.id);
                setNewThread(false);
                setBody("");
              }}
            >
              <strong>{item.subject}</strong>
              <small>
                {item.kind === "CARE" ? "Care team" : "Front desk"}
                {item.unread ? " · Unread" : ""}
              </small>
            </button>
          ))}
          {ready && !inbox.isFetching && !inbox.isError && !items.length && (
            <p>No conversations yet.</p>
          )}
        </aside>
        <div>
          {thread.isFetching && selected && (
            <p role="status">Loading messages…</p>
          )}
          {thread.isError && selected && (
            <p className="ws-alert">This conversation is unavailable.</p>
          )}
          {!newThread && detail && (
            <>
              <h3>{detail.conversation.subject}</h3>
              <div className="ws-bubbles" aria-live="polite">
                {detail.messages.map((message) => (
                  <article
                    key={message.sequence}
                    className={`ws-bubble ${message.side === (provider ? "PROVIDER" : "PATIENT") ? "ws-outgoing" : ""}`}
                  >
                    <span>
                      {message.side === "PROVIDER" ? "Care team" : "Patient"}
                    </span>
                    <p>{message.body}</p>
                    <time>
                      {new Date(message.sentAt).toLocaleString("en-IN")}
                    </time>
                  </article>
                ))}
              </div>
            </>
          )}
          {(newThread ||
            (selected && detail?.conversation.status === "OPEN")) && (
            <form onSubmit={submit}>
              {newThread && (
                <>
                  <h3>Start a conversation</h3>
                  <p className="ws-help">
                    Choose both the organization and patient in the working
                    context above.
                  </p>
                  <label>
                    Subject
                    <input
                      className="ws-input"
                      required
                      minLength={3}
                      maxLength={200}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </label>
                  <label>
                    Conversation type
                    <select
                      className="ws-input"
                      value={kind}
                      onChange={(e) => setKind(e.target.value)}
                    >
                      <option value="CARE">Medical care</option>
                      <option value="ADMINISTRATIVE">
                        Appointments and billing
                      </option>
                    </select>
                  </label>
                </>
              )}
              <label>
                Message
                <textarea
                  className="ws-input"
                  required
                  maxLength={4000}
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </label>
              <button
                className="ws-primary"
                disabled={
                  sending.isLoading ||
                  !ready ||
                  (newThread && (!context.patientId || !context.organizationId))
                }
              >
                {sending.isLoading ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
          {error && (
            <p className="ws-alert" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
