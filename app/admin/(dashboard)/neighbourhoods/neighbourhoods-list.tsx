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
import { createClient } from "@/utils/supabase/client";
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
  Upload,
  Trash2,
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
    admin_notes: "",
    city: "",
    county: "",
    state: "",
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState({
    name: "",
    slug: "",
    tagline: "",
    accent_color: "#b45309",
    home_count: "",
    city: "",
    county: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File, neighbourhoodId: string): Promise<string | null> {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${neighbourhoodId}/logo.${ext}`;

    const { error } = await supabase.storage
      .from("neighbourhood-logos")
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (error) {
      toast.error("Failed to upload image: " + error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("neighbourhood-logos")
      .getPublicUrl(path);

    return publicUrl;
  }

  async function handleImageUpload(file: File, neighbourhoodId: string) {
    setUploading(true);
    const url = await uploadImage(file, neighbourhoodId);
    if (url) {
      const result = await updateNeighbourhood(neighbourhoodId, { logo_url: url });
      if (result.error) {
        toast.error(result.error);
      } else {
        setNeighbourhoods((prev) =>
          prev.map((nh) => nh.id === neighbourhoodId ? { ...nh, logo_url: url } : nh)
        );
        toast.success("Image uploaded.");
        router.refresh();
      }
    }
    setUploading(false);
  }

  async function handleRemoveImage(neighbourhoodId: string) {
    setLoading(true);
    const result = await updateNeighbourhood(neighbourhoodId, { logo_url: "" });
    if (result.error) {
      toast.error(result.error);
    } else {
      setNeighbourhoods((prev) =>
        prev.map((nh) => nh.id === neighbourhoodId ? { ...nh, logo_url: null } : nh)
      );
      toast.success("Image removed.");
      router.refresh();
    }
    setLoading(false);
  }

  function startEdit(nh: Neighbourhood) {
    setEditingId(nh.id);
    setEditData({
      name: nh.name,
      slug: nh.slug,
      tagline: nh.tagline || "",
      accent_color: nh.accent_color,
      home_count: nh.home_count || "",
      admin_notes: nh.admin_notes || "",
      city: nh.city || "",
      county: nh.county || "",
      state: nh.state || "",
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
      admin_notes: editData.admin_notes || undefined,
      city: editData.city || undefined,
      county: editData.county || undefined,
      state: editData.state || undefined,
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
      city: newData.city || undefined,
      county: newData.county || undefined,
      state: newData.state || undefined,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Neighbourhood created.");
      setNewData({ name: "", slug: "", tagline: "", accent_color: "#b45309", home_count: "", city: "", county: "", state: "" });
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
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>City</Label>
                    <Input
                      value={editData.city}
                      onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                      placeholder="e.g. Katy"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>County</Label>
                    <Input
                      value={editData.county}
                      onChange={(e) => setEditData({ ...editData, county: e.target.value })}
                      placeholder="e.g. Harris"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>State</Label>
                    <Input
                      value={editData.state}
                      onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                      placeholder="e.g. TX"
                    />
                  </div>
                </div>
                {/* Image upload */}
                <div className="space-y-2">
                  <Label>Neighbourhood Image</Label>
                  {(() => {
                    const currentNh = neighbourhoods.find((n) => n.id === editingId);
                    return currentNh?.logo_url ? (
                      <div className="flex items-start gap-3">
                        <img
                          src={currentNh.logo_url}
                          alt={currentNh.name}
                          className="h-20 w-32 object-cover rounded border"
                        />
                        <div className="flex flex-col gap-2">
                          <label className="inline-flex items-center gap-1 text-xs nh-text cursor-pointer hover:underline">
                            <Upload className="h-3 w-3" />
                            Replace
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, editingId!);
                              }}
                            />
                          </label>
                          <button
                            onClick={() => handleRemoveImage(editingId!)}
                            className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {uploading ? "Uploading..." : "Click to upload an image"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, editingId!);
                          }}
                        />
                      </label>
                    );
                  })()}
                </div>
                <div className="space-y-1">
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={editData.admin_notes}
                    onChange={(e) => setEditData({ ...editData, admin_notes: e.target.value })}
                    placeholder="Internal notes (only visible to admins)..."
                    rows={3}
                    className="text-sm"
                  />
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
                {nh.logo_url ? (
                  <img
                    src={nh.logo_url}
                    alt={nh.name}
                    className="h-12 w-12 object-cover rounded-lg shrink-0 mt-0.5"
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg shrink-0 mt-0.5"
                    style={{ backgroundColor: nh.accent_color + "20", color: nh.accent_color }}
                  >
                    <MapPin className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{nh.name}</p>
                    {!nh.is_active && <Badge variant="secondary">Disabled</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">/{nh.slug}</p>
                  {nh.tagline && (
                    <p className="text-sm text-muted-foreground mt-1">{nh.tagline}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                    {nh.city && <span>{nh.city}{nh.state ? `, ${nh.state}` : ""}</span>}
                    {nh.county && <span>{nh.county} County</span>}
                    {nh.home_count && <span>{nh.home_count} homes</span>}
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ color: nh.accent_color }}
                    >
                      <span className="h-3 w-3 rounded-full inline-block" style={{ backgroundColor: nh.accent_color }} />
                      {nh.accent_color}
                    </span>
                  </div>
                  {nh.admin_notes && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md border border-dashed">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Admin Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{nh.admin_notes}</p>
                    </div>
                  )}
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
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>City</Label>
                <Input
                  value={newData.city}
                  onChange={(e) => setNewData({ ...newData, city: e.target.value })}
                  placeholder="e.g. Katy"
                />
              </div>
              <div className="space-y-1">
                <Label>County</Label>
                <Input
                  value={newData.county}
                  onChange={(e) => setNewData({ ...newData, county: e.target.value })}
                  placeholder="e.g. Harris"
                />
              </div>
              <div className="space-y-1">
                <Label>State</Label>
                <Input
                  value={newData.state}
                  onChange={(e) => setNewData({ ...newData, state: e.target.value })}
                  placeholder="e.g. TX"
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
