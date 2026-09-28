import { useRef, type ChangeEvent } from "react";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string, history: boolean) => void;
  multiline?: boolean;
  placeholder?: string;
  type?: "text" | "number";
}

export function Field({ label, value, onChange, multiline, placeholder, type = "text" }: FieldProps) {
  const armed = useRef(false);
  const handle = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const history = !armed.current;
    armed.current = true;
    onChange(event.target.value, history);
  };
  const blur = () => {
    armed.current = false;
  };
  return (
    <label className="field">
      {label ? <span>{label}</span> : null}
      {multiline ? (
        <textarea value={value} placeholder={placeholder} onChange={handle} onBlur={blur} rows={3} />
      ) : (
        <input value={value} type={type} placeholder={placeholder} onChange={handle} onBlur={blur} />
      )}
    </label>
  );
}

export function StringList({
  label,
  items,
  placeholder,
  onChange,
}: {
  label: string;
  items: string[];
  placeholder: string;
  onChange: (items: string[], history: boolean) => void;
}) {
  const update = (index: number, value: string, history: boolean) => {
    const next = items.map((item, itemIndex) => (itemIndex === index ? value : item));
    onChange(next, history);
  };
  return (
    <div className="string-list">
      <div className="row-between">
        <span className="field-label">{label}</span>
        <button type="button" className="text-btn" onClick={() => onChange([...items, ""], true)}>
          Add
        </button>
      </div>
      {items.length === 0 && <p className="hint">Nothing here yet.</p>}
      {items.map((item, index) => (
        <div className="string-row" key={`${label}-${index}`}>
          <Field label="" value={item} placeholder={placeholder} onChange={(value, history) => update(index, value, history)} />
          <button
            type="button"
            className="icon-btn"
            aria-label={`Remove ${label}`}
            onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index), true)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
