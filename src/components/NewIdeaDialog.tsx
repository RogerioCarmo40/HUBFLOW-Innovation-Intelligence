import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, useData } from "@/lib/store";
import type { IdeaType } from "@/lib/types";

const TYPES: IdeaType[] = ["Incremental", "Disruptive", "Process", "Product", "Service", "BusinessModel"];
const SECTORS = ["Fintech", "Healthtech", "Retail", "Logistics", "Industry", "Education", "Other"];

export function NewIdeaDialog({
  trigger,
  defaultProjectId = null,
}: {
  trigger: React.ReactNode;
  defaultProjectId?: string | null;
}) {
  const { addIdea, projects } = useData();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Incremental" as IdeaType,
    sector: "Fintech",
    projectId: defaultProjectId ?? "none",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await addIdea({
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        status: "Draft",
        sector: form.sector,
        projectId: form.projectId === "none" ? null : form.projectId,
        author: user?.name ?? "You",
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      toast.success("Idea added.");
      setOpen(false);
      setForm({
        title: "",
        description: "",
        type: "Incremental",
        sector: "Fintech",
        projectId: defaultProjectId ?? "none",
        tags: "",
      });
    } catch {
      toast.error("Could not add the idea. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Idea</DialogTitle>
          <DialogDescription>Capture a new innovation idea.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="i-title">Title</Label>
            <Input
              id="i-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Idea title"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="i-desc">Description</Label>
            <Textarea
              id="i-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the idea"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as IdeaType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sector</Label>
              <Select value={form.sector} onValueChange={(v) => setForm((f) => ({ ...f, sector: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Associated project</Label>
            <Select value={form.projectId} onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="i-tags">Tags (comma separated)</Label>
            <Input
              id="i-tags"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="pricing, ai, mobile"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Idea</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}