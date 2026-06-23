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
import type { Maturity, ProjectStatus } from "@/lib/types";

const SECTORS = ["Fintech", "Healthtech", "Retail", "Logistics", "Industry", "Education", "Other"];
const MATURITIES: Maturity[] = ["Ideation", "Validation", "MVP", "Scale"];
const STATUSES: ProjectStatus[] = ["InProgress", "Approved", "Archived"];

export function NewProjectDialog({ trigger }: { trigger: React.ReactNode }) {
  const { addProject } = useData();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    sector: "Fintech",
    maturity: "Ideation" as Maturity,
    status: "InProgress" as ProjectStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await addProject({
        name: form.name.trim(),
        description: form.description.trim(),
        sector: form.sector,
        maturity: form.maturity,
        status: form.status,
        owner: user?.name ?? "You",
      });
      toast.success("Project created.");
      setOpen(false);
      setForm({ name: "", description: "", sector: "Fintech", maturity: "Ideation", status: "InProgress" });
    } catch {
      toast.error("Could not create the project. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>Add a new innovation project to your pipeline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Project name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What is this project about?"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Sector</Label>
              <Select value={form.sector} onValueChange={(v) => setForm((f) => ({ ...f, sector: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Maturity</Label>
              <Select
                value={form.maturity}
                onValueChange={(v) => setForm((f) => ({ ...f, maturity: v as Maturity }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MATURITIES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v as ProjectStatus }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}