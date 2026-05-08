import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ScenarioClient from "./ScenarioClient";
import { getMemoryContext } from "@/lib/memory/session-memory";

export default async function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch scenario
  const { data: scenario, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !scenario) {
    return notFound();
  }

  // Check auth and lock status
  const { data: { user } } = await supabase.auth.getUser();

  if (!scenario.is_free) {
    if (!user) redirect("/dashboard");

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!sub) redirect("/dashboard");
  }

  // Fetch voice plan details
  let hasVoicePlan = false;
  let voiceMinutesUsed = 0;
  let voiceMinutesCap = 120;
  let memoryContext = "";

  if (user) {
    const { data: voiceSub } = await supabase
      .from("subscriptions")
      .select("plan_type, voice_minutes_used, voice_minutes_cap")
      .eq("user_id", user.id)
      .eq("status", "active")
      .eq("plan_type", "voice_monthly")
      .single();

    if (voiceSub) {
      hasVoicePlan = true;
      voiceMinutesUsed = voiceSub.voice_minutes_used ?? 0;
      voiceMinutesCap = voiceSub.voice_minutes_cap ?? 120;
    }

    // Fetch session memory context
    memoryContext = await getMemoryContext(user.id);
  }

  return (
    <ScenarioClient
      scenario={scenario}
      user={user}
      hasVoicePlan={hasVoicePlan}
      voiceMinutesUsed={voiceMinutesUsed}
      voiceMinutesCap={voiceMinutesCap}
      memoryContext={memoryContext}
      locale={scenario.locale || "ko"}
    />
  );
}
