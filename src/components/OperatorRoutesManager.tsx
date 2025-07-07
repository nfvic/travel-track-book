
import React from "react";
import { useOperatorRoutes } from "@/hooks/useOperatorRoutes";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

// Helper to parse comma-separated stages
function parseStages(str: string) {
  return str
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

type StageCoord = { lat: string; lng: string };

type OperatorRoutesManagerProps = {
  open: boolean;
  onClose: () => void;
};

export default function OperatorRoutesManager({ open, onClose }: OperatorRoutesManagerProps) {
  const { data: routes = [], refetch, isLoading } = useOperatorRoutes();
  const [form, setForm] = React.useState<{ name: string; stages: string; price: string; coords: StageCoord[] }>({ name: "", stages: "", price: "", coords: [] });
  const [editId, setEditId] = React.useState<string | null>(null);
  const { user } = useAuth();

  // Sync coords when stages input changes
  React.useEffect(() => {
    const stageArr = parseStages(form.stages);
    setForm(f => {
      // Sync coords to stage array length
      let coords = [...f.coords];
      if (stageArr.length > coords.length) {
        // Add blank coords for new stages
        coords = [...coords, ...Array(stageArr.length - coords.length).fill({ lat: "", lng: "" })];
      } else if (stageArr.length < coords.length) {
        coords = coords.slice(0, stageArr.length);
      }
      return { ...f, coords };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.stages]);

  React.useEffect(() => {
    if (!open) {
      setForm({ name: "", stages: "", price: "", coords: [] });
      setEditId(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stageArr = parseStages(form.stages);
    if (!form.name.trim() || stageArr.length < 2) {
      toast.error("Route name and at least 2 stages are required.");
      return;
    }
    if (!user?.id) {
      toast.error("You must be signed in to manage routes.");
      return;
    }
    // Validate price
    const priceNum = parseInt(form.price, 10);
    if (isNaN(priceNum) || priceNum < 1) {
      toast.error("Price must be a positive integer.");
      return;
    }
    // Validate coords
    let ok = true;
    const coords = form.coords.map((c, idx) => {
      const lat = parseFloat(c.lat);
      const lng = parseFloat(c.lng);
      if (isNaN(lat) || isNaN(lng)) ok = false;
      return { lat, lng };
    });
    if (!ok || coords.length !== stageArr.length) {
      toast.error("Please provide valid coordinates for every stage.");
      return;
    }

    const price_cents = priceNum * 100;

    if (editId) {
      // Update
      const { error } = await supabase
        .from("routes")
        .update({ name: form.name, stages: stageArr, operator_id: user.id, price_cents, stage_coords: coords })
        .eq("id", editId);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Route updated!");
        setEditId(null);
        setForm({ name: "", stages: "", price: "", coords: [] });
        refetch();
      }
    } else {
      // Create
      const { error } = await supabase
        .from("routes")
        .insert([{ name: form.name, stages: stageArr, operator_id: user.id, price_cents, stage_coords: coords }]);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Route created!");
        setForm({ name: "", stages: "", price: "", coords: [] });
        refetch();
      }
    }
  };

  const handleEdit = (route: Tables<"routes">) => {
    setEditId(route.id);
    setForm({ 
      name: route.name,
      stages: route.stages.join(", "),
      price: (route.price_cents ? Math.round(route.price_cents / 100) : "1").toString(),
      coords: (route.stage_coords && Array.isArray(route.stage_coords))
        ? route.stage_coords.map((obj: any) => ({
            lat: obj?.lat?.toString() ?? "",
            lng: obj?.lng?.toString() ?? ""
          }))
        : Array(route.stages.length).fill({ lat: "", lng: "" })
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      const { error } = await supabase.from("routes").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Route deleted.");
        refetch();
        if (editId === id) {
          setEditId(null);
          setForm({ name: "", stages: "", price: "", coords: [] });
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Routes</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block mb-1 text-sm font-semibold">Route Name</label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. CBD → Uthiru"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold">Stages (comma-separated)</label>
            <Input
              value={form.stages}
              onChange={e => setForm(f => ({ ...f, stages: e.target.value }))}
              placeholder="e.g. CBD, Westlands, Kangemi"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold">Price (in KES)</label>
            <Input
              type="number"
              min={1}
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value.replace(/[^0-9]/g, "") }))}
              placeholder="100"
            />
          </div>
          {/* New: Coordinates for stages */}
          <div>
            <label className="block mb-1 text-sm font-semibold">Stage Coordinates</label>
            {parseStages(form.stages).map((stage, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-1 pl-2">
                <span className="text-xs pt-1 min-w-[70px]">{stage}</span>
                <Input
                  type="number"
                  step="any"
                  min={-90}
                  max={90}
                  className="w-full sm:w-32"
                  placeholder="Lat"
                  value={form.coords[idx]?.lat ?? ""}
                  onChange={e =>
                    setForm(f => {
                      const coords = [...f.coords];
                      coords[idx] = { ...coords[idx], lat: e.target.value };
                      return { ...f, coords };
                    })
                  }
                />
                <Input
                  type="number"
                  step="any"
                  min={-180}
                  max={180}
                  className="w-full sm:w-32"
                  placeholder="Lng"
                  value={form.coords[idx]?.lng ?? ""}
                  onChange={e =>
                    setForm(f => {
                      const coords = [...f.coords];
                      coords[idx] = { ...coords[idx], lng: e.target.value };
                      return { ...f, coords };
                    })
                  }
                />
              </div>
            ))}
            {parseStages(form.stages).length === 0 && (
              <div className="text-xs text-muted-foreground pl-2">Enter stage names above to add coordinates for each stop.</div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">{editId ? "Update Route" : "Create Route"}</Button>
            {editId && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setEditId(null); setForm({ name: "", stages: "", price: "", coords: [] }); }}
              >
                Cancel Edit
              </Button>
            )}
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </form>
        {/* List existing routes */}
        <div className="mt-5">
          <div className="font-semibold text-base mb-2">Your Routes</div>
          {isLoading ? (
            <div>Loading...</div>
          ) : routes.length === 0 ? (
            <div className="text-muted-foreground">No routes created yet.</div>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-auto">
              {routes.map(route => (
                <li key={route.id} className="border rounded p-2 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{route.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {route.stages.join(" → ")}
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Price:</span> KES {Math.round(route.price_cents / 100)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(route)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(route.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
