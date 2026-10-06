import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/Button.tsx";
import { Field } from "../../components/Field.tsx";
import { ErrorBlock, LoadingBlock, Screen } from "../../components/Screen.tsx";
import { listSalesTeam, saveSalesperson } from "../../services/teamService.ts";

export function SalespersonFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    listSalesTeam()
      .then((team) => {
        const person = team.find((item) => item.id === id);
        if (!person) {
          setError("This salesperson could not be found.");
          return;
        }
        setName(person.name);
        setUserId(person.userId);
        setMobile(person.mobile ?? "");
        setActive(person.isActive);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load this salesperson."))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await saveSalesperson({ id, name, userId, password, mobile, isActive: active });
      navigate("/team", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this salesperson. Please try again.");
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <Screen title={editing ? "Edit salesperson" : "Add salesperson"} back>
      {error && editing && !name ? <ErrorBlock message={error} /> : null}
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Field label="Salesperson name *">
          <input className="control" value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="User ID *">
          <input
            className="control"
            value={userId}
            autoCapitalize="none"
            autoCorrect="off"
            disabled={editing}
            onChange={(event) => setUserId(event.target.value)}
          />
        </Field>
        <Field label={editing ? "New password" : "Password *"} hint={editing ? "Leave blank to keep the current password." : undefined}>
          <input className="control" type="password" value={password} autoComplete="new-password" onChange={(event) => setPassword(event.target.value)} />
        </Field>
        <Field label="Mobile number">
          <input className="control" type="tel" inputMode="numeric" value={mobile} onChange={(event) => setMobile(event.target.value)} />
        </Field>
        <button type="button" className="choice" aria-pressed={active} onClick={() => setActive((current) => !current)}>
          {active ? "Active" : "Inactive"}
        </button>
        {error ? <p className="text-[15px] text-bad">{error}</p> : null}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : editing ? "Save salesperson" : "Create salesperson"}
        </Button>
      </form>
    </Screen>
  );
}
