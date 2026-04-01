"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createPageSection,
  updatePageSection,
  deletePageSection,
  reorderPageSections,
} from "@/app/actions/page-sections";
import { toast } from "sonner";
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Check,
  X,
} from "lucide-react";
import type { PageSection } from "@/types/database";

const ICON_OPTIONS = [
  { value: "", label: "None" },
  { value: "Home", label: "Home" },
  { value: "BookOpen", label: "BookOpen" },
  { value: "Users", label: "Users" },
  { value: "Heart", label: "Heart" },
  { value: "Star", label: "Star" },
  { value: "MessageCircle", label: "MessageCircle" },
];

const COLOR_OPTIONS = [
  { value: "", label: "None" },
  { value: "red", label: "Red" },
  { value: "amber", label: "Amber" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
];

interface SectionsListProps {
  sections: PageSection[];
}

export function SectionsList({ sections: initial }: SectionsListProps) {
  const [sections, setSections] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHeading, setEditHeading] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editIconColor, setEditIconColor] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newHeading, setNewHeading] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [newIconColor, setNewIconColor] = useState("");
  const [loading, setLoading] = useState(false);

  function startEdit(s: PageSection) {
    setEditingId(s.id);
    setEditHeading(s.heading);
    setEditBody(s.body);
    setEditIcon(s.icon || "");
    setEditIconColor(s.icon_color || "");
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);
    const result = await updatePageSection(editingId, {
      heading: editHeading,
      body: editBody,
      icon: editIcon || null,
      icon_color: editIconColor || null,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      setSections((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, heading: editHeading, body: editBody, icon: editIcon || null, icon_color: editIconColor || null }
            : s
        )
      );
      toast.success("Section updated.");
      setEditingId(null);
    }
    setLoading(false);
  }

  async function handleToggleActive(s: PageSection) {
    setLoading(true);
    const newActive = !s.is_active;
    const result = await updatePageSection(s.id, { is_active: newActive });
    if (result.error) {
      toast.error(result.error);
    } else {
      setSections((prev) =>
        prev.map((item) =>
          item.id === s.id ? { ...item, is_active: newActive } : item
        )
      );
      toast.success(newActive ? "Section enabled." : "Section disabled.");
    }
    setLoading(false);
  }

  async function handleDelete(s: PageSection) {
    if (!confirm(`Delete "${s.heading}"? This cannot be undone.`)) return;
    setLoading(true);
    const result = await deletePageSection(s.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      setSections((prev) => prev.filter((item) => item.id !== s.id));
      toast.success("Section deleted.");
    }
    setLoading(false);
  }

  async function handleAdd() {
    if (!newKey.trim() || !newHeading.trim() || !newBody.trim()) return;
    setLoading(true);
    const result = await createPageSection("about", {
      section_key: newKey.trim().toLowerCase().replace(/\s+/g, "_"),
      heading: newHeading,
      body: newBody,
      icon: newIcon || undefined,
      icon_color: newIconColor || undefined,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Section added.");
      setNewKey("");
      setNewHeading("");
      setNewBody("");
      setNewIcon("");
      setNewIconColor("");
      setShowAdd(false);
      window.location.reload();
    }
    setLoading(false);
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sections.length) return;

    const reordered = [...sections];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    setSections(reordered);

    const result = await reorderPageSections(reordered.map((s) => s.id));
    if (result.error) {
      toast.error(result.error);
      setSections(sections);
    }
  }

  return (
    <div className="space-y-3">
      {sections.map((s, i) => (
        <Card
          key={s.id}
          className={!s.is_active ? "opacity-50" : undefined}
        >
          <CardContent className="py-4">
            {editingId === s.id ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Heading</Label>
                  <Input
                    value={editHeading}
                    onChange={(e) => setEditHeading(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Body</Label>
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate paragraphs with blank lines. Basic HTML like &lt;em&gt; is supported.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Icon</Label>
                    <select
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Icon Color</Label>
                    <select
                      value={editIconColor}
                      onChange={(e) => setEditIconColor(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      {COLOR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} disabled={loading}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={() => handleMove(i, "up")}
                    disabled={i === 0 || loading}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <button
                    onClick={() => handleMove(i, "down")}
                    disabled={i === sections.length - 1 || loading}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{s.heading}</p>
                    <Badge variant="outline" className="text-xs font-mono">
                      {s.section_key}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {s.body.replace(/<[^>]*>/g, "").slice(0, 150)}...
                  </p>
                  <div className="flex gap-2 mt-1">
                    {s.icon && (
                      <Badge variant="secondary" className="text-xs">
                        {s.icon}
                      </Badge>
                    )}
                    {s.icon_color && (
                      <Badge variant="secondary" className="text-xs">
                        {s.icon_color}
                      </Badge>
                    )}
                    {!s.is_active && (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(s)}
                    disabled={loading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(s)}
                    disabled={loading}
                    title={s.is_active ? "Disable" : "Enable"}
                  >
                    {s.is_active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(s)}
                    disabled={loading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add new section */}
      {showAdd ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Section Key</Label>
                <Input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. community"
                />
              </div>
              <div className="space-y-1">
                <Label>Heading</Label>
                <Input
                  value={newHeading}
                  onChange={(e) => setNewHeading(e.target.value)}
                  placeholder="Section heading"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Body</Label>
              <Textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Section content. Separate paragraphs with blank lines."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Icon</Label>
                <select
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Icon Color</Label>
                <select
                  value={newIconColor}
                  onChange={(e) => setNewIconColor(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  {COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={loading || !newKey.trim() || !newHeading.trim() || !newBody.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Section
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
          Add Section
        </Button>
      )}
    </div>
  );
}
