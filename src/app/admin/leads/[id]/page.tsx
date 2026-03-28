import { getLeadById, getAgents } from "@/lib/db/actions/lead.actions";
import { notFound } from "next/navigation";
import { LeadDetail } from "@/components/dashboard/leads/LeadDetail";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lead Detail" };

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [leadRes, agentsRes] = await Promise.all([
    getLeadById(id),
    getAgents(),
  ]);

  if (!leadRes.success || !leadRes.data) notFound();

  return <LeadDetail lead={leadRes.data} agents={agentsRes.data ?? []} />;
}