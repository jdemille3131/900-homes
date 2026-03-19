"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
} from "@/app/actions/faqs";
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
import type { Faq } from "@/types/database";

interface FaqsListProps {
  faqs: Faq[];
}

export function FaqsList({ faqs: initial }: FaqsListProps) {
  const [faqs, setFaqs] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  function startEdit(f: Faq) {
    setEditingId(f.id);
    setEditQuestion(f.question);
    setEditAnswer(f.answer);
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);
    const result = await updateFaq(editingId, {
      question: editQuestion,
      answer: editAnswer,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === editingId ? { ...f, question: editQuestion, answer: editAnswer } : f
        )
      );
      toast.success("FAQ updated.");
      setEditingId(null);
    }
    setLoading(false);
  }

  async function handleToggleActive(f: Faq) {
    setLoading(true);
    const newActive = !f.is_active;
    const result = await updateFaq(f.id, { is_active: newActive });
    if (result.error) {
      toast.error(result.error);
    } else {
      setFaqs((prev) =>
        prev.map((item) =>
          item.id === f.id ? { ...item, is_active: newActive } : item
        )
      );
      toast.success(newActive ? "FAQ enabled." : "FAQ disabled.");
    }
    setLoading(false);
  }

  async function handleDelete(f: Faq) {
    if (!confirm(`Delete "${f.question.slice(0, 50)}..."? This cannot be undone.`)) return;
    setLoading(true);
    const result = await deleteFaq(f.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      setFaqs((prev) => prev.filter((item) => item.id !== f.id));
      toast.success("FAQ deleted.");
    }
    setLoading(false);
  }

  async function handleAdd() {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setLoading(true);
    const result = await createFaq(newQuestion, newAnswer);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("FAQ added.");
      setNewQuestion("");
      setNewAnswer("");
      setShowAdd(false);
      // Refresh to get new item with ID
      window.location.reload();
    }
    setLoading(false);
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= faqs.length) return;

    const reordered = [...faqs];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    setFaqs(reordered);

    const result = await reorderFaqs(reordered.map((f) => f.id));
    if (result.error) {
      toast.error(result.error);
      setFaqs(faqs);
    }
  }

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <Card
          key={f.id}
          className={!f.is_active ? "opacity-50" : undefined}
        >
          <CardContent className="py-4">
            {editingId === f.id ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Question</Label>
                  <Input
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Answer</Label>
                  <Textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    rows={4}
                  />
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
                    disabled={i === faqs.length - 1 || loading}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium mb-1">{f.question}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {f.answer}
                  </p>
                  {!f.is_active && (
                    <Badge variant="secondary" className="mt-1">
                      Disabled
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(f)}
                    disabled={loading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(f)}
                    disabled={loading}
                    title={f.is_active ? "Disable" : "Enable"}
                  >
                    {f.is_active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(f)}
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

      {/* Add new FAQ */}
      {showAdd ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-4 space-y-3">
            <div className="space-y-1">
              <Label>Question</Label>
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What do people commonly ask?"
              />
            </div>
            <div className="space-y-1">
              <Label>Answer</Label>
              <Textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Provide a clear, helpful answer..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={loading || !newQuestion.trim() || !newAnswer.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add FAQ
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
          Add FAQ
        </Button>
      )}
    </div>
  );
}
