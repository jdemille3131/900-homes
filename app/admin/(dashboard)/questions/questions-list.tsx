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
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from "@/app/actions/questions";
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
  Star,
} from "lucide-react";
import type { Question } from "@/types/database";

interface QuestionsListProps {
  questions: Question[];
}

export function QuestionsList({ questions: initial }: QuestionsListProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editHint, setEditHint] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newHint, setNewHint] = useState("");
  const [newIsRequired, setNewIsRequired] = useState(true);
  const [loading, setLoading] = useState(false);

  function startEdit(q: Question) {
    setEditingId(q.id);
    setEditText(q.question);
    setEditHint(q.hint || "");
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);
    const result = await updateQuestion(editingId, {
      question: editText,
      hint: editHint || undefined,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Question updated.");
      setEditingId(null);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleToggleActive(q: Question) {
    setLoading(true);
    const newActive = !q.is_active;
    const result = await updateQuestion(q.id, { is_active: newActive });
    if (result.error) {
      toast.error(result.error);
    } else {
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === q.id ? { ...item, is_active: newActive } : item
        )
      );
      toast.success(newActive ? "Question enabled." : "Question disabled.");
    }
    setLoading(false);
  }

  async function handleToggleRequired(q: Question) {
    setLoading(true);
    const newRequired = !q.is_required;
    const result = await updateQuestion(q.id, { is_required: newRequired });
    if (result.error) {
      toast.error(result.error);
    } else {
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === q.id ? { ...item, is_required: newRequired } : item
        )
      );
      toast.success(newRequired ? "Question marked as core." : "Question marked as optional.");
    }
    setLoading(false);
  }

  async function handleDelete(q: Question) {
    if (!confirm(`Delete "${q.question.slice(0, 50)}..."? This cannot be undone.`)) return;
    setLoading(true);
    const result = await deleteQuestion(q.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Question deleted.");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleAdd() {
    if (!newQuestion.trim()) return;
    setLoading(true);
    const result = await createQuestion(newQuestion, newHint, newIsRequired);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Question added.");
      setNewQuestion("");
      setNewHint("");
      setShowAdd(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= questions.length) return;

    const reordered = [...questions];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    setQuestions(reordered);

    const result = await reorderQuestions(reordered.map((q) => q.id));
    if (result.error) {
      toast.error(result.error);
      setQuestions(questions); // revert
    }
  }

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <Card
          key={q.id}
          className={!q.is_active ? "opacity-50" : undefined}
        >
          <CardContent className="py-4">
            {editingId === q.id ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Question</Label>
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Hint (optional)</Label>
                  <Input
                    value={editHint}
                    onChange={(e) => setEditHint(e.target.value)}
                    placeholder="Helper text shown below the question"
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
                    disabled={i === questions.length - 1 || loading}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {i + 1}.
                    </span>
                    <p className="font-medium">{q.question}</p>
                  </div>
                  {q.hint && (
                    <p className="text-sm text-muted-foreground ml-6">
                      {q.hint}
                    </p>
                  )}
                  <div className="flex items-center gap-2 ml-6 mt-1">
                    {q.is_required ? (
                      <Badge className="nh-bg-100 nh-text-dark hover:nh-bg-100 text-xs">Core</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Optional</Badge>
                    )}
                    {!q.is_active && (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleRequired(q)}
                    disabled={loading}
                    title={q.is_required ? "Make optional" : "Make core"}
                  >
                    <Star className={`h-4 w-4 ${q.is_required ? "fill-[var(--nh-accent)] nh-text" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(q)}
                    disabled={loading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(q)}
                    disabled={loading}
                    title={q.is_active ? "Disable" : "Enable"}
                  >
                    {q.is_active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(q)}
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

      {/* Add new question */}
      {showAdd ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-4 space-y-3">
            <div className="space-y-1">
              <Label>New Question</Label>
              <Textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What would you like to ask storytellers?"
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <Label>Hint (optional)</Label>
              <Input
                value={newHint}
                onChange={(e) => setNewHint(e.target.value)}
                placeholder="Helper text shown below the question"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newIsRequired}
                onChange={(e) => setNewIsRequired(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 nh-accent"
              />
              <span className="text-sm font-medium">Core question</span>
              <span className="text-xs text-muted-foreground">(uncheck for optional)</span>
            </label>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading || !newQuestion.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Question
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
          Add Question
        </Button>
      )}
    </div>
  );
}
