import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/Button.tsx";
import { Field } from "../../components/Field.tsx";
import { ErrorBlock, LoadingBlock, Screen } from "../../components/Screen.tsx";
import { getShopType, saveShopType } from "../../services/qualityService.ts";

export function ShopTypeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getShopType(id)
      .then((type) => {
        if (!type) {
          setError("This shop type could not be found.");
          return;
        }
        setName(type.type_name);
        setDescription(type.description ?? "");
        setOrder(String(type.display_order));
        setActive(type.is_active);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load this shop type."))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (!name.trim()) {
      setError("Enter a shop type name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveShopType({
        id,
        typeName: name,
        description,
        displayOrder: Number.parseInt(order, 10) || 0,
        isActive: active,
      });
      navigate("/settings/shop-types", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this shop type. Please try again.");
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <Screen title={editing ? "Edit shop type" : "Add shop type"} back>
      {error && !name && editing ? <ErrorBlock message={error} /> : null}
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Field label="Shop type name">
          <input className="control" value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Description">
          <textarea className="control" maxLength={200} value={description} onChange={(event) => setDescription(event.target.value)} />
        </Field>
        <Field label="Display order">
          <input className="control" inputMode="numeric" value={order} onChange={(event) => setOrder(event.target.value.replace(/[^\d-]/g, ""))} />
        </Field>
        <button type="button" className="choice" aria-pressed={active} onClick={() => setActive((current) => !current)}>
          {active ? "Active" : "Inactive"}
        </button>
        {error ? <p className="text-[15px] text-bad">{error}</p> : null}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save shop type"}
        </Button>
      </form>
    </Screen>
  );
}
