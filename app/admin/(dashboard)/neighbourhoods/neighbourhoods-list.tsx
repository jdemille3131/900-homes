"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createNeighbourhood,
  updateNeighbourhood,
  toggleNeighbourhoodActive,
} from "@/app/actions/neighbourhoods";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Check,
  X,
  MapPin,
  ExternalLink,
} from "lucide-react";
import type { Neighbourhood } from "@/types/database";

interface NeighbourhoodsListProps {
  neighbourhoods: Neighbourhood[];
}

export function NeighbourhoodsList({ neighbourhoods: initial }: NeighbourhoodsListProps) {
  const router = useRouter();
  const [neighbourhoods, setNeighbourhoods] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    slug: "",
    tagline: "",
    accent_color: "#b45309",
    home_count: "",
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState({
    name: "",
    slug: "",
    tagline: "",
    accent_color: "#b45309",
    home_count: "",
  });
  const [loading, setLoading] = useState(false);

  function startEdit(nh: Neighbourhood) {
    setEditingId(nh.id);
    setEditData({
      name: nh.name,
      slug: nh.slug,
      tagline: nh.tagline || "",
      accent_color: nh.accent_color,
      home_count: nh.home_count || "",
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);
    const result = await updateNeighbourhood(editingId, {
      name: editData.name,
      slug: editData.slug,
      tagline: editData.tagline || undefined,
      accent_color: editData.accent_color,
      home_count: editData.home_count || undefined,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Neighbourhood updated.");
      setEditingId(null);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleToggleActive(nh: Neighbourhood) {
    setLoading(true);
    const result = await toggleNeighbourhoodActive(nh.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      setNeighbourhoods((prev) =>
        prev.map((item) =>
          item.id === nh.id ? { ...item, is_active: !!result.isActive } : item
        )
      );
      toast.success(result.isActive ? "Neighbourhood enabled." : "Neighbourhood disabled.");
    }
    setLoading(false);
  }

  async function handleAdd() {
    if (!newData.name.trim()) return;
    setLoading(true);
    const result = await createNeighbourhood({
      name: newData.name,
      slug: newData.slug || undefined,
      tagline: newData.tagline || undefined,
      accent_color: newData.accent_color,
      home_count: newData.home_count || undefined,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Neighbourhood created.");
      setNewData({ name: "", slug: "", tagline: "", accent_color: "#b45309", home_count: "" });
      setShowAdd(false);
      router.refresh();
    }
    setLoading(false);
  }

  function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  return (
    <div className="space-y-3">
      {neighbourhoods.map((nh) => (
        <Card key={nh.id} className={!nh.is_active ? "opacity-50" : undefined}>
          <CardContent className="py-4">
            {editingId === nh.id ? (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Slug</Label>
                    <Input
                      value={editData.slug}
                      onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Tagline</Label>
                  <Textarea
                    value={editData.tagline}
                    onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editData.accent_color}
                        onChange={(e) => setEditData({ ...editData, accent_color: e.target.value })}
                        className="h-10 w-14 rounded border cursor-pointer"
                      />
                      <Input
                        value={editData.accent_color}
                        onChange={(e) => setEditData({ ...editData, accent_color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Home Count</Label>
                    <Input
                      value={editData.home_count}
                      onChange={(e) => setEditData({ ...editData, home_count: e.target.value })}
                      placeholder="e.g. Over 900"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} disabled={loading}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full shrink-0 mt-0.5"
                  style={{ backgroundColor: nh.accent_color + "20", color: nh.accent_color }}
                >
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{nh.name}</p>
                    {!nh.is_active && <Badge variant="secondary">Disabled</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">/{nh.slug}</p>
                  {nh.tagline && (
                    <p className="text-sm text-muted-foreground mt-1">{nh.tagline}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {nh.home_count && <span>{nh.home_count} homes</span>}
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ color: nh.accent_color }}
                    >
                      <span className="h-3 w-3 rounded-full inline-block" style={{ backgroundColor: nh.accent_color }} />
                      {nh.accent_color}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`/${nh.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors"
                    title="View site"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(nh)}
                    disabled={loading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(nh)}
                    disabled={loading}
                    title={nh.is_active ? "Disable" : "Enable"}
                  >
                    {nh.is_active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add new neighbourhood */}
      {showAdd ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  value={newData.name}
                  onChange={(e) =>
                    setNewData({
                      ...newData,
                      name: e.target.value,
                      slug: newData.slug || slugify(e.target.value),
                    })
                  }
                  placeholder="e.g. Raintree Village, Katy TX"
                />
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input
                  value={newData.slug}
                  onChange={(e) => setNewData({ ...newData, slug: e.target.value })}
                  placeholder="e.g. raintree-village"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Tagline</Label>
              <Textarea
                value={newData.tagline}
                onChange={(e) => setNewData({ ...newData, tagline: e.target.value })}
                placeholder="A short description of the neighbourhood"
                rows={2}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newData.accent_color}
                    onChange={(e) => setNewData({ ...newData, accent_color: e.target.value })}
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input
                    value={newData.accent_color}
                    onChange={(e) => setNewData({ ...newData, accent_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Home Count</Label>
                <Input
                  value={newData.home_count}
                  onChange={(e) => setNewData({ ...newData, home_count: e.target.value })}
                  placeholder="e.g. Over 900"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading || !newData.name.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Create Neighbourhood
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Neighbourhood
        </Button>
      )}
    </div>
  );
}
